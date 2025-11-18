-- Migration: Ajout des modèles ContentAnalysis et AISuggestion
-- Date: 2025-01-23
-- Description: Système d'analyse IA du feed social media et génération de suggestions personnalisées

-- Créer la table ContentAnalysis
CREATE TABLE IF NOT EXISTS "ContentAnalysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "platform" TEXT NOT NULL,
    "toneOfVoice" TEXT NOT NULL,
    "topHashtags" JSONB NOT NULL,
    "avgEngagement" DOUBLE PRECISION NOT NULL,
    "bestPostTypes" JSONB NOT NULL,
    "bestPostTimes" JSONB NOT NULL,
    "topPosts" JSONB NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAnalysis_pkey" PRIMARY KEY ("id")
);

-- Créer la table AISuggestion
CREATE TABLE IF NOT EXISTS "AISuggestion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "category" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "hashtags" TEXT,
    "trendingNote" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'openai-gpt4',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISuggestion_pkey" PRIMARY KEY ("id")
);

-- Créer les index pour ContentAnalysis
CREATE INDEX IF NOT EXISTS "ContentAnalysis_organizationId_idx" ON "ContentAnalysis"("organizationId");
CREATE INDEX IF NOT EXISTS "ContentAnalysis_platform_idx" ON "ContentAnalysis"("platform");
CREATE INDEX IF NOT EXISTS "ContentAnalysis_analyzedAt_idx" ON "ContentAnalysis"("analyzedAt");

-- Créer les index pour AISuggestion
CREATE INDEX IF NOT EXISTS "AISuggestion_organizationId_category_idx" ON "AISuggestion"("organizationId", "category");
CREATE INDEX IF NOT EXISTS "AISuggestion_contentType_idx" ON "AISuggestion"("contentType");
CREATE INDEX IF NOT EXISTS "AISuggestion_createdAt_idx" ON "AISuggestion"("createdAt");

-- Commentaires pour documentation
COMMENT ON TABLE "ContentAnalysis" IS 'Analyse IA du feed social media pour identifier les tendances et patterns';
COMMENT ON TABLE "AISuggestion" IS 'Suggestions de contenu générées par IA basées sur l''analyse du feed';
