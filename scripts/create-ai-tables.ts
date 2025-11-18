import { getPrismaClient } from './src/lib/prisma';

async function createAITables() {
  const prisma = await getPrismaClient();

  try {
    console.log('🔍 Vérification des tables ContentAnalysis et AISuggestion...');

    // Exécuter la migration SQL directement
    await prisma.$executeRawUnsafe(`
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
    `);

    console.log('✅ Table ContentAnalysis créée');

    await prisma.$executeRawUnsafe(`
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
    `);

    console.log('✅ Table AISuggestion créée');

    // Créer les index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ContentAnalysis_organizationId_idx" ON "ContentAnalysis"("organizationId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ContentAnalysis_platform_idx" ON "ContentAnalysis"("platform");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ContentAnalysis_analyzedAt_idx" ON "ContentAnalysis"("analyzedAt");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AISuggestion_organizationId_category_idx" ON "AISuggestion"("organizationId", "category");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AISuggestion_contentType_idx" ON "AISuggestion"("contentType");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AISuggestion_createdAt_idx" ON "AISuggestion"("createdAt");
    `);

    console.log('✅ Index créés');

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('\nLes tables suivantes ont été créées:');
    console.log('  - ContentAnalysis (analyse du feed social media)');
    console.log('  - AISuggestion (suggestions générées par IA)');

  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('✅ Les tables existent déjà');
    } else {
      console.error('❌ Erreur lors de la création des tables:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAITables();
