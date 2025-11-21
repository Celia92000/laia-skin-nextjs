-- Migration: Ajout des champs SLA au modèle SupportTicket
-- À exécuter dans Supabase SQL Editor

ALTER TABLE "SupportTicket"
  ADD COLUMN IF NOT EXISTS "firstResponseAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "slaResponseDeadline" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "slaResponseBreach" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "slaResolutionDeadline" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "slaResolutionBreach" BOOLEAN NOT NULL DEFAULT false;

-- Création des index pour optimiser les requêtes de monitoring SLA
CREATE INDEX IF NOT EXISTS "SupportTicket_slaResponseBreach_idx" ON "SupportTicket"("slaResponseBreach");
CREATE INDEX IF NOT EXISTS "SupportTicket_slaResolutionBreach_idx" ON "SupportTicket"("slaResolutionBreach");

-- Vérification
SELECT 'SLA fields added successfully to SupportTicket table' AS status;
