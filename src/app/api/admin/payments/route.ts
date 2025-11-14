import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

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
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_OWNER', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer les paramètres de filtre
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');

    // 🔒 SÉCURITÉ MULTI-TENANT : Construire le filtre avec organizationId
    const where: any = {
      organizationId: user.organizationId
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      where.createdAt = {
        gte: startDate
      };
    }

    // Récupérer les paiements DE CETTE ORGANISATION avec les relations
    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    log.error('Erreur lors de la récupération des paiements:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
