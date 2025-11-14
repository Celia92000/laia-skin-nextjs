import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 🔒 Récupérer l'admin avec son organizationId
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!admin || !admin.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    if (admin.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // 🔒 Vérifier que le client appartient à cette organisation
    const client = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: admin.organizationId
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // 🔒 Récupérer les réductions disponibles pour le client DE CETTE ORGANISATION
    const discounts = await prisma.discount.findMany({
      where: {
        userId: userId,
        organizationId: admin.organizationId,
        status: 'available'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(discounts);

  } catch (error) {
    log.error('Erreur récupération réductions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réductions' },
      { status: 500 }
    );
  }
}
