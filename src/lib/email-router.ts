import { sendEmail as sendEmailBrevo } from './brevo'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    content: string // base64
    name: string
  }>
}

/**
 * Route l'email vers le bon provider selon le domaine
 * - laiaconnect.fr → Brevo
 * - laiaskininstitut.fr → Resend
 */
export async function sendEmail(params: EmailParams, domain?: string) {
  // Déterminer le domaine depuis les headers ou utiliser celui fourni
  const currentDomain = domain || (typeof window !== 'undefined' ? window.location.hostname : process.env.NEXT_PUBLIC_APP_URL || '')

  // Utiliser Brevo pour laiaconnect.fr
  if (currentDomain.includes('laiaconnect.fr')) {
    console.log('📧 Envoi via Brevo (LAIA Connect)')
    return sendEmailBrevo({
      ...params,
      replyTo: params.replyTo ? { email: params.replyTo } : undefined
    })
  }

  // Utiliser Resend pour laiaskininstitut.fr
  console.log('📧 Envoi via Resend (LAIA Skin Institut)')

  const { to, subject, html, text, replyTo, attachments } = params
  const toArray = Array.isArray(to) ? to : [to]

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: toArray,
      subject,
      html,
      text,
      replyTo: replyTo,
      attachments: attachments?.map(att => ({
        filename: att.name,
        content: att.content
      }))
    })

    console.log('✅ Email envoyé via Resend:', response.data?.id || 'Envoyé')
    return response
  } catch (error: any) {
    console.error('❌ Erreur envoi email Resend:', error.message)
    throw error
  }
}

/**
 * Envoie un email avec template selon le domaine
 */
export async function sendTemplateEmail(params: {
  to: string | string[]
  templateId?: number // Pour Brevo
  templateName?: string // Pour Resend
  params?: Record<string, any>
  domain?: string
}) {
  const { to, templateId, templateName, params: templateParams = {}, domain } = params
  const currentDomain = domain || (typeof window !== 'undefined' ? window.location.hostname : process.env.NEXT_PUBLIC_APP_URL || '')

  // Brevo pour laiaconnect.fr
  if (currentDomain.includes('laiaconnect.fr') && templateId) {
    const { sendTemplateEmail: sendBrevoTemplate } = await import('./brevo')
    return sendBrevoTemplate({ to, templateId, params: templateParams })
  }

  // Resend pour laiaskininstitut.fr
  if (templateName) {
    // Resend n'a pas de templates natifs, on pourrait utiliser React Email
    throw new Error('Les templates Resend ne sont pas encore implémentés. Utilisez sendEmail() avec HTML.')
  }

  throw new Error('Provider ou template non configuré pour ce domaine')
}

export default { sendEmail, sendTemplateEmail }
