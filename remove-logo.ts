import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeLogo() {
  try {
    console.log('🔄 Suppression du logo...');

    const config = await prisma.siteConfig.findFirst();

    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          logoUrl: '/logo-laia-beauty.svg',
        }
      });
      console.log('✅ Logo LAIA Beauty configuré');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeLogo();
