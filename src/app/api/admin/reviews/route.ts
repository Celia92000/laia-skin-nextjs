import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 🔒 Récupérer les avis DE CETTE ORGANISATION uniquement
    const reviews = await prisma.review.findMany({
      where: {
        organizationId: user.organizationId ?? undefined
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 🔒 Récupérer aussi les avis Google DE CETTE ORGANISATION
    const googleReviews = await prisma.googleReview.findMany({
      where: {
        organizationId: user.organizationId ?? undefined
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formater les avis pour l'interface
    const formattedReviews = [
      ...reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        satisfaction: r.satisfaction,
        clientName: r.user?.name || 'Client anonyme',
        clientEmail: r.user?.email,
        clientPhone: r.user?.phone,
        serviceName: r.serviceName,
        source: r.source || 'website',
        createdAt: r.createdAt,
        published: r.approved,
        response: r.response,
        photos: r.photos ? JSON.parse(r.photos) : []
      })),
      ...googleReviews.map(g => ({
        id: 'google_' + g.id,
        rating: g.rating,
        comment: g.comment,
        clientName: g.authorName,
        clientEmail: null,
        clientPhone: null,
        serviceName: null,
        source: 'google',
        createdAt: g.publishedAt,
        published: true,
        response: g.replyText,
        photos: []
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedReviews);
  } catch (error) {
    log.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const data = await request.json();

    // 🔒 Créer l'avis AVEC organizationId
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.clientId,
        organizationId: user.organizationId ?? undefined,
        serviceName: data.serviceName,
        source: data.source || 'website',
        approved: data.published || false
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    log.error('Erreur lors de la création de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}