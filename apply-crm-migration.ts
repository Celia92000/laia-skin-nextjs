import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🔄 Application de la migration CRM...\n');

  try {
    // Create FunnelStage enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "FunnelStage" AS ENUM ('AWARENESS', 'INTEREST', 'CONSIDERATION', 'INTENT', 'EVALUATION', 'PURCHASE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Enum FunnelStage créé');

    // Create SegmentCriteriaType enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "SegmentCriteriaType" AS ENUM ('TOTAL_SPENT', 'LAST_VISIT', 'VISIT_FREQUENCY', 'SERVICE_TYPE', 'PRODUCT_PURCHASED', 'LOYALTY_POINTS', 'REFERRAL_COUNT', 'BOOKING_COUNT', 'AVERAGE_TICKET', 'LIFETIME_VALUE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Enum SegmentCriteriaType créé');

    // Create ClientSegment table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ClientSegment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "color" TEXT NOT NULL DEFAULT '#3B82F6',
        "criteria" JSONB NOT NULL,
        "clientCount" INTEGER NOT NULL DEFAULT 0,
        "totalValue" DECIMAL(10,2),
        "isAutomatic" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "ClientSegment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Table ClientSegment créée');

    // Create indexes for ClientSegment
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ClientSegment_organizationId_idx" ON "ClientSegment"("organizationId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ClientSegment_isActive_idx" ON "ClientSegment"("isActive");`);
    console.log('✅ Index ClientSegment créés');

    // Create ConversionFunnel table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConversionFunnel" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "organizationId" TEXT,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "stages" JSONB NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "ConversionFunnel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Table ConversionFunnel créée');

    // Create indexes for ConversionFunnel
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversionFunnel_organizationId_idx" ON "ConversionFunnel"("organizationId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversionFunnel_isActive_idx" ON "ConversionFunnel"("isActive");`);
    console.log('✅ Index ConversionFunnel créés');

    // Create FunnelEntry table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FunnelEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "funnelId" TEXT NOT NULL,
        "leadId" TEXT,
        "userId" TEXT,
        "currentStage" "FunnelStage" NOT NULL DEFAULT 'AWARENESS',
        "stages" JSONB NOT NULL,
        "isConverted" BOOLEAN NOT NULL DEFAULT false,
        "convertedAt" TIMESTAMP(3),
        "conversionValue" DECIMAL(10,2),
        "source" TEXT,
        "utmSource" TEXT,
        "utmMedium" TEXT,
        "utmCampaign" TEXT,
        CONSTRAINT "FunnelEntry_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "ConversionFunnel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FunnelEntry_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "FunnelEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    console.log('✅ Table FunnelEntry créée');

    // Create indexes for FunnelEntry
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FunnelEntry_funnelId_idx" ON "FunnelEntry"("funnelId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FunnelEntry_leadId_idx" ON "FunnelEntry"("leadId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FunnelEntry_userId_idx" ON "FunnelEntry"("userId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FunnelEntry_currentStage_idx" ON "FunnelEntry"("currentStage");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FunnelEntry_isConverted_idx" ON "FunnelEntry"("isConverted");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FunnelEntry_createdAt_idx" ON "FunnelEntry"("createdAt");`);
    console.log('✅ Index FunnelEntry créés');

    // Create CampaignSegment table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CampaignSegment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "campaignId" TEXT NOT NULL,
        "segmentId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CampaignSegment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "CampaignSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "ClientSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "CampaignSegment_campaignId_segmentId_unique" UNIQUE ("campaignId", "segmentId")
      );
    `);
    console.log('✅ Table CampaignSegment créée');

    // Create indexes for CampaignSegment
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CampaignSegment_campaignId_idx" ON "CampaignSegment"("campaignId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CampaignSegment_segmentId_idx" ON "CampaignSegment"("segmentId");`);
    console.log('✅ Index CampaignSegment créés');

    console.log('\n✅ Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

applyMigration();
