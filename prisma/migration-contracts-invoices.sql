-- Migration pour Contrats et Paramètres de Facturation (CORRIGÉE)
-- À exécuter dans Supabase SQL Editor
-- Date: 2025-11-06

-- =====================================================
-- PARTIE 1: TABLE INVOICESETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS "InvoiceSettings" (
  "id" TEXT NOT NULL,

  -- Statut juridique
  "isCompany" BOOLEAN NOT NULL DEFAULT false,
  "legalStatus" TEXT NOT NULL DEFAULT 'Auto-Entrepreneur',

  -- Informations émetteur (LAIA)
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

  -- Contact
  "email" TEXT NOT NULL DEFAULT '[Votre email]',
  "phone" TEXT DEFAULT '[Votre téléphone]',
  "website" TEXT DEFAULT 'https://www.laia-connect.fr',

  -- Design
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#667eea',
  "secondaryColor" TEXT NOT NULL DEFAULT '#764ba2',

  -- Paramètres facture
  "invoicePrefix" TEXT NOT NULL DEFAULT 'LAIA',
  "tvaRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

  -- Mentions légales
  "paymentTerms" TEXT NOT NULL DEFAULT 'Prélèvement SEPA automatique',
  "latePenalty" TEXT NOT NULL DEFAULT 'En cas de retard de paiement, indemnité forfaitaire de 40€ pour frais de recouvrement.',
  "footerText" TEXT DEFAULT 'Dispensé d''immatriculation au RCS et au RM',

  -- Templates de contrat
  "contractArticle1" TEXT NOT NULL DEFAULT 'Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire met à disposition du Client sa solution SaaS LAIA Connect, comprenant un site web personnalisable, un système de réservation en ligne, et diverses fonctionnalités de gestion pour instituts de beauté.',
  "contractArticle3" TEXT NOT NULL DEFAULT 'Le Client bénéficie d''une période d''essai gratuite de 30 jours à compter de la date de souscription. Le premier prélèvement interviendra à l''issue de cette période.',
  "contractArticle4" TEXT NOT NULL DEFAULT 'Le contrat est conclu pour une durée indéterminée. Il se renouvelle automatiquement chaque mois par tacite reconduction. Le Client peut résilier à tout moment avec un préavis de 30 jours.',
  "contractArticle6" TEXT NOT NULL DEFAULT 'Le présent contrat est régi par les Conditions Générales de Vente (CGV) de LAIA Connect, accessibles en ligne à l''adresse : https://www.laiaconnect.fr/cgv-laia-connect. Le Client déclare avoir pris connaissance des CGV et les accepter sans réserve.',

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InvoiceSettings_pkey" PRIMARY KEY ("id")
);

-- Créer un trigger pour mettre à jour automatiquement updatedAt
CREATE OR REPLACE FUNCTION update_invoice_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_invoice_settings_updated_at ON "InvoiceSettings";
CREATE TRIGGER update_invoice_settings_updated_at
BEFORE UPDATE ON "InvoiceSettings"
FOR EACH ROW EXECUTE FUNCTION update_invoice_settings_updated_at();

-- Insérer les paramètres par défaut
INSERT INTO "InvoiceSettings" (
  "id",
  "isCompany",
  "legalStatus",
  "companyName",
  "address",
  "postalCode",
  "city",
  "country",
  "siret",
  "tvaNumber",
  "email",
  "phone",
  "website",
  "invoicePrefix",
  "tvaRate",
  "paymentTerms",
  "footerText",
  "updatedAt"
) VALUES (
  'default_settings',
  false,
  'Auto-Entrepreneur',
  'LAIA Connect',
  'Adresse à définir',
  '75001',
  'Paris',
  'France',
  '12345678900000',
  '',
  'contact@laia-connect.fr',
  '01 23 45 67 89',
  'https://laia-connect.fr',
  'LAIA',
  0.0,
  'Paiement à réception de facture par prélèvement SEPA',
  'Auto-entrepreneur - Dispensé d''immatriculation au RCS et au RM',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- =====================================================
-- PARTIE 2: TABLE CONTRACTCLAUSE
-- =====================================================

CREATE TABLE IF NOT EXISTS "ContractClause" (
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

-- Index unique sur la clé
CREATE UNIQUE INDEX IF NOT EXISTS "ContractClause_key_key" ON "ContractClause"("key");

-- Trigger pour updatedAt
CREATE OR REPLACE FUNCTION update_contract_clause_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contract_clause_updated_at ON "ContractClause";
CREATE TRIGGER update_contract_clause_updated_at
BEFORE UPDATE ON "ContractClause"
FOR EACH ROW EXECUTE FUNCTION update_contract_clause_updated_at();

-- =====================================================
-- PARTIE 3: COLONNES CONTRAT DANS ORGANIZATION
-- =====================================================

ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "contractNumber" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "contractPdfPath" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "contractSignedAt" TIMESTAMP(3);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS "Organization_contractNumber_idx" ON "Organization"("contractNumber");

-- =====================================================
-- PARTIE 4: INSERTION DES CLAUSES PAR DÉFAUT
-- =====================================================

-- Article 1 : Objet du contrat
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_1',
  'article_1',
  'ARTICLE 1 - OBJET DU CONTRAT',
  'Le présent contrat a pour objet de définir les conditions dans lesquelles LAIA met à disposition du Client sa plateforme SaaS de gestion pour instituts de beauté et centres esthétiques.

La plateforme LAIA Connect permet de :
- Gérer les réservations et le planning en ligne
- Gérer les clients, leads et prospects (CRM)
- Créer et gérer un site web personnalisé
- Vendre des produits en ligne
- Gérer la comptabilité et les factures
- Envoyer des campagnes d''emailing et SMS
- Gérer un programme de fidélité
- Et bien plus selon la formule choisie ({plan})',
  1,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 2 : Formule d'abonnement
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_2',
  'article_2',
  'ARTICLE 2 - FORMULE D''ABONNEMENT',
  'Le Client souscrit à la formule : {plan}

Tarif mensuel : {monthlyAmount} € HT / mois
Durée de l''essai gratuit : 30 jours
Fin de la période d''essai : {trialEndsAt}

Les fonctionnalités incluses dans cette formule sont détaillées sur le site web de LAIA Connect et dans les Conditions Générales de Vente acceptées lors de l''inscription.',
  2,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 3 : Période d'essai
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_3',
  'article_3',
  'ARTICLE 3 - PÉRIODE D''ESSAI GRATUITE',
  'Le Client bénéficie d''une période d''essai gratuite de 30 jours à compter de la date d''activation de son compte.

Pendant cette période :
- Le Client a accès à toutes les fonctionnalités de sa formule
- Aucun prélèvement n''est effectué
- Le Client peut résilier à tout moment sans frais

À l''issue de la période d''essai, si le Client ne résilie pas, l''abonnement devient payant et le premier prélèvement est effectué automatiquement.',
  3,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 4 : Durée et résiliation
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_4',
  'article_4',
  'ARTICLE 4 - DURÉE ET RÉSILIATION',
  'Le présent contrat est conclu pour une durée indéterminée.

L''abonnement est renouvelé automatiquement chaque mois, sans tacite reconduction contraignante.

Le Client peut résilier son abonnement à tout moment depuis son espace client, avec effet à la fin du mois en cours. Aucun remboursement au prorata ne sera effectué pour le mois en cours déjà payé.

LAIA Connect se réserve le droit de résilier le contrat en cas de manquement grave du Client à ses obligations, notamment en cas de non-paiement, après mise en demeure restée sans effet pendant 15 jours.',
  4,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 5 : Mandat SEPA
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_5',
  'article_5',
  'ARTICLE 5 - MANDAT DE PRÉLÈVEMENT SEPA',
  'En signant le présent contrat, le Client autorise LAIA à envoyer des instructions à sa banque pour débiter son compte, et autorise sa banque à débiter son compte conformément aux instructions de LAIA.

Référence unique du mandat (RUM) : {sepaMandateRef}

Le Client bénéficie du droit d''être remboursé par sa banque selon les conditions décrites dans la convention qu''il a passée avec celle-ci. Une demande de remboursement doit être présentée dans les 8 semaines suivant la date de débit de son compte pour un prélèvement autorisé.

Les prélèvements seront effectués mensuellement à date d''échéance correspondant au jour de souscription.',
  5,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 6 : CGV
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_6',
  'article_6',
  'ARTICLE 6 - CONDITIONS GÉNÉRALES DE VENTE',
  'Le présent contrat est complété par les Conditions Générales de Vente (CGV) de LAIA Connect, disponibles en ligne à l''adresse suivante :
https://laia-connect.fr/cgv-laia-connect

Le Client déclare avoir pris connaissance des CGV et les accepter sans réserve. En cas de contradiction entre le présent contrat et les CGV, les dispositions du présent contrat prévaudront.',
  6,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 7 : Propriété intellectuelle
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_7',
  'article_7',
  'ARTICLE 7 - PROPRIÉTÉ INTELLECTUELLE',
  'La plateforme LAIA Connect, son code source, sa structure, ses bases de données, son interface graphique et tous les éléments qui la composent sont la propriété exclusive de LAIA et sont protégés par le Code de la propriété intellectuelle.

Le Client bénéficie uniquement d''un droit d''usage non exclusif et non cessible de la plateforme, strictement limité à la durée du contrat et aux besoins de son activité professionnelle.

Le Client conserve la propriété exclusive de toutes les données qu''il saisit dans la plateforme (informations clients, prestations, produits, etc.).',
  7,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 8 : Protection des données (RGPD)
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_8',
  'article_8',
  'ARTICLE 8 - PROTECTION DES DONNÉES PERSONNELLES (RGPD)',
  'Dans le cadre de l''utilisation de la plateforme LAIA Connect :

**8.1 Responsabilité du traitement**
- Le Client est responsable de traitement pour les données de ses propres clients qu''il collecte et traite via la plateforme
- LAIA est sous-traitant au sens du RGPD pour ces données
- LAIA est responsable de traitement pour les données du Client lui-même (compte, facturation)

**8.2 Engagements de LAIA en tant que sous-traitant**
- Traiter les données uniquement pour les finalités définies par le Client
- Garantir la sécurité et la confidentialité des données
- Assister le Client dans le respect de ses obligations RGPD
- Ne pas transférer les données hors UE sans garanties appropriées
- Restituer ou supprimer les données à la fin du contrat

**8.3 Engagements du Client**
- Informer ses propres clients de l''utilisation de LAIA comme sous-traitant
- Recueillir les consentements nécessaires
- Respecter les droits des personnes (accès, rectification, suppression)

La politique de confidentialité complète est disponible sur le site de LAIA Connect.',
  8,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 9 : Disponibilité et support
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_9',
  'article_9',
  'ARTICLE 9 - DISPONIBILITÉ ET SUPPORT TECHNIQUE',
  '**9.1 Disponibilité**
LAIA s''engage à fournir un service disponible 24h/24 et 7j/7, avec un taux de disponibilité de 99,5% sur une base mensuelle, hors maintenance programmée.

Les opérations de maintenance sont réalisées autant que possible en dehors des heures ouvrées et sont annoncées au moins 48h à l''avance.

**9.2 Support technique**
Tous les clients LAIA Connect, quelle que soit leur formule d''abonnement, bénéficient du même niveau de support :
- Réponse sous 48h maximum par email
- Accès à la documentation en ligne
- Accès aux tutoriels vidéo
- Accès à la FAQ

Le support technique ne comprend pas la formation à l''utilisation du logiciel ni l''assistance à la création de contenu.',
  9,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 10 : Limitation de responsabilité
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_10',
  'article_10',
  'ARTICLE 10 - LIMITATION DE RESPONSABILITÉ',
  'LAIA met tout en œuvre pour fournir un service de qualité mais ne peut garantir un fonctionnement sans interruption ni erreur. Il s''agit d''une obligation de moyens et non de résultat.

**10.1 Exclusions**
LAIA ne saurait être tenue responsable :
- Des dommages indirects (perte de chiffre d''affaires, perte de clientèle, préjudice commercial, etc.)
- De la perte de données résultant d''une action du Client
- Des conséquences d''une utilisation anormale ou non conforme de la plateforme
- Des interruptions de service dues à un cas de force majeure

**10.2 Plafonnement**
En tout état de cause, la responsabilité totale de LAIA, toutes causes confondues, est limitée au montant des sommes effectivement versées par le Client au cours des 12 derniers mois.

**10.3 Sauvegarde**
Il est fortement recommandé au Client d''effectuer régulièrement des exports de ses données via les fonctionnalités prévues à cet effet.',
  10,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 11 : Force majeure
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_11',
  'article_11',
  'ARTICLE 11 - FORCE MAJEURE',
  'Aucune des parties ne sera tenue responsable d''un retard ou d''une inexécution de ses obligations résultant d''un cas de force majeure au sens de l''article 1218 du Code civil et de la jurisprudence française.

Sont notamment considérés comme cas de force majeure :
- Les catastrophes naturelles
- Les incendies, inondations
- Les grèves générales ou des fournisseurs essentiels
- Les pannes générales d''électricité ou de télécommunication
- Les attaques informatiques (DDoS, ransomware) malgré les mesures de sécurité
- Les décisions gouvernementales ou administratives
- Les guerres, émeutes

En cas de force majeure se prolongeant au-delà de 30 jours, chaque partie pourra résilier le contrat de plein droit.',
  11,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 12 : Confidentialité
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_12',
  'article_12',
  'ARTICLE 12 - CONFIDENTIALITÉ',
  'Chaque partie s''engage à conserver confidentielles toutes les informations de nature confidentielle de l''autre partie dont elle pourrait avoir connaissance lors de l''exécution du présent contrat.

Sont notamment considérées comme confidentielles :
- Les informations techniques et fonctionnelles de la plateforme
- Les données commerciales et stratégiques
- Les données clients et prospects
- Les conditions tarifaires et contractuelles

Cet engagement de confidentialité demeure en vigueur pendant toute la durée du contrat et pendant une période de 2 ans après sa résiliation.',
  12,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 13 : Sous-traitance
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_13',
  'article_13',
  'ARTICLE 13 - SOUS-TRAITANCE',
  'LAIA se réserve le droit de recourir à des sous-traitants pour l''exécution de certaines prestations, notamment :
- L''hébergement de la plateforme (Vercel, Supabase)
- Les services de paiement (Stripe)
- Les services d''emailing (SendGrid, Brevo)
- Les services de SMS (Twilio)

LAIA s''engage à ce que ses sous-traitants respectent les mêmes obligations de sécurité et de confidentialité que celles qui lui incombent.

Le Client est informé que certaines de ces prestations peuvent impliquer un transfert de données hors de l''Union Européenne, avec les garanties appropriées (clauses contractuelles types de la Commission Européenne).',
  13,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- Article 14 : Droit applicable et juridiction
INSERT INTO "ContractClause" ("id", "key", "title", "content", "order", "isDefault", "isActive", "updatedAt")
VALUES (
  'clause_article_14',
  'article_14',
  'ARTICLE 14 - DROIT APPLICABLE ET RÈGLEMENT DES LITIGES',
  'Le présent contrat est soumis au droit français.

**14.1 Médiation**
En cas de litige, les parties s''engagent à rechercher une solution amiable avant toute action judiciaire. À défaut d''accord amiable dans un délai de 30 jours, le litige pourra être soumis à médiation.

Conformément à l''article L.612-1 du Code de la consommation, le Client peut recourir gratuitement au service de médiation proposé par LAIA ou à tout médiateur inscrit sur la liste des médiateurs établie par la Commission d''évaluation et de contrôle de la médiation de la consommation.

**14.2 Juridiction compétente**
À défaut de résolution amiable ou par médiation, tout litige relatif à l''interprétation ou à l''exécution du présent contrat sera soumis aux tribunaux compétents de Paris, France.',
  14,
  true,
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("key") DO NOTHING;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

SELECT '✅ Migration terminée avec succès !' AS status;

SELECT 'Tables créées:' AS info;
SELECT
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'InvoiceSettings')
    THEN '✅ InvoiceSettings'
    ELSE '❌ InvoiceSettings manquante'
  END AS check_invoice_settings;

SELECT
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ContractClause')
    THEN '✅ ContractClause'
    ELSE '❌ ContractClause manquante'
  END AS check_contract_clause;

SELECT 'Colonnes Organization:' AS info;
SELECT
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'Organization' AND column_name = 'contractNumber'
  ) THEN '✅ contractNumber ajoutée'
    ELSE '❌ contractNumber manquante'
  END AS check_contract_columns;

SELECT 'Nombre de clauses insérées:' AS info;
SELECT COUNT(*) || ' clauses' AS total FROM "ContractClause";

SELECT 'Paramètres de facturation:' AS info;
SELECT "companyName", "legalStatus", "isCompany", "tvaRate" FROM "InvoiceSettings" WHERE "id" = 'default_settings';
