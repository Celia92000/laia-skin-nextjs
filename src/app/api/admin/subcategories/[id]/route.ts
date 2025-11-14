import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

// GET - Récupérer une sous-catégorie par ID
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

    // 🔒 Récupérer la sous-catégorie DANS CETTE ORGANISATION
    const subcategory = await prisma.serviceSubcategory.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      },
      include: {
        category: true,
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

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    log.error('Erreur lors de la récupération de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la sous-catégorie' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une sous-catégorie
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

    // 🔒 Vérifier que la sous-catégorie appartient à cette organisation
    const existingSubcat = await prisma.serviceSubcategory.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!existingSubcat) {
      return NextResponse.json({ error: 'Sous-catégorie non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { categoryId, name, description, icon, image, active, order } = body;

    // Si le nom change, régénérer le slug
    let slug = body.slug;
    if (name && !slug) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // 🔒 Vérifier si le slug existe déjà DANS CETTE ORGANISATION (sauf pour cette sous-catégorie)
      const existingSubcategory = await prisma.serviceSubcategory.findFirst({
        where: {
          slug,
          organizationId: user.organizationId,
          id: { not: id }
        }
      });

      if (existingSubcategory) {
        return NextResponse.json(
          { error: 'Une sous-catégorie avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    // 🔒 Si changement de catégorie parente, vérifier qu'elle existe DANS CETTE ORGANISATION
    if (categoryId) {
      const category = await prisma.serviceCategory.findFirst({
        where: {
          id: categoryId,
          organizationId: user.organizationId
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Catégorie parente non trouvée' },
          { status: 404 }
        );
      }
    }

    const subcategory = await prisma.serviceSubcategory.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(image !== undefined && { image }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order })
      },
      include: {
        category: true,
        _count: {
          select: { services: true }
        }
      }
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    log.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la sous-catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une sous-catégorie
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

    // 🔒 Vérifier si la sous-catégorie a des services associés DANS CETTE ORGANISATION
    const subcategory = await prisma.serviceSubcategory.findFirst({
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

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (subcategory._count.services > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer cette sous-catégorie. Elle contient ${subcategory._count.services} service(s). Veuillez d'abord réassigner ou supprimer ces services.` },
        { status: 400 }
      );
    }

    await prisma.serviceSubcategory.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Sous-catégorie supprimée avec succès' });
  } catch (error) {
    log.error('Erreur lors de la suppression de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la sous-catégorie' },
      { status: 500 }
    );
  }
}
