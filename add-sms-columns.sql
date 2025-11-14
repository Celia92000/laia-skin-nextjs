-- Ajout des colonnes SMS à la table Organization
-- À exécuter manuellement dans Supabase SQL Editor

ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "smsCredits" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "smsTotalPurchased" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "smsLastPurchaseDate" TIMESTAMP;

-- Vérification
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Organization'
AND column_name IN ('smsCredits', 'smsTotalPurchased', 'smsLastPurchaseDate')
ORDER BY column_name;
