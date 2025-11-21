import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllMissingColumns() {
  console.log('🔧 CORRECTION DE TOUTES LES COLONNES MANQUANTES\n');
  console.log('='.repeat(70));

  const queries = [
    // Organization table - 16 colonnes manquantes
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "address" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "city" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'FR';`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'Europe/Paris';`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'EUR';`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "description" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "instagram" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "facebook" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "linkedIn" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "twitter" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT;`,

    // Service table - 6 colonnes manquantes
    `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`,
    `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "color" TEXT;`,
    `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "requiresApproval" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT true;`,
    `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "maxClientsPerSlot" INTEGER DEFAULT 1;`,
    `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "locationId" TEXT;`,

    // Product table - 9 colonnes manquantes
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stock" INTEGER DEFAULT 0;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "barcode" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "dimensions" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER DEFAULT 0;`,

    // Reservation table - 8 colonnes manquantes
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "startTime" TEXT;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "endTime" TEXT;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "clientNotes" TEXT;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "paidAmount" DOUBLE PRECISION DEFAULT 0;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP;`,
    `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const query of queries) {
    try {
      await prisma.$executeRawUnsafe(query);
      successCount++;
      const match = query.match(/ADD COLUMN IF NOT EXISTS "(\w+)"/);
      if (match) {
        console.log(`✅ ${match[1]}`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Erreur:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RÉSUMÉ\n');
  console.log(`   ✅ Réussies : ${successCount}/39`);
  console.log(`   ❌ Échouées : ${errorCount}/39`);

  if (successCount === 39) {
    console.log('\n🎉 PARFAIT ! Toutes les colonnes ont été ajoutées.\n');
    console.log('🔄 Redémarrez le serveur Next.js :');
    console.log('   npx kill-port 3001 && npm run dev\n');
  } else {
    console.log('\n⚠️  Vérifiez les erreurs ci-dessus.\n');
  }

  await prisma.$disconnect();
}

fixAllMissingColumns();
