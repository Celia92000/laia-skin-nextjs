import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSiteName() {
  try {
    console.log('🔄 Mise à jour du nom du site...');

    // Mettre à jour la configuration
    const config = await prisma.siteConfig.findFirst();

    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          siteName: 'LAIA Beauty',
          siteTagline: 'Institut de Beauté & Bien-être',
        }
      });
      console.log('✅ Nom du site mis à jour : LAIA Beauty');
    } else {
      // Créer une nouvelle configuration
      await prisma.siteConfig.create({
        data: {
          siteName: 'LAIA Beauty',
          siteTagline: 'Institut de Beauté & Bien-être',
          email: 'contact@laiaskininstitut.fr',
          phone: '+33 6 00 00 00 00',
        }
      });
      console.log('✅ Configuration créée avec le nom : LAIA Beauty');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSiteName();
