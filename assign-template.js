const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignTemplate() {
  try {
    // Trouver LAIA SKIN INSTITUT
    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: { contains: 'Laia Skin', mode: 'insensitive' } },
          { slug: 'laia-skin-institut' }
        ]
      }
    });

    if (!org) {
      console.log('❌ Organisation LAIA SKIN non trouvée');
      return;
    }

    console.log('📍 Organisation trouvée:', org.name);
    console.log('   - ID:', org.id);
    console.log('   - Slug:', org.slug);
    console.log('   - Template actuel:', org.websiteTemplateId || '(aucun)');

    // Assigner le template "modern"
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: {
        websiteTemplateId: 'modern',
        slug: 'laia-skin-institut',
        subdomain: 'laia-skin-institut'
      }
    });

    console.log('\n✅ Template assigné avec succès !');
    console.log('   - Nouveau template:', updated.websiteTemplateId);
    console.log('   - Slug:', updated.slug);
    console.log('   - Subdomain:', updated.subdomain);
    console.log('\n🌐 Site accessible sur:');
    console.log('   - http://localhost:3001/laia-skin-institut');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

assignTemplate();
