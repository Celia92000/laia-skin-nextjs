import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp-meta';
import { isSlotAvailable } from '@/lib/availability-service';
import { sendConfirmationEmail } from '@/lib/email-service';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient();

    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation depuis le host
    const host = request.headers.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // 1. Chercher par domaine personnalisé
    if (!cleanHost.includes('localhost')) {
      organization = await prisma.organization.findUnique({
        where: { domain: cleanHost }
      });
    }

    // 2. Chercher par subdomain
    if (!organization) {
      const parts = cleanHost.split('.');
      let subdomain = 'laia-skin-institut';
      if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
        subdomain = parts[0];
      }
      organization = await prisma.organization.findUnique({
        where: { subdomain: subdomain }
      });
    }

    // 3. Fallback
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' }
      });
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { services, packages, date, time, notes, totalPrice, staffId, clientInfo, rescheduleId, giftCardCode, giftCardUsedAmount } = body;

    // Validation : vérifier qu'il y a au moins un service
    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({
        error: 'Veuillez sélectionner au moins un service pour votre réservation.'
      }, { status: 400 });
    }
    
    // Vérifier si le créneau est disponible (horaires de travail et dates bloquées)
    const reservationDate = new Date(date);
    const available = await isSlotAvailable(reservationDate, time);
    
    if (!available) {
      // Déterminer la raison de l'indisponibilité
      const dayOfWeek = reservationDate.getDay();
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      
      return NextResponse.json({ 
        error: `Ce créneau n'est pas disponible. L'institut est fermé le ${dayNames[dayOfWeek]} à ${time} ou cette date est bloquée. Veuillez choisir un autre horaire.` 
      }, { status: 409 });
    }
    
    let userId: string;
    let user;
    
    // Vérifier si c'est un utilisateur connecté ou un nouveau client
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Client connecté - 🔒 Vérifier qu'il appartient à cette organisation
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
      userId = decoded.userId;
      user = await prisma.user.findFirst({
        where: {
          id: userId,
          organizationId: organization.id // 🔒 Sécurité multi-tenant
        }
      });
    } else if (clientInfo && clientInfo.email) {
      // Nouveau client sans compte - 🔒 Chercher dans cette organisation uniquement
      user = await prisma.user.findFirst({
        where: {
          email: clientInfo.email,
          organizationId: organization.id // 🔒 Sécurité multi-tenant
        }
      });
      
      if (!user) {
        // Créer un nouveau client dans le CRM - 🔒 Lié à cette organisation
        user = await prisma.user.create({
          data: {
            name: clientInfo.name || 'Client',
            email: clientInfo.email,
            phone: clientInfo.phone || '',
            password: `temp_${Date.now()}`, // Mot de passe temporaire
            role: 'CLIENT', // En majuscules pour cohérence avec le CRM
            organizationId: organization.id // 🔒 Sécurité multi-tenant
          }
        });
      } else {
        // Mettre à jour les infos et s'assurer que c'est un CLIENT
        const updateData: any = {
          ...(clientInfo.phone && !user.phone ? { phone: clientInfo.phone } : {}),
          ...(clientInfo.name && user.name === 'Client' ? { name: clientInfo.name } : {})
        };
        
        // S'assurer que l'utilisateur est un CLIENT (pas ADMIN ou autre)
        if (user.role !== 'CLIENT' && (user.role as string) !== 'ADMIN') {
          updateData.role = 'CLIENT';
        }
        
        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData
          });
        }
      }
      userId = user.id;
    } else {
      return NextResponse.json({ error: 'Informations client requises' }, { status: 400 });
    }

    // Récupérer les services DE CETTE ORGANISATION pour obtenir les durées - 🔒 CRITIQUE
    const dbServices = await prisma.service.findMany({
      where: {
        slug: { in: services },
        organizationId: organization.id // 🔒 Sécurité multi-tenant - CRITIQUE
      }
    });

    // Calculer la durée totale de la nouvelle réservation
    let totalDurationMinutes = 0;
    for (const serviceSlug of services) {
      const service = dbServices.find(s => s.slug === serviceSlug);
      if (service) {
        totalDurationMinutes += service.duration;
      }
    }
    // Ajouter 15 minutes de préparation
    totalDurationMinutes += 15;

    // Normaliser la date à minuit pour la comparaison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // 🔒 Vérifier qu'il n'y a pas déjà une réservation à ce créneau DANS CETTE ORGANISATION
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        organizationId: organization.id,
        date: normalizedDate,
        time: time,
        status: {
          notIn: ['CANCELLED', 'cancelled'] // Exclure les réservations annulées (majuscules et minuscules)
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json({ 
        error: 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.' 
      }, { status: 409 }); // 409 Conflict
    }

    // 🔒 Vérifier les conflits avec les autres réservations DE CETTE ORGANISATION
    const allReservations = await prisma.reservation.findMany({
      where: {
        organizationId: organization.id,
        date: normalizedDate,
        status: {
          notIn: ['CANCELLED', 'cancelled']
        }
      }
    });

    // Convertir l'heure en minutes pour faciliter les calculs
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedTimeMinutes = timeToMinutes(time);
    const requestedEndTime = requestedTimeMinutes + totalDurationMinutes;

    // Vérifier chaque réservation existante
    for (const reservation of allReservations) {
      // Récupérer les services de la réservation existante pour calculer sa durée
      const existingServices = JSON.parse(reservation.services || '[]');
      let existingDuration = 0;
      
      for (const existingServiceSlug of existingServices) {
        // 🔒 Utiliser findFirst avec organizationId
        const service = await prisma.service.findFirst({
          where: {
            slug: existingServiceSlug,
            organizationId: organization.id
          }
        });
        if (service) {
          existingDuration += service.duration;
        }
      }
      // Ajouter 15 minutes de préparation à la réservation existante
      existingDuration += 15;

      const existingTimeMinutes = timeToMinutes(reservation.time);
      const existingEndTime = existingTimeMinutes + existingDuration;

      // Vérifier les chevauchements
      // Cas 1: La nouvelle réservation commence pendant une réservation existante
      // Cas 2: La nouvelle réservation finit pendant une réservation existante  
      // Cas 3: La nouvelle réservation englobe une réservation existante
      // Cas 4: Une réservation existante est englobée dans la nouvelle
      
      const hasConflict = 
        (requestedTimeMinutes >= existingTimeMinutes && requestedTimeMinutes < existingEndTime) || // Commence pendant
        (requestedEndTime > existingTimeMinutes && requestedEndTime <= existingEndTime) || // Finit pendant
        (requestedTimeMinutes <= existingTimeMinutes && requestedEndTime >= existingEndTime) || // Englobe
        (existingTimeMinutes >= requestedTimeMinutes && existingEndTime <= requestedEndTime); // Est englobé

      if (hasConflict) {
        // Calculer le prochain créneau disponible
        const nextAvailableMinutes = existingEndTime;
        const nextHours = Math.floor(nextAvailableMinutes / 60);
        const nextMinutes = nextAvailableMinutes % 60;
        const nextTimeStr = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
        
        // Déterminer le nom du service pour un message plus clair
        const serviceName = dbServices[0]?.name || 'le soin';
        const existingServiceName = existingServices.length > 0 ?
          (await prisma.service.findFirst({
            where: {
              slug: existingServices[0],
              organizationId: organization.id
            }
          }))?.name || 'un soin' :
          'un soin';
        
        return NextResponse.json({ 
          error: `Ce créneau entre en conflit avec ${existingServiceName} prévu de ${reservation.time} à ${String(Math.floor(existingEndTime/60)).padStart(2,'0')}:${String(existingEndTime%60).padStart(2,'0')}. Le prochain créneau disponible pour ${serviceName} (${Math.floor(totalDurationMinutes/60)}h${totalDurationMinutes%60 > 0 ? String(totalDurationMinutes%60).padStart(2,'0') : ''}) est à partir de ${nextTimeStr}.`
        }, { status: 409 });
      }
    }

    // Recalculer le prix total basé sur les services de la base de données
    let calculatedPrice = 0;
    
    for (const serviceId of services) {
      const service = dbServices.find(s => s.slug === serviceId);
      if (service) {
        // Vérifier si c'est un forfait ou un service simple
        const packageType = packages && packages[serviceId];
        if (packageType === 'forfait' && service.forfaitPrice) {
          calculatedPrice += service.forfaitPrice;
        } else {
          // Utiliser le prix promo s'il existe, sinon le prix normal
          calculatedPrice += service.promoPrice || service.price;
        }
      }
    }
    
    // Utiliser le prix calculé pour garantir l'exactitude
    // Si aucun prix n'est calculé et aucun prix fourni, utiliser 0
    const finalPrice = calculatedPrice > 0 ? calculatedPrice : (totalPrice || 0);
    
    // Validation du prix
    if (finalPrice <= 0) {
      return NextResponse.json({ 
        error: 'Le prix total de la réservation doit être supérieur à zéro. Veuillez vérifier votre sélection.' 
      }, { status: 400 });
    }
    
    log.info(`Prix calculé: ${calculatedPrice} Prix reçu: ${totalPrice} Prix final: ${finalPrice}`);
    
    // Déterminer si c'est un abonnement
    let isSubscription = false;
    if (packages) {
      const packagesObj = typeof packages === 'string' ? JSON.parse(packages) : packages;
      isSubscription = Object.values(packagesObj).includes('abonnement');
    }
    
    // 🔒 Gérer la carte cadeau si présente
    let giftCard = null;
    if (giftCardCode && giftCardUsedAmount && giftCardUsedAmount > 0) {
      // 🔒 Récupérer la carte cadeau DE CETTE ORGANISATION
      giftCard = await prisma.giftCard.findFirst({
        where: {
          code: giftCardCode.toUpperCase(),
          organizationId: organization.id
        }
      });

      if (!giftCard) {
        return NextResponse.json({
          error: 'Carte cadeau introuvable'
        }, { status: 400 });
      }

      // Vérifier que la carte a assez de solde
      if (giftCard.balance < giftCardUsedAmount) {
        return NextResponse.json({
          error: 'Solde insuffisant sur la carte cadeau'
        }, { status: 400 });
      }
    }

    // 🔒 Créer la réservation avec statut 'pending' (en attente de validation admin)
    const reservation = await prisma.reservation.create({
      data: {
        userId: userId,
        organizationId: organization.id, // 🔒 CRITIQUE : Utiliser l'organization détectée
        services: JSON.stringify(services),
        packages: packages ? JSON.stringify(packages) : '{}',
        isSubscription,
        date: normalizedDate, // Utiliser la date normalisée
        time,
        notes,
        totalPrice: finalPrice,
        status: 'pending', // Toujours en attente de validation admin
        ...(staffId && { staffId }), // Employé sélectionné par le client
        ...(rescheduleId && { rescheduledFrom: rescheduleId }), // Ajouter la référence si c'est une reprogrammation
        ...(giftCard && giftCardUsedAmount ? {
          giftCardId: giftCard.id,
          giftCardUsedAmount: giftCardUsedAmount,
          paymentMethod: 'giftcard',
          paymentStatus: giftCardUsedAmount >= finalPrice ? 'paid' : 'partial'
        } : {})
      }
    });

    // Mettre à jour le solde de la carte cadeau si utilisée
    if (giftCard && giftCardUsedAmount) {
      const newBalance = giftCard.balance - giftCardUsedAmount;
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          balance: newBalance,
          status: newBalance <= 0 ? 'used' : 'active'
        }
      });
    }

    // Si c'est une reprogrammation, annuler l'ancienne réservation et mettre à jour les références
    if (rescheduleId) {
      await prisma.reservation.update({
        where: { id: rescheduleId },
        data: {
          status: 'cancelled',
          rescheduledTo: reservation.id,
          rescheduledAt: new Date()
        }
      });
    }
    
    // 🔒 Créer ou mettre à jour le profil de fidélité pour ce client
    await prisma.loyaltyProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        organizationId: organization.id, // 🔒 CRITIQUE
        points: 0,
        individualServicesCount: 0,
        packagesCount: 0,
        totalSpent: 0,
        tier: 'bronze'
      },
      update: {} // Ne pas modifier si déjà existant
    });
    
    // Envoyer une notification WhatsApp à l'admin
    const adminPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+33683717050';
    if (user) {
      const adminMessage = rescheduleId ?
        `🔄 *Reprogrammation de rendez-vous*\n\n` +
        `Client: ${user.name}\n` +
        `Nouvelle date: ${new Date(date).toLocaleDateString('fr-FR')}\n` +
        `Nouvelle heure: ${time}\n` +
        `Services: ${services.join(', ')}\n` +
        `Total: ${totalPrice}€\n\n` +
        `⚠️ L'ancien rendez-vous a été automatiquement annulé.\n\n` +
        `Connectez-vous pour valider: https://laiaskin.fr/admin`
        :
        `🔔 *Nouvelle réservation à valider*\n\n` +
        `Client: ${user.name}\n` +
        `Date: ${new Date(date).toLocaleDateString('fr-FR')}\n` +
        `Heure: ${time}\n` +
        `Services: ${services.join(', ')}\n` +
        `Total: ${totalPrice}€\n\n` +
        `Connectez-vous pour valider: https://laiaskin.fr/admin`;
      
      // Envoi asynchrone sans bloquer
      sendWhatsAppMessage({
        to: adminPhone,
        message: adminMessage
      }).catch(console.error);
    }

    // Envoyer l'email de confirmation au client
    if (user?.email) {
      // Récupérer les noms des services depuis la base de données
      const serviceNames = services.map((serviceSlug: string) => {
        const service = dbServices.find(s => s.slug === serviceSlug);
        return service?.name || serviceSlug;
      });

      try {
        const emailSent = await sendConfirmationEmail({
          to: user.email,
          clientName: user.name || 'Cliente',
          date: new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: time,
          services: serviceNames,
          totalPrice: totalPrice,
          reservationId: reservation.id,
          notes: notes
        });
        
        if (emailSent) {
          log.info('✅ Email de confirmation envoyé à:', user.email);
        } else {
          log.info('⚠️ Email non envoyé (service non configuré)');
        }
      } catch (error) {
        log.error('Erreur envoi email:', error);
        // Ne pas bloquer la réservation si l'email échoue
      }
    }

    // Incrémenter le nombre de séances et le montant total dépensé
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSpent: { increment: totalPrice },
        lastVisit: new Date()
      }
    });

    // Vérifier si le client a droit à une réduction
    const updatedUser = await prisma.user.findFirst({
      where: { id: userId }
    });
    
    let loyaltyMessage = '';
    // TODO: Réactiver la logique de fidélité quand les champs seront disponibles
    
    return NextResponse.json({
      id: reservation.id,
      reservation,
      message: 'Votre demande de réservation a été enregistrée. Elle sera validée dans les plus brefs délais.' + loyaltyMessage
    });
  } catch (error) {
    log.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const prisma = await getPrismaClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 🔒 Récupérer UNIQUEMENT les réservations de cet utilisateur DANS SON ORGANISATION
    const reservations = await prisma.reservation.findMany({
      where: {
        userId: decoded.userId,
        organizationId: user.organizationId
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(reservations.map(r => ({
      ...r,
      services: (() => {
        try {
          // Essayer de parser si c'est du JSON
          return JSON.parse(r.services);
        } catch {
          // Si ce n'est pas du JSON, retourner comme tableau avec la valeur
          return typeof r.services === 'string' ? [r.services] : r.services;
        }
      })(),
    })));
  } catch (error) {
    log.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}