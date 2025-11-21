import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({
    select: {
      name: true,
      slug: true,
      config: {
        select: {
          siteName: true,
          founderName: true,
          legalRepName: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          postalCode: true,
        }
      }
    }
  });

  console.log('\n📊 Configuration des', orgs.length, 'organisation(s) :\n');
  console.log('='.repeat(80));

  orgs.forEach((org, i) => {
    console.log(`\n${i+1}. ${org.name} (@${org.slug})`);
    console.log('-'.repeat(80));

    if (!org.config) {
      console.log('   ❌ Aucune configuration trouvée\n');
      return;
    }

    const c = org.config;
    console.log('   Nom site:', c.siteName || '❌ Manquant');
    console.log('   Fondateur:', c.founderName || c.legalRepName || '❌ Manquant');
    console.log('   Téléphone:', c.phone || '❌ Manquant');
    console.log('   Email:', c.email || '❌ Manquant');

    const adresse = (c.address && c.city && c.postalCode)
      ? `✅ ${c.address}, ${c.postalCode} ${c.city}`
      : '❌ Incomplète';
    console.log('   Adresse:', adresse);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  await prisma.$disconnect();
}

main();
