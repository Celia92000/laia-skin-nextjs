import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

// GET - Lister tous les rapports sauvegardés
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const reports = await prisma.savedReport.findMany({
      where: {
        organizationId: user.organizationId ?? undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reports);

  } catch (error) {
    log.error('Erreur lors du chargement des rapports:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des rapports' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau rapport sauvegardé
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { name, metrics, period, autoSend, emailSchedule } = body;

    const report = await prisma.savedReport.create({
      data: {
        organizationId: user.organizationId ?? undefined,
        name,
        metrics,
        period,
        autoSend: autoSend || false,
        emailSchedule: autoSend ? emailSchedule : null
      }
    });

    return NextResponse.json(report);

  } catch (error) {
    log.error('Erreur lors de la création du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rapport' },
      { status: 500 }
    );
  }
}
