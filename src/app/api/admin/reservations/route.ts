import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getReservationWithServiceNamesFromDB } from '@/lib/service-utils-server';
import { isSlotAvailable } from '@/lib/availability-service';
import { cache } from '@/lib/cache';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
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

    // Vérifier que c'est un admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation requise' }, { status: 400 });
    }

    const body = await request.json();
    const { client, email, phone, date, time, services, notes, totalPrice, status, source, packages, giftCardId, giftCardUsedAmount } = body;

    // Vérifier la disponibilité du créneau AVANT de créer le client
    const reservationDate = new Date(date);
    // Normaliser la date à minuit pour la comparaison (comme dans isSlotAvailable)
    reservationDate.setHours(0, 0, 0, 0);

    const available = await isSlotAvailable(reservationDate, time);

    if (!available) {
      // Vérifier s'il y a déjà une réservation DE CETTE ORGANISATION à ce créneau
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          organizationId: user.organizationId, // 🔒 Sécurité multi-tenant
          date: reservationDate,
          time: time,
          status: {
            in: ['confirmed', 'pending']
          }
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      if (existingReservation) {
        return NextResponse.json({
          error: `Ce créneau est déjà réservé par ${existingReservation.user?.name || 'un client'}. Veuillez choisir un autre horaire.`
        }, { status: 409 });
      } else {
        return NextResponse.json({
          error: 'Ce créneau n\'est pas disponible (hors horaires de travail ou bloqué).'
        }, { status: 409 });
      }
    }

    // Créer ou trouver le client DE CETTE ORGANISATION
    let clientUser = await prisma.user.findFirst({
      where: {
        email: email || `client_${Date.now()}@temp.com`,
        organizationId: user.organizationId // 🔒 Sécurité multi-tenant
      }
    });

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          name: client,
          email: email || `client_${Date.now()}@temp.com`,
          phone: phone || '',
          password: 'temp_password', // Le client pourra créer son mot de passe plus tard
          role: 'CLIENT',
          organizationId: user.organizationId // 🔒 Sécurité multi-tenant
        }
      });
    } else if (phone && !clientUser.phone) {
      // Mettre à jour le téléphone si on l'a et qu'il n'était pas déjà enregistré
      await prisma.user.update({
        where: { id: clientUser.id },
        data: { phone }
      });
    }

    // Recalculer le prix total basé sur les services DE CETTE ORGANISATION
    let calculatedPrice = 0;
    const dbServices = await prisma.service.findMany({
      where: {
        organizationId: user.organizationId // 🔒 Sécurité multi-tenant - CRITIQUE
      },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        promoPrice: true,
        forfaitPrice: true
      }
    });
    let primaryServiceId = null;
    
    for (const serviceId of services) {
      const service = dbServices.find(s => s.slug === serviceId || s.name.toLowerCase().replace(/['\s]/g, '-') === serviceId);
      if (service) {
        // Prendre le premier service comme service principal
        if (!primaryServiceId) {
          primaryServiceId = service.id;
        }
        
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
    const finalPrice = calculatedPrice > 0 ? calculatedPrice : totalPrice;
    
    // Incrémenter le compteur de séances du client
    await prisma.user.update({
      where: { id: clientUser.id },
      data: {
        totalSpent: { increment: finalPrice },
        lastVisit: new Date()
      }
    });
    
    // Si une carte cadeau est utilisée, vérifier sa validité et mettre à jour son solde
    if (giftCardId && giftCardUsedAmount) {
      const giftCard = await prisma.giftCard.findUnique({
        where: { id: giftCardId },
        select: {
          id: true,
          status: true,
          balance: true
        }
      });

      if (!giftCard || giftCard.status !== 'active') {
        return NextResponse.json({
          error: 'Carte cadeau invalide ou inactive'
        }, { status: 400 });
      }

      if (giftCard.balance < giftCardUsedAmount) {
        return NextResponse.json({
          error: 'Solde insuffisant sur la carte cadeau'
        }, { status: 400 });
      }

      // Mettre à jour le solde de la carte cadeau
      const newBalance = giftCard.balance - giftCardUsedAmount;
      await prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          balance: newBalance,
          status: newBalance <= 0 ? 'used' : 'active',
          usedDate: newBalance <= 0 ? new Date() : null
        }
      });
    }

    // Créer la réservation avec le service principal
    const reservation = await prisma.reservation.create({
      data: {
        organizationId: user.organizationId,
        userId: clientUser.id,
        serviceId: primaryServiceId, // Lier le service principal
        services: JSON.stringify(services), // Garder aussi la liste pour compatibilité
        packages: packages ? JSON.stringify(packages) : '{}',
        date: reservationDate, // Utiliser la date normalisée
        time,
        totalPrice: finalPrice,
        status: status || 'confirmed',
        notes,
        source: source || 'admin',
        giftCardId: giftCardId || null,
        giftCardUsedAmount: giftCardUsedAmount || 0
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      id: reservation.id,
      userId: reservation.userId,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      phone: reservation.user.phone,
      services: JSON.parse(reservation.services),
      date: reservation.date.toISOString(),
      time: reservation.time,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      notes: reservation.notes,
      source: reservation.source,
      createdAt: reservation.createdAt.toISOString()
    });
  } catch (error) {
    log.error('Erreur lors de la création de la réservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // Vérifier que c'est un admin
    let user;
    try {
      user = await prisma.user.findFirst({
        where: { id: decoded.userId },
        select: { role: true, organizationId: true }
      });
    } catch (dbError) {
      log.warn('Erreur de connexion DB lors de la vérification utilisateur:', dbError);
      // En cas d'erreur DB, on fait confiance au token JWT qui a déjà été vérifié
      // et on utilise le rôle du token décodé
      const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
      if (!decoded.role || !adminRoles.includes(decoded.role)) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
      // On continue avec les données du token
      user = { role: decoded.role };
    }

    const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Vérifier le cache (par organisation)
    const cacheKey = `admin:reservations:${user.organizationId}`;
    const cachedReservations = cache.get(cacheKey);
    if (cachedReservations) {
      return NextResponse.json(cachedReservations);
    }

    // Récupérer toutes les réservations DE CETTE ORGANISATION avec les infos clients et services
    let reservations = [];
    try {
      reservations = await prisma.reservation.findMany({
      where: {
        user: {
          organizationId: user.organizationId
        }
      },
      select: {
        id: true,
        date: true,
        time: true,
        totalPrice: true,
        status: true,
        source: true,
        notes: true,
        services: true,
        packages: true,
        isSubscription: true,
        paymentStatus: true,
        paymentDate: true,
        paymentAmount: true,
        paymentMethod: true,
        giftCardId: true,
        giftCardUsedAmount: true,
        staffId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            slug: true,
            name: true,
            duration: true
          }
        },
        giftCard: {
          select: {
            id: true,
            code: true,
            balance: true,
            purchasedFor: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { date: 'desc' }
      ]
    });
    } catch (dbError) {
      log.error('Erreur de connexion à la DB pour les réservations:', dbError);
      // Retourner un tableau vide plutôt qu'une erreur 500
      return NextResponse.json([]);
    }

    // Récupérer tous les services DE CETTE ORGANISATION une seule fois
    const allServices = await prisma.service.findMany({
      where: {
        organizationId: user.organizationId
      },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    // Créer un map pour un accès rapide
    const serviceMap = new Map(allServices.map(s => [s.slug, s.name]));

    // Formater les données avec enrichissement des noms de services (séquentiel pour éviter la saturation)
    const formattedReservations = [];
    for (const r of reservations) {
      // Parser les services
      let servicesList = [];
      try {
        servicesList = JSON.parse(r.services || '[]');
      } catch (e) {
        servicesList = [];
      }

      // Parser les packages
      let packagesObj = {};
      try {
        packagesObj = JSON.parse(r.packages || '{}');
      } catch (e) {
        packagesObj = {};
      }

      // Formatter les noms de services
      const formattedServices = servicesList.map((slug: string) =>
        serviceMap.get(slug) || slug
      );

      formattedReservations.push({
        id: r.id,
        userId: r.user.id,
        userName: r.user.name,
        userEmail: r.user.email,
        phone: r.user.phone,
        services: servicesList,
        packages: packagesObj,
        serviceName: formattedServices.join(', ') || r.service?.name || 'Service inconnu',
        date: r.date.toISOString(),
        time: r.time,
        totalPrice: r.totalPrice,
        status: r.status,
        notes: r.notes,
        source: r.source || 'site',
        staffId: r.staffId,
        staffName: r.staff?.name || null,
        createdAt: r.createdAt.toISOString(),
        paymentStatus: r.paymentStatus,
        paymentDate: r.paymentDate?.toISOString(),
        paymentAmount: r.paymentAmount,
        paymentMethod: r.paymentMethod,
        formattedServices
      });
    }

    // Mettre en cache pour 60 secondes
    cache.set(cacheKey, formattedReservations, 60000);

    return NextResponse.json(formattedReservations);
  } catch (error) {
    log.error('Erreur lors de la récupération des réservations admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}