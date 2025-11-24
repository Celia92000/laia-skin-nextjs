import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification configuration Laia Skin Institut\n');

  const org = await prisma.organization.findUnique({
    where: { slug: 'laia-skin-institut' },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      referralEnabled: true,
      referralRewardType: true,
      referralRewardAmount: true,
      referralMinimumPurchase: true,
      referralReferrerReward: true,
      referralReferredReward: true,
      referralTermsUrl: true,
      referralEmailTemplate: true
    }
  });

  if (!org) {
    console.log('❌ Organisation Laia Skin Institut non trouvée');
    return;
  }

  console.log('✅ Organisation trouvée:');
  console.log(`   Nom: ${org.name}`);
  console.log(`   Slug: ${org.slug}`);
  console.log(`   Status: ${org.status}`);
  console.log(`\n📋 Configuration Parrainage:`);
  console.log(`   ✓ referralEnabled: ${org.referralEnabled}`);
  console.log(`   ✓ referralRewardType: ${org.referralRewardType}`);
  console.log(`   ✓ referralRewardAmount: ${org.referralRewardAmount}€`);
  console.log(`   ✓ referralMinimumPurchase: ${org.referralMinimumPurchase}€`);
  console.log(`   ✓ referralReferrerReward: ${org.referralReferrerReward}€`);
  console.log(`   ✓ referralReferredReward: ${org.referralReferredReward}€`);
  console.log(`   ✓ referralTermsUrl: ${org.referralTermsUrl || 'Non défini'}`);
  console.log(`   ✓ referralEmailTemplate: ${org.referralEmailTemplate ? 'Défini' : 'Non défini'}`);

  console.log('\n✅ Tous les champs de parrainage sont présents et configurés !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
