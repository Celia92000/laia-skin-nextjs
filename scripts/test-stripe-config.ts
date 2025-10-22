#!/usr/bin/env tsx
/**
 * Script de vérification de la configuration Stripe
 */

import Stripe from 'stripe';

async function testStripeConfig() {
  console.log('\n💳 VÉRIFICATION CONFIGURATION STRIPE');
  console.log('═'.repeat(80) + '\n');

  // Vérifier les variables d'environnement
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('📋 Variables d\'environnement:\n');

  // Secret Key
  if (!secretKey) {
    console.log('❌ STRIPE_SECRET_KEY: MANQUANTE');
    console.log('   → Ajouter dans .env.local\n');
    return;
  } else if (secretKey.startsWith('sk_test_')) {
    console.log('⚠️  STRIPE_SECRET_KEY: MODE TEST');
    console.log(`   ${secretKey.substring(0, 20)}...`);
    console.log('   → Passer en mode PRODUCTION (sk_live_) avant déploiement\n');
  } else if (secretKey.startsWith('sk_live_')) {
    console.log('✅ STRIPE_SECRET_KEY: MODE PRODUCTION');
    console.log(`   ${secretKey.substring(0, 20)}...\n`);
  } else {
    console.log('❌ STRIPE_SECRET_KEY: FORMAT INVALIDE');
    console.log(`   ${secretKey.substring(0, 20)}...\n`);
    return;
  }

  // Publishable Key
  if (!publishableKey) {
    console.log('⚠️  STRIPE_PUBLISHABLE_KEY: MANQUANTE');
    console.log('   → Ajouter dans .env.local\n');
  } else if (publishableKey.startsWith('pk_test_')) {
    console.log('⚠️  STRIPE_PUBLISHABLE_KEY: MODE TEST');
    console.log(`   ${publishableKey.substring(0, 20)}...\n`);
  } else if (publishableKey.startsWith('pk_live_')) {
    console.log('✅ STRIPE_PUBLISHABLE_KEY: MODE PRODUCTION');
    console.log(`   ${publishableKey.substring(0, 20)}...\n`);
  }

  // Webhook Secret
  if (!webhookSecret) {
    console.log('⚠️  STRIPE_WEBHOOK_SECRET: MANQUANT');
    console.log('   → Configurer dans Dashboard Stripe > Webhooks\n');
  } else {
    console.log('✅ STRIPE_WEBHOOK_SECRET: CONFIGURÉ');
    console.log(`   ${webhookSecret.substring(0, 15)}...\n`);
  }

  // Test de connexion à l'API Stripe
  console.log('═'.repeat(80));
  console.log('🔌 Test de connexion à l\'API Stripe\n');

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Récupérer les informations du compte
    const account = await stripe.accounts.retrieve();

    console.log('✅ Connexion réussie !\n');
    console.log('📊 Informations du compte:\n');
    console.log(`   Email: ${account.email || 'Non défini'}`);
    console.log(`   Pays: ${account.country}`);
    console.log(`   Devise par défaut: ${account.default_currency?.toUpperCase() || 'Non définie'}`);
    console.log(`   Type: ${account.type}`);
    console.log(`   Compte vérifié: ${account.charges_enabled ? 'Oui ✅' : 'Non ❌'}`);
    console.log(`   Paiements activés: ${account.payouts_enabled ? 'Oui ✅' : 'Non ❌'}\n');

    // Vérifier les webhooks configurés
    console.log('═'.repeat(80));
    console.log('📡 Webhooks configurés\n');

    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

    if (webhooks.data.length === 0) {
      console.log('⚠️  Aucun webhook configuré');
      console.log('   → Configurer dans Dashboard Stripe > Developers > Webhooks\n');
    } else {
      webhooks.data.forEach((webhook, index) => {
        console.log(String(index + 1) + '. ' + webhook.url);
        console.log('   Status: ' + webhook.status);
        console.log('   Événements: ' + webhook.enabled_events.length);
        if (webhook.enabled_events.length > 0) {
          console.log('   - ' + webhook.enabled_events.slice(0, 3).join('\n   - '));
          if (webhook.enabled_events.length > 3) {
            console.log('   - ... et ' + (webhook.enabled_events.length - 3) + ' autres');
          }
        }
        console.log('');
      });
    }

    // Récapitulatif
    console.log('═'.repeat(80));
    console.log('📝 RÉCAPITULATIF\n');

    const isProduction = secretKey.startsWith('sk_live_');
    const hasWebhooks = webhooks.data.length > 0;
    const isVerified = account.charges_enabled && account.payouts_enabled;

    if (isProduction && hasWebhooks && isVerified) {
      console.log('✅ Configuration PRÊTE pour la PRODUCTION\n');
      console.log('Prochaines étapes:');
      console.log('1. Tester un paiement réel de faible montant');
      console.log('2. Vérifier que le webhook est bien reçu');
      console.log('3. Tester un remboursement');
      console.log('4. Activer Radar anti-fraude');
      console.log('5. Configurer les notifications email\n');
    } else {
      console.log('⚠️  Configuration INCOMPLÈTE\n');
      console.log('Actions requises:');

      if (!isProduction) {
        console.log('❌ Passer en mode PRODUCTION');
        console.log('   → Obtenir les clés sk_live_ et pk_live_');
        console.log('   → Mettre à jour .env.local et Vercel\n');
      }

      if (!hasWebhooks) {
        console.log('❌ Configurer les webhooks');
        console.log('   → Dashboard Stripe > Developers > Webhooks');
        console.log('   → Endpoint: https://votre-domaine.com/api/webhooks/stripe\n');
      }

      if (!isVerified) {
        console.log('❌ Finaliser la vérification du compte Stripe');
        console.log('   → Compléter les informations KYC/KYB');
        console.log('   → Ajouter coordonnées bancaires\n');
      }
    }

  } catch (error: any) {
    console.error('\n❌ ERREUR lors de la connexion à Stripe:\n');
    console.error(`   ${error.message}\n`);

    if (error.type === 'StripeAuthenticationError') {
      console.error('💡 Vérifiez que votre STRIPE_SECRET_KEY est correcte');
    } else if (error.type === 'StripeAPIError') {
      console.error('💡 Problème avec l\'API Stripe');
      console.error('   Vérifiez https://status.stripe.com');
    }

    console.error('\n');
  }
}

testStripeConfig().catch(console.error);
