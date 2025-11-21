import { getPrismaClient } from './src/lib/prisma';

async function checkOrganization() {
  const prisma = await getPrismaClient();
  
  // Trouver l'admin Laia Skin
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@laiaskin.com' },
    include: { organization: true }
  });
  
  console.log('\n📊 Admin Laia Skin Institut:');
  console.log('Email:', admin?.email);
  console.log('Organization ID:', admin?.organizationId);
  console.log('Organization Name:', admin?.organization?.name);
  
  // Compter les tokens globaux
  const globalTokens = await prisma.apiToken.findMany({
    where: { organizationId: null }
  });
  
  console.log('\n🔑 Tokens globaux (organizationId = NULL):');
  if (globalTokens.length === 0) {
    console.log('  Aucun token global');
  } else {
    globalTokens.forEach(token => {
      console.log(`  - ${token.service}/${token.name}`);
    });
  }
  
  // Compter les tokens de l'organisation
  if (admin?.organizationId) {
    const orgTokens = await prisma.apiToken.findMany({
      where: { organizationId: admin.organizationId }
    });
    
    console.log('\n🏢 Tokens de l\'organisation Laia Skin:');
    if (orgTokens.length === 0) {
      console.log('  Aucun token pour cette organisation');
    } else {
      orgTokens.forEach(token => {
        console.log(`  - ${token.service}/${token.name}`);
      });
    }
  }
  
  await prisma.$disconnect();
}

checkOrganization();
