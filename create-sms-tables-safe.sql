-- ============================================
-- LAIA CONNECT - MODULE SMS MARKETING
-- Script SQL sécurisé pour création progressive
-- ============================================

-- ÉTAPE 1 : Ajouter les colonnes de features dans Organization
-- ============================================

DO $$
BEGIN
  -- featureEmailing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Organization' AND column_name = 'featureEmailing'
  ) THEN
    ALTER TABLE "Organization" ADD COLUMN "featureEmailing" BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Colonne featureEmailing créée';
  ELSE
    RAISE NOTICE 'Colonne featureEmailing existe déjà';
  END IF;

  -- featureWhatsApp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Organization' AND column_name = 'featureWhatsApp'
  ) THEN
    ALTER TABLE "Organization" ADD COLUMN "featureWhatsApp" BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Colonne featureWhatsApp créée';
  ELSE
    RAISE NOTICE 'Colonne featureWhatsApp existe déjà';
  END IF;

  -- featureSMS
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Organization' AND column_name = 'featureSMS'
  ) THEN
    ALTER TABLE "Organization" ADD COLUMN "featureSMS" BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Colonne featureSMS créée';
  ELSE
    RAISE NOTICE 'Colonne featureSMS existe déjà';
  END IF;

  -- featureSocialMedia
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Organization' AND column_name = 'featureSocialMedia'
  ) THEN
    ALTER TABLE "Organization" ADD COLUMN "featureSocialMedia" BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Colonne featureSocialMedia créée';
  ELSE
    RAISE NOTICE 'Colonne featureSocialMedia existe déjà';
  END IF;

  -- featureShop
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Organization' AND column_name = 'featureShop'
  ) THEN
    ALTER TABLE "Organization" ADD COLUMN "featureShop" BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Colonne featureShop créée';
  ELSE
    RAISE NOTICE 'Colonne featureShop existe déjà';
  END IF;

END $$;

-- ÉTAPE 2 : Créer les enums SMS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SMSStatus') THEN
    CREATE TYPE "SMSStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');
    RAISE NOTICE 'Enum SMSStatus créé';
  ELSE
    RAISE NOTICE 'Enum SMSStatus existe déjà';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SMSTemplateType') THEN
    CREATE TYPE "SMSTemplateType" AS ENUM ('BIRTHDAY', 'APPOINTMENT', 'CONFIRMATION', 'PROMOTION', 'LOYALTY', 'FOLLOW_UP', 'CUSTOM');
    RAISE NOTICE 'Enum SMSTemplateType créé';
  ELSE
    RAISE NOTICE 'Enum SMSTemplateType existe déjà';
  END IF;
END $$;

-- ÉTAPE 3 : Créer la table SMSCampaign
-- ============================================

CREATE TABLE IF NOT EXISTS "SMSCampaign" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "segmentId" TEXT,
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "status" "SMSStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "deliveredCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "clickedCount" INTEGER NOT NULL DEFAULT 0,
  "totalCost" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,

  CONSTRAINT "SMSCampaign_pkey" PRIMARY KEY ("id")
);

-- ÉTAPE 4 : Créer la table SMSTemplate
-- ============================================

CREATE TABLE IF NOT EXISTS "SMSTemplate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "SMSTemplateType" NOT NULL,
  "message" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SMSTemplate_pkey" PRIMARY KEY ("id")
);

-- ÉTAPE 5 : Créer la table SMSLog
-- ============================================

CREATE TABLE IF NOT EXISTS "SMSLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "campaignId" TEXT,
  "clientId" TEXT,
  "clientName" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "errorMessage" TEXT,
  "cost" DOUBLE PRECISION,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveredAt" TIMESTAMP(3),

  CONSTRAINT "SMSLog_pkey" PRIMARY KEY ("id")
);

-- ÉTAPE 6 : Créer les index
-- ============================================

-- Index pour SMSCampaign
CREATE INDEX IF NOT EXISTS "SMSCampaign_organizationId_idx" ON "SMSCampaign"("organizationId");
CREATE INDEX IF NOT EXISTS "SMSCampaign_status_idx" ON "SMSCampaign"("status");
CREATE INDEX IF NOT EXISTS "SMSCampaign_scheduledAt_idx" ON "SMSCampaign"("scheduledAt");
CREATE INDEX IF NOT EXISTS "SMSCampaign_createdAt_idx" ON "SMSCampaign"("createdAt");

-- Index pour SMSTemplate
CREATE INDEX IF NOT EXISTS "SMSTemplate_organizationId_idx" ON "SMSTemplate"("organizationId");
CREATE INDEX IF NOT EXISTS "SMSTemplate_type_idx" ON "SMSTemplate"("type");
CREATE INDEX IF NOT EXISTS "SMSTemplate_active_idx" ON "SMSTemplate"("active");

-- Index pour SMSLog
CREATE INDEX IF NOT EXISTS "SMSLog_organizationId_idx" ON "SMSLog"("organizationId");
CREATE INDEX IF NOT EXISTS "SMSLog_campaignId_idx" ON "SMSLog"("campaignId");
CREATE INDEX IF NOT EXISTS "SMSLog_clientId_idx" ON "SMSLog"("clientId");
CREATE INDEX IF NOT EXISTS "SMSLog_status_idx" ON "SMSLog"("status");
CREATE INDEX IF NOT EXISTS "SMSLog_sentAt_idx" ON "SMSLog"("sentAt");

-- ÉTAPE 7 : Ajouter les foreign keys (si elles n'existent pas)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'SMSCampaign_organizationId_fkey'
  ) THEN
    ALTER TABLE "SMSCampaign" ADD CONSTRAINT "SMSCampaign_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    RAISE NOTICE 'Foreign key SMSCampaign_organizationId_fkey créée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'SMSTemplate_organizationId_fkey'
  ) THEN
    ALTER TABLE "SMSTemplate" ADD CONSTRAINT "SMSTemplate_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    RAISE NOTICE 'Foreign key SMSTemplate_organizationId_fkey créée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'SMSLog_organizationId_fkey'
  ) THEN
    ALTER TABLE "SMSLog" ADD CONSTRAINT "SMSLog_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    RAISE NOTICE 'Foreign key SMSLog_organizationId_fkey créée';
  END IF;
END $$;

-- ÉTAPE 8 : Activer les features selon le plan
-- ============================================

-- Activer featureCRM et featureEmailing pour DUO+
UPDATE "Organization"
SET
  "featureCRM" = true,
  "featureEmailing" = true
WHERE "plan" IN ('DUO', 'TEAM', 'PREMIUM', 'ESSENTIAL', 'PROFESSIONAL', 'ENTERPRISE');

-- Activer toutes les features TEAM pour TEAM+
UPDATE "Organization"
SET
  "featureBlog" = true,
  "featureShop" = true,
  "featureWhatsApp" = true,
  "featureSMS" = true,
  "featureSocialMedia" = true
WHERE "plan" IN ('TEAM', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE');

-- Activer featureStock pour PREMIUM
UPDATE "Organization"
SET "featureStock" = true
WHERE "plan" IN ('PREMIUM', 'ENTERPRISE');

-- ÉTAPE 9 : Ajouter les commentaires
-- ============================================

COMMENT ON TABLE "SMSCampaign" IS 'Campagnes SMS Marketing (TEAM + PREMIUM)';
COMMENT ON TABLE "SMSTemplate" IS 'Templates SMS pré-configurés (TEAM + PREMIUM)';
COMMENT ON TABLE "SMSLog" IS 'Historique des SMS envoyés (tracking individuel)';

COMMENT ON COLUMN "Organization"."featureBlog" IS 'Blog (TEAM+)';
COMMENT ON COLUMN "Organization"."featureProducts" IS 'Boutique produits (TEAM+)';
COMMENT ON COLUMN "Organization"."featureCRM" IS 'CRM & Leads (DUO+)';
COMMENT ON COLUMN "Organization"."featureEmailing" IS 'Email Marketing (DUO+)';
COMMENT ON COLUMN "Organization"."featureWhatsApp" IS 'WhatsApp Marketing (TEAM+)';
COMMENT ON COLUMN "Organization"."featureSMS" IS 'SMS Marketing (TEAM+)';
COMMENT ON COLUMN "Organization"."featureSocialMedia" IS 'Réseaux sociaux (TEAM+)';
COMMENT ON COLUMN "Organization"."featureStock" IS 'Gestion de stock avancé (PREMIUM)';
COMMENT ON COLUMN "Organization"."featureFormations" IS 'Vente de formations (TEAM+)';
COMMENT ON COLUMN "Organization"."featureShop" IS 'E-commerce complet (TEAM+)';

-- ============================================
-- SCRIPT TERMINÉ
-- ============================================

SELECT 'Migration SMS Marketing terminée avec succès !' as status;

-- Vérification : Afficher les organisations et leurs features SMS
SELECT
  id,
  name,
  plan,
  "featureSMS",
  "featureWhatsApp",
  "featureSocialMedia",
  "featureBlog"
FROM "Organization"
ORDER BY "createdAt" DESC
LIMIT 5;
