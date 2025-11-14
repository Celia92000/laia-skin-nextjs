import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';

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

  try {
    // Récupérer l'organisation courante
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer la config Google Business de l'organisation
    const orgConfig = await prisma.organizationConfig.findUnique({
      where: { organizationId },
      select: {
        googlePlaceId: true,
        googleBusinessUrl: true,
        lastGoogleSync: true
      }
    });

    // Récupérer les avis Google de cette organisation uniquement
    const googleReviews = await prisma.googleReview.findMany({
      where: { organizationId },
      orderBy: { publishedAt: 'desc' }
    });

    // Calculer les stats internes (vos propres avis) pour cette organisation
    const internalReviews = await prisma.review.findMany({
      where: {
        organizationId,
        approved: true,
        source: { not: 'google' }
      }
    });

    const internalStats = {
      count: internalReviews.length,
      average: internalReviews.length > 0
        ? parseFloat((internalReviews.reduce((sum, r) => sum + r.rating, 0) / internalReviews.length).toFixed(1))
        : 0,
      distribution: {
        '5': internalReviews.filter(r => r.rating === 5).length,
        '4': internalReviews.filter(r => r.rating === 4).length,
        '3': internalReviews.filter(r => r.rating === 3).length,
        '2': internalReviews.filter(r => r.rating === 2).length,
        '1': internalReviews.filter(r => r.rating === 1).length,
      }
    };

    // Calculer les stats Google
    const googleStats = {
      count: googleReviews.length,
      average: googleReviews.length > 0
        ? parseFloat((googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length).toFixed(1))
        : 0,
      distribution: {
        '5': googleReviews.filter(r => r.rating === 5).length,
        '4': googleReviews.filter(r => r.rating === 4).length,
        '3': googleReviews.filter(r => r.rating === 3).length,
        '2': googleReviews.filter(r => r.rating === 2).length,
        '1': googleReviews.filter(r => r.rating === 1).length,
      }
    };

    return NextResponse.json({
      internal: {
        reviews: internalReviews.slice(0, 10), // Les 10 derniers
        stats: internalStats
      },
      google: {
        reviews: googleReviews.slice(0, 10), // Les 10 derniers
        stats: googleStats,
        businessUrl: orgConfig?.googleBusinessUrl || null,
        placeId: orgConfig?.googlePlaceId || null,
        lastSync: orgConfig?.lastGoogleSync || null
      },
      combined: {
        totalReviews: internalStats.count + googleStats.count,
        averageRating: (internalStats.count + googleStats.count) > 0
          ? parseFloat(
              ((internalStats.average * internalStats.count + googleStats.average * googleStats.count) /
              (internalStats.count + googleStats.count)).toFixed(1)
            )
          : 0
      }
    });
  } catch (error) {
    log.error('Erreur récupération avis Google:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

// Endpoint pour synchroniser manuellement avec Google (optionnel - DÉPRÉCIÉ)
// NOTE: Utilisez plutôt /api/admin/google-reviews/sync pour la synchronisation
export async function POST(request: Request) {
  try {
    // Récupérer l'organisation courante
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Pour une vraie implémentation, vous devriez utiliser l'API Google My Business
    // qui nécessite une authentification OAuth2
    // Voir: https://developers.google.com/my-business/reference/rest

    // Exemple de données simulées pour test
    const mockGoogleReviews = [
      {
        reviewId: `google_${organizationId}_1`,
        authorName: 'Marie L.',
        rating: 5,
        comment: 'Excellent institut ! Laïa est très professionnelle.',
        publishedAt: new Date('2025-01-15')
      },
      {
        reviewId: `google_${organizationId}_2`,
        authorName: 'Sophie D.',
        rating: 5,
        comment: 'Je recommande vivement. Résultats visibles dès la première séance.',
        publishedAt: new Date('2025-01-10')
      }
    ];

    // Insérer ou mettre à jour les avis Google pour cette organisation
    for (const review of mockGoogleReviews) {
      await prisma.googleReview.upsert({
        where: { reviewId: review.reviewId },
        create: {
          ...review,
          organizationId
        },
        update: {
          rating: review.rating,
          comment: review.comment
        }
      });
    }

    // Mettre à jour la date de dernière synchronisation dans OrganizationConfig
    await prisma.organizationConfig.updateMany({
      where: { organizationId },
      data: {
        lastGoogleSync: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Synchronisation Google terminée',
      reviewsCount: mockGoogleReviews.length
    });
  } catch (error) {
    log.error('Erreur synchronisation Google:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}