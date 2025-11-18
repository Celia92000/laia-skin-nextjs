-- Table pour l'historique des communications (emails, SMS, WhatsApp)
CREATE TABLE IF NOT EXISTS "CommunicationLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "clientId" TEXT,
  "clientEmail" TEXT,
  "clientPhone" TEXT,
  "type" TEXT NOT NULL, -- 'email', 'sms', 'whatsapp'
  "direction" TEXT NOT NULL, -- 'outbound', 'inbound'
  "subject" TEXT,
  "content" TEXT,
  "attachments" JSONB DEFAULT '[]', -- [{name, url, size}]
  "metadata" JSONB DEFAULT '{}', -- données supplémentaires
  "status" TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'read'
  "sentBy" TEXT, -- ID de l'utilisateur qui a envoyé
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommunicationLog_organizationId_fkey" FOREIGN KEY ("organizationId")
    REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "CommunicationLog_organizationId_idx" ON "CommunicationLog"("organizationId");
CREATE INDEX IF NOT EXISTS "CommunicationLog_clientEmail_idx" ON "CommunicationLog"("clientEmail");
CREATE INDEX IF NOT EXISTS "CommunicationLog_clientId_idx" ON "CommunicationLog"("clientId");
CREATE INDEX IF NOT EXISTS "CommunicationLog_type_idx" ON "CommunicationLog"("type");
CREATE INDEX IF NOT EXISTS "CommunicationLog_sentAt_idx" ON "CommunicationLog"("sentAt" DESC);

-- Index composite pour récupérer l'historique d'un client
CREATE INDEX IF NOT EXISTS "CommunicationLog_org_client_idx"
  ON "CommunicationLog"("organizationId", "clientEmail", "sentAt" DESC);
