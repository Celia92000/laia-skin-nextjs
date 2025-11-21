-- ⚠️ SCRIPT DE RESET COMPLET - ATTENTION : SUPPRIME TOUTES LES DONNÉES !
-- À utiliser UNIQUEMENT en développement
-- Date: 2025-11-06

-- =====================================================
-- ÉTAPE 1: SUPPRIMER LES TABLES PROBLÉMATIQUES
-- =====================================================

DROP TABLE IF EXISTS "ContractClause" CASCADE;
DROP TABLE IF EXISTS "InvoiceSettings" CASCADE;

-- =====================================================
-- ÉTAPE 2: RECRÉER INVOICESETTINGS
-- =====================================================

CREATE TABLE "InvoiceSettings" (
  "id" TEXT NOT NULL,
  "isCompany" BOOLEAN NOT NULL DEFAULT false,
  "legalStatus" TEXT NOT NULL DEFAULT 'Auto-Entrepreneur',
  "companyName" TEXT NOT NULL DEFAULT 'LAIA Connect',
  "address" TEXT NOT NULL DEFAULT '[Votre adresse]',
  "postalCode" TEXT NOT NULL DEFAULT '[Code postal]',
  "city" TEXT NOT NULL DEFAULT '[Ville]',
  "country" TEXT NOT NULL DEFAULT 'France',
  "siret" TEXT NOT NULL DEFAULT '[Votre SIRET]',
  "tvaNumber" TEXT DEFAULT '',
  "capitalSocial" TEXT DEFAULT '',
  "rcs" TEXT DEFAULT '',
  "apeCode" TEXT NOT NULL DEFAULT '6201Z',
  "email" TEXT NOT NULL DEFAULT '[Votre email]',
  "phone" TEXT DEFAULT '[Votre téléphone]',
  "website" TEXT DEFAULT 'https://www.laia-connect.fr',
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#667eea',
  "secondaryColor" TEXT NOT NULL DEFAULT '#764ba2',
  "invoicePrefix" TEXT NOT NULL DEFAULT 'LAIA',
  "tvaRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "paymentTerms" TEXT NOT NULL DEFAULT 'Prélèvement SEPA automatique',
  "latePenalty" TEXT NOT NULL DEFAULT 'En cas de retard de paiement, indemnité forfaitaire de 40€ pour frais de recouvrement.',
  "footerText" TEXT DEFAULT 'Dispensé d''immatriculation au RCS et au RM',
  "contractArticle1" TEXT NOT NULL DEFAULT 'Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire met à disposition du Client sa solution SaaS LAIA Connect.',
  "contractArticle3" TEXT NOT NULL DEFAULT 'Le Client bénéficie d''une période d''essai gratuite de 30 jours.',
  "contractArticle4" TEXT NOT NULL DEFAULT 'Le contrat est conclu pour une durée indéterminée.',
  "contractArticle6" TEXT NOT NULL DEFAULT 'Le présent contrat est régi par les CGV de LAIA Connect.',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceSettings_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- ÉTAPE 3: RECRÉER CONTRACTCLAUSE
-- =====================================================

CREATE TABLE "ContractClause" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isDefault" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractClause_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContractClause_key_key" ON "ContractClause"("key");

-- =====================================================
-- ÉTAPE 4: COLONNES ORGANIZATION
-- =====================================================

ALTER TABLE "Organization" DROP COLUMN IF EXISTS "contractNumber";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "contractPdfPath";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "contractSignedAt";

ALTER TABLE "Organization" ADD COLUMN "contractNumber" TEXT;
ALTER TABLE "Organization" ADD COLUMN "contractPdfPath" TEXT;
ALTER TABLE "Organization" ADD COLUMN "contractSignedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Organization_contractNumber_idx" ON "Organization"("contractNumber");

-- =====================================================
-- ÉTAPE 5: DONNÉES PAR DÉFAUT
-- =====================================================

INSERT INTO "InvoiceSettings" ("id", "isCompany", "legalStatus", "companyName", "address", "postalCode", "city", "country", "siret", "email", "phone", "website", "invoicePrefix", "tvaRate", "paymentTerms", "footerText", "updatedAt")
VALUES ('default_settings', false, 'Auto-Entrepreneur', 'LAIA Connect', 'Adresse à définir', '75001', 'Paris', 'France', '12345678900000', 'contact@laia-connect.fr', '01 23 45 67 89', 'https://laia-connect.fr', 'LAIA', 0.0, 'Paiement par prélèvement SEPA', 'Auto-entrepreneur - Dispensé d''immatriculation au RCS et au RM', CURRENT_TIMESTAMP);

-- Article 1
INSERT INTO "ContractClause" VALUES ('clause_article_1', 'article_1', 'ARTICLE 1 - OBJET DU CONTRAT', 'Le présent contrat a pour objet de définir les conditions dans lesquelles LAIA met à disposition du Client sa plateforme SaaS de gestion pour instituts de beauté.', 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 2
INSERT INTO "ContractClause" VALUES ('clause_article_2', 'article_2', 'ARTICLE 2 - FORMULE D''ABONNEMENT', 'Le Client souscrit à la formule : {plan}. Tarif mensuel : {monthlyAmount} € HT / mois.', 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 3
INSERT INTO "ContractClause" VALUES ('clause_article_3', 'article_3', 'ARTICLE 3 - PÉRIODE D''ESSAI', 'Le Client bénéficie d''une période d''essai gratuite de 30 jours.', 3, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 4
INSERT INTO "ContractClause" VALUES ('clause_article_4', 'article_4', 'ARTICLE 4 - DURÉE ET RÉSILIATION', 'Le présent contrat est conclu pour une durée indéterminée.', 4, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 5
INSERT INTO "ContractClause" VALUES ('clause_article_5', 'article_5', 'ARTICLE 5 - MANDAT SEPA', 'Référence unique du mandat : {sepaMandateRef}', 5, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 6
INSERT INTO "ContractClause" VALUES ('clause_article_6', 'article_6', 'ARTICLE 6 - CGV', 'Le présent contrat est complété par les CGV de LAIA Connect.', 6, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 7
INSERT INTO "ContractClause" VALUES ('clause_article_7', 'article_7', 'ARTICLE 7 - PROPRIÉTÉ INTELLECTUELLE', 'La plateforme LAIA Connect est la propriété exclusive de LAIA.', 7, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 8
INSERT INTO "ContractClause" VALUES ('clause_article_8', 'article_8', 'ARTICLE 8 - RGPD', 'LAIA agit en qualité de sous-traitant au sens du RGPD.', 8, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 9
INSERT INTO "ContractClause" VALUES ('clause_article_9', 'article_9', 'ARTICLE 9 - DISPONIBILITÉ', 'LAIA s''engage à un taux de disponibilité de 99,5%.', 9, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 10
INSERT INTO "ContractClause" VALUES ('clause_article_10', 'article_10', 'ARTICLE 10 - RESPONSABILITÉ', 'La responsabilité de LAIA est limitée.', 10, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 11
INSERT INTO "ContractClause" VALUES ('clause_article_11', 'article_11', 'ARTICLE 11 - FORCE MAJEURE', 'Aucune des parties ne sera tenue responsable en cas de force majeure.', 11, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 12
INSERT INTO "ContractClause" VALUES ('clause_article_12', 'article_12', 'ARTICLE 12 - CONFIDENTIALITÉ', 'Les parties s''engagent à la confidentialité.', 12, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 13
INSERT INTO "ContractClause" VALUES ('clause_article_13', 'article_13', 'ARTICLE 13 - SOUS-TRAITANCE', 'LAIA peut recourir à des sous-traitants.', 13, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Article 14
INSERT INTO "ContractClause" VALUES ('clause_article_14', 'article_14', 'ARTICLE 14 - DROIT APPLICABLE', 'Le présent contrat est soumis au droit français.', 14, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- VÉRIFICATION
-- =====================================================

SELECT '✅ RESET TERMINÉ !' AS status;
SELECT COUNT(*) || ' clauses' FROM "ContractClause";
SELECT "companyName", "legalStatus" FROM "InvoiceSettings";
