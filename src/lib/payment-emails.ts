import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LAIA <noreply@laia.com>'

interface PaymentSuccessEmailParams {
  to: string
  organizationName: string
  amount: number
  plan: string
  nextBillingDate: Date
  invoiceUrl?: string
}

interface PaymentFailedEmailParams {
  to: string
  organizationName: string
  amount: number
  plan: string
  reason?: string
}

interface TrialEndingEmailParams {
  to: string
  organizationName: string
  daysRemaining: number
  plan: string
  amount: number
}

/**
 * Envoie un email de confirmation après un prélèvement réussi
 */
export async function sendPaymentSuccessEmail({
  to,
  organizationName,
  amount,
  plan,
  nextBillingDate,
  invoiceUrl,
}: PaymentSuccessEmailParams) {
  try {
    const subject = `✅ Paiement confirmé - ${organizationName}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌸 LAIA Beauty</h1>
              <h2>Paiement confirmé</h2>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Nous vous confirmons que votre paiement a bien été effectué.</p>

              <div class="amount">€${amount.toFixed(2)}</div>

              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Organisation</span>
                  <span>${organizationName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Plan</span>
                  <span>${plan}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Montant</span>
                  <span>€${amount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Prochain prélèvement</span>
                  <span>${nextBillingDate.toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              ${invoiceUrl ? `
                <p style="text-align: center;">
                  <a href="${invoiceUrl}" class="button">📄 Télécharger la facture</a>
                </p>
              ` : ''}

              <p>Merci de votre confiance !</p>
              <p>L'équipe LAIA 💜</p>
            </div>
            <div class="footer">
              <p>LAIA Beauty - Logiciel de gestion pour instituts de beauté</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    console.log(`✅ Email de confirmation envoyé à ${to}`)
  } catch (error) {
    console.error('Erreur envoi email confirmation paiement:', error)
    throw error
  }
}

/**
 * Envoie un email en cas d'échec de prélèvement
 */
export async function sendPaymentFailedEmail({
  to,
  organizationName,
  amount,
  plan,
  reason,
}: PaymentFailedEmailParams) {
  try {
    const subject = `❌ Échec du prélèvement - ${organizationName}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            ul { line-height: 2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌸 LAIA Beauty</h1>
              <h2>Échec du prélèvement</h2>
            </div>
            <div class="content">
              <p>Bonjour,</p>

              <div class="warning">
                <strong>⚠️ Attention</strong><br>
                Le prélèvement automatique de votre abonnement LAIA a échoué.
              </div>

              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Organisation</span>
                  <span>${organizationName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Plan</span>
                  <span>${plan}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Montant</span>
                  <span>€${amount.toFixed(2)}</span>
                </div>
                ${reason ? `
                <div class="detail-row">
                  <span class="detail-label">Raison</span>
                  <span>${reason}</span>
                </div>
                ` : ''}
              </div>

              <h3>🔧 Que faire ?</h3>
              <ul>
                <li>Vérifiez que votre compte bancaire est suffisamment approvisionné</li>
                <li>Vérifiez que vos coordonnées bancaires sont à jour</li>
                <li>Contactez votre banque si le problème persiste</li>
              </ul>

              <p><strong>⚠️ Important :</strong> Votre accès à LAIA est actuellement suspendu. Régularisez votre situation pour continuer à utiliser le service.</p>

              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/billing" class="button">Mettre à jour mes informations</a>
              </p>

              <p>Pour toute question, n'hésitez pas à nous contacter.</p>
              <p>L'équipe LAIA</p>
            </div>
            <div class="footer">
              <p>LAIA Beauty - Logiciel de gestion pour instituts de beauté</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    console.log(`❌ Email d'échec de paiement envoyé à ${to}`)
  } catch (error) {
    console.error('Erreur envoi email échec paiement:', error)
    throw error
  }
}

/**
 * Envoie un email de rappel avant la fin de l'essai
 */
export async function sendTrialEndingEmail({
  to,
  organizationName,
  daysRemaining,
  plan,
  amount,
}: TrialEndingEmailParams) {
  try {
    const subject = `⏰ Votre essai gratuit se termine dans ${daysRemaining} jours`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌸 LAIA Beauty</h1>
              <h2>Votre essai touche à sa fin</h2>
            </div>
            <div class="content">
              <p>Bonjour,</p>

              <div class="info">
                <strong>ℹ️ Information</strong><br>
                Votre période d'essai gratuit de 30 jours se termine dans ${daysRemaining} jours.
              </div>

              <p>Après cette période, votre abonnement ${plan} sera automatiquement activé pour €${amount.toFixed(2)}/mois.</p>

              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Organisation</span>
                  <span>${organizationName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Plan</span>
                  <span>${plan}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Montant mensuel</span>
                  <span>€${amount.toFixed(2)}</span>
                </div>
              </div>

              <h3>📋 Que se passe-t-il ensuite ?</h3>
              <ul>
                <li>✅ Le premier prélèvement sera effectué automatiquement</li>
                <li>✅ Vous recevrez une facture par email</li>
                <li>✅ Votre service continue sans interruption</li>
              </ul>

              <p><strong>Vous souhaitez annuler ?</strong> Vous pouvez le faire à tout moment depuis votre espace admin.</p>

              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/billing" class="button">Gérer mon abonnement</a>
              </p>

              <p>Merci de votre confiance !</p>
              <p>L'équipe LAIA 💜</p>
            </div>
            <div class="footer">
              <p>LAIA Beauty - Logiciel de gestion pour instituts de beauté</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    console.log(`⏰ Email de rappel d'essai envoyé à ${to}`)
  } catch (error) {
    console.error('Erreur envoi email rappel essai:', error)
    throw error
  }
}
