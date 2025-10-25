import { getPrismaClient } from './src/lib/prisma';

async function migrateTokensToOrganization() {
  const prisma = await getPrismaClient();
  
  const LAIA_ORG_ID = '9739c909-c945-4548-bf53-4d226457f630';
  
  console.log('\n🔄 Migration des tokens globaux vers Laia Skin Institut...\n');
  
  // Récupérer tous les tokens globaux
  const globalTokens = await prisma.apiToken.findMany({
    where: { organizationId: null }
  });
  
  console.log(`📦 Tokens globaux trouvés: ${globalTokens.length}`);
  
  let migrated = 0;
  
  for (const token of globalTokens) {
    console.log(`\n  Migrating ${token.service}/${token.name}...`);
    
    try {
      // Mettre à jour le token avec l'organizationId
      await prisma.apiToken.update({
        where: { id: token.id },
        data: { organizationId: LAIA_ORG_ID }
      });
      
      console.log(`  ✅ ${token.service}/${token.name} migré vers Laia Skin`);
      migrated++;
    } catch (error) {
      console.error(`  ❌ Erreur pour ${token.service}/${token.name}:`, error);
    }
  }
  
  console.log(`\n📊 RÉSULTAT:`);
  console.log(`  ✅ ${migrated}/${globalTokens.length} tokens migrés`);
  
  // Vérifier le résultat
  const orgTokensAfter = await prisma.apiToken.findMany({
    where: { organizationId: LAIA_ORG_ID }
  });
  
  console.log(`\n🏢 Tokens de Laia Skin Institut après migration:`);
  orgTokensAfter.forEach(token => {
    console.log(`  - ${token.service}/${token.name}`);
  });
  
  await prisma.$disconnect();
}

migrateTokensToOrganization();
