import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getSiteConfig } from '@/lib/config-service';

export async function POST(request: NextRequest) {
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


  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { automationId, recipients } = await request.json();

    // Récupérer l'automatisation
    const automation = await prisma.emailAutomation.findUnique({
      where: { id: automationId }
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automatisation non trouvée' }, { status: 404 });
    }

    // Récupérer les détails des destinataires
    const clients = await prisma.user.findMany({
      where: {
        email: {
          in: recipients
        }
      }
    });

    const results = [];
    const timing = automation.timing ? JSON.parse(automation.timing) : {};

    // Préparer les paramètres selon le type d'automatisation
    for (const client of clients) {
      try {
        let templateParams: any = {
          to_email: client.email,
          client_name: client.name,
          from_name: `${siteName}`,
          reply_to: `${email}`
        };

        // Adapter les paramètres selon le trigger
        switch (automation.trigger) {
          case 'booking_confirmation':
            // Pour confirmation de réservation
            const nextReservation = await prisma.reservation.findFirst({
              where: {
                userId: client.id,
                date: {
                  gte: new Date()
                }
              },
              orderBy: {
                date: 'asc'
              },
              include: {
                service: true
              }
            });

            if (nextReservation) {
              templateParams.service_name = nextReservation.service?.name || 'votre soin';
              templateParams.appointment_date = nextReservation.date.toLocaleDateString('fr-FR');
              templateParams.appointment_time = nextReservation.time;
              templateParams.salon_name = `${siteName}`;
              templateParams.salon_address = '${fullAddress}';
            } else {
              // Si pas de réservation, utiliser des valeurs par défaut
              templateParams.service_name = 'votre prochain soin';
              templateParams.appointment_date = 'à confirmer';
              templateParams.appointment_time = 'à confirmer';
              templateParams.salon_name = `${siteName}`;
              templateParams.salon_address = '${fullAddress}';
            }
            break;

          case 'review_request':
            // Pour demande d'avis
            const lastReservation = await prisma.reservation.findFirst({
              where: {
                userId: client.id,
                date: {
                  lt: new Date()
                }
              },
              orderBy: {
                date: 'desc'
              },
              include: {
                service: true
              }
            });

            templateParams.service_name = lastReservation?.service?.name || 'votre dernier soin';
            templateParams.review_link = `https://${website.replace('https://', '').replace('http://', '')}/avis?client=${client.id}`;
            templateParams.loyalty_progress = `${client.loyaltyPoints || 0} points`;
            templateParams.next_reward = 'Prochain palier : -10% à 100 points';
            break;

          case 'appointment_reminder':
          case 'appointment_reminder_48h':
            // Pour les rappels
            const upcomingReservation = await prisma.reservation.findFirst({
              where: {
                userId: client.id,
                date: {
                  gte: new Date()
                }
              },
              orderBy: {
                date: 'asc'
              },
              include: {
                service: true
              }
            });

            if (upcomingReservation) {
              templateParams.service_name = upcomingReservation.service?.name || 'votre soin';
              templateParams.appointment_date = upcomingReservation.date.toLocaleDateString('fr-FR');
              templateParams.appointment_time = upcomingReservation.time;
              templateParams.salon_name = `${siteName}`;
              templateParams.salon_address = '${fullAddress}';
            }
            break;

          case 'birthday':
            // Pour anniversaire
            templateParams.service_name = 'Joyeux anniversaire !';
            templateParams.review_link = `https://${website.replace('https://', '').replace('http://', '')}`;
            templateParams.loyalty_progress = '🎂 Offre anniversaire : -30% sur un soin';
            templateParams.next_reward = 'Valable tout le mois de votre anniversaire';
            break;

          default:
            // Par défaut
            templateParams.service_name = 'votre soin';
            templateParams.appointment_date = new Date().toLocaleDateString('fr-FR');
            templateParams.appointment_time = '';
        }

        // Envoyer via EmailJS
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: 'default_service',
            template_id: automation.template,
            user_id: 'QK6MriGN3B0UqkIoS',
            template_params: templateParams
          })
        });

        const success = response.ok;

        // Enregistrer dans l'historique
        await prisma.emailHistory.create({
          data: {
            from: `${email}`,
            to: client.email,
            subject: `${automation.name} - Envoi manuel`,
            content: `Automatisation déclenchée manuellement : ${automation.name}`,
            template: automation.template,
            status: success ? 'sent' : 'failed',
            userId: client.id
          }
        });

        results.push({
          email: client.email,
          name: client.name,
          success,
          message: success ? 'Email envoyé' : 'Échec de l\'envoi'
        });

      } catch (error) {
        console.error(`Erreur envoi à ${client.email}:`, error);
        results.push({
          email: client.email,
          name: client.name,
          success: false,
          message: 'Erreur lors de l\'envoi'
        });
      }
    }

    // Mettre à jour lastRun
    await prisma.emailAutomation.update({
      where: { id: automationId },
      data: {
        lastRun: new Date()
      }
    });

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} email(s) envoyé(s), ${failCount} échec(s)`,
      results
    });

  } catch (error) {
    console.error('Erreur déclenchement automatisation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}