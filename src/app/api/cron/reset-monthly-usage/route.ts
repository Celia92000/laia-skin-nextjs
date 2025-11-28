import { NextResponse } from 'next/server';
import { resetMonthlyCounters } from '@/lib/quotas';
import { log } from '@/lib/logger';

/**
 * POST /api/cron/reset-monthly-usage
 * Réinitialise les compteurs mensuels de toutes les organisations
 *
 * À configurer dans vercel.json ou cron externe pour s'exécuter le 1er de chaque mois
 *
 * Headers requis:
 * - Authorization: Bearer {CRON_SECRET}
 */
export async function POST(request: Request) {
  try {
    // Vérifier le secret CRON
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      log.error('CRON_SECRET non configuré');
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
    }

    const token = authHeader?.replace('Bearer ', '');
    if (token !== cronSecret) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Exécuter le reset
    const resetCount = await resetMonthlyCounters();

    log.info(`Cron reset-monthly-usage: ${resetCount} organisations réinitialisées`);

    return NextResponse.json({
      success: true,
      message: `${resetCount} organisations réinitialisées`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('Erreur cron reset-monthly-usage:', error);
    return NextResponse.json(
      { error: 'Erreur lors du reset' },
      { status: 500 }
    );
  }
}

// Permettre aussi GET pour les tests manuels avec Vercel Cron
export async function GET(request: Request) {
  return POST(request);
}
