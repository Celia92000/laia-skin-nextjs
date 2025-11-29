-- Migration: Ajouter les champs 2FA au modèle User
-- Date: 2025-11-29

-- Ajouter les colonnes 2FA à la table User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT;

-- Commentaires
COMMENT ON COLUMN "User"."twoFactorEnabled" IS 'Indique si le 2FA est activé pour cet utilisateur';
COMMENT ON COLUMN "User"."twoFactorSecret" IS 'Secret TOTP encodé en base32';
COMMENT ON COLUMN "User"."twoFactorBackupCodes" IS 'Codes de récupération stockés en JSON array';
