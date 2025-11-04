const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestOrg() {
  try {
    // Vérifier si l'organisation existe déjà
    const existing = await prisma.organization.findFirst({
      where: { slug: 'beaute-zen-paris' }
    });

    if (existing) {
      console.log('⚠️  Organisation "Beauté Zen Paris" existe déjà');
      console.log('   - ID:', existing.id);
      console.log('   - Template:', existing.websiteTemplateId || '(aucun)');

      // Assigner template minimal
      const updated = await prisma.organization.update({
        where: { id: existing.id },
        data: {
          websiteTemplateId: 'minimal',
          primaryColor: '#000000',
          secondaryColor: '#333333',
          accentColor: '#666666',
          isOnboarded: true
        }
      });

      console.log('\n✅ Template mis à jour !');
      console.log('   - Template:', updated.websiteTemplateId);
      console.log('   - Couleurs: Noir & Gris (minimal)');
      console.log('\n🌐 Site accessible sur:');
      console.log('   - http://localhost:3001/beaute-zen-paris');

      return;
    }

    // Créer la nouvelle organisation
    const org = await prisma.organization.create({
      data: {
        name: 'Beauté Zen Paris',
        slug: 'beaute-zen-paris',
        subdomain: 'beaute-zen-paris',
        ownerEmail: 'contact@beautezenparis.fr',
        ownerFirstName: 'Marie',
        ownerLastName: 'Dubois',
        ownerPhone: '01 23 45 67 89',
        plan: 'SOLO',
        status: 'ACTIVE',
        type: 'SINGLE_LOCATION',
        maxLocations: 1,
        maxUsers: 1,
        maxStorage: 5,
        isOnboarded: true,
        primaryColor: '#000000',
        secondaryColor: '#333333',
        accentColor: '#666666'
      }
    });

    // Mettre à jour le template après création
    const updated = await prisma.$executeRaw`
      UPDATE "Organization"
      SET "websiteTemplateId" = 'minimal'
      WHERE id = ${org.id}
    `;

    console.log('✅ Organisation créée avec succès !');
    console.log('   - Nom:', org.name);
    console.log('   - Slug:', org.slug);
    console.log('   - Template:', org.websiteTemplateId);
    console.log('   - Couleurs: Noir & Gris (style minimal)');
    console.log('\n🌐 Site accessible sur:');
    console.log('   - http://localhost:3001/beaute-zen-paris');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrg();
