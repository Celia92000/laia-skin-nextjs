import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cette API doit être appelée tous les jours à 10h (via un cron job)
export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les réservations d'il y a 3 jours qui sont terminées
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
        status: 'confirmed', // Seulement les RDV confirmés/effectués
        reviewEmailSent: false // Pas déjà envoyé
      },
      include: {
        user: {
          include: {
            loyaltyProfile: true
          }
        }
      }
    });

    console.log(`📧 ${completedReservations.length} demandes d'avis à envoyer`);

    let sentCount = 0;
    
    for (const reservation of completedReservations) {
      if (!reservation.user?.email) continue;

      try {
        // Préparer les données pour l'email
        const services = JSON.parse(reservation.services as string);
        const serviceNames = services.map((s: string) => {
          const serviceMap: any = {
            'hydro-naissance': "Hydro'Naissance",
            'hydro': "Hydro'Cleaning",
            'renaissance': 'Renaissance',
            'bbglow': 'BB Glow',
            'led': 'LED Thérapie'
          };
          return serviceMap[s] || s;
        }).join(', ');

        // Calculer les informations de fidélité
        const loyaltyProfile = reservation.user.loyaltyProfile;
        const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
        const packagesCount = loyaltyProfile?.packagesCount || 0;
        
        // Déterminer la prochaine récompense
        let loyaltyProgress = '';
        let nextReward = '';
        
        if (sessionsCount < 3) {
          loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 3`;
          nextReward = `Plus que ${3 - sessionsCount} séance${3 - sessionsCount > 1 ? 's' : ''} pour obtenir -10% sur votre prochain soin !`;
        } else if (sessionsCount < 5) {
          loyaltyProgress = `Vous avez ${sessionsCount} séances`;
          nextReward = `Plus que ${5 - sessionsCount} séance${5 - sessionsCount > 1 ? 's' : ''} pour obtenir -15% sur votre prochain soin !`;
        } else if (packagesCount < 1) {
          loyaltyProgress = `Vous avez ${sessionsCount} séances`;
          nextReward = `Achetez votre premier forfait pour obtenir -20% !`;
        } else if (packagesCount < 2) {
          loyaltyProgress = `Vous avez ${sessionsCount} séances et ${packagesCount} forfait`;
          nextReward = `Plus qu'1 forfait pour obtenir un soin OFFERT !`;
        } else {
          loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP avec ${sessionsCount} séances et ${packagesCount} forfaits`;
          nextReward = `Profitez de vos avantages exclusifs !`;
        }

        // Envoyer via EmailJS
        if (process.env.EMAILJS_PUBLIC_KEY) {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: 'default_service',
              template_id: 'template_review',
              user_id: process.env.EMAILJS_PUBLIC_KEY,
              template_params: {
                to_email: reservation.user.email,
                client_name: reservation.user.name || 'Cliente',
                service_name: serviceNames,
                review_link: `https://laiaskin.fr/avis?id=${reservation.id}`,
                loyalty_progress: loyaltyProgress,
                next_reward: nextReward,
                from_name: 'LAIA SKIN Institut',
                reply_to: 'contact@laiaskin.fr'
              }
            })
          });

          if (response.ok) {
            // Marquer comme envoyé
            await prisma.reservation.update({
              where: { id: reservation.id },
              data: { reviewEmailSent: true }
            });
            sentCount++;
            console.log(`✅ Avis envoyé à: ${reservation.user.email}`);
          }
        }
      } catch (error) {
        console.error(`Erreur envoi avis pour ${reservation.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} demandes d'avis envoyées`,
      total: completedReservations.length
    });

  } catch (error) {
    console.error('Erreur cron review:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des demandes d\'avis' 
    }, { status: 500 });
  }
}

// Endpoint manuel pour tester
export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json();
    
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

    if (!reservation || !reservation.user?.email) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Envoyer l'email d'avis
    const services = JSON.parse(reservation.services as string);
    const serviceNames = services.map((s: string) => {
      const serviceMap: any = {
        'hydro-naissance': "Hydro'Naissance",
        'hydro': "Hydro'Cleaning",
        'renaissance': 'Renaissance',
        'bbglow': 'BB Glow',
        'led': 'LED Thérapie'
      };
      return serviceMap[s] || s;
    }).join(', ');

    // Calculer les informations de fidélité
    const loyaltyProfile = reservation.user.loyaltyProfile;
    const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
    const packagesCount = loyaltyProfile?.packagesCount || 0;
    
    // Déterminer la prochaine récompense
    let loyaltyProgress = '';
    let nextReward = '';
    
    if (sessionsCount < 3) {
      loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 3`;
      nextReward = `Plus que ${3 - sessionsCount} séance${3 - sessionsCount > 1 ? 's' : ''} pour obtenir -10% sur votre prochain soin !`;
    } else if (sessionsCount < 5) {
      loyaltyProgress = `Vous avez ${sessionsCount} séances`;
      nextReward = `Plus que ${5 - sessionsCount} séance${5 - sessionsCount > 1 ? 's' : ''} pour obtenir -15% sur votre prochain soin !`;
    } else if (packagesCount < 1) {
      loyaltyProgress = `Vous avez ${sessionsCount} séances`;
      nextReward = `Achetez votre premier forfait pour obtenir -20% !`;
    } else if (packagesCount < 2) {
      loyaltyProgress = `Vous avez ${sessionsCount} séances et ${packagesCount} forfait`;
      nextReward = `Plus qu'1 forfait pour obtenir un soin OFFERT !`;
    } else {
      loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP avec ${sessionsCount} séances et ${packagesCount} forfaits`;
      nextReward = `Profitez de vos avantages exclusifs !`;
    }

    if (process.env.EMAILJS_PUBLIC_KEY) {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'default_service',
          template_id: 'template_36zodeb', // Template review/avis
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: reservation.user.email,
            client_name: reservation.user.name || 'Cliente',
            service_name: serviceNames,
            review_link: `https://laiaskin.fr/avis?id=${reservation.id}`,
            loyalty_progress: loyaltyProgress,
            next_reward: nextReward,
            from_name: 'LAIA SKIN Institut',
            reply_to: 'contact@laiaskin.fr'
          }
        })
      });

      if (response.ok) {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { reviewEmailSent: true }
        });
        
        return NextResponse.json({ 
          success: true,
          message: 'Email d\'avis envoyé'
        });
      }
    }

    return NextResponse.json({ 
      success: false,
      message: 'Service email non configuré'
    });

  } catch (error) {
    console.error('Erreur envoi avis manuel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi' 
    }, { status: 500 });
  }
}