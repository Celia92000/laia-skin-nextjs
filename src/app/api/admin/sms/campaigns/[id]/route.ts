import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Détail d'une campagne SMS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const campaign = await prisma.sMSCampaign.findUnique({
      where: {
        id: id,
        organizationId: decoded.organizationId
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    log.error('Error fetching SMS campaign:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier une campagne SMS
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la campagne existe et appartient à l'organisation
    const existingCampaign = await prisma.sMSCampaign.findUnique({
      where: {
        id: id,
        organizationId: decoded.organizationId
      }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    // Ne pas permettre la modification si déjà envoyée
    if (existingCampaign.status === 'SENT') {
      return NextResponse.json({ error: 'Impossible de modifier une campagne déjà envoyée' }, { status: 400 });
    }

    const body = await request.json();
    const { name, message, segmentId, scheduledAt } = body;

    // Recalculer le nombre de destinataires si le segment a changé
    let recipientCount = existingCampaign.recipientCount;
    if (segmentId !== existingCampaign.segmentId) {
      if (!segmentId) {
        recipientCount = await prisma.user.count({
          where: {
            organizationId: decoded.organizationId,
            role: 'CLIENT'
          }
        });
      } else if (segmentId === 'vip') {
        recipientCount = await prisma.user.count({
          where: {
            organizationId: decoded.organizationId,
            role: 'CLIENT',
            vipStatus: 'VIP'
          }
        });
      } else if (segmentId === 'inactive') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        recipientCount = await prisma.user.count({
          where: {
            organizationId: decoded.organizationId,
            role: 'CLIENT',
            lastVisit: {
              lt: threeMonthsAgo
            }
          }
        });
      }
    }

    const campaign = await prisma.sMSCampaign.update({
      where: {
        id: id
      },
      data: {
        name,
        message,
        segmentId,
        recipientCount,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    log.error('Error updating SMS campaign:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une campagne SMS
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la campagne existe et appartient à l'organisation
    const existingCampaign = await prisma.sMSCampaign.findUnique({
      where: {
        id: id,
        organizationId: decoded.organizationId
      }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    await prisma.sMSCampaign.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting SMS campaign:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
