-- Migration complete pour synchroniser la base de donnees avec le schema Prisma
-- A executer dans Supabase SQL Editor
-- Date: 2025-11-06

-- PARTIE 1: RETRAIT DES ANCIENNES COLONNES BANCAIRES
-- Raison: Securite PCI-DSS - Les donnees bancaires sont gerees par Stripe

ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaIban";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaBic";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaAccountHolder";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaMandate";

-- PARTIE 2: AJOUT DES NOUVELLES COLONNES ORGANIZATION

ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "customFeaturesEnabled" TEXT DEFAULT '[]';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "customFeaturesDisabled" TEXT DEFAULT '[]';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "sepaMandateRef" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "sepaMandateDate" TIMESTAMP(3);

-- PARTIE 3: CREATION DE LA TABLE SUBSCRIPTIONPLAN

CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
  "id" TEXT NOT NULL,
  "planKey" "OrgPlan" NOT NULL,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priceMonthly" INTEGER NOT NULL,
  "priceYearly" INTEGER,
  "maxLocations" INTEGER NOT NULL DEFAULT 1,
  "maxUsers" INTEGER NOT NULL DEFAULT 1,
  "maxStorage" INTEGER NOT NULL DEFAULT 5,
  "features" TEXT NOT NULL DEFAULT '[]',
  "highlights" TEXT NOT NULL DEFAULT '[]',
  "isPopular" BOOLEAN NOT NULL DEFAULT false,
  "isRecommended" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "stripePriceId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- Index pour SubscriptionPlan
CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPlan_planKey_key" ON "SubscriptionPlan"("planKey");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_planKey_idx" ON "SubscriptionPlan"("planKey");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- PARTIE 4: TRIGGER POUR MISE A JOUR AUTOMATIQUE DU UPDATEDAT

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscription_plan_updated_at ON "SubscriptionPlan";
CREATE TRIGGER update_subscription_plan_updated_at BEFORE UPDATE ON "SubscriptionPlan"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification des tables et colonnes creees
SELECT 'Migration terminee avec succes !' AS status;

SELECT 'Table SubscriptionPlan: ' ||
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'SubscriptionPlan'
  ) THEN 'OK' ELSE 'MANQUANTE' END AS check_table;

SELECT 'Colonnes customFeatures: ' ||
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'Organization'
    AND column_name = 'customFeaturesEnabled'
  ) THEN 'OK' ELSE 'MANQUANTES' END AS check_columns;

SELECT 'Colonnes bancaires retirees: ' ||
  CASE WHEN NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'Organization'
    AND column_name = 'sepaIban'
  ) THEN 'OK' ELSE 'ERREUR' END AS check_removal;
