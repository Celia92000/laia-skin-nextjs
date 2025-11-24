import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('➡️  Adding heroVideo column to Organization and OrganizationConfig...');

  try {
    // Add heroVideo to Organization
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "heroVideo" TEXT;
    `);
    console.log('✅ Added heroVideo to Organization');

    // Add heroVideo to OrganizationConfig
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "heroVideo" TEXT;
    `);
    console.log('✅ Added heroVideo to OrganizationConfig');

    console.log('\n✨ Migration complete!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
