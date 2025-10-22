import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les formations
    const formations = await prisma.formation.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // Validation des champs obligatoires
    if (!body.name || !body.description || body.price === undefined || body.duration === undefined) {
      return NextResponse.json({
        error: 'Champs obligatoires manquants: name, description, price, duration'
      }, { status: 400 });
    }

    // Supprimer l'id s'il existe (pour la création)
    delete body.id;

    // Générer slug si non fourni
    if (!body.slug) {
      body.slug = body.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Créer la formation
    const formation = await prisma.formation.create({
      data: body
    });

    return NextResponse.json(formation);
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
