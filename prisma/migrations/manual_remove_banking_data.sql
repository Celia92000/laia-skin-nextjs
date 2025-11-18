-- Migration manuelle : Suppression des colonnes de données bancaires
-- Date : 2025-11-05
-- Raison : Sécurité PCI-DSS - Les données bancaires sont gérées par Stripe

-- Supprimer les colonnes de données bancaires de la table Organization
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaIban";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaBic";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaAccountHolder";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "sepaMandate";

-- Note : On conserve sepaMandateRef et sepaMandateDate car ce sont des références, pas des données sensibles
