-- Create api_tokens table for secure API token storage
CREATE TABLE IF NOT EXISTS "api_tokens" (
  "id" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "encryptedToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on service + name combination
CREATE UNIQUE INDEX IF NOT EXISTS "api_tokens_service_name_key" ON "api_tokens"("service", "name");
