import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createApiTokensTable() {
  try {
    console.log('🔄 Creating api_tokens table...\n');

    // Execute the SQL to create the table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "api_tokens" (
        "id" TEXT NOT NULL,
        "service" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "encryptedToken" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3),
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('✅ Created table api_tokens');

    // Create unique index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "api_tokens_service_name_key" ON "api_tokens"("service", "name");
    `);

    console.log('✅ Created unique index on service + name');

    console.log('\n✅ Table api_tokens created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createApiTokensTable()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
