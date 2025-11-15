/**
 * Logger pour tracker toutes les communications (emails, SMS, WhatsApp)
 * Permet de voir l'historique complet dans le CRM
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CommunicationData {
  organizationId: string
  clientId?: string
  clientEmail?: string
  clientPhone?: string
  type: 'email' | 'sms' | 'whatsapp'
  direction: 'outbound' | 'inbound'
  subject?: string
  content: string
  attachments?: Array<{
    name: string
    url?: string
    size?: number
    type?: string
  }>
  metadata?: Record<string, any>
  status?: 'sent' | 'delivered' | 'failed' | 'read'
  sentBy?: string
}

/**
 * Logger une communication dans l'historique
 */
export async function logCommunication(data: CommunicationData) {
  try {
    const log = await prisma.$executeRaw`
      INSERT INTO "CommunicationLog" (
        "id",
        "organizationId",
        "clientId",
        "clientEmail",
        "clientPhone",
        "type",
        "direction",
        "subject",
        "content",
        "attachments",
        "metadata",
        "status",
        "sentBy",
        "sentAt",
        "createdAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${data.organizationId},
        ${data.clientId || null},
        ${data.clientEmail || null},
        ${data.clientPhone || null},
        ${data.type},
        ${data.direction},
        ${data.subject || null},
        ${data.content},
        ${JSON.stringify(data.attachments || [])}::jsonb,
        ${JSON.stringify(data.metadata || {})}::jsonb,
        ${data.status || 'sent'},
        ${data.sentBy || null},
        NOW(),
        NOW()
      )
    `

    console.log(`✅ Communication logged: ${data.type} to ${data.clientEmail || data.clientPhone}`)
    return log
  } catch (error) {
    console.error('❌ Erreur logging communication:', error)
    // Ne pas bloquer l'envoi si le logging échoue
    return null
  }
}

/**
 * Logger un email de bienvenue avec identifiants
 */
export async function logWelcomeEmailWithCredentials(data: {
  organizationId: string
  clientEmail: string
  clientId?: string
  subject: string
  generatedPassword: string
  attachments: Array<{name: string, url?: string, size?: number}>
  needsDataMigration?: boolean
  currentSoftware?: string
}) {
  return logCommunication({
    organizationId: data.organizationId,
    clientId: data.clientId,
    clientEmail: data.clientEmail,
    type: 'email',
    direction: 'outbound',
    subject: data.subject,
    content: `Email de bienvenue envoyé avec identifiants de connexion`,
    attachments: data.attachments,
    metadata: {
      emailType: 'welcome',
      hasCredentials: true,
      generatedPassword: data.generatedPassword, // Stocké pour référence admin (chiffrer en prod)
      needsDataMigration: data.needsDataMigration || false,
      currentSoftware: data.currentSoftware || null,
      timestamp: new Date().toISOString()
    },
    status: 'sent'
  })
}

/**
 * Logger un email standard
 */
export async function logEmail(data: {
  organizationId: string
  clientEmail: string
  clientId?: string
  subject: string
  content: string
  attachments?: Array<{name: string, url?: string, size?: number}>
  sentBy?: string
  metadata?: Record<string, any>
}) {
  return logCommunication({
    organizationId: data.organizationId,
    clientId: data.clientId,
    clientEmail: data.clientEmail,
    type: 'email',
    direction: 'outbound',
    subject: data.subject,
    content: data.content,
    attachments: data.attachments,
    metadata: {
      ...data.metadata,
      timestamp: new Date().toISOString()
    },
    status: 'sent',
    sentBy: data.sentBy
  })
}

/**
 * Logger un SMS
 */
export async function logSMS(data: {
  organizationId: string
  clientPhone: string
  clientId?: string
  content: string
  sentBy?: string
  status?: 'sent' | 'delivered' | 'failed'
}) {
  return logCommunication({
    organizationId: data.organizationId,
    clientId: data.clientId,
    clientPhone: data.clientPhone,
    type: 'sms',
    direction: 'outbound',
    content: data.content,
    status: data.status || 'sent',
    sentBy: data.sentBy
  })
}

/**
 * Logger un message WhatsApp
 */
export async function logWhatsApp(data: {
  organizationId: string
  clientPhone: string
  clientId?: string
  content: string
  sentBy?: string
  attachments?: Array<{name: string, url?: string, type?: string}>
}) {
  return logCommunication({
    organizationId: data.organizationId,
    clientId: data.clientId,
    clientPhone: data.clientPhone,
    type: 'whatsapp',
    direction: 'outbound',
    content: data.content,
    attachments: data.attachments,
    status: 'sent',
    sentBy: data.sentBy
  })
}

/**
 * Récupérer l'historique de communication d'un client
 */
export async function getClientCommunicationHistory(
  organizationId: string,
  clientEmail?: string,
  clientPhone?: string,
  clientId?: string
) {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "CommunicationLog"
      WHERE "organizationId" = ${organizationId}
        AND (
          ("clientEmail" = ${clientEmail || ''} AND ${clientEmail} IS NOT NULL)
          OR ("clientPhone" = ${clientPhone || ''} AND ${clientPhone} IS NOT NULL)
          OR ("clientId" = ${clientId || ''} AND ${clientId} IS NOT NULL)
        )
      ORDER BY "sentAt" DESC
      LIMIT 100
    `

    return result
  } catch (error) {
    console.error('❌ Erreur récupération historique:', error)
    return []
  }
}
