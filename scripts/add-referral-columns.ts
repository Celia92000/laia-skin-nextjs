import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Ajout des colonnes de parrainage...');

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "referralEnabled" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "referralRewardType" TEXT DEFAULT 'FIXED',
      ADD COLUMN IF NOT EXISTS "referralRewardAmount" DOUBLE PRECISION DEFAULT 20.0,
      ADD COLUMN IF NOT EXISTS "referralMinimumPurchase" DOUBLE PRECISION DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS "referralReferrerReward" DOUBLE PRECISION DEFAULT 20.0,
      ADD COLUMN IF NOT EXISTS "referralReferredReward" DOUBLE PRECISION DEFAULT 10.0,
      ADD COLUMN IF NOT EXISTS "referralTermsUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "referralEmailTemplate" TEXT;
    `);

    console.log('✅ Colonnes de parrainage ajoutées avec succès !');

    // Vérifier qu'une organisation existe et qu'elle a les nouveaux champs
    const org = await prisma.organization.findFirst({
      select: {
        id: true,
        name: true,
        referralEnabled: true,
        referralRewardType: true,
        referralReferrerReward: true
      }
    });

    if (org) {
      console.log('\n✓ Vérification : Organisation trouvée');
      console.log(`  - Nom: ${org.name}`);
      console.log(`  - Parrainage activé: ${org.referralEnabled}`);
      console.log(`  - Type de récompense: ${org.referralRewardType}`);
      console.log(`  - Récompense parrain: ${org.referralReferrerReward}€`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
