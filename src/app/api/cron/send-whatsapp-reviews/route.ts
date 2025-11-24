import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp-meta';
import { getSiteConfig } from '@/lib/config-service';
import { log } from '@/lib/logger';

// Cette API doit être appelée tous les jours à 10h pour envoyer les demandes d'avis
export async function GET(request: Request) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const email = config.email || 'contact@institut.fr';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const website = config.customDomain || 'https://votre-institut.fr';
  const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';


  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les réservations d'il y a 3 jours
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);
    
    const threeDaysAgoEnd = new Date(threeDaysAgo);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    const completedReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: threeDaysAgo,
          lte: threeDaysAgoEnd
        },
        status: 'confirmed',
        reviewWhatsAppSent: false // Nouveau champ pour WhatsApp
      },
      include: {
        user: {
          include: {
            loyaltyProfile: true
          }
        }
      }
    });

    log.info(`📱 ${completedReservations.length} demandes d'avis WhatsApp à envoyer`);

    let sentCount = 0;
    let errorCount = 0;
    
    for (const reservation of completedReservations) {
      if (!reservation.user?.phone) {
        log.info(`⚠️ Pas de téléphone pour ${reservation.user?.name}`);
        continue;
      }

      try {
        // Préparer les services
        const services = JSON.parse(reservation.services as string);
        const serviceNames = services.map((s: string) => {
          const serviceMap: any = {
            'hydro-naissance': "Hydro'Naissance",
            'hydro-cleaning': "Hydro'Cleaning",
            'renaissance': 'Renaissance',
            'bb-glow': 'BB Glow',
            'led-therapie': 'LED Thérapie'
          };
          return serviceMap[s] || s;
        }).join(', ');

        // Calculer les informations de fidélité
        const loyaltyProfile = reservation.user.loyaltyProfile;
        const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
        const packagesCount = loyaltyProfile?.packagesCount || 0;
        
        let loyaltyProgress = '';
        let nextReward = '';
        
        if (sessionsCount < 5) {
          loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 5`;
          nextReward = `Plus que ${5 - sessionsCount} séance${5 - sessionsCount > 1 ? 's' : ''} pour obtenir -30€ !`;
        } else if (packagesCount < 3) {
          loyaltyProgress = `Vous avez ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} sur 3`;
          nextReward = `Plus que ${3 - packagesCount} forfait${3 - packagesCount > 1 ? 's' : ''} pour obtenir -30€ !`;
        } else {
          loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP`;
          nextReward = `Profitez de vos avantages exclusifs !`;
        }

        // Message WhatsApp pour demande d'avis
        const reviewMessage = `✨ *${siteName}* ✨

Bonjour ${reservation.user.name} ! 💕

J'espère que vous avez apprécié votre soin *${serviceNames}* d'il y a 3 jours.

⭐ *Votre avis est précieux !*
Pourriez-vous prendre quelques secondes pour partager votre expérience ?

👉 Répondez simplement à ce message avec:
- Une note de 1 à 5 étoiles (⭐)
- Votre commentaire

Ou cliquez ici : https://laiaskin.fr/avis?id=${reservation.id}

🎁 *Programme de fidélité*
${loyaltyProgress}
${nextReward}

Merci infiniment ! 🙏
*${siteName}*`;
        
        const result = await sendWhatsAppMessage({
          to: reservation.user.phone,
          message: reviewMessage
        });

        if (result.success) {
          // Marquer comme envoyé
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { reviewWhatsAppSent: true }
          });
          
          // 🔒 Enregistrer dans l'historique email avec organizationId
          try {
            await prisma.emailHistory.create({
              data: {
                from: `${siteName}`,
                to: reservation.user.phone,
                subject: `Demande d'avis WhatsApp`,
                content: `Demande d'avis automatique pour ${serviceNames}`,
                template: 'review_request_whatsapp',
                status: 'sent',
                direction: 'outgoing',
                userId: reservation.userId,
                organizationId: reservation.organizationId
              }
            });
          } catch (e) {
            // Table might not exist, continue
          }
          
          sentCount++;
          log.info(`✅ Avis WhatsApp envoyé à ${reservation.user.name} (${reservation.user.phone})`);
        } else {
          errorCount++;
          log.error(`❌ Échec envoi à ${reservation.user.name}:`, result.error);
        }
      } catch (error) {
        errorCount++;
        log.error(`❌ Erreur pour ${reservation.user.name}:`, error);
      }
      
      // Attendre un peu entre chaque envoi
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} demandes d'avis WhatsApp envoyées`,
      sent: sentCount,
      errors: errorCount,
      total: completedReservations.length
    });

  } catch (error) {
    log.error('Erreur cron WhatsApp reviews:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des demandes d\'avis' 
    }, { status: 500 });
  }
}

// Endpoint pour tester l'envoi manuel d'une demande d'avis
export async function POST(request: Request) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';

  try {
    const body = await request.json();
    const { reservationId } = body;

    if (!reservationId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { 
        user: {
          include: {
            loyaltyProfile: true
          }
        }
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    if (!reservation.user?.phone) {
      return NextResponse.json({ error: 'Pas de numéro de téléphone' }, { status: 400 });
    }

    // Préparer les services
    const services = JSON.parse(reservation.services as string);
    const serviceNames = services.map((s: string) => {
      const serviceMap: any = {
        'hydro-naissance': "Hydro'Naissance",
        'hydro-cleaning': "Hydro'Cleaning",
        'renaissance': 'Renaissance',
        'bb-glow': 'BB Glow',
        'led-therapie': 'LED Thérapie'
      };
      return serviceMap[s] || s;
    }).join(', ');

    // Calculer les informations de fidélité
    const loyaltyProfile = reservation.user.loyaltyProfile;
    const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
    
    // Message WhatsApp
    const reviewMessage = `✨ *${siteName}* ✨

Bonjour ${reservation.user.name} ! 💕

J'espère que vous avez apprécié votre soin *${serviceNames}*.

⭐ *Votre avis compte !*
Partagez votre expérience en répondant à ce message ou en cliquant ici :
👉 https://laiaskin.fr/avis?id=${reservation.id}

🎁 Programme de fidélité : ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''}

Merci ! 🙏
*${siteName}*`;
    
    const result = await sendWhatsAppMessage({
      to: reservation.user.phone,
      message: reviewMessage
    });

    if (result.success) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { reviewWhatsAppSent: true }
      });

      return NextResponse.json({ 
        success: true,
        message: 'Demande d\'avis WhatsApp envoyée',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({ 
        error: 'Échec de l\'envoi',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    log.error('Erreur envoi avis manuel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi' 
    }, { status: 500 });
  }
}