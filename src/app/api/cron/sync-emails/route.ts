import { NextResponse } from 'next/server';
import { syncTicketEmailsFromGandi } from '@/lib/email-sync';
import { log } from '@/lib/logger';

/**
 * Cron job pour synchroniser automatiquement les réponses aux tickets depuis Gandi Mail
 *
 * Configuration Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-emails?secret=VOTRE_CRON_SECRET",
 *     "schedule": "*/2 * * * *"
 *   }]
 * }
 *
 * Appel manuel : GET /api/cron/sync-emails?secret=VOTRE_CRON_SECRET
 */
export async function GET(request: Request) {
  try {
    // Vérifier le token secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      log.warn('[Cron Sync] Tentative d\'accès non autorisée');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que GANDI_EMAIL_PASSWORD est configuré
    if (!process.env.GANDI_EMAIL_PASSWORD) {
      log.info('[Cron Sync] GANDI_EMAIL_PASSWORD non configuré - synchronisation ignorée');
      return NextResponse.json({
        success: false,
        message: 'GANDI_EMAIL_PASSWORD non configuré'
      });
    }

    log.info('[Cron Sync] Début de la synchronisation des emails de tickets...');

    // Synchroniser les emails
    const result = await syncTicketEmailsFromGandi();

    if (!result.success) {
      log.error('[Cron Sync] Échec de la synchronisation');
      return NextResponse.json({
        success: false,
        message: 'Échec de la synchronisation',
        ...result
      }, { status: 500 });
    }

    log.info(`[Cron Sync] Synchronisation terminée : ${result.processed} emails traités, ${result.errors} erreurs`);

    return NextResponse.json({
      success: true,
      message: 'Synchronisation réussie',
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    log.error('[Cron Sync] Erreur synchronisation:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur de synchronisation',
      message: error.message
    }, { status: 500 });
  }
}
