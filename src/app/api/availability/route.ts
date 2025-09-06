import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, time } = await request.json();
    
    // Vérifier si le créneau est déjà pris
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        date: new Date(date),
        time: time,
        status: {
          notIn: ['cancelled'] // On ignore les réservations annulées
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json({ 
        available: false, 
        message: 'Ce créneau est déjà réservé' 
      });
    }

    return NextResponse.json({ 
      available: true,
      message: 'Créneau disponible'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date requise' }, { status: 400 });
    }

    // Récupérer toutes les réservations pour cette date
    const reservations = await prisma.reservation.findMany({
      where: {
        date: new Date(date),
        status: {
          notIn: ['cancelled']
        }
      },
      select: {
        time: true,
        services: true
      }
    });

    // Créer une liste des créneaux occupés
    const bookedSlots = reservations.map(r => {
      const services = JSON.parse(r.services);
      // Calculer la durée en fonction des services
      let duration = 30; // durée minimale par défaut
      
      if (services.includes('hydro-naissance')) {
        duration = 90; // 1h30
      } else if (services.includes('hydro') || services.includes('renaissance')) {
        duration = 60; // 1h
      } else if (services.includes('bbglow') || services.includes('led')) {
        duration = 30; // 30min
      }
      
      // Si plusieurs services, additionner les durées
      if (services.length > 1 && !services.includes('hydro-naissance')) {
        duration = services.length * 30; // approximation
      }
      
      return {
        time: r.time,
        duration: duration
      };
    });

    // Générer tous les créneaux de la journée (10h-18h par tranches de 30min)
    const allSlots = [];
    for (let hour = 10; hour < 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Marquer les créneaux comme disponibles ou non
    const availability = allSlots.map(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotMinutes = slotHour * 60 + slotMinute;
      
      // Vérifier si ce créneau est bloqué par une réservation
      const isBooked = bookedSlots.some(booked => {
        const [bookedHour, bookedMinute] = booked.time.split(':').map(Number);
        const bookedStartMinutes = bookedHour * 60 + bookedMinute;
        const bookedEndMinutes = bookedStartMinutes + booked.duration;
        
        // Le créneau est occupé si il chevauche avec une réservation existante
        return slotMinutes >= bookedStartMinutes && slotMinutes < bookedEndMinutes;
      });
      
      return {
        time: slot,
        available: !isBooked,
        // Suggérer la pause déjeuner entre 12h et 14h si pas de réservation
        suggestedBreak: (slotHour === 12 || slotHour === 13) && !isBooked
      };
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}