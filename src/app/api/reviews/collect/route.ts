import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données requises
    if (!data.rating || !data.comment) {
      return NextResponse.json(
        { error: 'Note et commentaire requis' }, 
        { status: 400 }
      );
    }

    // Trouver ou créer le client
    let client = null;
    if (data.clientEmail) {
      client = await prisma.user.findUnique({
        where: { email: data.clientEmail }
      });
      
      if (!client && data.clientName) {
        // Créer un nouveau client si nécessaire
        client = await prisma.user.create({
          data: {
            email: data.clientEmail,
            name: data.clientName,
            phone: data.clientPhone || null,
            password: '', // Les avis peuvent être laissés sans compte
            role: 'CLIENT'
          }
        });
      }
    }

    // Trouver le service si fourni
    let service = null;
    if (data.serviceId) {
      service = await prisma.service.findUnique({
        where: { id: data.serviceId }
      });
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        source: data.source || 'email', // email, whatsapp, website
        clientId: client?.id || null,
        serviceId: service?.id || null,
        published: false, // Les avis doivent être modérés
        photos: data.photos ? JSON.stringify(data.photos) : null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      },
      include: {
        client: true,
        service: true
      }
    });

    // Si des photos sont fournies en base64, les sauvegarder
    if (data.photosBase64 && Array.isArray(data.photosBase64)) {
      const photoUrls: string[] = [];
      
      for (const base64Photo of data.photosBase64) {
        // Dans un cas réel, vous devriez uploader vers un service de stockage
        // Ici on simule en gardant l'URL data
        photoUrls.push(base64Photo);
      }
      
      // Mettre à jour l'avis avec les URLs des photos
      await prisma.review.update({
        where: { id: review.id },
        data: { photos: JSON.stringify(photoUrls) }
      });
    }

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
  
  try {
    // Récupérer les informations de la réservation si disponible
    let reservationInfo = null;
    if (reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          client: true,
          service: true
        }
      });
      
      if (reservation) {
        reservationInfo = {
          clientName: reservation.client?.name,
          clientEmail: reservation.client?.email,
          serviceName: reservation.service?.name,
          serviceId: reservation.service?.id,
          date: reservation.date
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