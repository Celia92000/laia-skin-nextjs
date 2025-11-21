import { getPrismaClient } from './src/lib/prisma';

async function checkInstagramToken() {
  const prisma = await getPrismaClient();

  try {
    console.log('🔍 Vérification des tokens Instagram dans la base de données...\n');

    // Chercher tous les tokens Instagram
    const instagramTokens = await prisma.apiToken.findMany({
      where: {
        service: 'INSTAGRAM'
      },
      select: {
        id: true,
        name: true,
        service: true,
        organizationId: true,
        expiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (instagramTokens.length === 0) {
      console.log('❌ Aucun token Instagram trouvé dans la base de données');
      console.log('\nℹ️  Le token Instagram doit être configuré via:');
      console.log('   1. Interface Admin > Paramètres > Tokens API');
      console.log('   2. Ou créer un script pour l\'ajouter');
    } else {
      console.log(`✅ ${instagramTokens.length} token(s) Instagram trouvé(s):\n`);
      instagramTokens.forEach((token, index) => {
        console.log(`📷 Token ${index + 1}:`);
        console.log(`   ID: ${token.id}`);
        console.log(`   Nom: ${token.name}`);
        console.log(`   Organisation: ${token.organizationId || 'Global'}`);
        console.log(`   Expire: ${token.expiresAt ? token.expiresAt.toISOString() : 'Jamais'}`);
        console.log(`   Metadata: ${JSON.stringify(token.metadata, null, 2)}`);
        console.log(`   Créé: ${token.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Vérifier aussi s'il y a des tokens Facebook
    const facebookTokens = await prisma.apiToken.findMany({
      where: {
        service: 'FACEBOOK'
      },
      select: {
        id: true,
        name: true,
        organizationId: true,
      }
    });

    if (facebookTokens.length > 0) {
      console.log(`\n✅ ${facebookTokens.length} token(s) Facebook trouvé(s)`);
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstagramToken();
