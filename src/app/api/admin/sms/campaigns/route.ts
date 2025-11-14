import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Liste des campagnes SMS
export async function GET(request: NextRequest) {
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

    const campaigns = await prisma.sMSCampaign.findMany({
      where: {
        organizationId: decoded.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    log.error('Error fetching SMS campaigns:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle campagne SMS
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, message, segmentId, scheduledAt } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Nom et message requis' }, { status: 400 });
    }

    // Compter les destinataires selon le segment
    let recipientCount = 0;
    if (!segmentId) {
      // Tous les clients
      recipientCount = await prisma.user.count({
        where: {
          organizationId: decoded.organizationId,
          role: 'CLIENT'
        }
      });
    } else if (segmentId === 'vip') {
      // Clients VIP uniquement
      recipientCount = await prisma.user.count({
        where: {
          organizationId: decoded.organizationId,
          role: 'CLIENT',
          vipStatus: 'VIP'
        }
      });
    } else if (segmentId === 'inactive') {
      // Clients inactifs (dernière visite > 3 mois)
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

    const campaign = await prisma.sMSCampaign.create({
      data: {
        organizationId: decoded.organizationId,
        name,
        message,
        segmentId,
        recipientCount,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: decoded.userId
      }
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    log.error('Error creating SMS campaign:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
