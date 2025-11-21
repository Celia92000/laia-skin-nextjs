import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

// Vérification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER'].includes(user.role as string)) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// Calculer le nombre de clients qui correspondent aux critères
async function calculateClientCount(organizationId: string, criteria: any) {
  const prisma = await getPrismaClient();

  // Construire la requête Prisma dynamiquement selon les critères
  const where: any = {
    organizationId,
    role: 'CLIENT'
  };

  if (criteria.totalSpent) {
    if (criteria.totalSpent.min !== undefined) {
      where.totalSpent = { ...where.totalSpent, gte: criteria.totalSpent.min };
    }
    if (criteria.totalSpent.max !== undefined) {
      where.totalSpent = { ...where.totalSpent, lte: criteria.totalSpent.max };
    }
  }

  if (criteria.lastVisit) {
    const now = new Date();
    if (criteria.lastVisit.daysAgo?.min !== undefined) {
      const minDate = new Date(now);
      minDate.setDate(now.getDate() - criteria.lastVisit.daysAgo.min);
      where.lastVisit = { ...where.lastVisit, lte: minDate };
    }
    if (criteria.lastVisit.daysAgo?.max !== undefined) {
      const maxDate = new Date(now);
      maxDate.setDate(now.getDate() - criteria.lastVisit.daysAgo.max);
      where.lastVisit = { ...where.lastVisit, gte: maxDate };
    }
  }

  if (criteria.loyaltyPoints) {
    if (criteria.loyaltyPoints.min !== undefined) {
      where.loyaltyPoints = { ...where.loyaltyPoints, gte: criteria.loyaltyPoints.min };
    }
    if (criteria.loyaltyPoints.max !== undefined) {
      where.loyaltyPoints = { ...where.loyaltyPoints, lte: criteria.loyaltyPoints.max };
    }
  }

  const count = await prisma.user.count({ where });

  // Calculer la valeur totale
  const clients = await prisma.user.findMany({
    where,
    select: { totalSpent: true }
  });
  const totalValue = clients.reduce((sum, c) => sum + c.totalSpent, 0);

  return { count, totalValue };
}

// GET - Récupérer tous les segments de l'organisation
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const segments = await prisma.clientSegment.findMany({
      where: {
        organizationId: admin.organizationId ?? undefined
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(segments);
  } catch (error) {
    log.error('Erreur lors de la récupération des segments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau segment
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, color, criteria, isAutomatic } = body;

    // Calculer le nombre de clients qui correspondent aux critères
    const { count, totalValue } = await calculateClientCount(admin.organizationId, criteria);

    const segment = await prisma.clientSegment.create({
      data: {
        organizationId: admin.organizationId ?? undefined,
        name,
        description,
        color: color || '#3B82F6',
        criteria,
        clientCount: count,
        totalValue,
        isAutomatic: isAutomatic !== false
      }
    });

    return NextResponse.json(segment);
  } catch (error) {
    log.error('Erreur lors de la création du segment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un segment
export async function PATCH(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { id, name, description, color, criteria, isAutomatic, isActive } = body;

    // Vérifier que le segment appartient à l'organisation
    const existingSegment = await prisma.clientSegment.findFirst({
      where: {
        id,
        organizationId: admin.organizationId ?? undefined
      }
    });

    if (!existingSegment) {
      return NextResponse.json(
        { error: 'Segment non trouvé' },
        { status: 404 }
      );
    }

    // Recalculer le nombre si les critères ont changé
    let updateData: any = {
      name,
      description,
      color,
      isActive
    };

    if (criteria) {
      const { count, totalValue } = await calculateClientCount(admin.organizationId, criteria);
      updateData.criteria = criteria;
      updateData.clientCount = count;
      updateData.totalValue = totalValue;
    }

    if (isAutomatic !== undefined) {
      updateData.isAutomatic = isAutomatic;
    }

    const segment = await prisma.clientSegment.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(segment);
  } catch (error) {
    log.error('Erreur lors de la mise à jour du segment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un segment
export async function DELETE(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Vérifier que le segment appartient à l'organisation
    const segment = await prisma.clientSegment.findFirst({
      where: {
        id,
        organizationId: admin.organizationId ?? undefined
      }
    });

    if (!segment) {
      return NextResponse.json(
        { error: 'Segment non trouvé' },
        { status: 404 }
      );
    }

    await prisma.clientSegment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Erreur lors de la suppression du segment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
