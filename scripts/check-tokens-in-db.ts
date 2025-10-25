import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTokens() {
  try {
    console.log('🔍 Vérification des tokens dans la base de données...\n');

    const tokens = await prisma.apiToken.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Nombre de tokens trouvés : ${tokens.length}\n`);

    if (tokens.length === 0) {
      console.log('❌ Aucun token dans la base de données');
    } else {
      tokens.forEach((token, index) => {
        console.log(`${index + 1}. ${token.service} / ${token.name}`);
        console.log(`   ID: ${token.id}`);
        console.log(`   Créé: ${token.createdAt}`);
        console.log(`   Expire: ${token.expiresAt || 'Jamais'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();
