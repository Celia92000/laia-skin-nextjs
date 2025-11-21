-- Script de synchronisation de la base de données (version simplifiée)
-- Ajouter les colonnes manquantes à DemoBooking

-- 1. Ajouter leadSource
ALTER TABLE "DemoBooking" ADD COLUMN IF NOT EXISTS "leadSource" TEXT DEFAULT 'DEMO_FORM';

-- 2. Ajouter viewedByAdminAt
ALTER TABLE "DemoBooking" ADD COLUMN IF NOT EXISTS "viewedByAdminAt" TIMESTAMP(3);

-- 3. Créer les index
CREATE INDEX IF NOT EXISTS "DemoBooking_viewedByAdminAt_idx" ON "DemoBooking" ("viewedByAdminAt");
CREATE INDEX IF NOT EXISTS "DemoBooking_leadSource_idx" ON "DemoBooking" ("leadSource");
CREATE INDEX IF NOT EXISTS "DemoBooking_status_idx" ON "DemoBooking" ("status");
