-- Migration: Ajout de Stripe Connect pour les instituts
-- À exécuter dans Supabase SQL Editor

-- Renommer la colonne stripeCustomerId existante pour clarifier son usage
-- (optionnel si vous voulez garder l'ancien nom)

-- Ajouter stripeSubscriptionId si elle n'existe pas déjà
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT UNIQUE;

-- Ajouter les champs Stripe Connect
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "stripeConnectedAccountId" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "Organization_stripeConnectedAccountId_idx" ON "Organization"("stripeConnectedAccountId");

-- Vérification
SELECT 'Stripe Connect fields added successfully to Organization table' AS status;
