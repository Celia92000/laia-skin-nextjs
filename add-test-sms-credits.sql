-- ============================================
-- Ajouter des crédits SMS de test
-- ============================================

-- Option 1: Ajouter 100 crédits à l'organisation "laia-skin-institut"
UPDATE "Organization"
SET
  "smsCredits" = 100,
  "smsTotalPurchased" = 100,
  "smsLastPurchaseDate" = NOW()
WHERE slug = 'laia-skin-institut';

-- Option 2: Si vous ne connaissez pas le slug, utilisez l'email du propriétaire
-- UPDATE "Organization"
-- SET
--   "smsCredits" = 100,
--   "smsTotalPurchased" = 100,
--   "smsLastPurchaseDate" = NOW()
-- WHERE "ownerEmail" = 'votre-email@example.com';

-- Vérification après l'update
SELECT
  id,
  name,
  slug,
  "smsCredits",
  "smsTotalPurchased",
  "smsLastPurchaseDate"
FROM "Organization"
WHERE slug = 'laia-skin-institut';
