-- Migration pour ajouter les colonnes manquantes dans OrganizationConfig
-- A executer dans Supabase SQL Editor
-- Date: 2025-11-06

-- Ajouter les colonnes Google My Business
ALTER TABLE "OrganizationConfig" ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT;
ALTER TABLE "OrganizationConfig" ADD COLUMN IF NOT EXISTS "googleBusinessUrl" TEXT;
ALTER TABLE "OrganizationConfig" ADD COLUMN IF NOT EXISTS "googleApiKey" TEXT;
ALTER TABLE "OrganizationConfig" ADD COLUMN IF NOT EXISTS "lastGoogleSync" TIMESTAMP(3);
ALTER TABLE "OrganizationConfig" ADD COLUMN IF NOT EXISTS "autoSyncGoogleReviews" BOOLEAN DEFAULT false;

-- Verification
SELECT 'Migration OrganizationConfig terminee avec succes !' AS status;

SELECT 'Colonnes Google ajoutees: ' ||
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'OrganizationConfig'
    AND column_name = 'googlePlaceId'
  ) THEN 'OK' ELSE 'ERREUR' END AS check_columns;
