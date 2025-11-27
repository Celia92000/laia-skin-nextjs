import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding Google Business columns to OrganizationConfig...\n');

  try {
    // Add Google Business columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "googleBusinessConnected" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "googleBusinessAccessToken" TEXT,
      ADD COLUMN IF NOT EXISTS "googleBusinessRefreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "googleBusinessTokenExpiry" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "googleBusinessEmail" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "googleBusinessAccountId" VARCHAR(255);
    `);

    console.log('✅ Google Business columns added successfully!\n');

    // Verify columns were added
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'OrganizationConfig'
      AND column_name LIKE 'googleBusiness%'
      ORDER BY column_name;
    `);

    console.log('📋 Google Business columns in OrganizationConfig:');
    console.table(result);

  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
