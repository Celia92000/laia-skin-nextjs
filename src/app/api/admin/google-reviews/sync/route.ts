import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-session';
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    // Vérifier l'authentification
    const user = await getCurrentUser();
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { googlePlaceId } = await request.json();

    if (!googlePlaceId) {
      return NextResponse.json({ error: 'Google Place ID requis' }, { status: 400 });
    }

    // TODO: Implémenter l'appel à l'API Google Places pour récupérer les avis
    // Pour le moment, on simule avec des données de test
    const mockGoogleReviews = [
      {
        reviewId: `google_${user.organizationId}_1`,
        authorName: 'Client Google 1',
        rating: 5,
        comment: 'Excellent service ! Je recommande vivement.',
        publishedAt: new Date('2025-01-15')
      },
      {
        reviewId: `google_${user.organizationId}_2`,
        authorName: 'Client Google 2',
        rating: 5,
        comment: 'Très professionnels, résultats visibles rapidement.',
        publishedAt: new Date('2025-01-10')
      },
      {
        reviewId: `google_${user.organizationId}_3`,
        authorName: 'Client Google 3',
        rating: 4,
        comment: 'Bon institut, bonne ambiance.',
        publishedAt: new Date('2025-01-05')
      }
    ];

    // Insérer ou mettre à jour les avis Google
    let syncedCount = 0;
    for (const review of mockGoogleReviews) {
      await prisma.googleReview.upsert({
        where: { reviewId: review.reviewId },
        create: {
          ...review,
          organizationId: user.organizationId ?? undefined
        },
        update: {
          rating: review.rating,
          comment: review.comment
        }
      });
      syncedCount++;
    }

    // Mettre à jour la configuration de l'organisation
    await prisma.organizationConfig.updateMany({
      where: { organizationId: user.organizationId ?? undefined },
      data: {
        googlePlaceId,
        googleBusinessUrl: `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`,
        lastGoogleSync: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Synchronisation Google terminée',
      reviewsCount: syncedCount
    });
  } catch (error) {
    log.error('Erreur synchronisation Google:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}
