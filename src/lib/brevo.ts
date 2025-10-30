import * as brevo from '@getbrevo/brevo'

// Instance API initialisée de manière lazy
let apiInstance: brevo.TransactionalEmailsApi | null = null

function getApiInstance() {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || ''
    )
  }
  return apiInstance
}

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: {
    name: string
    email: string
  }
  replyTo?: {
    email: string
    name?: string
  }
  attachments?: Array<{
    content: string // base64
    name: string
  }>
}

/**
 * Envoie un email via Brevo
 */
export async function sendEmail(params: SendEmailParams) {
  const {
    to,
    subject,
    html,
    text,
    from = {
      name: process.env.BREVO_FROM_NAME || 'LAIA Connect',
      email: process.env.BREVO_FROM_EMAIL || 'contact@laiaconnect.fr'
    },
    replyTo,
    attachments
  } = params

  // Convertir to en tableau
  const toArray = Array.isArray(to) ? to : [to]

  const sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.sender = from
  sendSmtpEmail.to = toArray.map(email => ({ email }))
  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = html

  if (text) sendSmtpEmail.textContent = text
  if (replyTo) sendSmtpEmail.replyTo = replyTo
  if (attachments) sendSmtpEmail.attachment = attachments

  try {
    const api = getApiInstance()
    const response = await api.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Email envoyé via Brevo:', response.body?.messageId || 'Envoyé')
    return response
  } catch (error: any) {
    console.error('❌ Erreur envoi email Brevo:', error.response?.body || error.message)
    throw error
  }
}

/**
 * Envoie un email avec template Brevo
 */
export async function sendTemplateEmail(params: {
  to: string | string[]
  templateId: number
  params?: Record<string, any>
  from?: { name: string; email: string }
}) {
  const {
    to,
    templateId,
    params: templateParams = {},
    from = {
      name: process.env.BREVO_FROM_NAME || 'LAIA Connect',
      email: process.env.BREVO_FROM_EMAIL || 'contact@laiaconnect.fr'
    }
  } = params

  const toArray = Array.isArray(to) ? to : [to]

  const sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.sender = from
  sendSmtpEmail.to = toArray.map(email => ({ email }))
  sendSmtpEmail.templateId = templateId
  sendSmtpEmail.params = templateParams

  try {
    const api = getApiInstance()
    const response = await api.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Email template envoyé via Brevo:', response.body?.messageId || 'Envoyé')
    return response
  } catch (error: any) {
    console.error('❌ Erreur envoi template Brevo:', error.response?.body || error.message)
    throw error
  }
}

export default { sendEmail, sendTemplateEmail }
