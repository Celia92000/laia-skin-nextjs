import * as brevo from '@getbrevo/brevo'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

// Configuration Resend (fallback email provider)
const resend = new Resend(process.env.RESEND_API_KEY)

// Configuration Brevo pour LAIA Connect (plateforme SaaS)
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
)

/**
 * Helper pour envoyer un email via Brevo et logger dans EmailHistory
 */
async function sendEmailViaBrevo({
  to,
  subject,
  htmlContent,
  attachments,
  template,
  organizationId
}: {
  to: string[]
  subject: string
  htmlContent: string
  attachments?: Array<{ content: string; name: string }>
  template?: string
  organizationId: string
}) {
  const sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = htmlContent
  sendSmtpEmail.sender = {
    name: process.env.BREVO_FROM_NAME || 'LAIA Connect',
    email: process.env.BREVO_FROM_EMAIL || 'contact@laiaconnect.fr'
  }
  sendSmtpEmail.to = to.map(email => ({ email }))

  if (attachments) {
    sendSmtpEmail.attachment = attachments
  }

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)

    // Logger dans EmailHistory
    await prisma.emailHistory.create({
      data: {
        organizationId,
        from: sendSmtpEmail.sender.email,
        to: to.join(', '),
        subject,
        content: htmlContent,
        template,
        status: 'sent',
        direction: 'outgoing',
        messageId: (data.body as any)?.messageId || `brevo-${Date.now()}`
      }
    }).catch(err => console.error('⚠️ Erreur logging email:', err))

    return data
  } catch (error) {
    // Logger l'échec
    await prisma.emailHistory.create({
      data: {
        organizationId,
        from: sendSmtpEmail.sender.email,
        to: to.join(', '),
        subject,
        content: htmlContent,
        template,
        status: 'failed',
        direction: 'outgoing',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }).catch(err => console.error('⚠️ Erreur logging email échec:', err))

    throw error
  }
}

interface WelcomeEmailData {
  organizationId: string
  organizationName: string
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  tempPassword: string
  plan: string
  subdomain: string
  customDomain?: string
  adminUrl: string
  monthlyAmount: number
  trialEndsAt: Date
  sepaMandateRef: string
}

/**
 * Email de bienvenue avec identifiants après onboarding réussi
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData,
  invoicePdfBuffer?: Buffer,
  invoiceNumber?: string,
  contractPdfBuffer?: Buffer,
  contractNumber?: string
) {
  const {
    organizationId,
    organizationName,
    ownerFirstName,
    ownerLastName,
    ownerEmail,
    tempPassword,
    plan,
    subdomain,
    customDomain,
    adminUrl,
    monthlyAmount,
    trialEndsAt,
    sepaMandateRef
  } = data

  if (!plan) {
    throw new Error('Plan manquant dans les données d\'email de bienvenue')
  }

  const siteUrl = customDomain || `https://${subdomain}.laia-connect.fr`
  const fullName = `${ownerFirstName} ${ownerLastName}`

  const planNames: Record<string, string> = {
    SOLO: 'Solo',
    DUO: 'Duo',
    TEAM: 'Team',
    PREMIUM: 'Premium'
  }

  const planFeatures: Record<string, string[]> = {
    SOLO: [
      'Site web complet personnalisable',
      'Réservations en ligne illimitées',
      'Paiement Stripe (0% commission)',
      'Gestion clients complète',
      'Programme de fidélité & Parrainage',
      'Avis clients avec Google Reviews',
      'Comptabilité & Factures automatiques',
      'Statistiques en temps réel'
    ],
    DUO: [
      'Tout de Solo +',
      '✨ Blog professionnel',
      '✨ CRM & Prospection',
      '✨ Email Marketing avec automations',
      '3 utilisateurs'
    ],
    TEAM: [
      'Tout de Duo +',
      '✨ Boutique en ligne (produits + formations)',
      '✨ WhatsApp Business',
      '✨ SMS Marketing',
      '✨ Publications Instagram & Facebook',
      '✨ Gestion de stock',
      '✨ Nom de domaine personnalisé',
      '3 emplacements, 10 utilisateurs'
    ],
    PREMIUM: [
      'Tout de Team +',
      '✨ Publications TikTok',
      '✨ Support prioritaire',
      '✨ Account Manager dédié',
      '♾️ Tout illimité'
    ]
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur LAIA Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- En-tête -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <img src="https://laiaconnect.fr/logo-laia-connect.png" alt="LAIA Connect" style="width: 120px; height: 120px; margin-bottom: 20px;" />
              <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 700;">🎉 Bienvenue sur LAIA Connect !</h1>
              <p style="color: rgba(255, 255, 255, 0.95); font-size: 16px; margin: 0;">Votre site est prêt, ${ownerFirstName} !</p>
            </td>
          </tr>

          <!-- Contenu Principal -->
          <tr>
            <td style="padding: 40px 30px;">

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Félicitations ${fullName} ! 🎊
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Votre site <strong>${organizationName}</strong> est maintenant actif avec la formule <strong>${planNames[plan]}</strong>. Vous bénéficiez de <strong>30 jours d'essai gratuit</strong> jusqu'au <strong>${trialEndsAt.toLocaleDateString('fr-FR')}</strong>.
              </p>

              <!-- Bloc Identifiants -->
              <table role="presentation" style="width: 100%; background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">🔐 Vos identifiants de connexion</h2>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">URL d'administration</p>
                          <a href="${adminUrl}" style="color: #667eea; font-size: 16px; font-weight: 600; text-decoration: none;">${adminUrl}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Email</p>
                          <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0;">${ownerEmail}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Mot de passe temporaire</p>
                          <p style="color: #1f2937; font-size: 16px; font-weight: 600; font-family: monospace; background-color: white; padding: 10px; border-radius: 6px; margin: 5px 0 0 0;">${tempPassword}</p>
                        </td>
                      </tr>
                    </table>

                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-top: 20px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0;">
                        ⚠️ <strong>Important :</strong> Changez ce mot de passe dès votre première connexion pour des raisons de sécurité.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Votre Site -->
              <table role="presentation" style="width: 100%; background-color: #ede9fe; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">🌐 Votre site web</h2>
                    <p style="color: #4c1d95; font-size: 16px; margin: 0 0 10px 0;">
                      <a href="${siteUrl}" style="color: #667eea; font-weight: 600; text-decoration: none;">${siteUrl}</a>
                    </p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      Votre site est déjà en ligne avec un template professionnel pré-configuré !
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Votre Formule -->
              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">💎 Votre formule ${planNames[plan]}</h2>

              <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                ${planFeatures[plan].map(feature => `<li>${feature}</li>`).join('')}
              </ul>

              <!-- Bouton CTA -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      🚀 Accéder à mon espace admin
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Prochaines Étapes -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="color: #065f46; font-size: 18px; margin: 0 0 15px 0;">📋 Prochaines étapes</h3>
                <ol style="color: #047857; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Connectez-vous et changez votre mot de passe</li>
                  <li>Personnalisez les couleurs et le logo de votre site</li>
                  <li>Ajoutez vos services et tarifs</li>
                  <li>Configurez vos horaires d'ouverture</li>
                  <li>Testez une réservation</li>
                </ol>
              </div>

              <!-- Documents contractuels -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="color: #92400e; font-size: 18px; margin: 0 0 15px 0;">📄 Vos documents contractuels</h3>
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                  Vous trouverez en pièces jointes de cet email :
                </p>
                <ul style="color: #92400e; font-size: 14px; line-height: 1.8; margin: 0 0 15px 0;">
                  ${invoiceNumber ? `<li>📋 Votre facture d'activation (${invoiceNumber})</li>` : ''}
                  ${contractNumber ? `<li>📝 Votre contrat d'abonnement (${contractNumber})</li>` : ''}
                </ul>
                <p style="color: #92400e; font-size: 13px; margin: 0;">
                  <strong>Important :</strong> Vous pouvez également consulter nos
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.laiaconnect.fr'}/cgv-laia-connect" style="color: #f59e0b; text-decoration: underline;">Conditions Générales de Vente</a>
                  en ligne à tout moment.
                </p>
              </div>

              <!-- Informations Abonnement -->
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">💳 Informations d'abonnement</h3>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Formule</p>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0;">${planNames[plan]}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Prix mensuel</p>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0;">${monthlyAmount}€ HT/mois</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Période d'essai</p>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #10b981; font-size: 14px; font-weight: 600; margin: 0;">30 jours gratuits</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Fin de l'essai</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0;">${trialEndsAt.toLocaleDateString('fr-FR')}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Référence mandat SEPA</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="color: #1f2937; font-size: 12px; font-family: monospace; margin: 0;">${sepaMandateRef}</p>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #6b7280; font-size: 13px; margin: 15px 0 0 0; font-style: italic;">
                      Le premier prélèvement aura lieu le ${trialEndsAt.toLocaleDateString('fr-FR')}. Vous pouvez annuler à tout moment sans frais.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Besoin d'aide -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px 0;">💬 Besoin d'aide ?</h3>
                <p style="color: #1e3a8a; font-size: 15px; line-height: 1.6; margin: 0;">
                  Notre équipe est là pour vous accompagner :<br>
                  📧 Email : <a href="mailto:support@laia-connect.fr" style="color: #3b82f6; text-decoration: none;">support@laia-connect.fr</a><br>
                  📚 Centre d'aide : <a href="https://help.laia-connect.fr" style="color: #3b82f6; text-decoration: none;">help.laia-connect.fr</a><br>
                  💬 Chat en direct : Disponible dans votre espace admin
                </p>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Nous sommes ravis de vous compter parmi nous et avons hâte de voir votre institut briller en ligne ! ✨
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                À très bientôt,<br>
                <strong>L'équipe LAIA Connect</strong>
              </p>

            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} LAIA Connect - Tous droits réservés
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Vous recevez cet email car vous venez de créer un compte sur LAIA Connect.<br>
                <a href="${siteUrl}/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Se désabonner</a> |
                <a href="https://laia-connect.fr/privacy" style="color: #9ca3af; text-decoration: underline;">Politique de confidentialité</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    // Préparer les pièces jointes pour Brevo (format base64)
    const attachments = []

    if (invoicePdfBuffer && invoiceNumber) {
      attachments.push({
        content: invoicePdfBuffer.toString('base64'),
        name: `Facture_${invoiceNumber}.pdf`
      })
    }

    if (contractPdfBuffer && contractNumber) {
      attachments.push({
        content: contractPdfBuffer.toString('base64'),
        name: `Contrat_${contractNumber}.pdf`
      })
    }

    const result = await sendEmailViaBrevo({
      to: [ownerEmail],
      subject: `🎉 Bienvenue sur LAIA Connect - Votre site ${organizationName} est prêt !`,
      htmlContent: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
      template: 'onboarding_welcome',
      organizationId
    })

    console.log('✅ Email de bienvenue envoyé via Brevo:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Erreur envoi email de bienvenue:', error)
    throw error
  }
}

/**
 * Email avec guide de démarrage détaillé
 */
export async function sendOnboardingGuide(data: WelcomeEmailData) {
  const {
    organizationName,
    ownerFirstName,
    ownerEmail,
    adminUrl
  } = data

  const guideHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guide de démarrage LAIA Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <table role="presentation" style="max-width: 600px; width: 100%; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <img src="https://laiaconnect.fr/logo-laia-connect.png" alt="LAIA Connect" style="width: 120px; height: 120px; margin-bottom: 20px;" />
              <h1 style="color: white; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">📚 Guide de Démarrage Rapide</h1>
              <p style="color: rgba(255, 255, 255, 0.95); font-size: 16px; margin: 0;">En 10 minutes, votre site sera opérationnel !</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Bonjour ${ownerFirstName},<br><br>
                Voici un guide complet pour configurer votre site <strong>${organizationName}</strong> et commencer à recevoir vos premières réservations ! 🚀
              </p>

              <!-- Étape 1 -->
              <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #8b5cf6; font-size: 20px; margin: 0 0 10px 0;">1️⃣ Première Connexion</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  Connectez-vous à votre espace d'administration :
                </p>
                <a href="${adminUrl}" style="display: inline-block; background-color: #8b5cf6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 10px 0;">
                  Accéder à l'admin
                </a>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                  ⚠️ <strong>Action importante :</strong> Changez immédiatement votre mot de passe dans <strong>Paramètres → Mon Compte</strong>
                </p>
              </div>

              <!-- Étape 2 -->
              <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #3b82f6; font-size: 20px; margin: 0 0 10px 0;">2️⃣ Personnaliser l'Apparence</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  Allez dans <strong>Paramètres → Design & Apparence</strong> :
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Téléchargez votre <strong>logo</strong></li>
                  <li>Choisissez vos <strong>couleurs</strong> (primaire, secondaire)</li>
                  <li>Personnalisez le <strong>titre</strong> et <strong>slogan</strong></li>
                  <li>Modifiez la <strong>page d'accueil</strong> (texte, images)</li>
                  <li>Ajoutez vos <strong>photos d'institut</strong></li>
                </ul>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                  💡 <strong>Astuce :</strong> Des photos de qualité font toute la différence !
                </p>
              </div>

              <!-- Étape 3 -->
              <div style="border-left: 4px solid #f59e0b; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #f59e0b; font-size: 20px; margin: 0 0 10px 0;">3️⃣ Ajouter vos Services</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  Allez dans <strong>Services</strong> :
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Cliquez sur <strong>"Nouveau service"</strong></li>
                  <li>Indiquez le <strong>nom</strong>, <strong>description</strong> et <strong>bénéfices</strong></li>
                  <li>Définissez le <strong>prix</strong> et la <strong>durée</strong></li>
                  <li>Ajoutez des <strong>photos</strong> de qualité</li>
                  <li>Choisissez une <strong>catégorie</strong> (Soins visage, Épilation, etc.)</li>
                  <li>Activez le service avec le bouton <strong>"Visible"</strong></li>
                </ul>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                  💡 <strong>Astuce :</strong> Ajoutez au moins 5 services populaires pour commencer
                </p>
              </div>

              <!-- Étape 4 -->
              <div style="border-left: 4px solid #ec4899; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #ec4899; font-size: 20px; margin: 0 0 10px 0;">4️⃣ Configurer vos Horaires</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  Allez dans <strong>Planning → Disponibilités</strong> :
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Définissez vos <strong>horaires d'ouverture</strong> par jour</li>
                  <li>Bloquez vos <strong>congés</strong> et <strong>fermetures</strong></li>
                  <li>Configurez vos <strong>pauses déjeuner</strong></li>
                </ul>
              </div>

              <!-- Étape 5 -->
              <div style="border-left: 4px solid #10b981; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #10b981; font-size: 20px; margin: 0 0 10px 0;">5️⃣ Tester une Réservation</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  <strong>Important :</strong> Testez le parcours client !
                </p>
                <ol style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Ouvrez votre site web (lien dans le premier email)</li>
                  <li>Cliquez sur <strong>"Réserver"</strong></li>
                  <li>Choisissez un service et un créneau</li>
                  <li>Créez un compte client test</li>
                  <li>Vérifiez que vous recevez bien l'email de confirmation</li>
                </ol>
              </div>

              <!-- Étape 6 -->
              <div style="border-left: 4px solid #6366f1; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #6366f1; font-size: 20px; margin: 0 0 10px 0;">6️⃣ Configurer les Notifications</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  Allez dans <strong>Paramètres → Notifications</strong> :
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Activez les <strong>rappels 24h avant</strong> (email)</li>
                  <li>Activez la <strong>demande d'avis</strong> après le RDV</li>
                  <li>Personnalisez les <strong>messages automatiques</strong></li>
                </ul>
              </div>

              <!-- Étape 7 -->
              <div style="border-left: 4px solid #f97316; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #f97316; font-size: 20px; margin: 0 0 10px 0;">7️⃣ Partager votre Site</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                  Maintenant, faites connaître votre site :
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Partagez le lien sur <strong>Instagram</strong> et <strong>Facebook</strong></li>
                  <li>Ajoutez-le dans votre <strong>bio Instagram</strong></li>
                  <li>Envoyez-le à vos <strong>clients actuels</strong></li>
                  <li>Ajoutez-le sur <strong>Google My Business</strong></li>
                  <li>Imprimez des <strong>cartes de visite</strong> avec le lien</li>
                </ul>
              </div>

              <!-- Checklist -->
              <div style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #065f46; font-size: 18px; margin: 0 0 15px 0;">✅ Checklist de Lancement</h3>
                <ul style="color: #047857; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px; list-style: none;">
                  <li>☐ Mot de passe changé</li>
                  <li>☐ Logo et couleurs configurés</li>
                  <li>☐ Au moins 5 services ajoutés</li>
                  <li>☐ Horaires d'ouverture définis</li>
                  <li>☐ Réservation test effectuée</li>
                  <li>☐ Notifications activées</li>
                  <li>☐ Site partagé sur les réseaux sociaux</li>
                </ul>
              </div>

              <!-- Ressources -->
              <h2 style="color: #1f2937; font-size: 20px; margin: 30px 0 15px 0;">📚 Ressources Utiles</h2>
              <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li><a href="https://help.laia-connect.fr" style="color: #3b82f6; text-decoration: none;">Centre d'aide complet</a></li>
                <li><a href="https://help.laia-connect.fr/videos" style="color: #3b82f6; text-decoration: none;">Vidéos tutoriels</a></li>
                <li><a href="https://docs.laia-connect.fr/domaine-personnalise" style="color: #3b82f6; text-decoration: none;">🌐 Guide : Configurer votre domaine personnalisé</a></li>
                <li><a href="https://help.laia-connect.fr/faq" style="color: #3b82f6; text-decoration: none;">FAQ</a></li>
                <li><a href="mailto:support@laia-connect.fr" style="color: #3b82f6; text-decoration: none;">Support par email</a></li>
              </ul>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Vous avez des questions ? N'hésitez pas à nous contacter, nous sommes là pour vous aider ! 💬
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Bonne configuration !<br>
                <strong>L'équipe LAIA Connect</strong>
              </p>

            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © ${new Date().getFullYear()} LAIA Connect
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const result = await resend.emails.send({
      from: 'LAIA Connect <support@laia-connect.fr>',
      to: [ownerEmail],
      subject: `📚 Guide de démarrage - ${organizationName}`,
      html: guideHtml
    })

    console.log('✅ Guide de démarrage envoyé:', result)
    return result
  } catch (error) {
    console.error('❌ Erreur envoi guide:', error)
    throw error
  }
}

/**
 * Email de confirmation de paiement et attente d'activation (24h)
 */
export async function sendPendingActivationEmail(data: WelcomeEmailData) {
  const {
    organizationName,
    ownerFirstName,
    ownerEmail,
    plan,
    monthlyAmount,
    sepaMandateRef
  } = data

  const planNames: Record<string, string> = {
    SOLO: 'Solo',
    DUO: 'Duo',
    TEAM: 'Team',
    PREMIUM: 'Premium'
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement confirmé - Activation sous 24h</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Paiement confirmé !
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Votre compte ${organizationName} est en cours de préparation
              </p>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour ${ownerFirstName},
              </p>

              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Merci pour votre confiance ! Votre paiement a bien été enregistré et votre abonnement <strong>${planNames[plan]}</strong> à <strong>${monthlyAmount}€/mois</strong> est activé.
              </p>

              <!-- Encadré important -->
              <table style="width: 100%; background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-left: 4px solid #3b82f6; border-radius: 8px; margin: 25px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #1e40af;">
                      ⏳ Activation sous 24 heures
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6;">
                      Notre équipe prépare actuellement votre espace personnalisé. Vous recevrez vos identifiants de connexion par email dès que tout sera prêt.
                    </p>
                  </td>
                </tr>
              </table>

              <h3 style="font-size: 18px; color: #111827; margin: 30px 0 15px 0;">
                📋 Récapitulatif de votre commande
              </h3>

              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Offre</td>
                  <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">
                    Plan ${planNames[plan]}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Montant mensuel</td>
                  <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">
                    ${monthlyAmount}€/mois
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Période d'essai</td>
                  <td style="padding: 12px 0; color: #10b981; font-size: 14px; text-align: right; font-weight: 600;">
                    30 jours gratuits
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Référence mandat SEPA</td>
                  <td style="padding: 12px 0; color: #111827; font-size: 12px; text-align: right; font-family: monospace;">
                    ${sepaMandateRef}
                  </td>
                </tr>
              </table>

              <h3 style="font-size: 18px; color: #111827; margin: 30px 0 15px 0;">
                🎯 Prochaines étapes
              </h3>

              <ol style="padding-left: 20px; margin: 0; color: #374151; font-size: 14px; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Notre équipe configure votre espace personnalisé</li>
                <li style="margin-bottom: 10px;">Vous recevrez un email avec vos identifiants de connexion</li>
                <li style="margin-bottom: 10px;">Vous pourrez vous connecter et commencer à utiliser LAIA Connect</li>
                <li>Profitez de vos 30 jours d'essai gratuit !</li>
              </ol>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Des questions ? Contactez-nous à <a href="mailto:support@laia-connect.fr" style="color: #9333ea; text-decoration: none;">support@laia-connect.fr</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                © 2025 LAIA Connect - Logiciel de gestion pour instituts de beauté
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const result = await resend.emails.send({
      from: 'LAIA Connect <onboarding@laia-connect.fr>',
      to: ownerEmail,
      subject: `✅ Paiement confirmé - Activation sous 24h - ${organizationName}`,
      html: emailHtml
    })

    console.log('✅ Email de confirmation envoyé:', result)
    return result
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error)
    throw error
  }
}

/**
 * Email d'activation du compte avec identifiants
 */
export async function sendAccountActivationEmail(data: WelcomeEmailData) {
  const {
    organizationName,
    ownerFirstName,
    ownerEmail,
    tempPassword,
    adminUrl,
    subdomain,
    customDomain
  } = data

  const siteUrl = customDomain || `https://${subdomain}.laia-connect.fr`

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre compte est activé !</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Votre compte est activé !
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Bienvenue dans l'aventure LAIA Connect
              </p>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour ${ownerFirstName},
              </p>

              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Bonne nouvelle ! Votre espace <strong>${organizationName}</strong> est maintenant prêt. Vous pouvez vous connecter et commencer à l'utiliser dès maintenant.
              </p>

              <!-- Encadré identifiants -->
              <table style="width: 100%; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; margin: 25px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #92400e;">
                      🔐 Vos identifiants de connexion
                    </p>
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Email :</td>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-family: monospace; background-color: rgba(255,255,255,0.5); padding: 4px 8px; border-radius: 4px;">
                          ${ownerEmail}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Mot de passe :</td>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-family: monospace; background-color: rgba(255,255,255,0.5); padding: 4px 8px; border-radius: 4px;">
                          ${tempPassword}
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #92400e;">
                      ⚠️ Pour votre sécurité, changez ce mot de passe dès votre première connexion
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Bouton de connexion -->
              <table style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">
                      🚀 Accéder à mon espace admin
                    </a>
                  </td>
                </tr>
              </table>

              <h3 style="font-size: 18px; color: #111827; margin: 30px 0 15px 0;">
                🎯 Pour bien démarrer
              </h3>

              <ol style="padding-left: 20px; margin: 0; color: #374151; font-size: 14px; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Connectez-vous à votre espace admin</li>
                <li style="margin-bottom: 10px;">Changez votre mot de passe</li>
                <li style="margin-bottom: 10px;">Complétez votre profil et ajoutez votre logo</li>
                <li style="margin-bottom: 10px;">Ajoutez vos services et prestations</li>
                <li>Invitez vos premiers clients !</li>
              </ol>

              <!-- URLs utiles -->
              <table style="width: 100%; background-color: #f9fafb; border-radius: 8px; margin: 25px 0; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #374151;">
                      📍 Vos liens importants :
                    </p>
                    <p style="margin: 5px 0; font-size: 13px; color: #6b7280;">
                      <strong>Espace admin :</strong> <a href="${adminUrl}" style="color: #9333ea;">${adminUrl}</a>
                    </p>
                    <p style="margin: 5px 0; font-size: 13px; color: #6b7280;">
                      <strong>Votre site :</strong> <a href="${siteUrl}" style="color: #9333ea;">${siteUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Guides utiles -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px 0;">📚 Guides et Documentation</h3>
                <ul style="color: #1e40af; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><a href="https://docs.laia-connect.fr" style="color: #3b82f6; text-decoration: none;">Documentation complète</a></li>
                  <li><a href="https://docs.laia-connect.fr/domaine-personnalise" style="color: #3b82f6; text-decoration: none;">🌐 Configurer votre domaine personnalisé (DNS)</a></li>
                  <li><a href="https://help.laia-connect.fr/videos" style="color: #3b82f6; text-decoration: none;">Vidéos tutoriels</a></li>
                </ul>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Besoin d'aide ? Consultez notre <a href="https://docs.laia-connect.fr" style="color: #9333ea;">documentation</a> ou contactez-nous à <a href="mailto:support@laia-connect.fr" style="color: #9333ea;">support@laia-connect.fr</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                © 2025 LAIA Connect - Logiciel de gestion pour instituts de beauté
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const result = await resend.emails.send({
      from: 'LAIA Connect <onboarding@laia-connect.fr>',
      to: ownerEmail,
      subject: `🎉 Votre compte ${organizationName} est activé !`,
      html: emailHtml
    })

    console.log('✅ Email d\'activation envoyé:', result)
    return result
  } catch (error) {
    console.error('❌ Erreur envoi email activation:', error)
    throw error
  }
}

/**
 * Email de notification au super-admin lors d'une nouvelle inscription
 */
export async function sendSuperAdminNotification(data: {
  organizationId: string
  organizationName: string
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  ownerPhone?: string
  city: string
  plan: string
  monthlyAmount: number
  siret?: string
  legalName?: string
  subdomain: string
  customDomain?: string
  trialEndsAt: Date
  createdAt: Date
}) {
  const {
    organizationId,
    organizationName,
    ownerFirstName,
    ownerLastName,
    ownerEmail,
    ownerPhone,
    city,
    plan,
    monthlyAmount,
    siret,
    legalName,
    subdomain,
    customDomain,
    trialEndsAt,
    createdAt
  } = data

  const fullName = `${ownerFirstName} ${ownerLastName}`
  const siteUrl = customDomain || `https://${subdomain}.laia-connect.fr`
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/super-admin/organizations/${organizationId}`

  const planNames: Record<string, string> = {
    SOLO: 'Solo (49€/mois)',
    DUO: 'Duo (69€/mois)',
    TEAM: 'Team (119€/mois)',
    PREMIUM: 'Premium (179€/mois)'
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle inscription LAIA Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <table role="presentation" style="max-width: 650px; width: 100%; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <img src="https://laiaconnect.fr/logo-laia-connect.png" alt="LAIA Connect" style="width: 120px; height: 120px; margin-bottom: 20px;" />
              <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 700;">🎉 Nouvelle Inscription !</h1>
              <p style="color: rgba(255, 255, 255, 0.95); font-size: 16px; margin: 0;">Une nouvelle organisation vient de s'inscrire</p>
            </td>
          </tr>

          <!-- Badge NOUVEAU -->
          <tr>
            <td style="padding: 20px 30px; background-color: #ecfdf5; border-bottom: 3px solid #10b981;">
              <div style="text-align: center;">
                <span style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  ✨ Nouveau Client
                </span>
              </div>
            </td>
          </tr>

          <!-- Informations principales -->
          <tr>
            <td style="padding: 30px;">

              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <tr>
                  <td>
                    <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 20px 0;">📋 Informations de l'organisation</h2>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">Nom de l'institut</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${organizationName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Raison sociale</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px;">${legalName || 'Non renseigné'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">SIRET</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-family: monospace;">${siret || 'Non renseigné'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Ville</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px;">${city}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Subdomain</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-family: monospace;">${subdomain}.laia-connect.fr</td>
                      </tr>
                      ${customDomain ? `
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Domaine personnalisé</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-family: monospace;">${customDomain}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <tr>
                  <td>
                    <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 20px 0;">👤 Propriétaire</h2>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">Nom complet</td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Email</td>
                        <td style="padding: 10px 0;">
                          <a href="mailto:${ownerEmail}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">${ownerEmail}</a>
                        </td>
                      </tr>
                      ${ownerPhone ? `
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Téléphone</td>
                        <td style="padding: 10px 0;">
                          <a href="tel:${ownerPhone}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">${ownerPhone}</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <tr>
                  <td>
                    <h2 style="color: #92400e; font-size: 22px; margin: 0 0 20px 0;">💰 Abonnement</h2>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px; width: 40%;">Formule</td>
                        <td style="padding: 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">${planNames[plan]}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px;">Revenu mensuel</td>
                        <td style="padding: 10px 0; color: #92400e; font-size: 18px; font-weight: 700;">${monthlyAmount}€ HT/mois</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px;">Période d'essai</td>
                        <td style="padding: 10px 0; color: #10b981; font-size: 14px; font-weight: 600;">30 jours gratuits</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px;">Fin de l'essai</td>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">${trialEndsAt.toLocaleDateString('fr-FR')}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px;">Date d'inscription</td>
                        <td style="padding: 10px 0; color: #92400e; font-size: 14px;">${createdAt.toLocaleDateString('fr-FR')} à ${createdAt.toLocaleTimeString('fr-FR')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Actions rapides -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="color: #065f46; font-size: 18px; margin: 0 0 15px 0;">⚡ Actions rapides</h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td align="center" style="padding: 10px 0;">
                      <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                        👁️ Voir la fiche organisation
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 10px 0;">
                      <a href="${siteUrl}" target="_blank" style="display: inline-block; background-color: white; border: 2px solid #10b981; color: #10b981; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                        🌐 Visiter le site
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 10px 0;">
                      <a href="mailto:${ownerEmail}" style="display: inline-block; background-color: white; border: 2px solid #3b82f6; color: #3b82f6; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                        📧 Contacter le propriétaire
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Informations système -->
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 25px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0; font-family: monospace;">
                  <strong>ID Organisation :</strong> ${organizationId}<br>
                  <strong>Statut :</strong> ACTIVE (essai gratuit)<br>
                  <strong>Email envoyé :</strong> Oui ✅
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © ${new Date().getFullYear()} LAIA Connect - Notification Super Admin
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    // Email au super-admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'contact@laiaconnect.fr'

    const result = await sendEmailViaBrevo({
      to: [superAdminEmail],
      subject: `🎉 Nouvelle inscription : ${organizationName} - Plan ${plan} (${monthlyAmount}€/mois)`,
      htmlContent: emailHtml,
      template: 'onboarding_superadmin_notification',
      organizationId
    })

    console.log('✅ Notification super-admin envoyée via Brevo:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Erreur envoi notification super-admin:', error)
    throw error
  }
}
