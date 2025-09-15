import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Initialiser Resend avec une clé dummy pour le build
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

// Cette API doit être appelée tous les jours à 9h (via un cron job)
export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les clients dont c'est l'anniversaire aujourd'hui
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Mois actuel (1-12)
    const currentDay = today.getDate();

    // Récupérer tous les utilisateurs avec une date de naissance
    const allUsers = await prisma.user.findMany({
      where: {
        birthDate: {
          not: null
        },
        role: 'client' // Seulement les clients
      }
    });

    // Filtrer ceux dont c'est l'anniversaire aujourd'hui
    const birthdayUsers = allUsers.filter(user => {
      if (!user.birthDate) return false;
      const birthDate = new Date(user.birthDate);
      return birthDate.getMonth() + 1 === currentMonth && birthDate.getDate() === currentDay;
    });

    console.log(`🎂 ${birthdayUsers.length} emails d'anniversaire à envoyer`);

    let sentCount = 0;
    
    for (const user of birthdayUsers) {
      if (!user.email) continue;

      try {
        // Générer le code promo du mois
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const currentMonthCode = monthNames[currentMonth - 1];

        // Vérifier que Resend est configuré
        if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
          console.log('Resend non configuré - emails non envoyés');
          continue;
        }

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
        <p>Toute l'équipe de LAIA SKIN Institut vous souhaite un merveilleux anniversaire !</p>
        
        <p><strong>Notre cadeau pour vous :</strong></p>
        <div class="code">-30% SUR TOUS LES SOINS</div>
        <p><em>Code promo : ${currentMonthCode}2025</em></p>
        <p><em>Valable tout le mois de votre anniversaire</em></p>
      </div>
      
      <p>Profitez de cette offre exceptionnelle pour vous faire plaisir avec le soin de votre choix.</p>
      
      <p>Pour réserver, contactez-nous :</p>
      <ul>
        <li>📞 WhatsApp : 06 83 71 70 50</li>
        <li>✉️ Email : contact@laiaskininstitut.fr</li>
      </ul>
      
      <p>Nous avons hâte de célébrer avec vous !</p>
      
      <p>Très belle journée à vous,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      🌐 laiaskininstitut.fr</p>
    </div>
  </div>
</body>
</html>`;

        await resend!.emails.send({
          from: 'LAIA SKIN Institut <onboarding@resend.dev>',
          to: [user.email],
          subject: `🎂 Joyeux anniversaire ${user.name} ! Une surprise vous attend`,
          html: htmlContent,
          text: `Joyeux anniversaire ${user.name} ! Profitez de -30% sur tous nos soins ce mois-ci avec le code ${currentMonthCode}2025.`
        });

        // Enregistrer dans l'historique
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laiaskininstitut.fr',
            to: user.email,
            subject: `🎂 Joyeux anniversaire ${user.name} !`,
            content: 'Email d\'anniversaire automatique',
            template: 'birthday',
            status: 'sent',
            direction: 'outgoing',
            userId: user.id
          }
        });

        // Créer une notification pour l'admin
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'birthday',
            title: 'Joyeux anniversaire !',
            message: `Email d'anniversaire envoyé à ${user.name}`,
            actionUrl: `/admin/clients?id=${user.id}`
          }
        });

        sentCount++;
        console.log(`✅ Email anniversaire envoyé à: ${user.email}`);
      } catch (error) {
        console.error(`Erreur envoi anniversaire pour ${user.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} emails d'anniversaire envoyés`,
      total: birthdayUsers.length
    });

  } catch (error) {
    console.error('Erreur cron birthday:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des emails d\'anniversaire' 
    }, { status: 500 });
  }
}