import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateInvoiceNumber,
  generateInvoiceMetadata,
  calculateInvoiceTotal,
  getCurrentBillingPeriod,
  getNextBillingDate
} from '@/lib/subscription-billing'
import { sendInvoiceEmail } from '@/lib/email-service'
import { log } from '@/lib/logger';

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

    log.info('🔄 Démarrage génération factures mensuelles...')

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
        addons: true,
        ownerEmail: true,
        trialEndsAt: true
      }
    })

    log.info(`📊 ${organizations.length} organisations actives trouvées`)

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
        // Vérifier si l'organisation est en période d'essai
        if (org.trialEndsAt && new Date(org.trialEndsAt) > now) {
          log.info(`⏭️  ${org.name} - En période d'essai jusqu'au ${new Date(org.trialEndsAt).toLocaleDateString('fr-FR')}`)
          results.skipped.push(org.name)
          continue
        }

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
          log.info(`⏭️  Facture déjà existante pour ${org.name} (${existingInvoice.invoiceNumber})`)
          results.skipped.push(org.name)
          continue
        }

        // On ne vérifie plus subscriptionStartDate car ce champ n'existe pas
        // L'organisation active avec période d'essai terminée est facturée

        // Générer la facture avec notre nouveau système
        const billingPeriod = getCurrentBillingPeriod()
        const dueDate = getNextBillingDate()

        const metadata = generateInvoiceMetadata(
          org.plan,
          org.addons,
          billingPeriod.start,
          billingPeriod.end
        )

        const amount = calculateInvoiceTotal(org.plan, org.addons)
        const invoiceNumber = generateInvoiceNumber()

        log.info(`💰 Génération facture pour ${org.name} - ${org.plan} (${amount}€)`)

        // Créer la facture dans la base de données
        const invoice = await prisma.invoice.create({
          data: {
            organizationId: org.id,
            invoiceNumber,
            amount,
            plan: org.plan,
            status: 'PENDING',
            issueDate: new Date(),
            dueDate,
            description: `Abonnement ${org.plan} - ${billingPeriod.start.toLocaleDateString('fr-FR')} au ${billingPeriod.end.toLocaleDateString('fr-FR')}`,
            metadata: metadata as any
          }
        })

        log.info(`✅ Facture ${invoiceNumber} créée pour ${org.name}`)

        // Envoyer la facture par email automatiquement
        try {
          await sendInvoiceEmail({
            organizationName: org.name,
            ownerEmail: org.ownerEmail,
            invoiceNumber,
            amount,
            dueDate,
            plan: org.plan,
            lineItems: metadata.lineItems,
            prorata: metadata.prorata
          })
          log.info(`📧 Email envoyé à ${org.ownerEmail}`)
        } catch (emailError) {
          log.error(`⚠️  Erreur envoi email pour ${org.name}:`, emailError)
          // On continue même si l'email échoue
        }

        results.success.push(org.name)

      } catch (error) {
        log.error(`❌ Erreur pour ${org.name}:`, error)
        results.errors.push({
          org: org.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    // Envoyer notification aux admins si des erreurs
    if (results.errors.length > 0) {
      log.warn('⚠️  Erreurs détectées lors de la génération:', results.errors)

      // TODO: Envoyer email de notification au super-admin
      // await sendAdminNotification({
      //   subject: 'Erreurs génération factures mensuelles',
      //   errors: results.errors
      // })
    }

    log.info('✅ Génération factures terminée')
    log.info(`   - Réussies: ${results.success.length}`)
    log.info(`   - Ignorées: ${results.skipped.length}`)
    log.info(`   - Erreurs: ${results.errors.length}`)

    // Logger l'activité (ActivityLog n'existe pas encore dans le schéma)
    // TODO: Créer le modèle ActivityLog si nécessaire
    // await prisma.activityLog.create({ ... })

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
    log.error('❌ Erreur critique génération factures:', error)
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
