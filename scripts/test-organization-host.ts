import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getOrganizationByHost(host: string) {
  try {
    const cleanHost = host.split(':')[0].toLowerCase();
    console.log('🌐 Host reçu:', host, '→ Clean host:', cleanHost);

    let organization = null;

    // 1️⃣ Domaine personnalisé
    console.log('🔍 Recherche par domaine:', cleanHost);
    organization = await prisma.organization.findUnique({
      where: { domain: cleanHost }
    });

    if (organization) {
      console.log('✅ Trouvé par domaine:', organization.name);
      return organization;
    }

    // 2️⃣ Subdomain
    const subdomain = cleanHost.split('.')[0];
    console.log('🔍 Recherche par subdomain:', subdomain);
    organization = await prisma.organization.findUnique({
      where: { subdomain }
    });

    if (organization) {
      console.log('✅ Trouvé par subdomain:', organization.name);
      return organization;
    }

    // 3️⃣ Fallback
    console.log('🔍 Fallback sur slug: laia-skin-institut');
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' }
    });

    if (organization) {
      console.log('✅ Trouvé par fallback:', organization.name);
      return organization;
    }

    console.log('❌ Aucune organisation trouvée');
    return null;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
}

async function testDifferentHosts() {
  console.log('🧪 Test de différents hosts:\n');

  const hosts = [
    'localhost',
    'localhost:3001',
    'laia-skin-institut.localhost',
    'laia-skin-institut.localhost:3001',
    'laiaskininstitut.fr',
    '127.0.0.1',
    '127.0.0.1:3001'
  ];

  for (const host of hosts) {
    console.log('━'.repeat(60));
    const org = await getOrganizationByHost(host);
    console.log('Résultat:', org ? `✅ ${org.name} (ID: ${org.id})` : '❌ NULL');
    console.log('');
  }

  await prisma.$disconnect();
}

testDifferentHosts();
