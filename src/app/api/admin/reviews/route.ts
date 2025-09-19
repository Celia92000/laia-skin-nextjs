import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    // Récupérer les avis de la base de données
    const reviews = await prisma.review.findMany({
      include: {
        client: true,
        service: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer aussi les avis Google
    const googleReviews = await prisma.googleReview.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Formater les avis pour l'interface
    const formattedReviews = [
      ...reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        clientName: r.client?.name || 'Client anonyme',
        clientEmail: r.client?.email,
        clientPhone: r.client?.phone,
        serviceName: r.service?.name,
        source: r.source || 'website',
        createdAt: r.createdAt,
        published: r.published,
        response: r.response,
        photos: r.photos ? JSON.parse(r.photos) : []
      })),
      ...googleReviews.map(g => ({
        id: g.id,
        rating: g.rating,
        comment: g.comment,
        clientName: g.authorName,
        clientEmail: null,
        clientPhone: null,
        serviceName: null,
        source: 'google',
        createdAt: g.createdAt,
        published: true,
        response: g.response,
        photos: g.photos ? JSON.parse(g.photos) : []
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const data = await request.json();
    
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        clientId: data.clientId,
        serviceId: data.serviceId,
        source: data.source || 'website',
        published: data.published || false,
        photos: data.photos ? JSON.stringify(data.photos) : null
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}