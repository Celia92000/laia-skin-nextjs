import { NextRequest, NextResponse } from 'next/server';

/**
 * Route de test pour vérifier que Sentry fonctionne
 *
 * Cette route déclenche intentionnellement une erreur qui devrait
 * apparaître dans le dashboard Sentry.
 *
 * Usage: GET /api/test-sentry
 */
export async function GET(request: NextRequest) {
  // Log pour indiquer que le test est en cours
  console.log('🧪 Test Sentry - Déclenchement d\'une erreur de test...');

  // Déclencher une erreur intentionnelle
  throw new Error('🧪 Test Sentry - Cette erreur devrait apparaître dans Sentry Dashboard');
}
