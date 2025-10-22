import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreLaiaSkin() {
  try {
    console.log('🔄 Restauration de LAIA SKIN Institut...');

    const config = await prisma.siteConfig.findFirst();

    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          siteName: 'LAIA SKIN Institut',
          logoUrl: '/logo-laia-skin.png',
        }
      });
      console.log('✅ LAIA SKIN Institut restauré avec le logo original');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreLaiaSkin();
