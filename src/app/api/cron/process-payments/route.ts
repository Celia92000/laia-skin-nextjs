import { NextRequest, NextResponse } from 'next/server'
import { processAutomaticCharges } from '@/lib/stripe-service'

/**
 * Cronjob pour traiter les prélèvements automatiques
 *
 * À configurer dans Vercel Cron ou tout autre service de cron :
 * - Fréquence : Tous les jours à 2h du matin
 * - URL : https://votre-domaine.com/api/cron/process-payments
 * - Header : Authorization: Bearer ${CRON_SECRET}
 *
 * Exemple avec Vercel : vercel.json
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-payments",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET non configuré' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    console.log('🕐 Démarrage du traitement des prélèvements automatiques...')

    // Traiter les prélèvements
    const results = await processAutomaticCharges()

    console.log(`✅ Traitement terminé : ${results.success.length} réussis, ${results.failed.length} échecs`)

    return NextResponse.json({
      success: true,
      processed: results.success.length + results.failed.length,
      succeeded: results.success.length,
      failed: results.failed.length,
      successIds: results.success,
      failedIds: results.failed,
    })
  } catch (error) {
    console.error('❌ Erreur traitement des prélèvements:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
