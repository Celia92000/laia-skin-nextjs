import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

// ✅ CORRIGÉ : Utilisation de la base de données avec isolation multi-tenant
// 🔒 Table RecurringBlock avec organizationId pour séparer les données

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

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // 🔒 Récupérer UNIQUEMENT les blocages de CETTE organisation
    const recurringBlocks = await prisma.recurringBlock.findMany({
      where: {
        organizationId: user.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(recurringBlocks);
  } catch (error) {
    console.error('Erreur lors de la récupération des récurrences:', error);
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

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Vérifier que c'est un admin
    if (user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // 🔒 Créer le blocage AVEC organizationId
    const newBlock = await prisma.recurringBlock.create({
      data: {
        organizationId: user.organizationId, // 🔒 CRITIQUE
        type: body.type,
        dayOfWeek: body.dayOfWeek,
        dayOfMonth: body.dayOfMonth,
        timeSlots: body.timeSlots ? JSON.stringify(body.timeSlots) : null,
        allDay: body.allDay ?? false,
        startTime: body.startTime,
        endTime: body.endTime,
        reason: body.reason
      }
    });

    return NextResponse.json(newBlock);
  } catch (error) {
    console.error('Erreur lors de la création de la récurrence:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Vérifier que c'est un admin
    if (user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // 🔒 Vérifier que le blocage appartient à CETTE organisation avant de supprimer
    const existingBlock = await prisma.recurringBlock.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!existingBlock) {
      return NextResponse.json({ error: 'Récurrence non trouvée' }, { status: 404 });
    }

    // 🔒 Supprimer le blocage
    await prisma.recurringBlock.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Récurrence supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la récurrence:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}