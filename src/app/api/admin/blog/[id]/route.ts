import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Récupérer un article spécifique
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

    const { id } = await params;

    // Récupérer l'article DE CETTE ORGANISATION
    const post = await prisma.blogPost.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    log.error('Erreur lors de la récupération de l\'article:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un article
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

    const { id } = await params;
    const data = await request.json();

    // Vérifier que l'article appartient à cette organisation
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    // Générer le slug si non fourni
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[àáäâ]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.published ? data.publishedAt || new Date() : null
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    log.error('Erreur lors de la mise à jour de l\'article:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Désactivé pour éviter la suppression accidentelle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  // La suppression est désactivée pour protéger les articles
  return NextResponse.json(
    { error: 'La suppression d\'articles est désactivée pour des raisons de sécurité' }, 
    { status: 403 }
  );
}