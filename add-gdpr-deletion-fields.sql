-- Ajout des champs RGPD pour le Droit à l'oubli (Article 17)
-- Ces champs permettent de gérer les demandes de suppression des données personnelles

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "scheduledDeletionAt" TIMESTAMP(3);

-- Commentaires pour la documentation
COMMENT ON COLUMN "User"."deletionRequestedAt" IS 'Date de demande de suppression des données par l''utilisateur (RGPD Article 17)';
COMMENT ON COLUMN "User"."scheduledDeletionAt" IS 'Date de suppression effective programmée (30 jours après la demande)';

-- Index pour les tâches CRON de suppression automatique
CREATE INDEX IF NOT EXISTS "User_scheduledDeletionAt_idx" ON "User"("scheduledDeletionAt") WHERE "scheduledDeletionAt" IS NOT NULL;
