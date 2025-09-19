import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configuration Google Business LAIA SKIN Institut
const GOOGLE_PLACE_ID = '3014602962211627658';
const GOOGLE_BUSINESS_URL = 'https://www.google.com/maps/place/?q=place_id:3014602962211627658';

export async function GET(request: Request) {
  try {
    // Récupérer les avis Google depuis la base
    const googleReviews = await prisma.googleReview.findMany({
      orderBy: { publishedAt: 'desc' }
    });

    // Récupérer ou créer les stats business
    let businessStats = await prisma.businessStats.findFirst();
    
    if (!businessStats) {
      businessStats = await prisma.businessStats.create({
        data: {
          googlePlaceId: GOOGLE_PLACE_ID,
          googleBusinessUrl: GOOGLE_BUSINESS_URL
        }
      });
    }

    // Calculer les stats internes (vos propres avis)
    const internalReviews = await prisma.review.findMany({
      where: { 
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

    // Mettre à jour les stats business
    await prisma.businessStats.update({
      where: { id: businessStats.id },
      data: {
        googleRating: googleStats.average,
        googleReviewCount: googleStats.count,
        internalRating: internalStats.average,
        internalReviewCount: internalStats.count
      }
    });

    return NextResponse.json({
      internal: {
        reviews: internalReviews.slice(0, 10), // Les 10 derniers
        stats: internalStats
      },
      google: {
        reviews: googleReviews.slice(0, 10), // Les 10 derniers
        stats: googleStats,
        businessUrl: GOOGLE_BUSINESS_URL
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
    console.error('Erreur récupération avis Google:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

// Endpoint pour synchroniser manuellement avec Google (optionnel)
export async function POST(request: Request) {
  try {
    // Pour une vraie implémentation, vous devriez utiliser l'API Google My Business
    // qui nécessite une authentification OAuth2
    // Voir: https://developers.google.com/my-business/reference/rest

    // Exemple de données simulées pour test
    const mockGoogleReviews = [
      {
        reviewId: 'google_1',
        authorName: 'Marie L.',
        rating: 5,
        comment: 'Excellent institut ! Laïa est très professionnelle.',
        publishedAt: new Date('2025-01-15')
      },
      {
        reviewId: 'google_2',
        authorName: 'Sophie D.',
        rating: 5,
        comment: 'Je recommande vivement. Résultats visibles dès la première séance.',
        publishedAt: new Date('2025-01-10')
      }
    ];

    // Insérer ou mettre à jour les avis Google
    for (const review of mockGoogleReviews) {
      await prisma.googleReview.upsert({
        where: { reviewId: review.reviewId },
        create: review,
        update: {
          rating: review.rating,
          comment: review.comment
        }
      });
    }

    // Mettre à jour la date de dernière synchronisation
    await prisma.businessStats.updateMany({
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
    console.error('Erreur synchronisation Google:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}