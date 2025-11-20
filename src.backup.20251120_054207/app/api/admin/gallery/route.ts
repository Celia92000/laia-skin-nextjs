import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// GET - Récupérer toutes les photos de galerie de l'organisation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const photos = await prisma.galleryPhoto.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Erreur lors de la récupération des photos:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle photo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { url, title, description, linkTo, order } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL de la photo requise' },
        { status: 400 }
      );
    }

    const photo = await prisma.galleryPhoto.create({
      data: {
        organizationId: session.user.organizationId,
        url,
        title: title || null,
        description: description || null,
        linkTo: linkTo || null,
        order: order || 0,
        active: true
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Erreur lors de la création de la photo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour l'ordre des photos
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { photos } = body; // Array de { id, order }

    if (!Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Format invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour l'ordre de toutes les photos
    await Promise.all(
      photos.map(({ id, order }) =>
        prisma.galleryPhoto.update({
          where: {
            id,
            organizationId: session.user.organizationId
          },
          data: { order }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
