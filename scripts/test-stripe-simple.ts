#!/usr/bin/env tsx
/**
 * Script simple de vérification de la configuration Stripe
 */

async function testStripe() {
  console.log('\n💳 VÉRIFICATION CONFIGURATION STRIPE\n');
  console.log('='.repeat(80) + '\n');

  // Vérifier les variables d'environnement
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey) {
    console.log('❌ STRIPE_SECRET_KEY: MANQUANTE\n');
    return;
  }

  if (secretKey.startsWith('sk_test_')) {
    console.log('⚠️  STRIPE_SECRET_KEY: MODE TEST');
    console.log('   ' + secretKey.substring(0, 20) + '...');
    console.log('   → Passer en mode PRODUCTION (sk_live_)\n');
  } else if (secretKey.startsWith('sk_live_')) {
    console.log('✅ STRIPE_SECRET_KEY: MODE PRODUCTION');
    console.log('   ' + secretKey.substring(0, 20) + '...\n');
  }

  if (!publishableKey) {
    console.log('⚠️  STRIPE_PUBLISHABLE_KEY: MANQUANTE\n');
  } else if (publishableKey.startsWith('pk_test_')) {
    console.log('⚠️  STRIPE_PUBLISHABLE_KEY: MODE TEST');
    console.log('   ' + publishableKey.substring(0, 20) + '...\n');
  } else if (publishableKey.startsWith('pk_live_')) {
    console.log('✅ STRIPE_PUBLISHABLE_KEY: MODE PRODUCTION');
    console.log('   ' + publishableKey.substring(0, 20) + '...\n');
  }

  // Test de connexion
  console.log('='.repeat(80));
  console.log('🔌 Test de connexion à l\'API Stripe\n');

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const account = await stripe.accounts.retrieve();

    console.log('✅ Connexion réussie !\n');
    console.log('📊 Informations du compte:\n');
    console.log('   Email: ' + (account.email || 'Non défini'));
    console.log('   Pays: ' + account.country);
    console.log('   Type: ' + account.type);
    console.log('   Compte vérifié: ' + (account.charges_enabled ? 'Oui ✅' : 'Non ❌'));
    console.log('   Paiements activés: ' + (account.payouts_enabled ? 'Oui ✅' : 'Non ❌'));
    console.log('');

    // Vérifier webhooks
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

    console.log('='.repeat(80));
    console.log('📡 Webhooks: ' + webhooks.data.length + ' configuré(s)\n');

    if (webhooks.data.length === 0) {
      console.log('⚠️  Aucun webhook configuré');
      console.log('   → Aller sur Dashboard Stripe > Developers > Webhooks\n');
    } else {
      webhooks.data.forEach((wh, i) => {
        console.log((i + 1) + '. ' + wh.url);
        console.log('   Status: ' + wh.status);
        console.log('   Événements: ' + wh.enabled_events.length + '\n');
      });
    }

    // Résumé
    console.log('='.repeat(80));
    console.log('📝 RÉSUMÉ\n');

    const isProduction = secretKey.startsWith('sk_live_');
    const hasWebhooks = webhooks.data.length > 0;
    const isVerified = account.charges_enabled && account.payouts_enabled;

    if (isProduction && hasWebhooks && isVerified) {
      console.log('✅ Configuration PRÊTE pour la PRODUCTION\n');
    } else {
      console.log('⚠️  Configuration INCOMPLÈTE\n');

      if (!isProduction) {
        console.log('❌ Passer en mode PRODUCTION');
        console.log('   → Utiliser sk_live_ et pk_live_\n');
      }

      if (!hasWebhooks) {
        console.log('❌ Configurer les webhooks');
        console.log('   → Dashboard Stripe > Developers > Webhooks\n');
      }

      if (!isVerified) {
        console.log('❌ Finaliser la vérification du compte');
        console.log('   → Compléter KYC/KYB et coordonnées bancaires\n');
      }
    }

    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ ERREUR de connexion à Stripe:\n');
    console.error('   ' + error.message + '\n');
  }
}

testStripe().catch(console.error);
