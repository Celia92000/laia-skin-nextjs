import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    // En production, vérifier le secret
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    }

    const prisma = await getPrismaClient();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    let messagesSent = {
      reminders: 0,
      reviews: 0
    };

    // ========================================
    // 1. RAPPELS DE RENDEZ-VOUS PAR WHATSAPP (J-1)
    // ========================================
    console.log('📱 Recherche des rappels WhatsApp à envoyer...');

    const reservationsForReminder = await prisma.reservation.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        },
        status: 'confirmed',
        reminder24hSent: false
      },
      include: {
        user: true,
        service: true
      }
    });

    console.log(`📅 ${reservationsForReminder.length} rappels WhatsApp à envoyer pour demain`);

    for (const reservation of reservationsForReminder) {
      try {
        // Vérifier que le client a un numéro de téléphone
        if (!reservation.user.phone) {
          console.log(`⚠️ Pas de téléphone pour ${reservation.user.name}`);
          continue;
        }

        const serviceNames = reservation.services ?
          JSON.parse(reservation.services as string).join(', ') :
          reservation.service?.name || 'votre soin';

        const formattedDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });

        const message = `🌟 *Rappel de votre RDV*

Bonjour ${reservation.user.name} 👋

C'est demain ! Nous avons hâte de vous accueillir pour :

📅 *${formattedDate}*
⏰ *${reservation.time}*
💆‍♀️ *${serviceNames}*

📍 *Laia Skin Institut*
123 rue de la Beauté, 75001 Paris

💡 *Petits conseils :*
• Arrivez 5 min en avance
• Venez démaquillée si possible
• N'hésitez pas à nous appeler si besoin

Pour toute modification : 📞 ${phone}

À demain ! ✨
*L'équipe Laia Skin Institut*`;

        // Envoyer le message WhatsApp
        await WhatsAppService.sendMessage(
          reservation.user.phone,
          message
        );

        // Marquer comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reminder24hSent: true }
        });

        messagesSent.reminders++;
        console.log(`✅ Rappel WhatsApp envoyé à ${reservation.user.phone}`);

        // Attendre un peu entre chaque envoi pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Erreur envoi rappel WhatsApp pour ${reservation.user.phone}:`, error);
      }
    }

    // ========================================
    // 2. DEMANDES D'AVIS PAR WHATSAPP (J+1)
    // ========================================
    console.log('⭐ Recherche des demandes d\'avis à envoyer...');

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const completedReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: yesterday,
          lt: today
        },
        status: 'completed',
        reviewWhatsAppSent: false
      },
      include: {
        user: true,
        service: true
      }
    });

    console.log(`⭐ ${completedReservations.length} demandes d'avis à envoyer`);

    for (const reservation of completedReservations) {
      try {
        if (!reservation.user.phone) {
          console.log(`⚠️ Pas de téléphone pour ${reservation.user.name}`);
          continue;
        }

        const serviceNames = reservation.services ?
          JSON.parse(reservation.services as string).join(', ') :
          reservation.service?.name || 'votre soin';

        const reviewLink = `${process.env.NEXT_PUBLIC_URL}/avis/nouveau?reservation=${reservation.id}`;

        const message = `✨ *Comment s'est passé votre soin ?*

Bonjour ${reservation.user.name} 🌟

J'espère que vous avez apprécié votre moment de détente hier avec *${serviceNames}*.

Votre avis compte énormément pour nous ! 💕

⭐ *Partagez votre expérience :*
${reviewLink}

Cela ne prend que 30 secondes et nous aide beaucoup 🙏

Si vous avez été satisfait(e), n'hésitez pas à nous recommander à vos proches. En retour, vous recevrez 20€ de réduction ! 🎁

Merci pour votre confiance,
*Laia* 💆‍♀️`;

        await WhatsAppService.sendMessage(
          reservation.user.phone,
          message
        );

        // Marquer comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reviewWhatsAppSent: true }
        });

        messagesSent.reviews++;
        console.log(`✅ Demande d'avis WhatsApp envoyée à ${reservation.user.phone}`);

        // Attendre entre chaque envoi
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Erreur envoi demande d'avis pour ${reservation.user.phone}:`, error);
      }
    }

    console.log('📊 Résumé des envois WhatsApp:');
    console.log(`- Rappels RDV: ${messagesSent.reminders}`);
    console.log(`- Demandes d'avis: ${messagesSent.reviews}`);

    return NextResponse.json({
      success: true,
      message: 'Messages WhatsApp quotidiens envoyés',
      stats: messagesSent
    });

  } catch (error) {
    console.error('❌ Erreur cron WhatsApp quotidien:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des messages WhatsApp' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}