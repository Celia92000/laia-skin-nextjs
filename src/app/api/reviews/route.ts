import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    
    const reviews = await prisma.review.findMany({
      where: {
        approved: true,
        ...(serviceId && { serviceId })
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, serviceId, rating, comment, reservationId } = body;

    // Vérifier que l'utilisateur a bien eu ce service
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId,
        status: 'completed'
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée ou non complétée' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        serviceId,
        rating,
        comment,
        approved: false // Les avis doivent être approuvés par l'admin
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'avis' }, { status: 500 });
  }
}