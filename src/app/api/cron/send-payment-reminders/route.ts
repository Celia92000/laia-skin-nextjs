import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { log } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Cron job pour envoyer des relances de paiement
 * À exécuter quotidiennement
 * URL: /api/cron/send-payment-reminders
 *
 * Configuration Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-payment-reminders",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    log.info('🔄 Démarrage envoi relances paiement...')

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Récupérer les factures impayées
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        dueDate: { lt: now }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            ownerEmail: true,
            plan: true,
            status: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    log.info(`📊 ${overdueInvoices.length} factures impayées trouvées`)

    const results = {
      firstReminder: [] as string[],
      secondReminder: [] as string[],
      suspended: [] as string[],
      errors: [] as { org: string, error: string }[]
    }

    for (const invoice of overdueInvoices) {
      try {
        const org = invoice.organization
        const daysSinceIssue = Math.floor((now.getTime() - invoice.issueDate.getTime()) / (24 * 60 * 60 * 1000))

        // Vérifier si une relance a déjà été envoyée pour cette facture
        const lastReminder = await prisma.activityLog.findFirst({
          where: {
            entityType: 'INVOICE',
            entityId: invoice.id,
            action: { in: ['PAYMENT_REMINDER_1', 'PAYMENT_REMINDER_2'] }
          },
          orderBy: { createdAt: 'desc' }
        })

        // Première relance après 7 jours
        if (daysSinceIssue >= 7 && daysSinceIssue < 14 && !lastReminder) {
          log.info(`📧 Envoi 1ère relance à ${org.name}`)

          await resend.emails.send({
            from: 'LAIA Platform <noreply@laiaskin.com>',
            to: org.ownerEmail,
            subject: `⚠️ Relance paiement - Facture ${invoice.invoiceNumber}`,
            html: generateReminderEmail(org.name, invoice.invoiceNumber, invoice.amount, 1)
          })

          await prisma.activityLog.create({
            data: {
              userId: 'system',
              action: 'PAYMENT_REMINDER_1',
              entityType: 'INVOICE',
              entityId: invoice.id,
              description: `1ère relance de paiement envoyée à ${org.name}`,
              metadata: { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount }
            }
          })

          results.firstReminder.push(org.name)
        }

        // Deuxième relance après 14 jours
        else if (daysSinceIssue >= 14 && daysSinceIssue < 21) {
          log.info(`📧 Envoi 2ème relance à ${org.name}`)

          await resend.emails.send({
            from: 'LAIA Platform <noreply@laiaskin.com>',
            to: org.ownerEmail,
            subject: `🚨 URGENT - Paiement en retard - Facture ${invoice.invoiceNumber}`,
            html: generateReminderEmail(org.name, invoice.invoiceNumber, invoice.amount, 2)
          })

          await prisma.activityLog.create({
            data: {
              userId: 'system',
              action: 'PAYMENT_REMINDER_2',
              entityType: 'INVOICE',
              entityId: invoice.id,
              description: `2ème relance de paiement envoyée à ${org.name}`,
              metadata: { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount }
            }
          })

          results.secondReminder.push(org.name)
        }

        // Suspension après 21 jours
        else if (daysSinceIssue >= 21 && org.status !== 'SUSPENDED') {
          log.info(`🚫 Suspension de ${org.name}`)

          await prisma.organization.update({
            where: { id: org.id },
            data: { status: 'SUSPENDED' }
          })

          await resend.emails.send({
            from: 'LAIA Platform <noreply@laiaskin.com>',
            to: org.ownerEmail,
            subject: `🚫 Compte suspendu - Impayé ${invoice.invoiceNumber}`,
            html: generateSuspensionEmail(org.name, invoice.invoiceNumber, invoice.amount)
          })

          await prisma.activityLog.create({
            data: {
              userId: 'system',
              action: 'ORGANIZATION_SUSPENDED',
              entityType: 'ORGANIZATION',
              entityId: org.id,
              description: `Organisation suspendue pour impayé`,
              metadata: { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount, daysSinceIssue }
            }
          })

          results.suspended.push(org.name)
        }

      } catch (error) {
        log.error(`❌ Erreur pour ${invoice.organization.name}:`, error)
        results.errors.push({
          org: invoice.organization.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    log.info('✅ Relances envoyées')
    log.info(`   - 1ères relances: ${results.firstReminder.length}`)
    log.info(`   - 2èmes relances: ${results.secondReminder.length}`)
    log.info(`   - Suspensions: ${results.suspended.length}`)
    log.info(`   - Erreurs: ${results.errors.length}`)

    return NextResponse.json({
      success: true,
      message: 'Relances envoyées avec succès',
      stats: {
        total: overdueInvoices.length,
        firstReminder: results.firstReminder.length,
        secondReminder: results.secondReminder.length,
        suspended: results.suspended.length,
        errors: results.errors.length
      },
      details: results
    })

  } catch (error) {
    log.error('❌ Erreur critique envoi relances:', error)
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

function generateReminderEmail(orgName: string, invoiceNumber: string, amount: number, reminderLevel: 1 | 2): string {
  const urgency = reminderLevel === 1 ? 'Rappel' : 'URGENT'
  const message = reminderLevel === 1
    ? 'Votre facture arrive bientôt à échéance.'
    : 'Votre facture est en retard. Merci de régulariser votre situation dans les plus brefs délais.'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${urgency} - Facture impayée</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #2d3748;">Bonjour ${orgName},</p>

        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
          ${message}
        </p>

        <div style="background: #f7fafc; border-left: 4px solid #f56565; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #718096;">Numéro de facture</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2d3748;">${invoiceNumber}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Montant à régler</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #f56565;">${amount.toFixed(2)} €</p>
        </div>

        ${reminderLevel === 2 ? `
        <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #c53030; font-weight: bold;">⚠️ Attention</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #742a2a;">
            En l'absence de règlement sous 7 jours, votre compte sera suspendu et l'accès à la plateforme sera interrompu.
          </p>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">
          Pour toute question concernant cette facture, contactez-nous à <a href="mailto:facturation@laiaskin.com" style="color: #667eea;">facturation@laiaskin.com</a>
        </p>

        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          Cordialement,<br>
          L'équipe LAIA
        </p>
      </div>
    </body>
    </html>
  `
}

function generateSuspensionEmail(orgName: string, invoiceNumber: string, amount: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚫 Compte suspendu</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #2d3748;">Bonjour ${orgName},</p>

        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
          Votre compte LAIA a été suspendu en raison d'un impayé.
        </p>

        <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #718096;">Facture impayée</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2d3748;">${invoiceNumber}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Montant dû</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #e53e3e;">${amount.toFixed(2)} €</p>
        </div>

        <div style="background: #fffaf0; border: 1px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #7c2d12; font-weight: bold;">Que faire maintenant ?</p>
          <ol style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #7c2d12;">
            <li>Réglez votre facture dans les plus brefs délais</li>
            <li>Contactez-nous à facturation@laiaskin.com</li>
            <li>Votre accès sera rétabli dès réception du paiement</li>
          </ol>
        </div>

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">
          Nous restons à votre disposition pour tout arrangement de paiement.
        </p>

        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          L'équipe LAIA
        </p>
      </div>
    </body>
    </html>
  `
}
