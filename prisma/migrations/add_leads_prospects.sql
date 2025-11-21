-- Migration: Système de prospection CRM pour LAIA
-- Gestion des leads et prospects d'instituts de beauté

-- Statut du lead dans le pipeline de conversion
CREATE TYPE "LeadStatus" AS ENUM (
  'NEW',              -- Nouveau lead (découverte)
  'CONTACTED',        -- Premier contact effectué
  'QUALIFIED',        -- Prospect qualifié (intéressé)
  'DEMO_SCHEDULED',   -- Démo planifiée
  'DEMO_DONE',        -- Démo effectuée
  'PROPOSAL_SENT',    -- Proposition commerciale envoyée
  'NEGOTIATION',      -- En négociation
  'WON',              -- Gagné → converti en client
  'LOST',             -- Perdu
  'ON_HOLD'           -- En attente
);

-- Source d'acquisition du lead
CREATE TYPE "LeadSource" AS ENUM (
  'WEBSITE',          -- Formulaire site web
  'REFERRAL',         -- Recommandation
  'LINKEDIN',         -- LinkedIn
  'INSTAGRAM',        -- Instagram
  'FACEBOOK',         -- Facebook
  'GOOGLE_ADS',       -- Google Ads
  'EMAIL_CAMPAIGN',   -- Campagne email
  'COLD_EMAIL',       -- Email à froid
  'COLD_CALL',        -- Appel à froid
  'NETWORKING',       -- Networking/Salon professionnel
  'PARTNER',          -- Partenaire commercial
  'OTHER'             -- Autre
);

-- Type d'interaction avec le lead
CREATE TYPE "InteractionType" AS ENUM (
  'EMAIL',
  'PHONE',
  'MEETING',
  'DEMO',
  'WHATSAPP',
  'LINKEDIN_MESSAGE',
  'NOTE'
);

-- Table des Leads/Prospects
CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  -- Informations institut
  "institutName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "website" TEXT,
  "address" TEXT,
  "city" TEXT,
  "postalCode" TEXT,
  "country" TEXT DEFAULT 'France',

  -- Informations business
  "numberOfLocations" INTEGER DEFAULT 1,
  "numberOfEmployees" INTEGER,
  "currentSoftware" TEXT,              -- Logiciel actuel utilisé
  "estimatedRevenue" DECIMAL(10,2),     -- CA annuel estimé
  "painPoints" TEXT[],                  -- Points de douleur (array)

  -- Pipeline
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "source" "LeadSource" NOT NULL,
  "score" INTEGER DEFAULT 0,            -- Score de qualité 0-100
  "probability" INTEGER DEFAULT 0,       -- Probabilité de conversion 0-100%
  "estimatedValue" DECIMAL(10,2),       -- Valeur estimée du contrat

  -- Suivi commercial
  "assignedToUserId" TEXT,              -- Super-admin assigné
  "nextFollowUpDate" TIMESTAMP(3),      -- Prochaine relance
  "lastContactDate" TIMESTAMP(3),       -- Dernier contact
  "expectedCloseDate" TIMESTAMP(3),     -- Date de closing estimée

  -- Conversion
  "organizationId" TEXT,                 -- Si converti en client
  "convertedAt" TIMESTAMP(3),
  "lostReason" TEXT,                     -- Raison si perdu

  -- Métadonnées
  "tags" TEXT[],
  "notes" TEXT,

  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Table des interactions avec les leads
CREATE TABLE "LeadInteraction" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leadId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,               -- Super-admin qui a fait l'interaction

  "type" "InteractionType" NOT NULL,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "nextAction" TEXT,                     -- Action de suivi à faire
  "nextActionDate" TIMESTAMP(3),

  -- Pièces jointes
  "attachments" TEXT[],

  CONSTRAINT "LeadInteraction_pkey" PRIMARY KEY ("id")
);

-- Table des templates emails de prospection
CREATE TABLE "ProspectingEmailTemplate" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,                  -- HTML avec variables {{institutName}}, {{contactName}}, etc.
  "category" TEXT,                       -- 'first_contact', 'follow_up', 'demo', 'proposal', etc.
  "isActive" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "ProspectingEmailTemplate_pkey" PRIMARY KEY ("id")
);

-- Index pour performance
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_assignedToUserId_idx" ON "Lead"("assignedToUserId");
CREATE INDEX "Lead_source_idx" ON "Lead"("source");
CREATE INDEX "Lead_nextFollowUpDate_idx" ON "Lead"("nextFollowUpDate");
CREATE INDEX "Lead_contactEmail_idx" ON "Lead"("contactEmail");
CREATE INDEX "Lead_city_idx" ON "Lead"("city");
CREATE INDEX "LeadInteraction_leadId_idx" ON "LeadInteraction"("leadId");
CREATE INDEX "LeadInteraction_userId_idx" ON "LeadInteraction"("userId");
CREATE INDEX "LeadInteraction_createdAt_idx" ON "LeadInteraction"("createdAt");

-- Contraintes de clés étrangères
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Vue pour le pipeline commercial
CREATE VIEW "LeadPipeline" AS
SELECT
  status,
  COUNT(*) as count,
  SUM("estimatedValue") as total_value,
  AVG("probability") as avg_probability
FROM "Lead"
WHERE status NOT IN ('WON', 'LOST')
GROUP BY status
ORDER BY
  CASE status
    WHEN 'NEW' THEN 1
    WHEN 'CONTACTED' THEN 2
    WHEN 'QUALIFIED' THEN 3
    WHEN 'DEMO_SCHEDULED' THEN 4
    WHEN 'DEMO_DONE' THEN 5
    WHEN 'PROPOSAL_SENT' THEN 6
    WHEN 'NEGOTIATION' THEN 7
    ELSE 8
  END;
