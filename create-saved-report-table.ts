import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSavedReportTable() {
  console.log('🔄 Création de la table SavedReport...\n');

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SavedReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "metrics" JSONB NOT NULL,
        "period" TEXT NOT NULL,
        "autoSend" BOOLEAN NOT NULL DEFAULT false,
        "emailSchedule" TEXT,
        "lastSent" TIMESTAMP(3),
        CONSTRAINT "SavedReport_organizationId_fkey" FOREIGN KEY ("organizationId")
          REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Table SavedReport créée');

    // Créer les index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SavedReport_organizationId_idx" ON "SavedReport"("organizationId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SavedReport_autoSend_idx" ON "SavedReport"("autoSend");
    `);
    console.log('✅ Index SavedReport créés');

    console.log('\n✅ Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

createSavedReportTable();
