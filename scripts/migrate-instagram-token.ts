import { config } from 'dotenv';
import { resolve } from 'path';
import { storeApiToken } from '../src/lib/api-token-manager';

// Charger .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function migrateInstagramToken() {
  console.log('🔐 MIGRATION DU TOKEN INSTAGRAM\n');
  console.log('============================================================\n');

  try {
    if (process.env.INSTAGRAM_ACCESS_TOKEN) {
      // Calculer la date d'expiration (60 jours)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);

      await storeApiToken({
        service: 'INSTAGRAM',
        name: 'access_token',
        token: process.env.INSTAGRAM_ACCESS_TOKEN,
        expiresAt,
        metadata: {
          migratedFrom: '.env.local',
          migratedAt: new Date().toISOString(),
          accountId: process.env.INSTAGRAM_ACCOUNT_ID,
        },
      });
      console.log('✅ INSTAGRAM access_token migré');
      console.log(`📅 Expire le : ${expiresAt.toLocaleDateString('fr-FR')}`);
    } else {
      console.log('⚠️  Token Instagram non trouvé dans .env.local');
    }

    console.log('\n✅ MIGRATION INSTAGRAM TERMINÉE !');
    console.log('\n📝 Le token Instagram est maintenant chiffré en base de données.');
    console.log('   Vous pouvez le voir dans l\'admin : Paramètres → Sécurité API');

  } catch (error) {
    console.error('❌ ERREUR lors de la migration:', error);
    process.exit(1);
  }
}

migrateInstagramToken();
