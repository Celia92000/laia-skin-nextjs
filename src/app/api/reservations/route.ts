import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { services, packages, date, time, notes, totalPrice, clientInfo } = body;
    
    // Vérifier si le créneau est bloqué
    const blockedSlotsResponse = await fetch(`${request.url.replace('/api/reservations', '/api/admin/blocked-slots')}`);
    if (blockedSlotsResponse.ok) {
      const blockedSlots = await blockedSlotsResponse.json();
      const dateStr = new Date(date).toISOString().split('T')[0];
      
      const isBlocked = blockedSlots.some((slot: any) => 
        slot.date === dateStr && (slot.allDay || slot.time === time)
      );
      
      if (isBlocked) {
        return NextResponse.json({ 
          error: 'Ce créneau n\'est pas disponible. Veuillez choisir un autre horaire.' 
        }, { status: 409 });
      }
    }
    
    let userId: string;
    let user;
    
    // Vérifier si c'est un utilisateur connecté ou un nouveau client
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Client connecté
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
      userId = decoded.userId;
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (clientInfo && clientInfo.email) {
      // Nouveau client sans compte - Créer automatiquement le profil
      user = await prisma.user.findFirst({
        where: { email: clientInfo.email }
      });
      
      if (!user) {
        // Créer un nouveau client dans le CRM
        user = await prisma.user.create({
          data: {
            name: clientInfo.name || 'Client',
            email: clientInfo.email,
            phone: clientInfo.phone || '',
            password: `temp_${Date.now()}`, // Mot de passe temporaire
            role: 'client'
          }
        });
      } else {
        // Mettre à jour les infos si nécessaire
        if ((clientInfo.phone && !user.phone) || (clientInfo.name && user.name === 'Client')) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(clientInfo.phone && !user.phone ? { phone: clientInfo.phone } : {}),
              ...(clientInfo.name && user.name === 'Client' ? { name: clientInfo.name } : {})
            }
          });
        }
      }
      userId = user.id;
    } else {
      return NextResponse.json({ error: 'Informations client requises' }, { status: 400 });
    }

    // Vérifier qu'il n'y a pas déjà une réservation à ce créneau
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        date: new Date(date),
        time: time,
        status: {
          notIn: ['cancelled'] // Exclure seulement les réservations annulées
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json({ 
        error: 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.' 
      }, { status: 409 }); // 409 Conflict
    }

    // Vérifier qu'il y a au moins 15 minutes avant et après les autres réservations
    const allReservations = await prisma.reservation.findMany({
      where: {
        date: new Date(date),
        status: {
          notIn: ['cancelled']
        }
      }
    });

    // Convertir l'heure en minutes pour faciliter les calculs
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedTimeMinutes = timeToMinutes(time);

    // Vérifier chaque réservation existante
    for (const reservation of allReservations) {
      const existingTimeMinutes = timeToMinutes(reservation.time);
      const timeDifference = Math.abs(requestedTimeMinutes - existingTimeMinutes);
      
      // Si la différence est inférieure à 90 minutes (durée du soin + 15 min de préparation)
      if (timeDifference < 90 && timeDifference > 0) {
        const nextAvailableTime = new Date(date);
        nextAvailableTime.setHours(0, existingTimeMinutes + 90, 0, 0);
        const nextTimeStr = nextAvailableTime.toTimeString().slice(0, 5);
        
        return NextResponse.json({ 
          error: `Un soin est déjà prévu proche de cet horaire. Il faut au minimum 1h30 entre chaque soin (75 min de soin + 15 min de préparation). Prochain créneau disponible après ${reservation.time}: ${nextTimeStr}` 
        }, { status: 409 });
      }
    }

    // Créer la réservation avec statut 'pending' (en attente de validation admin)
    const reservation = await prisma.reservation.create({
      data: {
        userId: userId,
        services: JSON.stringify(services),
        packages: JSON.stringify(packages),
        date: new Date(date),
        time,
        notes,
        totalPrice,
        status: 'pending' // Toujours en attente de validation admin
      }
    });

    // Incrémenter le nombre de séances et le montant total dépensé
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSessions: { increment: 1 },
        totalSpent: { increment: totalPrice },
        lastVisit: new Date()
      }
    });

    // Vérifier si le client a droit à une réduction
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    let loyaltyMessage = '';
    if (updatedUser) {
      const sessionsCount = updatedUser.totalSessions || 0;
      const packagesCount = updatedUser.totalPackages || 0;
      
      if (sessionsCount === 6) {
        loyaltyMessage = ' Félicitations ! Vous avez atteint 6 séances, -30€ sur votre prochaine séance !';
      } else if (packagesCount === 2) {
        loyaltyMessage = ' Félicitations ! C\'est votre 3e forfait, -50€ de réduction !';
      } else if (sessionsCount > 0 && sessionsCount % 6 === 0) {
        loyaltyMessage = ` Carte de fidélité complète ! -30€ sur votre prochaine séance !`;
      }
    }
    
    return NextResponse.json({
      id: reservation.id,
      reservation,
      message: 'Votre demande de réservation a été enregistrée. Elle sera validée dans les plus brefs délais.' + loyaltyMessage
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: decoded.userId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(reservations.map(r => ({
      ...r,
      services: JSON.parse(r.services),
      packages: JSON.parse(r.packages)
    })));
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}