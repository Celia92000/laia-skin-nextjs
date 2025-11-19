-- Migration: Add OnboardingEmailTemplate table
-- Date: 2025-01-19
-- Description: Table pour gérer les templates d'emails d'onboarding (créer, modifier, activer/désactiver)

-- Créer la table
CREATE TABLE IF NOT EXISTS "onboarding_email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "usage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_email_templates_pkey" PRIMARY KEY ("id")
);

-- Créer l'index unique sur templateKey
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_email_templates_templateKey_key" ON "onboarding_email_templates"("templateKey");

-- Créer les index
CREATE INDEX IF NOT EXISTS "onboarding_email_templates_templateKey_idx" ON "onboarding_email_templates"("templateKey");
CREATE INDEX IF NOT EXISTS "onboarding_email_templates_isActive_idx" ON "onboarding_email_templates"("isActive");

-- Insérer les templates par défaut (optionnel)
-- Vous pouvez créer ces templates via l'interface ou les insérer ici

-- Commentaires
COMMENT ON TABLE "onboarding_email_templates" IS 'Templates d''emails d''onboarding éditables via l''interface super-admin';
COMMENT ON COLUMN "onboarding_email_templates"."templateKey" IS 'Clé unique du type de template (welcome, pending, activation)';
COMMENT ON COLUMN "onboarding_email_templates"."isActive" IS 'Seul un template actif par templateKey peut exister';
