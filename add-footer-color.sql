-- Ajouter la colonne footerColor aux tables OrganizationConfig et SiteConfig

-- OrganizationConfig
ALTER TABLE "OrganizationConfig"
ADD COLUMN IF NOT EXISTS "footerColor" TEXT DEFAULT '#2c3e50';

-- SiteConfig
ALTER TABLE "SiteConfig"
ADD COLUMN IF NOT EXISTS "footerColor" TEXT DEFAULT '#2c3e50';

-- Mise à jour des couleurs LAIA Skin Institut
UPDATE "OrganizationConfig"
SET
  "primaryColor" = '#d4b5a0',
  "secondaryColor" = '#c9a084',
  "accentColor" = '#2c3e50',
  "footerColor" = '#2c3e50'
WHERE "organizationId" = '9739c909-c945-4548-bf53-4d226457f630';
