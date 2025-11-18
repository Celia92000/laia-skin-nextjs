-- Migration manuelle pour améliorer la table email_templates
-- À exécuter directement dans Supabase SQL Editor

-- 1. Ajouter les nouvelles colonnes à la table email_templates
ALTER TABLE "email_templates"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "textContent" TEXT,
  ADD COLUMN IF NOT EXISTS "availableVariables" JSONB,
  ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "fromName" TEXT,
  ADD COLUMN IF NOT EXISTS "fromEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'fr';

-- 2. Mettre à jour les lignes existantes avec des valeurs par défaut pour slug (si la table n'est pas vide)
-- Générer un slug unique basé sur le nom pour les enregistrements existants
UPDATE "email_templates"
SET "slug" = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'é', 'e'), 'è', 'e'))
WHERE "slug" IS NULL;

-- 3. Rendre la colonne slug NOT NULL maintenant qu'elle a des valeurs
ALTER TABLE "email_templates"
  ALTER COLUMN "slug" SET NOT NULL;

-- 4. Créer la contrainte unique sur (slug, organizationId)
-- Note: Cette contrainte permet d'avoir le même slug pour différentes organisations
CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_slug_organizationId_key"
  ON "email_templates"("slug", COALESCE("organizationId", ''));

-- 5. Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "email_templates_category_idx" ON "email_templates"("category");
CREATE INDEX IF NOT EXISTS "email_templates_isActive_idx" ON "email_templates"("isActive");
CREATE INDEX IF NOT EXISTS "email_templates_isSystem_idx" ON "email_templates"("isSystem");

-- 6. Afficher les résultats
SELECT
  COUNT(*) as total_templates,
  COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_templates,
  COUNT(CASE WHEN "isSystem" = true THEN 1 END) as system_templates
FROM "email_templates";

-- Migration terminée ✅
