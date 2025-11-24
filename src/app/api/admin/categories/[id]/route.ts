import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

// GET - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: auth.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // 🔒 Récupérer la catégorie DANS CETTE ORGANISATION
    const category = await prisma.serviceCategory.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      },
      include: {
        subcategories: {
          orderBy: { order: 'asc' }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            active: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    log.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une catégorie
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth || (auth.role as string) !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: auth.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // 🔒 Vérifier que la catégorie existe DANS CETTE ORGANISATION
    const existingCat = await prisma.serviceCategory.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!existingCat) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, icon, color, image, metaTitle, metaDescription, keywords, featured, active, order } = body;

    // Si le nom change, régénérer le slug
    let slug = body.slug;
    if (name && !slug) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // 🔒 Vérifier si le slug existe déjà DANS CETTE ORGANISATION (sauf pour cette catégorie)
      const existingCategory = await prisma.serviceCategory.findFirst({
        where: {
          slug,
          organizationId: user.organizationId,
          id: { not: id }
        }
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Une catégorie avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color && { color }),
        ...(image !== undefined && { image }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(keywords !== undefined && { keywords }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order })
      },
      include: {
        subcategories: true,
        _count: {
          select: { services: true }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    log.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth || (auth.role as string) !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: auth.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // 🔒 Vérifier si la catégorie a des services associés DANS CETTE ORGANISATION
    const category = await prisma.serviceCategory.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      },
      include: {
        _count: {
          select: { services: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (category._count.services > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer cette catégorie. Elle contient ${category._count.services} service(s). Veuillez d'abord réassigner ou supprimer ces services.` },
        { status: 400 }
      );
    }

    await prisma.serviceCategory.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    log.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}
