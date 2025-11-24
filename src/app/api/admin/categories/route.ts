import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

// GET - Récupérer toutes les catégories avec leurs sous-catégories
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: auth.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const categories = await prisma.serviceCategory.findMany({
      where: {
        organizationId: user.organizationId
      },
      include: {
        subcategories: {
          orderBy: { order: 'asc' },
          where: { active: true }
        },
        _count: {
          select: { services: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    log.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: auth.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    if (!['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, color, image, metaTitle, metaDescription, keywords, featured } = body;

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Vérifier si le slug existe déjà DANS CETTE ORGANISATION
    const existingCategory = await prisma.serviceCategory.findFirst({
      where: {
        slug,
        organizationId: user.organizationId,
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Obtenir le prochain ordre POUR CETTE ORGANISATION
    const lastCategory = await prisma.serviceCategory.findFirst({
      where: {
        organizationId: user.organizationId
      },
      orderBy: { order: 'desc' }
    });
    const order = (lastCategory?.order ?? -1) + 1;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        color: color || '#e11d48',
        image,
        metaTitle,
        metaDescription,
        keywords,
        featured: featured || false,
        order,
        organizationId: user.organizationId,
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    log.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}
