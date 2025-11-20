import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: 'laia-skin-institut' }
  });

  console.log('Organisation "Laia Skin Institut":');
  console.log(JSON.stringify(org, null, 2));

  // Essayer de chercher par subdomain
  if (org?.subdomain) {
    const orgBySubdomain = await prisma.organization.findUnique({
      where: { subdomain: org.subdomain }
    });
    console.log('\n\nRecherche par subdomain :', org.subdomain);
    console.log(orgBySubdomain ? '✅ Trouvé' : '❌ Non trouvé');
  }

  // Chercher par subdomain "laia-skin-institut" directement
  const test = await prisma.organization.findUnique({
    where: { subdomain: 'laia-skin-institut' }
  });
  console.log('\n\nRecherche directe par subdomain="laia-skin-institut":');
  console.log(test ? `✅ Trouvé: ${test.name}` : '❌ Non trouvé');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
