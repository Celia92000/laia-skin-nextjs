import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isSLABreached } from '@/lib/sla-config'
import { Resend } from 'resend'
import { log } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Cron job pour surveiller les violations SLA des tickets
 * À exécuter toutes les heures
 * URL: /api/cron/check-sla
 *
 * Configuration Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-sla",
 *     "schedule": "0 * * * *"
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

    log.info('🔄 Démarrage vérification SLA des tickets...')

    const now = new Date()

    // Récupérer tous les tickets non résolus
    const openTickets = await prisma.supportTicket.findMany({
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] }
      },
      include: {
        organization: {
          select: { id: true, name: true, ownerEmail: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    log.info(`📊 ${openTickets.length} tickets ouverts à vérifier`)

    const results = {
      responseBreach: [] as string[],
      resolutionBreach: [] as string[],
      alerts: [] as string[],
      errors: [] as { ticket: string, error: string }[]
    }

    for (const ticket of openTickets) {
      try {
        let updated = false

        // Vérifier la violation du SLA de réponse
        if (ticket.slaResponseDeadline && !ticket.firstResponseAt && !ticket.slaResponseBreach) {
          if (isSLABreached(ticket.slaResponseDeadline, null)) {
            log.info(`⚠️ Violation SLA réponse - Ticket #${ticket.ticketNumber}`)

            await prisma.supportTicket.update({
              where: { id: ticket.id },
              data: { slaResponseBreach: true }
            })

            // Log de l'activité
            await prisma.activityLog.create({
              data: {
                userId: 'system',
                action: 'SLA_RESPONSE_BREACH',
                entityType: 'TICKET',
                entityId: ticket.id,
                description: `Violation du SLA de réponse pour le ticket #${ticket.ticketNumber}`,
                metadata: {
                  ticketNumber: ticket.ticketNumber,
                  priority: ticket.priority,
                  deadline: ticket.slaResponseDeadline
                }
              }
            })

            // Envoyer alerte email au super admin assigné
            if (ticket.assignedTo && resend) {
              await resend.emails.send({
                from: 'LAIA Support <contact@laiaconnect.fr>',
                to: ticket.assignedTo.email,
                subject: `⚠️ Violation SLA - Ticket #${ticket.ticketNumber}`,
                html: generateSLABreachEmail(
                  ticket.assignedTo.name || 'Admin',
                  ticket.ticketNumber,
                  ticket.subject,
                  'réponse',
                  ticket.priority,
                  ticket.organization.name
                )
              })
              results.alerts.push(ticket.assignedTo.email)
            }

            results.responseBreach.push(ticket.ticketNumber)
            updated = true
          }
        }

        // Vérifier la violation du SLA de résolution
        if (ticket.slaResolutionDeadline && !ticket.resolvedAt && !ticket.slaResolutionBreach) {
          if (isSLABreached(ticket.slaResolutionDeadline, null)) {
            log.info(`⚠️ Violation SLA résolution - Ticket #${ticket.ticketNumber}`)

            await prisma.supportTicket.update({
              where: { id: ticket.id },
              data: { slaResolutionBreach: true }
            })

            // Log de l'activité
            await prisma.activityLog.create({
              data: {
                userId: 'system',
                action: 'SLA_RESOLUTION_BREACH',
                entityType: 'TICKET',
                entityId: ticket.id,
                description: `Violation du SLA de résolution pour le ticket #${ticket.ticketNumber}`,
                metadata: {
                  ticketNumber: ticket.ticketNumber,
                  priority: ticket.priority,
                  deadline: ticket.slaResolutionDeadline
                }
              }
            })

            // Envoyer alerte email au super admin assigné
            if (ticket.assignedTo && resend) {
              await resend.emails.send({
                from: 'LAIA Support <contact@laiaconnect.fr>',
                to: ticket.assignedTo.email,
                subject: `🚨 URGENT - Violation SLA résolution - Ticket #${ticket.ticketNumber}`,
                html: generateSLABreachEmail(
                  ticket.assignedTo.name || 'Admin',
                  ticket.ticketNumber,
                  ticket.subject,
                  'résolution',
                  ticket.priority,
                  ticket.organization.name
                )
              })
              results.alerts.push(ticket.assignedTo.email)
            }

            results.resolutionBreach.push(ticket.ticketNumber)
            updated = true
          }
        }

      } catch (error) {
        log.error(`❌ Erreur ticket #${ticket.ticketNumber}:`, error)
        results.errors.push({
          ticket: ticket.ticketNumber,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    log.info('✅ Vérification SLA terminée')
    log.info(`   - Violations SLA réponse: ${results.responseBreach.length}`)
    log.info(`   - Violations SLA résolution: ${results.resolutionBreach.length}`)
    log.info(`   - Alertes envoyées: ${results.alerts.length}`)
    log.info(`   - Erreurs: ${results.errors.length}`)

    return NextResponse.json({
      success: true,
      message: 'Vérification SLA effectuée avec succès',
      stats: {
        total: openTickets.length,
        responseBreach: results.responseBreach.length,
        resolutionBreach: results.resolutionBreach.length,
        alerts: results.alerts.length,
        errors: results.errors.length
      },
      details: results
    })

  } catch (error) {
    log.error('❌ Erreur critique vérification SLA:', error)
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

function generateSLABreachEmail(
  adminName: string,
  ticketNumber: string,
  ticketSubject: string,
  slaType: 'réponse' | 'résolution',
  priority: string,
  orgName: string
): string {
  const urgency = slaType === 'résolution' ? '🚨 URGENT' : '⚠️ ATTENTION'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f56565 0%, #c53030 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${urgency} - Violation SLA</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #2d3748;">Bonjour ${adminName},</p>

        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
          Le ticket suivant a dépassé son SLA de <strong>${slaType}</strong>.
        </p>

        <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #718096;">Ticket</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2d3748;">#${ticketNumber}</p>

          <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Sujet</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #2d3748;">${ticketSubject}</p>

          <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Priorité</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #f56565;">${priority}</p>

          <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Organisation</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #2d3748;">${orgName}</p>
        </div>

        <div style="background: #fffaf0; border: 1px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #7c2d12; font-weight: bold;">Action requise</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #7c2d12;">
            ${slaType === 'réponse'
              ? 'Ce ticket nécessite une première réponse immédiate.'
              : 'Ce ticket nécessite une résolution dans les plus brefs délais.'}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://laia.platform/super-admin/tickets?ticket=${ticketNumber}"
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Voir le ticket
          </a>
        </div>

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">
          Cordialement,<br>
          Système LAIA
        </p>
      </div>
    </body>
    </html>
  `
}
