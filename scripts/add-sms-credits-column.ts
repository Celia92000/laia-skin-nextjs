import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSmsCreditsColumn() {
  try {
    console.log('📝 Adding smsCredits column to Organization table...');

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "smsCredits" INTEGER DEFAULT 0;`
    );

    console.log('✅ Column smsCredits added successfully');

    // Verify the column exists
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Organization' AND column_name = 'smsCredits';`
    );

    if (result.length > 0) {
      console.log('✅ Verified: smsCredits column exists');
    } else {
      console.log('❌ Warning: Column may not have been created');
    }

  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addSmsCreditsColumn();
