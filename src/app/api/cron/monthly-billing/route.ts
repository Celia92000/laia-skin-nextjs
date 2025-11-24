import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

/**
 * API Cron job pour la facturation mensuelle automatique
 * À exécuter quotidiennement pour vérifier les organisations à facturer
 *
 * Pour configurer avec Vercel Cron:
 * Ajouter dans vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/monthly-billing",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Vérifier que la requête vient de Vercel Cron (ou en développement)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Trouver toutes les organisations dont la date de facturation est aujourd'hui ou passée
    const organizationsToBill = await prisma.organization.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        nextBillingDate: {
          lte: today
        },
        sepaMandate: true, // Mandat SEPA actif
        stripeCustomerId: { not: null }
      }
    })

    log.info(`🔄 ${organizationsToBill.length} organisation(s) à facturer aujourd'hui`)

    const results = []

    for (const org of organizationsToBill) {
      try {
        // Initialiser Stripe avec la clé secrète
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error('STRIPE_SECRET_KEY non configuré')
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-09-30.clover'
        })

        // Créer une facture Stripe pour déclencher le prélèvement SEPA
        const invoice = await stripe.invoices.create({
          customer: org.stripeCustomerId!,
          auto_advance: true, // Finaliser automatiquement
          collection_method: 'charge_automatically',
          description: `Abonnement ${org.plan} - Paiement mensuel`,
          metadata: {
            organizationId: org.id,
            organizationName: org.name,
            plan: org.plan
          }
        })

        // Ajouter une ligne pour l'abonnement
        await stripe.invoiceItems.create({
          customer: org.stripeCustomerId!,
          invoice: invoice.id,
          amount: Math.round((org.monthlyAmount || 49) * 100), // Convertir en centimes
          currency: 'eur',
          description: `Abonnement ${org.plan}`
        })

        // Finaliser et envoyer la facture (déclenche le prélèvement)
        await stripe.invoices.finalizeInvoice(invoice.id)

        results.push({
          organizationId: org.id,
          organizationName: org.name,
          amount: org.monthlyAmount,
          status: 'invoice_created',
          stripeInvoiceId: invoice.id
        })

        log.info(`✅ Facture créée pour ${org.name} - ${org.monthlyAmount}€`)

      } catch (error: any) {
        log.error(`❌ Erreur facturation ${org.name}:`, error.message)
        results.push({
          organizationId: org.id,
          organizationName: org.name,
          status: 'error',
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      totalProcessed: organizationsToBill.length,
      results
    })

  } catch (error: any) {
    log.error('❌ Erreur cron facturation mensuelle:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
