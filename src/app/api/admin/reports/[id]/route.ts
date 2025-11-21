import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Vérifier que le rapport appartient à l'organisation
    const report = await prisma.savedReport.findFirst({
      where: {
        id: id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 });
    }

    // Supprimer le rapport
    await prisma.savedReport.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true, message: 'Rapport supprimé avec succès' });

  } catch (error) {
    log.error('Erreur lors de la suppression du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rapport' },
      { status: 500 }
    );
  }
}

// GET - Récupérer un rapport spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const report = await prisma.savedReport.findFirst({
      where: {
        id: id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 });
    }

    return NextResponse.json(report);

  } catch (error) {
    log.error('Erreur lors de la récupération du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rapport' },
      { status: 500 }
    );
  }
}
