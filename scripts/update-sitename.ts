import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSiteName() {
  try {
    console.log('🔍 Recherche de la configuration actuelle...');

    const config = await prisma.siteConfig.findFirst();

    if (!config) {
      console.log('❌ Aucune configuration trouvée');
      return;
    }

    console.log('\n📊 Configuration actuelle:');
    console.log('  - Nom du site (siteName):', config.siteName);
    console.log('  - Nom légal (legalName):', config.legalName);

    console.log('\n✏️  Mise à jour du siteName vers "LAIA SKIN INSTITUT"...');

    const updated = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        siteName: 'LAIA SKIN INSTITUT'
      }
    });

    console.log('✅ Mise à jour réussie !');
    console.log('\n📊 Nouvelle configuration:');
    console.log('  - Nom du site (siteName):', updated.siteName);
    console.log('  - Nom légal (legalName):', updated.legalName);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSiteName();
