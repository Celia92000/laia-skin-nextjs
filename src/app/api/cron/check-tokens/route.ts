import { NextRequest, NextResponse } from 'next/server';
import { checkExpiringTokens } from '@/lib/api-token-manager';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * Cron job pour vérifier les tokens expirants
 * À appeler quotidiennement via Vercel Cron ou service externe
 *
 * URL: /api/cron/check-tokens
 * Méthode: GET
 * Header: Authorization: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret cron pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET non configuré' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    log.info('🔄 [Cron] Vérification des tokens expirants...');

    // Vérifier les tokens qui expirent dans les 7 prochains jours
    const expiringTokens = await checkExpiringTokens(7);

    if (expiringTokens.length === 0) {
      log.info('✅ [Cron] Aucun token n\'expire dans les 7 prochains jours');
      return NextResponse.json({
        success: true,
        message: 'Aucun token expirant trouvé',
        expiringTokens: [],
        checkedAt: new Date().toISOString()
      });
    }

    // Créer des notifications pour les admins
    const prisma = await getPrismaClient();

    for (const token of expiringTokens) {
      const daysLeft = token.expiresAt
        ? Math.ceil((token.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Récupérer l'organisation pour notifier les admins
      if (token.organizationId) {
        const organization = await prisma.organization.findUnique({
          where: { id: token.organizationId },
          include: {
            users: {
              where: {
                role: { in: ['SUPER_ADMIN', 'ORG_ADMIN'] }
              }
            }
          }
        });

        if (organization) {
          // Créer une notification pour chaque admin
          for (const user of organization.users) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                organizationId: token.organizationId,
                type: 'token_expiring',
                title: `Token ${token.service} expire bientôt`,
                message: `Votre token ${token.service}/${token.name} expire dans ${daysLeft} jour(s). Pensez à le renouveler dans les paramètres.`,
                link: '/admin/settings',
                priority: daysLeft <= 3 ? 'high' : 'medium'
              }
            });
          }
        }
      }
    }

    log.info(`✅ [Cron] ${expiringTokens.length} notification(s) créée(s) pour les tokens expirants`);

    return NextResponse.json({
      success: true,
      expiringTokens: expiringTokens.map(token => ({
        service: token.service,
        name: token.name,
        organizationId: token.organizationId,
        expiresAt: token.expiresAt,
        daysLeft: token.expiresAt
          ? Math.ceil((token.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null
      })),
      notificationsCreated: expiringTokens.length,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    log.error('❌ [Cron] Erreur lors de la vérification des tokens:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la vérification des tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
