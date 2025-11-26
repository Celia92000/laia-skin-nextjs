import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncGoogleReviews } from '@/lib/google-business-api';
import { log } from '@/lib/logger';

/**
 * Cron job pour synchroniser automatiquement les avis Google
 * À exécuter tous les jours à 6h du matin (via Vercel Cron ou autre)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    log.info('[Cron Google Reviews] Démarrage de la synchronisation automatique');

    // Récupérer toutes les organisations avec autoSyncGoogleReviews activé
    const organizations = await prisma.organizationConfig.findMany({
      where: {
        autoSyncGoogleReviews: true,
        googleBusinessConnected: true,
      },
      select: {
        organizationId: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    log.info(`[Cron Google Reviews] ${organizations.length} organisation(s) à synchroniser`);

    const results = {
      success: [] as string[],
      errors: [] as { org: string; error: string }[],
    };

    for (const orgConfig of organizations) {
      try {
        const orgName = orgConfig.organization?.name || orgConfig.organizationId;
        log.info(`[Cron Google Reviews] Synchronisation de ${orgName}...`);

        const result = await syncGoogleReviews(orgConfig.organizationId);

        log.info(
          `[Cron Google Reviews] ${orgName}: ${result.synced} avis synchronisés, ${result.errors} erreurs`
        );

        results.success.push(orgName);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        log.error(`[Cron Google Reviews] Erreur pour ${orgConfig.organizationId}:`, error);

        results.errors.push({
          org: orgConfig.organization?.name || orgConfig.organizationId,
          error: errorMessage,
        });
      }
    }

    // Envoyer une notification au super admin si des erreurs
    if (results.errors.length > 0) {
      log.warn(`[Cron Google Reviews] ${results.errors.length} erreur(s) détectée(s)`);
      // TODO: Envoyer email au super admin avec les erreurs
    }

    log.info('[Cron Google Reviews] Synchronisation terminée');
    log.info(`  - Réussies: ${results.success.length}`);
    log.info(`  - Erreurs: ${results.errors.length}`);

    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée: ${results.success.length} succès, ${results.errors.length} erreurs`,
      results,
    });
  } catch (error) {
    log.error('[Cron Google Reviews] Erreur globale:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
