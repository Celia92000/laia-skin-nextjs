import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// GET - Récupérer un avis spécifique par ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Vérifier si c'est un avis Google ou normal
    const isGoogleReview = id.startsWith('google_');

    if (isGoogleReview) {
      // 🔒 Récupérer l'avis Google DANS CETTE ORGANISATION
      const review = await prisma.googleReview.findFirst({
        where: {
          id: id.replace('google_', ''),
          organizationId: user.organizationId
        }
      });

      if (!review) {
        return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
      }

      return NextResponse.json({
        ...review,
        id: `google_${review.id}`,
        isGoogleReview: true
      });
    } else {
      // 🔒 Récupérer l'avis DANS CETTE ORGANISATION
      const review = await prisma.review.findFirst({
        where: {
          id,
          organizationId: user.organizationId
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!review) {
        return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
      }

      return NextResponse.json({
        ...review,
        userName: review.user?.name,
        userEmail: review.user?.email,
        photos: typeof review.photos === 'string'
          ? (review.photos ? JSON.parse(review.photos) : [])
          : review.photos,
        isGoogleReview: false
      });
    }
  } catch (error) {
    log.error('Erreur lors de la récupération de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const data = await request.json();

    // Vérifier si c'est un avis Google ou normal
    const isGoogleReview = id.startsWith('google_');

    if (isGoogleReview) {
      // 🔒 Vérifier que l'avis Google appartient à cette organisation avant de modifier
      const existingReview = await prisma.googleReview.findFirst({
        where: {
          id: id.replace('google_', ''),
          organizationId: user.organizationId
        }
      });

      if (!existingReview) {
        return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
      }

      // Pour les avis Google, on peut seulement ajouter une réponse
      if (data.response !== undefined) {
        const review = await prisma.googleReview.update({
          where: { id: id.replace('google_', '') },
          data: {
            replyText: data.response,
            replyAt: new Date()
          }
        });
        return NextResponse.json(review);
      }
    } else {
      // 🔒 Vérifier que l'avis appartient à cette organisation avant de modifier
      const existingReview = await prisma.review.findFirst({
        where: {
          id,
          organizationId: user.organizationId
        }
      });

      if (!existingReview) {
        return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
      }

      // Pour les avis normaux, on peut tout modifier
      const updateData: any = {};
      if (data.published !== undefined) updateData.approved = data.published;
      if (data.response !== undefined) updateData.response = data.response;
      if (data.photos !== undefined) updateData.photos = JSON.stringify(data.photos);

      const review = await prisma.review.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json(review);
    }

    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  } catch (error) {
    log.error('Erreur lors de la mise à jour de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // On ne peut supprimer que les avis non-Google
    if (id.startsWith('google_')) {
      return NextResponse.json({ error: 'Impossible de supprimer un avis Google' }, { status: 403 });
    }

    // 🔒 Vérifier que l'avis appartient à cette organisation avant de supprimer
    const review = await prisma.review.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
    }

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Avis supprimé' });
  } catch (error) {
    log.error('Erreur lors de la suppression de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}