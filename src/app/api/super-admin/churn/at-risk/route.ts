import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/churn/at-risk
 * Identifie et retourne les organisations à risque de churn
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
    const now = new Date();

    // Récupérer toutes les organisations actives
    const organizations = await prisma.organization.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      include: {
        users: {
          select: {
            lastLoginAt: true
          },
          orderBy: {
            lastLoginAt: 'desc'
          },
          take: 1
        }
      }
    });

    const atRiskProfiles = [];

    for (const org of organizations) {
      // Calculer le score de risque
      let riskScore = 0;
      const riskFactors = [];

      // Facteur 1: Pas de connexion depuis X jours
      const lastLogin = org.users[0]?.lastLoginAt;
      const daysWithoutLogin = lastLogin
        ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysWithoutLogin >= 30) {
        riskScore += 40;
        riskFactors.push('Pas de connexion depuis 30+ jours');
      } else if (daysWithoutLogin >= 14) {
        riskScore += 30;
        riskFactors.push('Pas de connexion depuis 14+ jours');
      } else if (daysWithoutLogin >= 7) {
        riskScore += 15;
        riskFactors.push('Pas de connexion depuis 7+ jours');
      }

      // Facteur 2: Fin d'essai proche
      if (org.status === 'TRIAL' && org.trialEndsAt) {
        const daysUntilTrialEnd = Math.floor((org.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilTrialEnd <= 5 && daysUntilTrialEnd >= 0) {
          riskScore += 25;
          riskFactors.push(`Fin d'essai dans ${daysUntilTrialEnd} jours`);
        }
      }

      // Facteur 3: Organisation récente sans activité
      const daysSinceCreation = Math.floor((now.getTime() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation <= 15 && daysWithoutLogin >= 7) {
        riskScore += 20;
        riskFactors.push('Nouvelle organisation inactive');
      }

      // Facteur 4: Pas de configuration complète
      if (!org.isOnboarded) {
        riskScore += 15;
        riskFactors.push('Configuration incomplète');
      }

      // Niveau d'utilisation (estimation basique)
      const usageLevel = daysWithoutLogin <= 7 ? 'high' :
                        daysWithoutLogin <= 14 ? 'medium' : 'low';

      // Seul retenir les organisations avec un score de risque > 20
      if (riskScore >= 20) {
        atRiskProfiles.push({
          organizationId: org.id,
          organizationName: org.name,
          ownerEmail: org.ownerEmail,
          ownerName: `${org.ownerFirstName || ''} ${org.ownerLastName || ''}`.trim(),
          plan: org.plan,
          status: org.status,
          riskScore,
          riskFactors,
          daysWithoutLogin,
          usageLevel,
          createdAt: org.createdAt,
          trialEndsAt: org.trialEndsAt,
          lastLogin
        });
      }
    }

    // Trier par score de risque décroissant
    atRiskProfiles.sort((a, b) => b.riskScore - a.riskScore);

    return NextResponse.json({
      success: true,
      atRiskCount: atRiskProfiles.length,
      profiles: atRiskProfiles
    });

  } catch (error: any) {
    log.error('Erreur clients à risque:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
