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

    // Récupérer les réservations dans 48h (après-demain)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    
    const twoDaysFromNowEnd = new Date(twoDaysFromNow);
    twoDaysFromNowEnd.setHours(23, 59, 59, 999);

    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: twoDaysFromNow,
          lte: twoDaysFromNowEnd
        },
        status: 'confirmed' // Seulement les RDV confirmés
      },
      include: {
        user: true
      }
    });

    console.log(`📧 ${upcomingReservations.length} rappels 48h à envoyer`);

    let sentCount = 0;
    
    for (const reservation of upcomingReservations) {
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

        // Calculer la durée totale (75 min par soin)
        const duration = `${services.length * 75} minutes`;

        // Envoyer via EmailJS
        if (process.env.EMAILJS_PUBLIC_KEY) {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: 'default_service',
              template_id: 'template_reminder_48h',
              user_id: process.env.EMAILJS_PUBLIC_KEY,
              template_params: {
                to_email: reservation.user.email,
                client_name: reservation.user.name || 'Cliente',
                date: reservation.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }),
                time: reservation.time,
                services: serviceNames,
                duration: duration,
                from_name: 'LAIA SKIN Institut',
                reply_to: 'contact@laiaskin.fr'
              }
            })
          });

          if (response.ok) {
            sentCount++;
            console.log(`✅ Rappel 48h envoyé à: ${reservation.user.email}`);
          }
        }
      } catch (error) {
        console.error(`Erreur envoi rappel pour ${reservation.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} rappels 48h envoyés`,
      total: upcomingReservations.length
    });

  } catch (error) {
    console.error('Erreur cron reminder 48h:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des rappels' 
    }, { status: 500 });
  }
}