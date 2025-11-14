-- ============================================
-- LAIA CONNECT - MODULE SMS MARKETING
-- Tables pour les campagnes SMS (TEAM + PREMIUM)
-- ============================================

-- Création des enums
DO $$ BEGIN
  CREATE TYPE "SMSStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SMSTemplateType" AS ENUM ('BIRTHDAY', 'APPOINTMENT', 'CONFIRMATION', 'PROMOTION', 'LOYALTY', 'FOLLOW_UP', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ajouter les colonnes de features manquantes dans Organization (si elles n'existent pas déjà)
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureEmailing" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureWhatsApp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureSMS" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureSocialMedia" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureShop" BOOLEAN NOT NULL DEFAULT false;

-- Mise à jour des commentaires des colonnes existantes
COMMENT ON COLUMN "Organization"."featureBlog" IS 'Blog (TEAM+)';
COMMENT ON COLUMN "Organization"."featureProducts" IS 'Boutique produits (TEAM+)';
COMMENT ON COLUMN "Organization"."featureCRM" IS 'CRM & Leads (DUO+)';
COMMENT ON COLUMN "Organization"."featureStock" IS 'Gestion de stock avancé (PREMIUM)';
COMMENT ON COLUMN "Organization"."featureFormations" IS 'Vente de formations (TEAM+)';

-- Table SMSCampaign
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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,

  CONSTRAINT "SMSCampaign_pkey" PRIMARY KEY ("id")
);

-- Table SMSTemplate
CREATE TABLE IF NOT EXISTS "SMSTemplate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "SMSTemplateType" NOT NULL,
  "message" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SMSTemplate_pkey" PRIMARY KEY ("id")
);

-- Table SMSLog
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

-- Foreign keys
ALTER TABLE "SMSCampaign" ADD CONSTRAINT "SMSCampaign_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SMSTemplate" ADD CONSTRAINT "SMSTemplate_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SMSLog" ADD CONSTRAINT "SMSLog_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Activer featureSMS pour les organisations TEAM et PREMIUM
UPDATE "Organization"
SET "featureSMS" = true
WHERE "plan" IN ('TEAM', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE');

-- Activer toutes les features selon le plan
UPDATE "Organization"
SET
  "featureCRM" = true,
  "featureEmailing" = true
WHERE "plan" IN ('DUO', 'TEAM', 'PREMIUM', 'ESSENTIAL', 'PROFESSIONAL', 'ENTERPRISE');

UPDATE "Organization"
SET
  "featureBlog" = true,
  "featureShop" = true,
  "featureWhatsApp" = true,
  "featureSMS" = true,
  "featureSocialMedia" = true
WHERE "plan" IN ('TEAM', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE');

UPDATE "Organization"
SET "featureStock" = true
WHERE "plan" IN ('PREMIUM', 'ENTERPRISE');

COMMENT ON TABLE "SMSCampaign" IS 'Campagnes SMS Marketing (TEAM + PREMIUM)';
COMMENT ON TABLE "SMSTemplate" IS 'Templates SMS pré-configurés (TEAM + PREMIUM)';
COMMENT ON TABLE "SMSLog" IS 'Historique des SMS envoyés (tracking individuel)';
