import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrganizations() {
  try {
    console.log('🔍 Vérification des organisations...\n');

    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        domain: true,
        status: true,
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total: ${orgs.length} organisation(s) trouvée(s)\n`);

    if (orgs.length === 0) {
      console.log('❌ AUCUNE ORGANISATION TROUVÉE !');
      console.log('   → Il faut créer une organisation pour pouvoir se connecter\n');
    } else {
      orgs.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name}`);
        console.log(`   ID: ${org.id}`);
        console.log(`   Slug: ${org.slug}`);
        console.log(`   Subdomain: ${org.subdomain || 'N/A'}`);
        console.log(`   Domain: ${org.domain || 'N/A'}`);
        console.log(`   Status: ${org.status}`);
        console.log(`   Plan: ${org.plan}`);
        console.log('');
      });

      const laiaOrg = orgs.find(o => o.slug === 'laia-skin-institut');
      if (laiaOrg) {
        console.log('✅ Organisation "laia-skin-institut" TROUVÉE');
        console.log(`   → localhost:3001 devrait fonctionner avec cette org\n`);
      } else {
        console.log('⚠️  Organisation "laia-skin-institut" NON TROUVÉE');
        console.log('   → Le fallback ne fonctionnera pas pour localhost\n');
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrganizations();
