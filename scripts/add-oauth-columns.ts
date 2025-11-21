import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🚀 Starting OAuth columns migration...')

    // Planity OAuth columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "planityConnected" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "planityAccessToken" TEXT,
      ADD COLUMN IF NOT EXISTS "planityRefreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "planityTokenExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "planityBusinessId" TEXT,
      ADD COLUMN IF NOT EXISTS "planityBusinessName" TEXT;
    `)
    console.log('✅ Planity columns added')

    // Treatwell OAuth columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "treatwellConnected" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "treatwellAccessToken" TEXT,
      ADD COLUMN IF NOT EXISTS "treatwellRefreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "treatwellTokenExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "treatwellVenueId" TEXT,
      ADD COLUMN IF NOT EXISTS "treatwellVenueName" TEXT;
    `)
    console.log('✅ Treatwell columns added')

    // PayPal OAuth columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "paypalConnected" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "paypalAccessToken" TEXT,
      ADD COLUMN IF NOT EXISTS "paypalRefreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "paypalTokenExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "paypalMerchantId" TEXT,
      ADD COLUMN IF NOT EXISTS "paypalEmail" TEXT;
    `)
    console.log('✅ PayPal columns added')

    // SumUp OAuth columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "sumupConnected" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "sumupAccessToken" TEXT,
      ADD COLUMN IF NOT EXISTS "sumupRefreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "sumupTokenExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "sumupMerchantCode" TEXT,
      ADD COLUMN IF NOT EXISTS "sumupCurrency" TEXT;
    `)
    console.log('✅ SumUp columns added')

    // Google Calendar OAuth columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "googleCalendarConnected" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "googleCalendarAccessToken" TEXT,
      ADD COLUMN IF NOT EXISTS "googleCalendarRefreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "googleCalendarTokenExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "googleCalendarId" TEXT,
      ADD COLUMN IF NOT EXISTS "googleCalendarEmail" TEXT;
    `)
    console.log('✅ Google Calendar columns added')

    // Verify columns exist
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Organization'
      AND column_name IN (
        'planityConnected', 'treatwellConnected', 'paypalConnected',
        'sumupConnected', 'googleCalendarConnected'
      )
      ORDER BY column_name;
    `) as any[]

    console.log(`\n✅ Verification: ${result.length}/5 main OAuth columns added`)
    result.forEach(col => {
      console.log(`   - ${col.column_name}`)
    })

    console.log('\n✨ Migration completed successfully!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
