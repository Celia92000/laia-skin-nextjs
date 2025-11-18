import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/churn/metrics
 * Récupère les métriques de churn et rétention
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const prisma = await getPrismaClient();

    // Période d'analyse (30 derniers jours par défaut)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total clients actifs
    const totalCustomers = await prisma.organization.count({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    });

    // Clients en période d'essai
    const activeTrials = await prisma.organization.count({
      where: {
        status: 'TRIAL',
        trialEndsAt: { gte: new Date() }
      }
    });

    // Nouveaux clients (période)
    const newCustomers = await prisma.organization.count({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    });

    // Clients qui ont churné (période)
    const churnedCustomers = await prisma.organization.count({
      where: {
        status: 'CANCELLED',
        updatedAt: { gte: startDate }
      }
    });

    // Calcul MRR
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179
    };

    const activeOrgs = await prisma.organization.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      select: {
        plan: true,
        monthlyAmount: true,
        createdAt: true,
        status: true
      }
    });

    let totalMRR = 0;
    let newMRR = 0;

    activeOrgs.forEach(org => {
      const mrr = org.monthlyAmount || planPrices[org.plan] || 0;
      totalMRR += mrr;

      // MRR des nouveaux clients
      if (org.createdAt >= startDate) {
        newMRR += mrr;
      }
    });

    // MRR perdu (churn)
    const churnedOrgs = await prisma.organization.findMany({
      where: {
        status: 'CANCELLED',
        updatedAt: { gte: startDate }
      },
      select: {
        plan: true,
        monthlyAmount: true
      }
    });

    let churnedMRR = 0;
    churnedOrgs.forEach(org => {
      const mrr = org.monthlyAmount || planPrices[org.plan] || 0;
      churnedMRR += mrr;
    });

    // Calcul des taux
    const churnRate = totalCustomers > 0
      ? ((churnedCustomers / totalCustomers) * 100).toFixed(2)
      : '0';

    const retentionRate = (100 - parseFloat(churnRate)).toFixed(2);

    // LTV moyen (approximation: MRR moyen × durée moyenne d'abonnement)
    const avgMRR = totalCustomers > 0 ? totalMRR / totalCustomers : 0;
    const averageLTV = avgMRR * 12; // 12 mois en moyenne

    // Expansion MRR (upgrades - approximation)
    const expansionMRR = 0; // À implémenter avec tracking des upgrades

    // Contraction MRR (downgrades - approximation)
    const contractionMRR = 0; // À implémenter avec tracking des downgrades

    const metrics = {
      date: new Date(),
      totalMRR: parseFloat(totalMRR.toFixed(2)),
      newMRR: parseFloat(newMRR.toFixed(2)),
      expansionMRR,
      contractionMRR,
      churnedMRR: parseFloat(churnedMRR.toFixed(2)),
      totalCustomers,
      newCustomers,
      churnedCustomers,
      activeTrials,
      churnRate: parseFloat(churnRate),
      retentionRate: parseFloat(retentionRate),
      averageLTV: parseFloat(averageLTV.toFixed(2))
    };

    // Optionnel : Sauvegarder dans la table ChurnMetric
    try {
      await prisma.churnMetric.create({
        data: metrics
      });
    } catch (error) {
      // Non bloquant si la table n'existe pas encore
      log.warn('ChurnMetric table not ready:', error);
    }

    return NextResponse.json({
      success: true,
      metrics,
      period: parseInt(period)
    });

  } catch (error: any) {
    log.error('Erreur métriques churn:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
