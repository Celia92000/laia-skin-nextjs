import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { services, packages, date, time, notes, totalPrice } = body;

    // IMPORTANT: Vérifier la disponibilité du créneau avant de créer la réservation
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        date: new Date(date),
        time: time,
        status: {
          notIn: ['cancelled']
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json({ 
        error: 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.' 
      }, { status: 409 }); // 409 Conflict
    }

    // Créer la réservation si le créneau est disponible
    const reservation = await prisma.reservation.create({
      data: {
        userId: decoded.userId,
        services: JSON.stringify(services),
        packages: JSON.stringify(packages),
        date: new Date(date),
        time,
        notes,
        totalPrice,
        status: 'pending'
      }
    });

    // Add loyalty points (1 point per 10€ spent)
    const pointsEarned = Math.floor(totalPrice / 10);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        loyaltyPoints: { increment: pointsEarned },
        totalSpent: { increment: totalPrice }
      }
    });

    return NextResponse.json({
      id: reservation.id,
      reservation,
      pointsEarned,
      message: 'Réservation confirmée ! Vous avez gagné ' + pointsEarned + ' points de fidélité.'
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