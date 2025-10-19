import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getSiteConfig } from '@/lib/config-service';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const config = await getSiteConfig();
  const email = config.email || 'contact@institut.fr';
  const phone = config.phone || '06 XX XX XX XX';
  const website = config.customDomain || 'https://votre-institut.fr';


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

    let emailsSent = {
      confirmations: 0,
      birthdays: 0
    };

    // ========================================
    // 1. CONFIRMATIONS DE RENDEZ-VOUS (J-1)
    // ========================================
    console.log('🔔 Recherche des réservations à confirmer...');

    const reservationsToConfirm = await prisma.reservation.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        },
        status: 'confirmed',
        reminderSent: false
      },
      include: {
        user: true,
        service: true
      }
    });

    console.log(`📅 ${reservationsToConfirm.length} réservations trouvées pour demain`);

    for (const reservation of reservationsToConfirm) {
      try {
        const serviceNames = reservation.services ?
          JSON.parse(reservation.services as string).join(', ') :
          reservation.service?.name || 'Service';

        const formattedDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Envoyer email de confirmation
        await sendEmail({
          to: reservation.user.email,
          subject: `📅 Rappel: Votre RDV demain chez Laia Skin Institut`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #d4a574; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #7f8c8d; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4a574; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌟 Rappel de votre rendez-vous</h1>
                </div>
                <div class="content">
                  <p>Bonjour ${reservation.user.name},</p>

                  <p>Nous avons le plaisir de vous rappeler votre rendez-vous <strong>demain</strong> :</p>

                  <div class="info-box">
                    <p><strong>📅 Date :</strong> ${formattedDate}</p>
                    <p><strong>⏰ Heure :</strong> ${reservation.time}</p>
                    <p><strong>💆‍♀️ Prestation :</strong> ${serviceNames}</p>
                    <p><strong>📍 Lieu :</strong> Laia Skin Institut<br>
                    123 rue de la Beauté, 75001 Paris</p>
                  </div>

                  <center>
                    <a href="${process.env.NEXT_PUBLIC_URL}/espace-client" class="button">
                      Gérer mon rendez-vous
                    </a>
                  </center>

                  <p>💡 <strong>Conseils pour votre venue :</strong></p>
                  <ul>
                    <li>Arrivez 5 minutes en avance</li>
                    <li>Venez démaquillée si possible</li>
                    <li>Pensez à nous signaler tout changement</li>
                  </ul>

                  <p>Nous avons hâte de vous accueillir !</p>

                  <p>Chaleureusement,<br>
                  <strong>L'équipe Laia Skin Institut</strong></p>
                </div>
                <div class="footer">
                  <p>📞 ${phone} | 📧 ${email}</p>
                  <p>Pour annuler ou reporter : connectez-vous à votre espace client</p>
                </div>
              </div>
            </body>
            </html>
          `
        });

        // Marquer comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reminderSent: true }
        });

        emailsSent.confirmations++;
        console.log(`✅ Confirmation envoyée à ${reservation.user.email}`);
      } catch (error) {
        console.error(`❌ Erreur envoi confirmation pour ${reservation.user.email}:`, error);
      }
    }

    // ========================================
    // 2. EMAILS D'ANNIVERSAIRE
    // ========================================
    console.log('🎂 Recherche des anniversaires du jour...');

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const usersWithBirthday = await prisma.user.findMany({
      where: {
        birthDate: {
          not: null
        }
      }
    });

    const birthdayUsers = usersWithBirthday.filter(user => {
      if (!user.birthDate) return false;
      const birthDate = new Date(user.birthDate);
      return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
    });

    console.log(`🎉 ${birthdayUsers.length} anniversaires aujourd'hui`);

    for (const user of birthdayUsers) {
      try {
        // Créer un code promo anniversaire
        const promoCode = `ANNIVERSAIRE${user.id.slice(-4).toUpperCase()}`;

        await sendEmail({
          to: user.email,
          subject: `🎂 Joyeux anniversaire ${user.name} ! Un cadeau vous attend`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #e91e63 0%, #f06292 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff5f8; padding: 30px; border-radius: 0 0 10px 10px; }
                .gift-box { background: white; border: 2px dashed #e91e63; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0; }
                .promo-code { font-size: 28px; font-weight: bold; color: #e91e63; letter-spacing: 2px; padding: 15px; background: #ffe0ec; border-radius: 8px; display: inline-block; margin: 10px 0; }
                .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #e91e63 0%, #f06292 100%); color: white; text-decoration: none; border-radius: 30px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; padding: 20px; color: #7f8c8d; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎂 Joyeux Anniversaire ${user.name} ! 🎉</h1>
                </div>
                <div class="content">
                  <p style="font-size: 18px;">Chère ${user.name},</p>

                  <p>Toute l'équipe de Laia Skin Institut vous souhaite un <strong>merveilleux anniversaire</strong> !</p>

                  <p>Pour célébrer ce jour spécial, nous avons le plaisir de vous offrir :</p>

                  <div class="gift-box">
                    <h2>🎁 VOTRE CADEAU D'ANNIVERSAIRE 🎁</h2>
                    <p style="font-size: 20px; color: #e91e63; font-weight: bold;">
                      -20% sur votre prochain soin
                    </p>
                    <p>Votre code promo personnel :</p>
                    <div class="promo-code">${promoCode}</div>
                    <p style="font-size: 14px; color: #7f8c8d;">
                      Valable 30 jours • Non cumulable
                    </p>
                  </div>

                  <center>
                    <a href="${process.env.NEXT_PUBLIC_URL}/reservation" class="button">
                      Réserver mon soin anniversaire
                    </a>
                  </center>

                  <p>Nous serions ravis de vous chouchouter en cette occasion spéciale.
                  Offrez-vous un moment de détente et de bien-être, vous le méritez !</p>

                  <p>Encore une fois, <strong>joyeux anniversaire</strong> ! 🌟</p>

                  <p>Avec toute notre affection,<br>
                  <strong>L'équipe Laia Skin Institut</strong> 💕</p>
                </div>
                <div class="footer">
                  <p>📞 ${phone} | 📧 ${email}</p>
                  <p>Ce code est unique et personnel, ne le partagez pas</p>
                </div>
              </div>
            </body>
            </html>
          `
        });

        emailsSent.birthdays++;
        console.log(`✅ Email anniversaire envoyé à ${user.email}`);
      } catch (error) {
        console.error(`❌ Erreur envoi anniversaire pour ${user.email}:`, error);
      }
    }

    console.log('📊 Résumé des envois emails:');
    console.log(`- Confirmations RDV: ${emailsSent.confirmations}`);
    console.log(`- Anniversaires: ${emailsSent.birthdays}`);

    return NextResponse.json({
      success: true,
      message: 'Emails quotidiens envoyés',
      stats: emailsSent
    });

  } catch (error) {
    console.error('❌ Erreur cron emails quotidiens:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des emails' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}