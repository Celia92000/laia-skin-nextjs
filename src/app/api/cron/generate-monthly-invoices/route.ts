import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAndSaveInvoice } from '@/lib/invoice-service'

const PLAN_PRICES = {
  SOLO: 49,
  DUO: 99,
  TEAM: 199,
  PREMIUM: 399
}

/**
 * Cron job pour générer les factures mensuelles automatiquement
 * À exécuter le 1er de chaque mois
 * URL: /api/cron/generate-monthly-invoices
 *
 * Configuration Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/generate-monthly-invoices",
 *     "schedule": "0 0 1 * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron (Vercel envoie un header Authorization)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('🔄 Démarrage génération factures mensuelles...')

    // Récupérer toutes les organisations ACTIVE
    const organizations = await prisma.organization.findMany({
      where: {
        status: 'ACTIVE',
        plan: { in: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'] }
      },
      select: {
        id: true,
        name: true,
        plan: true,
        subscriptionStartDate: true
      }
    })

    console.log(`📊 ${organizations.length} organisations actives trouvées`)

    const results = {
      success: [] as string[],
      errors: [] as { org: string, error: string }[],
      skipped: [] as string[]
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (const org of organizations) {
      try {
        // Vérifier si une facture existe déjà pour ce mois
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            organizationId: org.id,
            issueDate: {
              gte: new Date(currentYear, currentMonth, 1),
              lt: new Date(currentYear, currentMonth + 1, 1)
            }
          }
        })

        if (existingInvoice) {
          console.log(`⏭️  Facture déjà existante pour ${org.name}`)
          results.skipped.push(org.name)
          continue
        }

        // Vérifier que l'organisation a dépassé la période d'essai
        if (org.subscriptionStartDate) {
          const subscriptionStart = new Date(org.subscriptionStartDate)
          if (subscriptionStart > now) {
            console.log(`⏭️  ${org.name} - Abonnement pas encore démarré`)
            results.skipped.push(org.name)
            continue
          }
        }

        // Récupérer le prix du plan
        const amount = PLAN_PRICES[org.plan as keyof typeof PLAN_PRICES]

        if (!amount) {
          console.log(`⚠️  Plan inconnu pour ${org.name}: ${org.plan}`)
          results.errors.push({ org: org.name, error: 'Plan inconnu' })
          continue
        }

        // Générer la facture
        console.log(`💰 Génération facture pour ${org.name} - ${org.plan} (${amount}€)`)

        await generateAndSaveInvoice(
          org.id,
          amount,
          org.plan,
          undefined // Pas de Stripe payment intent pour facture automatique
        )

        results.success.push(org.name)
        console.log(`✅ Facture créée pour ${org.name}`)

      } catch (error) {
        console.error(`❌ Erreur pour ${org.name}:`, error)
        results.errors.push({
          org: org.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    // Envoyer notification aux admins si des erreurs
    if (results.errors.length > 0) {
      console.warn('⚠️  Erreurs détectées lors de la génération:', results.errors)

      // TODO: Envoyer email de notification au super-admin
      // await sendAdminNotification({
      //   subject: 'Erreurs génération factures mensuelles',
      //   errors: results.errors
      // })
    }

    console.log('✅ Génération factures terminée')
    console.log(`   - Réussies: ${results.success.length}`)
    console.log(`   - Ignorées: ${results.skipped.length}`)
    console.log(`   - Erreurs: ${results.errors.length}`)

    // Logger l'activité
    await prisma.activityLog.create({
      data: {
        userId: 'system',
        action: 'MONTHLY_INVOICES_GENERATED',
        entityType: 'INVOICE',
        entityId: 'cron',
        description: `Génération automatique des factures mensuelles`,
        metadata: {
          total: organizations.length,
          success: results.success.length,
          skipped: results.skipped.length,
          errors: results.errors.length,
          date: now.toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Factures générées avec succès',
      stats: {
        total: organizations.length,
        success: results.success.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      details: results
    })

  } catch (error) {
    console.error('❌ Erreur critique génération factures:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
