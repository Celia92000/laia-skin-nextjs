import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResend } from '@/lib/resend';
import { getSiteConfig } from '@/lib/config-service';

export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que Resend est bien configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.log('Resend API key not configured, skipping email send');
      return NextResponse.json({
        success: false,
        message: 'Resend non configuré - emails non envoyés'
      });
    }

    // Obtenir la date d'aujourd'hui
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    console.log(`Vérification des anniversaires pour le ${todayDay}/${todayMonth}`);

    // 🔒 Récupérer toutes les organisations actives
    const organizations = await prisma.organization.findMany({
      where: { status: 'ACTIVE' }
    });

    let totalSent = 0;

    // 🔒 Traiter chaque organisation séparément
    for (const organization of organizations) {
      // Récupérer la config de cette organisation
      const orgConfig = await prisma.organizationConfig.findUnique({
        where: { organizationId: organization.id }
      });

      const siteName = orgConfig?.siteName || organization.name || 'Mon Institut';
      const email = orgConfig?.email || 'contact@institut.fr';
      const phone = orgConfig?.phone || '06 XX XX XX XX';
      const address = orgConfig?.address || '';
      const city = orgConfig?.city || '';
      const postalCode = orgConfig?.postalCode || '';
      const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
      const website = orgConfig?.customDomain || 'https://votre-institut.fr';

      // 🔒 Récupérer les clients DE CETTE ORGANISATION dont c'est l'anniversaire
      const users = await prisma.user.findMany({
        where: {
          organizationId: organization.id,
          birthDate: { not: null },
          email: { not: '' }
        }
      });

    // Filtrer les utilisateurs dont c'est l'anniversaire
    const birthdayUsers = users.filter(user => {
      if (!user.birthDate) return false;
      const birthday = new Date(user.birthDate);
      return birthday.getMonth() + 1 === todayMonth && birthday.getDate() === todayDay;
    });

    console.log(`${birthdayUsers.length} anniversaire(s) trouvé(s)`);

    // Envoyer un email à chaque personne
    for (const user of birthdayUsers) {
      try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .birthday-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .code { background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-size: 20px; font-weight: bold; margin: 10px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎂 Joyeux Anniversaire ${user.name} ! 🎉</h1>
    </div>
    <div class="content">
      <p>Bonjour ${user.name},</p>
      
      <div class="birthday-box">
        <h2>C'est votre jour spécial !</h2>
        <p>Toute l'équipe de ${siteName} vous souhaite un merveilleux anniversaire !</p>
        
        <p><strong>Notre cadeau pour vous :</strong></p>
        <div class="code">-30% SUR TOUS LES SOINS</div>
        <p><em>Valable tout le mois de votre anniversaire</em></p>
      </div>
      
      <p>Profitez de cette offre exceptionnelle pour vous faire plaisir avec le soin de votre choix.</p>
      
      <p>Pour réserver, contactez-nous :</p>
      <ul>
        <li>📞 WhatsApp : ${phone}</li>
        <li>✉️ Email : ${email}</li>
      </ul>
      
      <p>Nous avons hâte de célébrer avec vous !</p>
      
      <p>Très belle journée à vous,<br>
      <strong>Laïa</strong><br>
      ${siteName}</p>
    </div>
    <div class="footer">
      <p>📍 ${fullAddress}<br>
      🌐 ${website.replace('https://', '').replace('http://', '')}</p>
    </div>
  </div>
</body>
</html>`;

        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || `${siteName} <${email}>`,
          to: [user.email!],
          subject: `🎂 Joyeux anniversaire ${user.name} ! Une surprise vous attend`,
          html: htmlContent,
          text: `Joyeux anniversaire ${user.name} ! Profitez de -30% sur tous nos soins ce mois-ci.`
        });

        // 🔒 Enregistrer dans l'historique AVEC organizationId
        await prisma.emailHistory.create({
          data: {
            from: `${email}`,
            to: user.email!,
            subject: `🎂 Joyeux anniversaire ${user.name} !`,
            content: 'Email d\'anniversaire automatique',
            template: 'birthday',
            status: 'sent',
            direction: 'outgoing',
            userId: user.id,
            organizationId: organization.id
          }
        });

        console.log(`[${organization.name}] Email d'anniversaire envoyé à ${user.name}`);
        totalSent++;
      } catch (emailError) {
        console.error(`[${organization.name}] Erreur envoi email à ${user.name}:`, emailError);
      }
    }

    console.log(`[${organization.name}] ${birthdayUsers.length} anniversaire(s) traité(s)`);
    }

    return NextResponse.json({
      success: true,
      message: `${totalSent} email(s) d'anniversaire envoyé(s) sur ${organizations.length} organisation(s)`
    });

  } catch (error) {
    console.error('Erreur cron anniversaires:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des emails d\'anniversaire',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}