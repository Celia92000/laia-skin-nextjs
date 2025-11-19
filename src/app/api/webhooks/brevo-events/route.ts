import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'

/**
 * Webhook pour recevoir les événements Brevo (webhook sortant)
 *
 * Événements trackés :
 * - delivered : Email délivré avec succès
 * - hard_bounce : Email rejeté définitivement
 * - soft_bounce : Email rejeté temporairement
 * - request : Demande d'envoi
 * - opened : Email ouvert par le destinataire
 * - click : Lien cliqué dans l'email
 * - invalid_email : Adresse email invalide
 * - deferred : Envoi différé
 * - blocked : Email bloqué
 * - unsubscribed : Désabonnement
 * - complaint : Marqué comme spam
 *
 * Configuration Brevo:
 * 1. Aller dans Brevo Dashboard > Webhooks
 * 2. Créer un nouveau webhook
 * 3. URL: https://www.laiaconnect.fr/api/webhooks/brevo-events
 * 4. Sélectionner les événements à tracker
 */

interface BrevoEvent {
  event: string // Type d'événement
  email: string // Email du destinataire
  id?: number // ID du message
  date?: string // Date de l'événement (ISO 8601)
  ts?: number // Timestamp
  'message-id'?: string // ID du message
  ts_event?: number // Timestamp de l'événement
  subject?: string // Sujet de l'email
  tag?: string // Tag personnalisé
  sending_ip?: string // IP d'envoi
  ts_epoch?: number // Timestamp epoch
  tags?: string[] // Tags multiples

  // Événements spécifiques
  link?: string // Pour les clics
  reason?: string // Pour les bounces
  template_id?: number // ID du template utilisé
}

export async function POST(request: Request) {
  try {
    const events: BrevoEvent[] = await request.json()

    log.info(`Brevo webhook reçu: ${events.length} événement(s)`)

    for (const event of events) {
      log.info(`Événement Brevo: ${event.event} pour ${event.email}`)

      // Traiter selon le type d'événement
      switch (event.event) {
        case 'delivered':
          await handleDelivered(event)
          break

        case 'opened':
          await handleOpened(event)
          break

        case 'click':
          await handleClick(event)
          break

        case 'hard_bounce':
        case 'soft_bounce':
          await handleBounce(event)
          break

        case 'invalid_email':
          await handleInvalidEmail(event)
          break

        case 'blocked':
          await handleBlocked(event)
          break

        case 'unsubscribed':
          await handleUnsubscribe(event)
          break

        case 'complaint':
          await handleComplaint(event)
          break

        default:
          log.info(`Événement Brevo non géré: ${event.event}`)
      }
    }

    return NextResponse.json({
      received: events.length,
      status: 'processed'
    })

  } catch (error) {
    log.error('Erreur webhook Brevo events:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Handlers pour chaque type d'événement

async function handleDelivered(event: BrevoEvent) {
  log.info(`✅ Email délivré à ${event.email}`)

  // Mettre à jour l'historique des emails si nécessaire
  try {
    await prisma.emailHistory.updateMany({
      where: {
        recipient: event.email,
        messageId: event['message-id']
      },
      data: {
        status: 'delivered',
        deliveredAt: new Date(event.date || event.ts_event ? event.ts_event * 1000 : Date.now())
      }
    })
  } catch (error) {
    // EmailHistory n'existe peut-être pas encore
    log.warn('Impossible de mettre à jour EmailHistory:', error)
  }
}

async function handleOpened(event: BrevoEvent) {
  log.info(`👀 Email ouvert par ${event.email}`)

  try {
    await prisma.emailHistory.updateMany({
      where: {
        recipient: event.email,
        messageId: event['message-id']
      },
      data: {
        openedAt: new Date(event.date || event.ts_event ? event.ts_event * 1000 : Date.now()),
        opened: true
      }
    })
  } catch (error) {
    log.warn('Impossible de mettre à jour EmailHistory:', error)
  }
}

async function handleClick(event: BrevoEvent) {
  log.info(`🖱️ Lien cliqué par ${event.email}: ${event.link}`)

  try {
    await prisma.emailHistory.updateMany({
      where: {
        recipient: event.email,
        messageId: event['message-id']
      },
      data: {
        clickedAt: new Date(event.date || event.ts_event ? event.ts_event * 1000 : Date.now()),
        clicked: true
      }
    })
  } catch (error) {
    log.warn('Impossible de mettre à jour EmailHistory:', error)
  }
}

async function handleBounce(event: BrevoEvent) {
  const isSoft = event.event === 'soft_bounce'
  log.warn(`❌ ${isSoft ? 'Soft' : 'Hard'} bounce pour ${event.email}: ${event.reason}`)

  // Pour les hard bounces, marquer l'email comme invalide
  if (!isSoft) {
    try {
      await prisma.user.updateMany({
        where: { email: event.email },
        data: {
          // Ajouter un champ pour marquer l'email comme invalide si nécessaire
          adminNotes: `Email invalide (hard bounce): ${event.reason}`
        }
      })
    } catch (error) {
      log.warn('Impossible de marquer l\'email comme invalide:', error)
    }
  }

  try {
    await prisma.emailHistory.updateMany({
      where: {
        recipient: event.email,
        messageId: event['message-id']
      },
      data: {
        status: isSoft ? 'soft_bounce' : 'hard_bounce',
        bounceReason: event.reason
      }
    })
  } catch (error) {
    log.warn('Impossible de mettre à jour EmailHistory:', error)
  }
}

async function handleInvalidEmail(event: BrevoEvent) {
  log.warn(`⚠️ Email invalide: ${event.email}`)

  try {
    await prisma.user.updateMany({
      where: { email: event.email },
      data: {
        adminNotes: `Email invalide détecté par Brevo`
      }
    })
  } catch (error) {
    log.warn('Impossible de marquer l\'email:', error)
  }
}

async function handleBlocked(event: BrevoEvent) {
  log.warn(`🚫 Email bloqué pour ${event.email}: ${event.reason}`)

  try {
    await prisma.emailHistory.updateMany({
      where: {
        recipient: event.email,
        messageId: event['message-id']
      },
      data: {
        status: 'blocked',
        bounceReason: event.reason
      }
    })
  } catch (error) {
    log.warn('Impossible de mettre à jour EmailHistory:', error)
  }
}

async function handleUnsubscribe(event: BrevoEvent) {
  log.info(`🔕 Désabonnement de ${event.email}`)

  try {
    await prisma.user.updateMany({
      where: { email: event.email },
      data: {
        // Marquer comme désabonné si vous avez ce champ
        preferences: 'unsubscribed_from_emails'
      }
    })
  } catch (error) {
    log.warn('Impossible de marquer comme désabonné:', error)
  }
}

async function handleComplaint(event: BrevoEvent) {
  log.warn(`⚠️ Plainte spam de ${event.email}`)

  try {
    await prisma.user.updateMany({
      where: { email: event.email },
      data: {
        adminNotes: 'Marqué comme spam par le destinataire'
      }
    })
  } catch (error) {
    log.warn('Impossible de marquer la plainte:', error)
  }
}
