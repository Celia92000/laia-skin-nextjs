import { config } from 'dotenv';
import { resolve } from 'path';
import { storeApiToken } from '../src/lib/api-token-manager';

// Charger .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function migrateStripeTokens() {
  console.log('🔐 MIGRATION DES TOKENS STRIPE\n');
  console.log('============================================================\n');

  try {
    // 1. Secret Key
    if (process.env.STRIPE_SECRET_KEY) {
      await storeApiToken({
        service: 'STRIPE',
        name: 'secret_key',
        token: process.env.STRIPE_SECRET_KEY,
        metadata: {
          migratedFrom: '.env.local',
          migratedAt: new Date().toISOString(),
          type: 'live',
        },
      });
      console.log('✅ STRIPE secret_key migré');
    }

    // 2. Publishable Key
    if (process.env.STRIPE_PUBLISHABLE_KEY) {
      await storeApiToken({
        service: 'STRIPE',
        name: 'publishable_key',
        token: process.env.STRIPE_PUBLISHABLE_KEY,
        metadata: {
          migratedFrom: '.env.local',
          migratedAt: new Date().toISOString(),
          type: 'live',
        },
      });
      console.log('✅ STRIPE publishable_key migré');
    }

    // 3. Webhook Secret
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      await storeApiToken({
        service: 'STRIPE',
        name: 'webhook_secret',
        token: process.env.STRIPE_WEBHOOK_SECRET,
        metadata: {
          migratedFrom: '.env.local',
          migratedAt: new Date().toISOString(),
        },
      });
      console.log('✅ STRIPE webhook_secret migré');
    }

    console.log('\n✅ MIGRATION STRIPE TERMINÉE AVEC SUCCÈS !');
    console.log('\n📝 Les clés Stripe sont maintenant chiffrées en base de données.');
    console.log('   Vous pouvez les voir dans l\'admin : Paramètres → Sécurité API');

  } catch (error) {
    console.error('❌ ERREUR lors de la migration:', error);
    process.exit(1);
  }
}

migrateStripeTokens();
