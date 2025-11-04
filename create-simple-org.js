const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOrg() {
  try {
    // Créer l'organisation
    const org = await prisma.organization.create({
      data: {
        name: 'Beauté Zen Paris',
        slug: 'beaute-zen-paris',
        subdomain: 'beaute-zen-paris',
        ownerEmail: 'contact@beautezenparis.fr',
        ownerFirstName: 'Marie',
        ownerLastName: 'Dubois',
        plan: 'SOLO',
        status: 'ACTIVE',
        type: 'SINGLE_LOCATION'
      }
    });

    console.log('✅ Organisation créée:', org.name);

    // Mettre à jour avec le template
    await prisma.$executeRaw`
      UPDATE "Organization"
      SET "websiteTemplateId" = 'minimal',
          "isOnboarded" = true
      WHERE id = ${org.id}
    `;

    console.log('✅ Template minimal assigné');
    console.log('\n🌐 Sites accessibles:');
    console.log('   - LAIA SKIN: http://localhost:3001/laia-skin-institut (template: modern)');
    console.log('   - BEAUTÉ ZEN: http://localhost:3001/beaute-zen-paris (template: minimal)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createOrg();
