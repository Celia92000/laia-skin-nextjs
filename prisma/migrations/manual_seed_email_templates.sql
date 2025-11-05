-- Script SQL pour créer les templates d'onboarding par défaut
-- À exécuter après la migration manual_enhance_email_templates.sql

-- Template 1: Email de bienvenue complet (ACTUELLEMENT UTILISÉ)
INSERT INTO "email_templates" (
  "id",
  "slug",
  "name",
  "description",
  "subject",
  "content",
  "textContent",
  "availableVariables",
  "category",
  "isActive",
  "isSystem",
  "fromName",
  "fromEmail",
  "language",
  "organizationId",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'onboarding-welcome',
  '🎉 Email de Bienvenue Complet',
  'Email envoyé après création du compte avec identifiants, guide complet, facture et contrat PDF',
  '🎉 Bienvenue sur LAIA Connect - Votre site {{organizationName}} est prêt !',
  '<!-- Le contenu HTML complet est généré dynamiquement dans src/lib/onboarding-emails.ts -->
   <!-- Ce template sert de référence et peut être modifié via l''interface -->',
  'Version texte sera générée automatiquement',
  '{
    "organizationName": "Nom de l''organisation",
    "ownerFirstName": "Prénom du propriétaire",
    "ownerLastName": "Nom du propriétaire",
    "ownerEmail": "Email du propriétaire",
    "tempPassword": "Mot de passe temporaire",
    "plan": "Formule choisie (SOLO, DUO, TEAM, PREMIUM)",
    "adminUrl": "URL de connexion admin",
    "subdomain": "Sous-domaine de l''organisation",
    "customDomain": "Domaine personnalisé (optionnel)",
    "monthlyAmount": "Montant mensuel de l''abonnement",
    "trialEndsAt": "Date de fin de l''essai",
    "sepaMandateRef": "Référence du mandat SEPA",
    "invoiceNumber": "Numéro de facture",
    "contractNumber": "Numéro de contrat"
  }'::jsonb,
  'onboarding',
  true,
  true,
  'LAIA Connect',
  'contact@laiaconnect.fr',
  'fr',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT ("slug", COALESCE("organizationId", '')) DO NOTHING;

-- Template 2: Email de confirmation de paiement (pour activation manuelle)
INSERT INTO "email_templates" (
  "id",
  "slug",
  "name",
  "description",
  "subject",
  "content",
  "textContent",
  "availableVariables",
  "category",
  "isActive",
  "isSystem",
  "fromName",
  "fromEmail",
  "language",
  "organizationId",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'onboarding-pending',
  '⏳ Confirmation Paiement',
  'Email de confirmation de paiement sans identifiants - pour activation manuelle sous 24h',
  '✅ Paiement confirmé - Activation sous 24h - {{organizationName}}',
  '<html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; font-size: 28px;">✅ Paiement Confirmé</h1>
      </div>

      <p>Bonjour {{ownerFirstName}} {{ownerLastName}},</p>

      <p>Nous avons bien reçu votre paiement pour l''abonnement <strong>{{plan}}</strong> de votre organisation <strong>{{organizationName}}</strong>.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">
          💰 Montant mensuel : <strong>{{monthlyAmount}}€/mois</strong><br/>
          📅 Fin de l''essai gratuit : <strong>{{trialEndsAt}}</strong><br/>
          🏦 Référence mandat SEPA : <strong>{{sepaMandateRef}}</strong>
        </p>
      </div>

      <p><strong>⏳ Activation en cours...</strong></p>
      <p>Votre compte est en cours d''activation. Vous recevrez un email avec vos identifiants de connexion dans les <strong>24 heures</strong>.</p>

      <p>À très bientôt !<br/>
      L''équipe LAIA Connect</p>
    </body>
  </html>',
  'Bonjour {{ownerFirstName}}, votre paiement a été confirmé. Activation sous 24h.',
  '{
    "organizationName": "Nom de l''organisation",
    "ownerFirstName": "Prénom du propriétaire",
    "ownerLastName": "Nom du propriétaire",
    "ownerEmail": "Email du propriétaire",
    "plan": "Formule choisie",
    "monthlyAmount": "Montant mensuel",
    "trialEndsAt": "Date de fin de l''essai",
    "sepaMandateRef": "Référence du mandat SEPA"
  }'::jsonb,
  'onboarding',
  false,
  false,
  'LAIA Connect',
  'contact@laiaconnect.fr',
  'fr',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT ("slug", COALESCE("organizationId", '')) DO NOTHING;

-- Template 3: Email d'activation (pour activation différée)
INSERT INTO "email_templates" (
  "id",
  "slug",
  "name",
  "description",
  "subject",
  "content",
  "textContent",
  "availableVariables",
  "category",
  "isActive",
  "isSystem",
  "fromName",
  "fromEmail",
  "language",
  "organizationId",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'onboarding-activation',
  '✅ Activation du Compte',
  'Email d''activation avec identifiants uniquement - envoyé après validation manuelle',
  '🎉 Votre compte {{organizationName}} est activé !',
  '<html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; font-size: 28px;">🎉 Compte Activé !</h1>
      </div>

      <p>Bonjour {{ownerFirstName}} {{ownerLastName}},</p>

      <p>Excellente nouvelle ! Votre compte <strong>{{organizationName}}</strong> est maintenant <strong>activé</strong> ! 🚀</p>

      <div style="background: #7c3aed; padding: 25px; border-radius: 10px; margin: 30px 0;">
        <h2 style="color: white; margin-top: 0;">🔑 Vos identifiants de connexion</h2>
        <p style="color: white; margin: 10px 0;">
          <strong>Email :</strong> {{ownerEmail}}<br/>
          <strong>Mot de passe temporaire :</strong> <code style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 5px;">{{tempPassword}}</code>
        </p>
        <p style="color: white; font-size: 12px; margin-top: 15px;">
          ⚠️ Pensez à changer votre mot de passe lors de votre première connexion
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{adminUrl}}" style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          🚀 Accéder à mon espace admin
        </a>
      </div>

      <p>Cordialement,<br/>
      L''équipe LAIA Connect</p>
    </body>
  </html>',
  'Bonjour {{ownerFirstName}}, votre compte est activé ! Email: {{ownerEmail}}, Mot de passe: {{tempPassword}}',
  '{
    "organizationName": "Nom de l''organisation",
    "ownerFirstName": "Prénom du propriétaire",
    "ownerLastName": "Nom du propriétaire",
    "ownerEmail": "Email du propriétaire",
    "tempPassword": "Mot de passe temporaire",
    "adminUrl": "URL de connexion admin"
  }'::jsonb,
  'onboarding',
  false,
  false,
  'LAIA Connect',
  'contact@laiaconnect.fr',
  'fr',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT ("slug", COALESCE("organizationId", '')) DO NOTHING;

-- Vérification des templates créés
SELECT
  "slug",
  "name",
  "isActive",
  "isSystem",
  "category"
FROM "email_templates"
WHERE "organizationId" IS NULL
  AND "category" = 'onboarding'
ORDER BY "isActive" DESC, "slug" ASC;

-- Seed terminé ✅
-- 3 templates d'onboarding créés
