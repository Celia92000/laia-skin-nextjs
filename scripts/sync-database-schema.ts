import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncDatabaseSchema() {
  try {
    console.log('🔧 Synchronisation complète du schéma de base de données...\n');

    // Liste des colonnes à ajouter
    const queries = [
      // User table
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;`,

      // Organization table - Features
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureEmailing" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureSMS" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureWhatsApp" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureSocialMedia" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureReviews" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureBlog" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureLoyalty" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureCRM" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureStock" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureAccounting" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureGiftCards" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureMultiLocation" BOOLEAN DEFAULT false;`,
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
        successCount++;
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS "(\w+)"/)?.[1];
        console.log(`✅ ${columnName}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Erreur:`, error.message);
      }
    }

    console.log(`\n📊 Résumé :`);
    console.log(`   ✅ Réussies : ${successCount}`);
    console.log(`   ❌ Échouées : ${errorCount}`);
    console.log('\n🔄 Redémarrez le serveur Next.js pour prendre en compte les changements.');
    console.log('   npx kill-port 3001 && npm run dev');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDatabaseSchema();
