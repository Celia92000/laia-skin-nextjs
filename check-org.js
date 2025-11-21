const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrg() {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        domain: true,
        ownerEmail: true,
        plan: true,
        status: true
      }
    });

    if (orgs.length === 0) {
      console.log('❌ Aucune organisation trouvée');
      return;
    }

    const org = orgs[0];
    console.log('\n📋 Dernière organisation créée:');
    console.log('   ID:', org.id);
    console.log('   Nom:', org.name);
    console.log('   Slug:', org.slug);
    console.log('   Subdomain:', org.subdomain);
    console.log('   Domain personnalisé:', org.domain || 'Non configuré');
    console.log('   Email:', org.ownerEmail);
    console.log('   Plan:', org.plan);
    console.log('   Statut:', org.status);
    console.log('\n🌐 URLs d\'accès:');
    console.log('   Site web:', `https://${org.subdomain}.laia-connect.fr` + (org.domain ? ` ou https://${org.domain}` : ''));
    console.log('   Admin:', `http://localhost:3001/admin`);
    console.log('   (En dev, le tenant est détecté depuis la DB, pas le domaine)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrg();
