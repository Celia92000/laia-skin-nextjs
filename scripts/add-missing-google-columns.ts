import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding missing Google columns to OrganizationConfig...\n');

  try {
    // Add missing Google-related columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "googleApiKey" TEXT,
      ADD COLUMN IF NOT EXISTS "lastGoogleSync" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "autoSyncGoogleReviews" BOOLEAN DEFAULT false;
    `);

    console.log('✅ Missing columns added successfully!\n');

    // Verify all Google columns
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'OrganizationConfig'
      AND (column_name LIKE '%google%' OR column_name LIKE '%Google%')
      ORDER BY column_name;
    `);

    console.log('📋 All Google-related columns in OrganizationConfig:');
    console.table(result);

  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
