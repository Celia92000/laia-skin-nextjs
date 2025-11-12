-- Création de la table RecurringBlock pour remplacer le stockage en mémoire
-- 🔒 CRITIQUE : Isolation multi-tenant avec organizationId

CREATE TABLE IF NOT EXISTS "RecurringBlock" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "dayOfWeek" INTEGER,
  "dayOfMonth" INTEGER,
  "timeSlots" TEXT,
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "startTime" TEXT,
  "endTime" TEXT,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS "RecurringBlock_organizationId_idx" ON "RecurringBlock"("organizationId");
CREATE INDEX IF NOT EXISTS "RecurringBlock_type_idx" ON "RecurringBlock"("type");

-- Commentaire pour la documentation
COMMENT ON TABLE "RecurringBlock" IS 'Blocages récurrents du calendrier (ex: fermé tous les dimanches, fermé le 1er du mois, etc.) - Multi-tenant avec organizationId';
