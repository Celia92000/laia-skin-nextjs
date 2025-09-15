import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Envoyer via EmailJS
        if (process.env.EMAILJS_PUBLIC_KEY) {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: 'default_service',
              template_id: 'template_birthday',
              user_id: process.env.EMAILJS_PUBLIC_KEY,
              template_params: {
                to_email: user.email,
                client_name: user.name || 'Cliente',
                current_month: currentMonthCode,
                from_name: 'LAIA SKIN Institut',
                reply_to: 'contact@laiaskin.fr'
              }
            })
          });

          if (response.ok) {
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
          }
        }
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