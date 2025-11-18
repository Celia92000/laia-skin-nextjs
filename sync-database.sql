-- Script de synchronisation de la base de données
-- À exécuter directement dans Supabase SQL Editor

-- 1. Ajouter le champ leadSource à DemoBooking (si absent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'DemoBooking' AND column_name = 'leadSource'
  ) THEN
    ALTER TABLE "DemoBooking"
    ADD COLUMN "leadSource" TEXT DEFAULT 'DEMO_FORM';
  END IF;
END $$;

-- 2. Ajouter le champ viewedByAdminAt à DemoBooking (si absent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'DemoBooking' AND column_name = 'viewedByAdminAt'
  ) THEN
    ALTER TABLE "DemoBooking"
    ADD COLUMN "viewedByAdminAt" TIMESTAMP(3);
  END IF;
END $$;

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "DemoBooking_viewedByAdminAt_idx"
ON "DemoBooking" ("viewedByAdminAt");

CREATE INDEX IF NOT EXISTS "DemoBooking_leadSource_idx"
ON "DemoBooking" ("leadSource");

CREATE INDEX IF NOT EXISTS "DemoBooking_status_idx"
ON "DemoBooking" ("status");
