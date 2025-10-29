import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';
import { encrypt } from './src/lib/encryption-service';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function addSnapchatToken() {
  console.log('🔐 Configuration des tokens Snapchat...');
  console.log('');

  const clientId = process.env.SNAPCHAT_CLIENT_ID;
  const clientSecret = process.env.SNAPCHAT_CLIENT_SECRET;
  const accessToken = process.env.SNAPCHAT_ACCESS_TOKEN;

  if (!clientId || !clientSecret) {
    console.log('❌ CLIENT_ID ou CLIENT_SECRET Snapchat manquant dans .env.local');
    console.log('');
    console.log('Ajoutez :');
    console.log('SNAPCHAT_CLIENT_ID=votre_client_id');
    console.log('SNAPCHAT_CLIENT_SECRET=votre_client_secret');
    return;
  }

  console.log('📋 Informations trouvées:');
  console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
  console.log(`   Client Secret: ${clientSecret.substring(0, 20)}...`);
  if (accessToken) {
    console.log(`   ✅ Access Token: ${accessToken.substring(0, 30)}...`);
  } else {
    console.log('   ⚠️  Access Token: Non trouvé');
  }
  console.log('');

  // Pour le moment, on stocke juste les credentials
  try {
    const prisma = await getPrismaClient();

    // Stocker CLIENT_ID
    const encryptedClientId = encrypt(clientId);
    await prisma.apiToken.upsert({
      where: {
        service_name: {
          service: 'SNAPCHAT',
          name: 'client_id'
        }
      },
      update: {
        encryptedToken: encryptedClientId,
        expiresAt: null
      },
      create: {
        service: 'SNAPCHAT',
        name: 'client_id',
        encryptedToken: encryptedClientId
      }
    });

    // Stocker CLIENT_SECRET
    const encryptedClientSecret = encrypt(clientSecret);
    await prisma.apiToken.upsert({
      where: {
        service_name: {
          service: 'SNAPCHAT',
          name: 'client_secret'
        }
      },
      update: {
        encryptedToken: encryptedClientSecret,
        expiresAt: null
      },
      create: {
        service: 'SNAPCHAT',
        name: 'client_secret',
        encryptedToken: encryptedClientSecret
      }
    });

    // Stocker ACCESS_TOKEN si disponible
    if (accessToken) {
      const encryptedAccessToken = encrypt(accessToken);
      await prisma.apiToken.upsert({
        where: {
          service_name: {
            service: 'SNAPCHAT',
            name: 'access_token'
          }
        },
        update: {
          encryptedToken: encryptedAccessToken,
          expiresAt: null
        },
        create: {
          service: 'SNAPCHAT',
          name: 'access_token',
          encryptedToken: encryptedAccessToken
        }
      });

      console.log('✅ Snapchat entièrement configuré !');
      console.log('');
      console.log('📝 Tokens stockés:');
      console.log('   ✓ Client ID');
      console.log('   ✓ Client Secret');
      console.log('   ✓ Access Token');
      console.log('');
      console.log('🎉 Vous pouvez maintenant publier sur Snapchat !');
    } else {
      console.log('✅ Client ID et Client Secret Snapchat stockés avec succès!');
      console.log('');
      console.log('📝 Prochaine étape:');
      console.log('   Une fois votre access_token obtenu, ajoutez-le avec:');
      console.log('   SNAPCHAT_ACCESS_TOKEN=votre_token');
      console.log('   Puis relancez ce script');
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

addSnapchatToken();
