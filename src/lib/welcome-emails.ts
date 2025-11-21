import { sendEmail } from './brevo'
import { log } from './logger'

interface WelcomeEmailParams {
  email: string
  name: string
  institutName?: string
  plan?: string
}

/**
 * Envoie l'email de bienvenue immédiat (J+0)
 * Envoyé juste après l'inscription
 */
export async function sendWelcomeEmailDay0(params: WelcomeEmailParams) {
  const { email, name, institutName, plan } = params

  try {
    await sendEmail({
      to: email,
      subject: `🎉 Bienvenue sur LAIA Connect ${institutName ? `- ${institutName}` : ''}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header avec logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0; font-size: 32px;">Bienvenue sur LAIA Connect !</h1>
            <p style="color: #6b7280; margin-top: 10px;">Votre aventure digitale commence maintenant 🚀</p>
          </div>

          <!-- Contenu principal -->
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Bonjour <strong>${name}</strong>,
            </p>

            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Félicitations ! Vous venez de franchir la première étape vers la digitalisation de votre institut ${institutName ? `<strong>${institutName}</strong>` : ''}.
            </p>

            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0;">
              Avec LAIA Connect, vous avez maintenant accès à une plateforme complète pour :
            </p>

            <ul style="color: #1f2937; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
              <li>📅 Gérer vos réservations en ligne</li>
              <li>🌐 Publier votre site web professionnel</li>
              <li>💰 Accepter les paiements en ligne</li>
              <li>👥 Fidéliser vos clients</li>
              <li>📊 Suivre vos statistiques</li>
            </ul>
          </div>

          <!-- Call to action -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin"
               style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Accéder à mon espace admin
            </a>
          </div>

          <!-- Prochaines étapes -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Vos prochaines étapes :</h3>
            <ol style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Complétez la configuration de votre espace (5 min)</li>
              <li>Ajoutez votre premier service</li>
              <li>Personnalisez votre site web</li>
              <li>Partagez votre lien de réservation</li>
            </ol>
          </div>

          <!-- Ressources utiles -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📚 Ressources utiles :</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/aide" style="color: #7c3aed;">Guide de démarrage rapide</a></li>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/aide#faq" style="color: #7c3aed;">Foire aux questions</a></li>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/support" style="color: #7c3aed;">Support client</a></li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Besoin d'aide ? Notre équipe est là pour vous accompagner.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Répondez à cet email ou contactez-nous à <a href="mailto:contact@laiaconnect.fr" style="color: #7c3aed;">contact@laiaconnect.fr</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
              L'équipe LAIA Connect 💜
            </p>
          </div>
        </div>
      `
    })

    log.info(`[Welcome Email J+0] Envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    log.error('[Welcome Email J+0] Erreur envoi:', error)
    return { success: false, error }
  }
}

/**
 * Email J+1 : Premiers pas et conseils
 */
export async function sendWelcomeEmailDay1(params: WelcomeEmailParams) {
  const { email, name, institutName } = params

  try {
    await sendEmail({
      to: email,
      subject: `💡 ${name}, avez-vous ajouté votre premier service ?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">Bonjour ${name} 👋</h2>

          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Hier, vous avez rejoint LAIA Connect. Nous espérons que votre première découverte s'est bien passée !
          </p>

          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Aujourd'hui, nous voulons vous aider à franchir une étape importante : <strong>créer votre premier service</strong>.
          </p>

          <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #7c3aed; margin: 0 0 15px 0;">🎯 Conseil du jour :</h3>
            <p style="color: #374151; margin: 0; line-height: 1.6;">
              Commencez par ajouter <strong>votre prestation la plus populaire</strong>. Vous pourrez toujours ajouter les autres plus tard. L'important est de commencer simple !
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/services"
               style="display: inline-block; background: #7c3aed; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ajouter mon premier service
            </a>
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">💚 Le saviez-vous ?</h3>
            <p style="color: #065f46; margin: 0; line-height: 1.6; font-size: 14px;">
              Les instituts qui ajoutent au moins 3 services dans la première semaine augmentent leurs réservations de 60% !
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            À bientôt,<br>
            L'équipe LAIA Connect
          </p>
        </div>
      `
    })

    log.info(`[Welcome Email J+1] Envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    log.error('[Welcome Email J+1] Erreur envoi:', error)
    return { success: false, error }
  }
}

/**
 * Email J+3 : Personnalisation du site
 */
export async function sendWelcomeEmailDay3(params: WelcomeEmailParams) {
  const { email, name } = params

  try {
    await sendEmail({
      to: email,
      subject: `🎨 ${name}, personnalisez votre site en 10 minutes !`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">Créez une vitrine unique pour votre institut ! ✨</h2>

          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Bonjour ${name},
          </p>

          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Votre site web est la première impression que vos futurs clients auront de votre institut. Rendons-le irrésistible ! 🌟
          </p>

          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">🎨 En 10 minutes chrono :</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Ajoutez votre logo</li>
              <li>Choisissez vos couleurs</li>
              <li>Rédigez votre présentation</li>
              <li>Publiez votre site !</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/website"
               style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Personnaliser mon site
            </a>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>Astuce pro :</strong> Utilisez des photos de qualité et des descriptions claires pour augmenter votre taux de conversion de 40% !
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            Belle journée,<br>
            L'équipe LAIA Connect
          </p>
        </div>
      `
    })

    log.info(`[Welcome Email J+3] Envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    log.error('[Welcome Email J+3] Erreur envoi:', error)
    return { success: false, error }
  }
}

/**
 * Email J+7 : Bilan et prochaines étapes
 */
export async function sendWelcomeEmailDay7(params: WelcomeEmailParams) {
  const { email, name } = params

  try {
    await sendEmail({
      to: email,
      subject: `🎉 ${name}, une semaine déjà ! Faisons le point`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">Félicitations pour cette première semaine ! 🎊</h2>

          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Bonjour ${name},
          </p>

          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Cela fait maintenant <strong>7 jours</strong> que vous avez rejoint LAIA Connect. Nous espérons que cette première semaine a été productive !
          </p>

          <div style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #1e3a8a; margin: 0 0 20px 0;">📊 Pour aller plus loin :</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 2;">
              <li>✅ Activez les paiements en ligne (Stripe)</li>
              <li>✅ Configurez vos horaires d'ouverture</li>
              <li>✅ Invitez votre équipe si besoin</li>
              <li>✅ Partagez votre lien de réservation</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin"
               style="display: inline-block; background: #7c3aed; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Accéder à mon tableau de bord
            </a>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">💡 Besoin d'aide ?</h3>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
              Notre équipe est disponible par email ou via le chat de support dans votre espace admin. N'hésitez pas à nous solliciter !
            </p>
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #065f46; margin: 0; font-size: 15px; line-height: 1.6; text-align: center;">
              <strong>🎁 Votre période d'essai gratuite est active pendant encore 23 jours !</strong><br>
              <span style="font-size: 13px;">Profitez-en pour explorer toutes les fonctionnalités.</span>
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            Merci de votre confiance,<br>
            L'équipe LAIA Connect 💜
          </p>
        </div>
      `
    })

    log.info(`[Welcome Email J+7] Envoyé à ${email}`)
    return { success: true }
  } catch (error) {
    log.error('[Welcome Email J+7] Erreur envoi:', error)
    return { success: false, error }
  }
}
