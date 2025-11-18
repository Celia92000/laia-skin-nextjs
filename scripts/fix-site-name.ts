import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSiteName() {
  try {
    console.log('🔍 Recherche de l\'organisation laia-skin-institut...');

    // Chercher l'organisation laia-skin-institut
    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { subdomain: 'laia-skin-institut' },
          { slug: 'laia-skin-institut' }
        ]
      },
      include: {
        config: true
      }
    });

    if (!org) {
      console.log('❌ Organisation laia-skin-institut non trouvée');
      return;
    }

    console.log(`✅ Organisation trouvée : ${org.name}`);
    console.log(`📋 siteName actuel : ${org.config?.siteName || 'null'}`);

    // Mettre à jour le siteName dans la config
    if (org.config) {
      const updated = await prisma.organizationConfig.update({
        where: { id: org.config.id },
        data: {
          siteName: 'LAIA Connect'
        }
      });

      console.log(`✅ siteName mis à jour : ${updated.siteName}`);
    } else {
      // Créer la config si elle n'existe pas
      const created = await prisma.organizationConfig.create({
        data: {
          organizationId: org.id,
          siteName: 'LAIA Connect',
          primaryColor: '#d4b5a0',
          secondaryColor: '#c9a084',
          accentColor: '#2c3e50'
        }
      });

      console.log(`✅ Config créée avec siteName : ${created.siteName}`);
    }

    console.log('');
    console.log('✅ Terminé ! Le nom du site est maintenant "LAIA Connect"');
    console.log('🔄 Rafraîchissez votre navigateur sur http://localhost:3001/login/');

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSiteName();
