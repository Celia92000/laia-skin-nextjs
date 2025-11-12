import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient();
    const data = await request.json();

    // Valider les données requises
    if (!data.rating || !data.comment) {
      return NextResponse.json(
        { error: 'Note et commentaire requis' },
        { status: 400 }
      );
    }

    if (!data.organizationId) {
      return NextResponse.json(
        { error: 'organizationId requis' },
        { status: 400 }
      );
    }

    // 🔒 Trouver ou créer le client DANS CETTE ORGANISATION
    let client = null;
    if (data.clientEmail) {
      client = await prisma.user.findFirst({
        where: {
          email: data.clientEmail,
          organizationId: data.organizationId
        }
      });

      if (!client && data.clientName) {
        // 🔒 Créer un nouveau client AVEC organizationId
        client = await prisma.user.create({
          data: {
            email: data.clientEmail,
            name: data.clientName,
            phone: data.clientPhone || null,
            password: '', // Les avis peuvent être laissés sans compte
            role: 'CLIENT',
            organizationId: data.organizationId
          }
        });
      }
    }

    // 🔒 Trouver le service si fourni DANS CETTE ORGANISATION
    let service = null;
    if (data.serviceId) {
      service = await prisma.service.findFirst({
        where: {
          id: data.serviceId,
          organizationId: data.organizationId
        }
      });
    }

    // Si pas de client, on ne peut pas créer l'avis
    if (!client) {
      // 🔒 Créer un utilisateur anonyme temporaire AVEC organizationId
      const anonymousUser = await prisma.user.create({
        data: {
          email: `anonymous_${Date.now()}@temp.com`,
          name: data.clientName || 'Client anonyme',
          password: 'not-used',
          role: "CLIENT",
          organizationId: data.organizationId
        }
      });
      client = anonymousUser;
    }

    // 🔒 Créer l'avis AVEC organizationId
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        source: data.source || 'email', // email, whatsapp, website
        userId: client.id,
        organizationId: data.organizationId,
        serviceName: service?.name || data.serviceName,
        approved: false // Les avis doivent être modérés
      },
      include: {
        user: true
      }
    });

    // Les photos ne sont plus supportées dans le modèle Review actuel
    // Si des photos sont fournies, elles sont ignorées
    // TODO: Créer une table séparée pour les photos si nécessaire

    return NextResponse.json({ 
      success: true,
      message: 'Merci pour votre avis ! Il sera publié après modération.',
      reviewId: review.id
    });
    
  } catch (error) {
    console.error('Erreur lors de la collecte de l\'avis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de votre avis' }, 
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer le formulaire d'avis (pour email/WhatsApp)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get('reservation');
  const clientEmail = searchParams.get('email');
  const organizationId = searchParams.get('organizationId');

  try {
    const prisma = await getPrismaClient();
    // Récupérer les informations de la réservation si disponible
    let reservationInfo = null;
    if (reservationId && organizationId) {
      // 🔒 Récupérer la réservation DANS CETTE ORGANISATION
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          organizationId: organizationId
        },
        include: {
          user: true
        }
      });

      if (reservation) {
        reservationInfo = {
          clientName: reservation.user?.name,
          clientEmail: reservation.user?.email,
          serviceName: null,
          serviceId: reservation.serviceId,
          date: reservation.date,
          organizationId: reservation.organizationId
        };
      }
    }
    
    // Retourner les informations pour pré-remplir le formulaire
    return NextResponse.json({
      reservationInfo,
      formUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/avis?reservation=${reservationId || ''}&email=${clientEmail || ''}`,
      instructions: {
        fr: {
          title: "Laissez votre avis",
          ratingLabel: "Votre note",
          commentLabel: "Votre commentaire",
          photosLabel: "Ajoutez des photos (optionnel)",
          submitButton: "Envoyer mon avis",
          thankYouMessage: "Merci pour votre retour !"
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations' }, 
      { status: 500 }
    );
  }
}