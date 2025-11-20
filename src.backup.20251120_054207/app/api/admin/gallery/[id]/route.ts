import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// PATCH - Mettre à jour une photo
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { url, title, description, linkTo, order, active } = body;

    const photo = await prisma.galleryPhoto.update({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      data: {
        ...(url !== undefined && { url }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(linkTo !== undefined && { linkTo }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active })
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la photo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une photo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await prisma.galleryPhoto.delete({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
