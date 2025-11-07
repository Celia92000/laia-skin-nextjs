/**
 * Templates d'emails pour les workflows automatiques
 * Variables disponibles:
 * - {organizationName}
 * - {ownerFirstName}
 * - {ownerLastName}
 * - {ownerEmail}
 * - {plan}
 * - {subdomain}
 * - {demoLink}
 * - {supportEmail}
 * - {dashboardUrl}
 */

export const defaultWorkflowTemplates = [
  {
    name: 'Bienvenue J+1',
    description: 'Email de bienvenue envoyé 1 jour après inscription',
    trigger: 'ONBOARDING_DAY_1',
    delayDays: 1,
    subject: 'Bienvenue sur LAIA Connect, {ownerFirstName} ! 🎉',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .checklist { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .checklist-item { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur LAIA Connect !</h1>
          </div>
          <div class="content">
            <p>Bonjour {ownerFirstName},</p>

            <p>Félicitations ! Votre organisation <strong>{organizationName}</strong> est maintenant active sur LAIA Connect.</p>

            <p>Vous avez choisi la formule <strong>{plan}</strong> et vous disposez de <strong>30 jours d'essai gratuit</strong> pour découvrir toutes les fonctionnalités.</p>

            <div class="checklist">
              <h3>✅ Pour bien démarrer :</h3>
              <div class="checklist-item">✓ Votre espace admin est accessible sur : <strong>{dashboardUrl}</strong></div>
              <div class="checklist-item">✓ Consultez vos documents (facture + contrat) reçus par email</div>
              <div class="checklist-item">✓ Personnalisez votre site (couleurs, logo, contenus)</div>
              <div class="checklist-item">✓ Ajoutez vos prestations et tarifs</div>
              <div class="checklist-item">✓ Configurez votre système de réservation en ligne</div>
            </div>

            <p style="text-align: center;">
              <a href="{dashboardUrl}" class="button">Accéder à mon espace admin</a>
            </p>

            <p>Si vous avez la moindre question, notre équipe est là pour vous aider !</p>

            <p>À très bientôt,<br>
            L'équipe LAIA Connect</p>
          </div>
          <div class="footer">
            <p>LAIA Connect - Logiciel SaaS pour instituts de beauté</p>
            <p>Besoin d'aide ? Contactez-nous : {supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'Aide configuration J+7',
    description: 'Proposition de démo après 7 jours',
    trigger: 'ONBOARDING_DAY_7',
    delayDays: 7,
    subject: 'Besoin d\'aide pour configurer votre site ? 🤝',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button-secondary { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .highlight-box { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤝 Comment se passe votre démarrage ?</h1>
          </div>
          <div class="content">
            <p>Bonjour {ownerFirstName},</p>

            <p>Cela fait une semaine que vous avez rejoint LAIA Connect avec <strong>{organizationName}</strong>. J'espère que tout se passe bien !</p>

            <p>Certains de nos clients nous ont dit qu'un accompagnement personnalisé les aidait à démarrer plus rapidement.</p>

            <div class="highlight-box">
              <h3>🎯 Réservez une session de démo personnalisée (30 min, gratuit)</h3>
              <p>Je peux vous aider à :</p>
              <ul>
                <li>Configurer votre site en 5 minutes chrono</li>
                <li>Optimiser votre page de réservation</li>
                <li>Paramétrer vos automatisations</li>
                <li>Répondre à toutes vos questions</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="{demoLink}" class="button">📅 Réserver une session de démo gratuite</a>
            </p>

            <p style="text-align: center;">
              <a href="{dashboardUrl}" class="button-secondary">Continuer seul(e)</a>
            </p>

            <p>Pas besoin de démo ? Aucun souci ! Vous pouvez également consulter notre documentation complète et nos tutoriels vidéo.</p>

            <p>À votre disposition,<br>
            L'équipe LAIA Connect</p>
          </div>
          <div class="footer">
            <p>LAIA Connect - Logiciel SaaS pour instituts de beauté</p>
            <p>Besoin d'aide ? Contactez-nous : {supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'Suivi J+15',
    description: 'Email de suivi après 15 jours',
    trigger: 'ONBOARDING_DAY_15',
    delayDays: 15,
    subject: 'Mi-parcours de votre essai gratuit 📊',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .stats-box { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Mi-parcours de votre essai !</h1>
          </div>
          <div class="content">
            <p>Bonjour {ownerFirstName},</p>

            <p>Vous êtes maintenant à mi-chemin de votre période d'essai gratuite de 30 jours avec <strong>{organizationName}</strong>.</p>

            <div class="stats-box">
              <h3>⏰ Il vous reste 15 jours pour profiter de toutes les fonctionnalités !</h3>
              <p>Avez-vous eu l'occasion de tester :</p>
              <ul>
                <li>✅ Système de réservation en ligne</li>
                <li>✅ Gestion des clients et historique</li>
                <li>✅ Envoi automatique de SMS/emails</li>
                <li>✅ Boutique en ligne (si formule DUO+)</li>
                <li>✅ Blog et articles (si formule DUO+)</li>
              </ul>
            </div>

            <p>Si vous n'avez pas encore exploré toutes ces fonctionnalités, c'est le moment idéal !</p>

            <p style="text-align: center;">
              <a href="{dashboardUrl}" class="button">Accéder à mon tableau de bord</a>
            </p>

            <p>Des questions ? Une fonctionnalité qui vous manque ? N'hésitez pas à nous contacter : <strong>{supportEmail}</strong></p>

            <p>Cordialement,<br>
            L'équipe LAIA Connect</p>
          </div>
          <div class="footer">
            <p>LAIA Connect - Logiciel SaaS pour instituts de beauté</p>
            <p>Besoin d'aide ? Contactez-nous : {supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'Fin d\'essai proche J+25',
    description: 'Rappel 5 jours avant fin d\'essai',
    trigger: 'TRIAL_ENDING_SOON',
    delayDays: 25,
    subject: '⏰ Votre essai gratuit se termine dans 5 jours',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning-box { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Dernière ligne droite !</h1>
          </div>
          <div class="content">
            <p>Bonjour {ownerFirstName},</p>

            <p>Votre période d'essai gratuite de 30 jours pour <strong>{organizationName}</strong> se termine dans <strong>5 jours</strong>.</p>

            <div class="warning-box">
              <h3>📅 Que va-t-il se passer ?</h3>
              <p>Dans 5 jours, votre abonnement <strong>{plan}</strong> sera automatiquement activé et facturé mensuellement par prélèvement SEPA.</p>
              <p><strong>Aucune action n'est requise de votre part.</strong></p>
            </div>

            <p><strong>Vous souhaitez continuer ?</strong> Parfait ! Tout est déjà configuré.</p>

            <p><strong>Vous préférez arrêter ou changer de formule ?</strong><br>
            Contactez-nous avant la fin de votre essai : <strong>{supportEmail}</strong></p>

            <p style="text-align: center;">
              <a href="{dashboardUrl}" class="button">Accéder à mon espace</a>
            </p>

            <p>Merci de votre confiance,<br>
            L'équipe LAIA Connect</p>
          </div>
          <div class="footer">
            <p>LAIA Connect - Logiciel SaaS pour instituts de beauté</p>
            <p>Besoin d'aide ? Contactez-nous : {supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'Inactivité 7 jours',
    description: 'Email si aucune connexion depuis 7 jours',
    trigger: 'NO_LOGIN_7_DAYS',
    delayDays: 0,
    subject: 'On ne vous a pas vu depuis 7 jours... 😢',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .help-box { background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>😢 Vous nous manquez !</h1>
          </div>
          <div class="content">
            <p>Bonjour {ownerFirstName},</p>

            <p>Nous avons remarqué que vous ne vous êtes pas connecté(e) à <strong>{organizationName}</strong> depuis 7 jours.</p>

            <p>Tout va bien ? Rencontrez-vous des difficultés ?</p>

            <div class="help-box">
              <h3>💡 Comment pouvons-nous vous aider ?</h3>
              <ul>
                <li>📞 Session de démo personnalisée (gratuite) : <a href="{demoLink}">Réserver</a></li>
                <li>📧 Questions par email : {supportEmail}</li>
                <li>📚 Documentation et tutoriels vidéo disponibles</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="{dashboardUrl}" class="button">Reprendre où j'en étais</a>
            </p>

            <p>Nous sommes là pour vous aider à réussir avec LAIA Connect.</p>

            <p>À très bientôt,<br>
            L'équipe LAIA Connect</p>
          </div>
          <div class="footer">
            <p>LAIA Connect - Logiciel SaaS pour instituts de beauté</p>
            <p>Besoin d'aide ? Contactez-nous : {supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'Fidélité 60 jours',
    description: 'Email de remerciement après 60 jours actifs',
    trigger: 'SUBSCRIPTION_ACTIVE_60_DAYS',
    delayDays: 60,
    subject: '🎉 2 mois avec LAIA Connect !',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .thank-you-box { background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Merci pour votre confiance !</h1>
          </div>
          <div class="content">
            <p>Bonjour {ownerFirstName},</p>

            <p>Cela fait maintenant 2 mois que <strong>{organizationName}</strong> utilise LAIA Connect, et nous tenions à vous remercier pour votre confiance !</p>

            <div class="thank-you-box">
              <h3>💜 Votre avis compte !</h3>
              <p>Votre retour nous aide à améliorer constamment LAIA Connect.</p>
              <p>Comment se passe votre expérience ? Quelles fonctionnalités aimeriez-vous voir ajoutées ?</p>
              <p>Répondez simplement à cet email, nous lisons tous vos messages !</p>
            </div>

            <p><strong>Besoin d'aide pour aller plus loin ?</strong><br>
            Nos tutoriels avancés et notre équipe sont à votre disposition.</p>

            <p style="text-align: center;">
              <a href="{dashboardUrl}" class="button">Accéder à mon tableau de bord</a>
            </p>

            <p>Merci encore et à très bientôt,<br>
            L'équipe LAIA Connect</p>
          </div>
          <div class="footer">
            <p>LAIA Connect - Logiciel SaaS pour instituts de beauté</p>
            <p>Besoin d'aide ? Contactez-nous : {supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
];
