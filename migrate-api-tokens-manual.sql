-- Migration manuelle : Ajout de organizationId aux API Tokens

-- 1. Supprimer l'ancienne contrainte unique
ALTER TABLE "api_tokens" DROP CONSTRAINT IF EXISTS "api_tokens_service_name_key";

-- 2. Ajouter la colonne organizationId
ALTER TABLE "api_tokens" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

-- 3. Ajouter la contrainte de clé étrangère
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 4. Créer la nouvelle contrainte unique (organizationId, service, name)
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_organizationId_service_name_key"
  UNIQUE ("organizationId", "service", "name");

-- 5. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "api_tokens_organizationId_idx" ON "api_tokens"("organizationId");
