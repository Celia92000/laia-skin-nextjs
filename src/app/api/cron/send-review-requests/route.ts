import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResend } from '@/lib/resend';
import { sendWhatsAppMessage } from '@/lib/whatsapp-meta';
import { getSiteConfig } from '@/lib/config-service';
import { log } from '@/lib/logger';

// Cette API doit être appelée tous les jours à 10h (via un cron job)
export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      log.info('Resend non configuré - emails non envoyés');
      return NextResponse.json({
        success: false,
        message: 'Resend non configuré - emails non envoyés'
      });
    }

    // 🔒 Récupérer toutes les organisations actives
    const organizations = await prisma.organization.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        customDomain: true,
        subdomain: true
      }
    });

    log.info(`📧 Traitement de ${organizations.length} organisation(s)`);

    // Récupérer les réservations d'il y a 3 jours qui sont terminées
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const threeDaysAgoEnd = new Date(threeDaysAgo);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    let totalSentCount = 0;

    // 🔒 Traiter chaque organisation séparément
    for (const organization of organizations) {
      // Récupérer la config de cette organisation
      const orgConfig = await prisma.organizationConfig.findUnique({
        where: { organizationId: organization.id }
      });

      const siteName = orgConfig?.siteName || organization.name || 'Mon Institut';
      const email = orgConfig?.email || 'contact@institut.fr';
      const primaryColor = orgConfig?.primaryColor || '#d4b5a0';
      const phone = orgConfig?.phone || '06 XX XX XX XX';
      const address = orgConfig?.address || '';
      const city = orgConfig?.city || '';
      const postalCode = orgConfig?.postalCode || '';
      const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
      const website = organization.customDomain || (organization.subdomain ? `https://${organization.subdomain}.laia-connect.fr` : 'https://votre-institut.fr');
      const ownerName = orgConfig?.legalRepName?.split(' ')[0] || 'Votre esthéticienne';

      // 🔒 Récupérer les réservations DE CETTE ORGANISATION
      const completedReservations = await prisma.reservation.findMany({
        where: {
          organizationId: organization.id,
          date: {
            gte: threeDaysAgo,
            lte: threeDaysAgoEnd
          },
          status: 'confirmed',
          reviewEmailSent: false
        },
        include: {
          user: {
            include: {
              loyaltyProfile: true
            }
          }
        }
      });

      log.info(`[${organization.name}] ${completedReservations.length} demande(s) d'avis à envoyer`);

      let sentCount = 0;

      for (const reservation of completedReservations) {
      if (!reservation.user?.email) continue;

      try {
        // Préparer les données pour l'email
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
        
        // Déterminer la prochaine récompense
        let loyaltyProgress = '';
        let nextReward = '';
        
        if (sessionsCount < 5) {
          loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 6`;
          nextReward = `Plus que ${6 - sessionsCount} séance${6 - sessionsCount > 1 ? 's' : ''} pour obtenir 20€ de réduction sur votre 6ème soin !`;
        } else if (sessionsCount === 5) {
          loyaltyProgress = `Vous avez 5 séances`;
          nextReward = `Votre prochain soin bénéficie de 20€ de réduction !`;
        } else if (packagesCount < 3) {
          loyaltyProgress = `Vous avez ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} sur 4`;
          nextReward = `Plus que ${4 - packagesCount} forfait${4 - packagesCount > 1 ? 's' : ''} pour obtenir 40€ de réduction sur votre 4ème forfait !`;
        } else if (packagesCount === 3) {
          loyaltyProgress = `Vous avez 3 forfaits`;
          nextReward = `Votre prochain forfait bénéficie de 40€ de réduction !`;
        } else {
          loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP avec ${sessionsCount} séances et ${packagesCount} forfaits`;
          nextReward = `Profitez de vos avantages exclusifs !`;
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .review-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .btn { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 15px 0; }
    .loyalty-box { background: #f0f8ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Comment s'est passé votre soin ?</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name || 'Cliente'},</p>
      
      <p>J'espère que vous avez apprécié votre soin <strong>${serviceNames}</strong> !</p>
      
      <div class="review-box">
        <h3>💕 Votre avis compte énormément pour moi</h3>
        <p>Pourriez-vous prendre quelques secondes pour partager votre expérience ?</p>
        <a href="https://laiaskin.fr/avis?id=${reservation.id}" class="btn">Donner mon avis</a>
      </div>
      
      <div class="loyalty-box">
        <h3>🎆 Votre statut fidélité</h3>
        <p>${loyaltyProgress}</p>
        <p><strong>${nextReward}</strong></p>
      </div>
      
      <p>Merci infiniment pour votre confiance !</p>
      
      <p>À très bientôt,<br>
      <strong>Laïa</strong><br>
      ${siteName}</p>
    </div>
    <div class="footer">
      <p>📍 ${fullAddress}<br>
      📞 ${phone}<br>
      🌐 ${website.replace('https://', '').replace('http://', '')}</p>
    </div>
  </div>
</body>
</html>`;

        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || `${siteName} <${email}>`,
          to: [reservation.user.email],
          subject: `✨ Comment s'est passé votre soin ${serviceNames} ?`,
          html: htmlContent,
          text: `Bonjour ${reservation.user.name}, j'espère que vous avez apprécié votre soin ! Votre avis compte énormément pour moi.`
        });

        // Marquer comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reviewEmailSent: true }
        });

        // 🔒 Enregistrer dans l'historique AVEC organizationId
        await prisma.emailHistory.create({
          data: {
            from: `${email}`,
            to: reservation.user.email,
            subject: `✨ Demande d'avis`,
            content: `Demande d'avis automatique pour le soin ${serviceNames}`,
            template: 'review_request',
            status: 'sent',
            direction: 'outgoing',
            userId: reservation.userId,
            organizationId: organization.id
          }
        });

        // Envoyer aussi par WhatsApp si le numéro est disponible
        if (reservation.user.phone) {
          const whatsappMessage = `✨ *${siteName}* ✨

Bonjour ${reservation.user.name} ! 💕

J'espère que vous avez apprécié votre soin *${serviceNames}* d'il y a 3 jours.

⭐ *Votre avis est précieux !*
Pourriez-vous prendre quelques secondes pour partager votre expérience ?

👉 Cliquez ici : https://laiaskin.fr/avis?id=${reservation.id}

🎁 *Programme de fidélité*
${loyaltyProgress}
${nextReward}

Merci infiniment ! 🙏
*${siteName}*`;
          
          try {
            await sendWhatsAppMessage({
              to: reservation.user.phone,
              message: whatsappMessage
            });
            log.info(`📱 WhatsApp avis envoyé à: ${reservation.user.phone}`);
          } catch (whatsappError) {
            log.error('Erreur WhatsApp:', whatsappError);
          }
        }

        sentCount++;
        totalSentCount++;
        log.info(`[${organization.name}] ✅ Avis envoyé à: ${reservation.user.email}`);
      } catch (error) {
        log.error(`[${organization.name}] Erreur envoi avis pour ${reservation.id}:`, error);
      }
    }

      log.info(`[${organization.name}] ${sentCount} demande(s) d'avis envoyée(s)`);
    }

    return NextResponse.json({
      success: true,
      message: `${totalSentCount} demandes d'avis envoyées sur ${organizations.length} organisation(s)`,
      totalSent: totalSentCount,
      organizationsProcessed: organizations.length
    });

  } catch (error) {
    log.error('Erreur cron review:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des demandes d\'avis' 
    }, { status: 500 });
  }
}

// Endpoint manuel pour tester
export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json();

    // 🔒 ÉTAPE 1 : Récupérer la réservation avec son organizationId
    const reservation = await prisma.reservation.findFirst({
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

    // 🔒 ÉTAPE 2 : Vérifier que la réservation a un organizationId
    if (!reservation.organizationId) {
      return NextResponse.json({ error: 'Organisation non définie pour cette réservation' }, { status: 400 });
    }

    // 🔒 ÉTAPE 3 : Récupérer la config DE CETTE ORGANISATION
    const orgConfig = await prisma.organizationConfig.findUnique({
      where: { organizationId: reservation.organizationId }
    });

    const organization = await prisma.organization.findUnique({
      where: { id: reservation.organizationId },
      select: {
        id: true,
        name: true,
        customDomain: true,
        subdomain: true
      }
    });

    // 🔒 Utiliser la config spécifique à cette organisation
    const siteName = orgConfig?.siteName || organization?.name || 'Mon Institut';
    const email = orgConfig?.email || 'contact@institut.fr';
    const phone = orgConfig?.phone || '06 XX XX XX XX';
    const address = orgConfig?.address || '';
    const city = orgConfig?.city || '';
    const postalCode = orgConfig?.postalCode || '';
    const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
    const website = organization?.customDomain || (organization?.subdomain ? `https://${organization.subdomain}.laia-connect.fr` : 'https://votre-institut.fr');

    // Envoyer l'email d'avis
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
    
    // Déterminer la prochaine récompense
    let loyaltyProgress = '';
    let nextReward = '';
    
    if (sessionsCount < 5) {
      loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 6`;
      nextReward = `Plus que ${6 - sessionsCount} séance${6 - sessionsCount > 1 ? 's' : ''} pour obtenir 10€ de réduction sur votre 6ème soin !`;
    } else if (sessionsCount === 5) {
      loyaltyProgress = `Vous avez 5 séances`;
      nextReward = `Votre prochain soin bénéficie de 10€ de réduction !`;
    } else if (packagesCount < 3) {
      loyaltyProgress = `Vous avez ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} sur 4`;
      nextReward = `Plus que ${4 - packagesCount} forfait${4 - packagesCount > 1 ? 's' : ''} pour obtenir 20€ de réduction sur votre 4ème forfait !`;
    } else if (packagesCount === 3) {
      loyaltyProgress = `Vous avez 3 forfaits`;
      nextReward = `Votre prochain forfait bénéficie de 20€ de réduction !`;
    } else {
      loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP avec ${sessionsCount} séances et ${packagesCount} forfaits`;
      nextReward = `Profitez de vos avantages exclusifs !`;
    }

    // Vérifier que Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      return NextResponse.json({ 
        success: false,
        message: 'Service email non configuré'
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .review-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .btn { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 15px 0; }
    .loyalty-box { background: #f0f8ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Comment s'est passé votre soin ?</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name || 'Cliente'},</p>
      
      <p>J'espère que vous avez apprécié votre soin <strong>${serviceNames}</strong> !</p>
      
      <div class="review-box">
        <h3>💕 Votre avis compte énormément pour moi</h3>
        <p>Pourriez-vous prendre quelques secondes pour partager votre expérience ?</p>
        <a href="https://laiaskin.fr/avis?id=${reservation.id}" class="btn">Donner mon avis</a>
      </div>
      
      <div class="loyalty-box">
        <h3>🎆 Votre statut fidélité</h3>
        <p>${loyaltyProgress}</p>
        <p><strong>${nextReward}</strong></p>
      </div>
      
      <p>Merci infiniment pour votre confiance !</p>
      
      <p>À très bientôt,<br>
      <strong>Laïa</strong><br>
      ${siteName}</p>
    </div>
    <div class="footer">
      <p>📍 ${fullAddress}<br>
      📞 ${phone}<br>
      🌐 ${website.replace('https://', '').replace('http://', '')}</p>
    </div>
  </div>
</body>
</html>`;

    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || `${siteName} <${email}>`,
      to: [reservation.user.email],
      subject: `✨ Comment s'est passé votre soin ${serviceNames} ?`,
      html: htmlContent,
      text: `Bonjour ${reservation.user.name}, j'espère que vous avez apprécié votre soin ! Votre avis compte énormément pour moi.`
    });

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { reviewEmailSent: true }
    });

    // 🔒 Enregistrer dans l'historique AVEC organizationId
    await prisma.emailHistory.create({
      data: {
        from: `${email}`,
        to: reservation.user.email,
        subject: `✨ Demande d'avis`,
        content: `Demande d'avis manuelle pour le soin ${serviceNames}`,
        template: 'review_request',
        status: 'sent',
        direction: 'outgoing',
        userId: reservation.userId,
        organizationId: reservation.organizationId // 🔒 CRITIQUE
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email d\'avis envoyé'
    });

  } catch (error) {
    log.error('Erreur envoi avis manuel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi' 
    }, { status: 500 });
  }
}