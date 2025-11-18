-- Ajouter le champ viewedByAdminAt à la table DemoBooking
ALTER TABLE "DemoBooking"
ADD COLUMN IF NOT EXISTS "viewedByAdminAt" TIMESTAMP(3);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS "DemoBooking_viewedByAdminAt_idx"
ON "DemoBooking" ("viewedByAdminAt");
