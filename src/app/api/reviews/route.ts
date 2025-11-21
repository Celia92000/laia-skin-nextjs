import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

export async function GET(request: Request) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const email = config.email || 'contact@institut.fr';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const website = config.customDomain || 'https://votre-institut.fr';
  const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';

  const prisma = await getPrismaClient();
  try {
    // Récupérer l'organisation courante
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const featured = searchParams.get('featured');
    const userOnly = searchParams.get('userOnly');

    // Si userOnly, vérifier l'authentification
    let userId = null;
    if (userOnly === 'true') {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.userId;
        } catch (e) {
          return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    }

    const where: any = { organizationId };
    if (userId) where.userId = userId;
    if (approved !== null && !userId) where.approved = approved === 'true';
    if (featured !== null) where.featured = featured === 'true';

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculer les statistiques
    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0,
      distribution: {
        '5': reviews.filter(r => r.rating === 5).length,
        '4': reviews.filter(r => r.rating === 4).length,
        '3': reviews.filter(r => r.rating === 3).length,
        '2': reviews.filter(r => r.rating === 2).length,
        '1': reviews.filter(r => r.rating === 1).length,
      }
    };

    return NextResponse.json({
      reviews,
      stats
    });
  } catch (error) {
    log.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    // Récupérer l'organisation courante
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceName, rating, comment, reservationId, satisfaction, photos } = body;

    // Si un reservationId est fourni, vérifier la réservation
    if (reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          userId: userId,
          organizationId: organizationId // 🔒 Sécurité multi-tenant
        }
      });

      if (!reservation) {
        return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 400 });
      }

      // Vérifier qu'il n'y a pas déjà un avis pour cette réservation
      const existingReview = await prisma.review.findFirst({
        where: {
          reservationId,
          organizationId: organizationId // 🔒 Sécurité multi-tenant
        }
      });

      if (existingReview) {
        return NextResponse.json({ error: 'Un avis existe déjà pour cette réservation' }, { status: 400 });
      }
    }

    const review = await prisma.review.create({
      data: {
        organizationId,
        userId,
        reservationId,
        serviceName: serviceName || 'Service',
        rating,
        comment,
        satisfaction: satisfaction || 5,
        photos: photos ? JSON.stringify(photos) : '[]',
        source: 'site',
        approved: false, // Les avis doivent être approuvés manuellement
        googleReview: rating === 5 // Suggérer Google pour 5 étoiles
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        reservation: true
      }
    });

    // Récupérer l'URL Google Business de l'organisation
    const orgConfig = await prisma.organizationConfig.findUnique({
      where: { organizationId },
      select: { googleBusinessUrl: true }
    });

    const googleUrl = rating === 5 && orgConfig?.googleBusinessUrl
      ? orgConfig.googleBusinessUrl
      : null;

    return NextResponse.json({
      success: true,
      message: 'Avis enregistré avec succès. Il sera publié après validation.',
      review,
      suggestGoogle: rating === 5,
      googleUrl
    }, { status: 201 });
  } catch (error) {
    log.error('Error creating review:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'avis' }, { status: 500 });
  }
}