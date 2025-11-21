import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🚀 Starting migration...')

    // Add column if not exists
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
    `)
    console.log('✅ Column organizationId added successfully')

    // Create index if not exists
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Review_organizationId_idx" ON "Review"("organizationId");
    `)
    console.log('✅ Index Review_organizationId_idx created successfully')

    // Verify column exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Review' AND column_name = 'organizationId';
    `) as any[]

    if (result.length > 0) {
      console.log(`✅ Verification: Column ${result[0].column_name} exists with type ${result[0].data_type}`)
    } else {
      console.log('❌ Column not found after creation')
      process.exit(1)
    }

    console.log('\n✨ Migration completed successfully!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
