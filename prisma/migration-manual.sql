-- Migration manuelle COMPLÈTE pour tous les changements du schema
-- À exécuter dans Supabase SQL Editor si prisma db push timeout
--
-- Ce script met à jour :
-- 1. Ajoute les colonnes customFeatures à Organization
-- 2. Crée la table SubscriptionPlan
-- 3. Crée les index nécessaires

-- PARTIE 1 : Modifications Organization (custom features)
-- Ces colonnes sont nécessaires pour que le site fonctionne

ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "customFeaturesEnabled" TEXT DEFAULT '[]';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "customFeaturesDisabled" TEXT DEFAULT '[]';

-- PARTIE 2 : Créer la table SubscriptionPlan
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

-- 2. Créer les index
CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPlan_planKey_key" ON "SubscriptionPlan"("planKey");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_planKey_idx" ON "SubscriptionPlan"("planKey");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- PARTIE 3 : Trigger pour mettre à jour updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plan_updated_at BEFORE UPDATE ON "SubscriptionPlan"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
