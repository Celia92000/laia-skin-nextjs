import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Récupérer tous les produits
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer tous les produits DE CETTE ORGANISATION
    const products = await prisma.product.findMany({
      where: {
        organizationId: user.organizationId ?? undefined
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    log.error('Erreur récupération produits:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau produit
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();

    // Créer le produit POUR CETTE ORGANISATION
    const product = await prisma.product.create({
      data: {
        organizationId: user.organizationId ?? undefined,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        name: body.name,
        description: body.description || '',
        shortDescription: body.shortDescription,
        price: body.price,
        salePrice: body.salePrice,
        category: body.category || 'Produit',
        brand: body.brand,
        mainImage: body.mainImage || '/images/placeholder.png',
        imageSettings: body.imageSettings,
        gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        ingredients: body.ingredients,
        usage: body.usage,
        benefits: body.benefits,
        active: body.active ?? true,
        featured: body.featured ?? false,
        order: body.order || 0
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    log.error('Erreur création produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un produit
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Vérifier que le produit appartient à cette organisation
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Mettre à jour le produit
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        gallery: updateData.gallery ? JSON.stringify(updateData.gallery) : undefined
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    log.error('Erreur mise à jour produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Vérifier que le produit appartient à cette organisation avant de le supprimer
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Erreur suppression produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}