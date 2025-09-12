import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage, whatsappTemplates } from '@/lib/whatsapp';
import { sendEmail, emailTemplates } from '@/lib/email';

// Cette API doit être appelée régulièrement (toutes les heures par exemple)
// Via Vercel Cron, GitHub Actions, ou un service externe
export async function GET(request: Request) {
  try {
    // Vérifier le token secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const in2Hours = new Date();
    in2Hours.setHours(in2Hours.getHours() + 2);
    
    // 1. Rappels 24h avant
    const tomorrowReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: 'confirmed'
      },
      include: {
        user: true
      }
    });
    
    for (const reservation of tomorrowReservations) {
      // Vérifier si on n'a pas déjà envoyé ce rappel
      const reminderKey = `reminder_24h_${reservation.id}`;
      const alreadySent = await checkIfReminderSent(reminderKey);
      
      if (!alreadySent) {
        const services = JSON.parse(reservation.services);
        
        // Envoyer WhatsApp si le numéro existe
        if (reservation.user.phone) {
          const message = whatsappTemplates.appointmentReminder({
            clientName: reservation.user.name,
            time: reservation.time,
            services: services
          });
          
          await sendWhatsAppMessage({
            to: reservation.user.phone,
            message
          });
        }
        
        // Envoyer email
        const emailTemplate = emailTemplates.reservationReminder({
          clientName: reservation.user.name,
          date: reservation.date.toLocaleDateString('fr-FR'),
          time: reservation.time,
          services: services
        });
        
        await sendEmail({
          to: reservation.user.email,
          ...emailTemplate
        });
        
        // Marquer comme envoyé
        await markReminderAsSent(reminderKey);
      }
    }
    
    // 2. Rappels 2h avant (optionnel)
    const in2HoursReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: new Date(now.toDateString()),
          lt: new Date(tomorrow.toDateString())
        },
        status: 'confirmed'
      },
      include: {
        user: true
      }
    });
    
    for (const reservation of in2HoursReservations) {
      const [hours, minutes] = reservation.time.split(':').map(Number);
      const reservationTime = new Date(reservation.date);
      reservationTime.setHours(hours, minutes, 0, 0);
      
      const timeDiff = reservationTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Si c'est dans environ 2h
      if (hoursDiff > 1.5 && hoursDiff <= 2.5) {
        const reminderKey = `reminder_2h_${reservation.id}`;
        const alreadySent = await checkIfReminderSent(reminderKey);
        
        if (!alreadySent && reservation.user.phone) {
          const message = `⏰ Rappel: Votre RDV est dans 2h à ${reservation.time}\nLAIA SKIN Institut 💕`;
          
          await sendWhatsAppMessage({
            to: reservation.user.phone,
            message
          });
          
          await markReminderAsSent(reminderKey);
        }
      }
    }
    
    // 3. Messages d'anniversaire
    const todayBirthdays = await prisma.user.findMany({
      where: {
        birthDate: {
          not: null
        },
        role: 'client'
      }
    });
    
    for (const user of todayBirthdays) {
      if (user.birthDate) {
        const birthdate = new Date(user.birthDate);
        if (birthdate.getDate() === now.getDate() && 
            birthdate.getMonth() === now.getMonth()) {
          
          const reminderKey = `birthday_${user.id}_${now.getFullYear()}`;
          const alreadySent = await checkIfReminderSent(reminderKey);
          
          if (!alreadySent) {
            // WhatsApp
            if (user.phone) {
              const message = whatsappTemplates.birthdayMessage({
                clientName: user.name
              });
              
              await sendWhatsAppMessage({
                to: user.phone,
                message
              });
            }
            
            // Email
            const emailTemplate = emailTemplates.birthdayWish({
              clientName: user.name
            });
            
            await sendEmail({
              to: user.email,
              ...emailTemplate
            });
            
            await markReminderAsSent(reminderKey);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      reminders24h: tomorrowReservations.length,
      reminders2h: in2HoursReservations.filter(r => {
        const [h, m] = r.time.split(':').map(Number);
        const rt = new Date(r.date);
        rt.setHours(h, m, 0, 0);
        const td = rt.getTime() - now.getTime();
        const hd = td / (1000 * 60 * 60);
        return hd > 1.5 && hd <= 2.5;
      }).length,
      birthdays: todayBirthdays.filter(u => {
        if (!u.birthDate) return false;
        const bd = new Date(u.birthDate);
        return bd.getDate() === now.getDate() && bd.getMonth() === now.getMonth();
      }).length
    });
    
  } catch (error) {
    console.error('Erreur envoi rappels:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonctions helper pour gérer les rappels déjà envoyés
async function checkIfReminderSent(key: string): Promise<boolean> {
  // En production, utiliser Redis ou une table dédiée
  // Pour l'instant, on utilise localStorage côté serveur ou une table simple
  // TODO: Implémenter avec Redis ou une table dédiée
  // Pour l'instant, on retourne false pour permettre l'envoi
  return false;
}

async function markReminderAsSent(key: string): Promise<void> {
  // TODO: Implémenter avec Redis ou une table dédiée
  console.log(`Reminder marked as sent: ${key}`);
}