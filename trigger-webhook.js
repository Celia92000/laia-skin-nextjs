const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function triggerWebhook() {
  try {
    const sessionId = process.argv[2];

    if (!sessionId) {
      console.error('❌ Session ID manquant');
      console.log('Usage: node trigger-webhook.js cs_live_xxx');
      process.exit(1);
    }

    console.log(`🔍 Récupération de la session ${sessionId}...`);

    // Récupérer la session complète avec tous les détails
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    console.log('✅ Session récupérée');
    console.log(`   Status: ${session.status}`);
    console.log(`   Payment Status: ${session.payment_status}`);
    console.log(`   Customer: ${session.customer}`);
    console.log(`   Subscription: ${session.subscription}`);

    if (session.status !== 'complete') {
      console.warn('⚠️ La session n\'est pas encore complétée');
      console.log('   Attendre que le paiement SEPA soit validé...');
    }

    // Construire l'événement webhook
    const webhookEvent = {
      id: `evt_${Date.now()}`,
      object: 'event',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: session
      },
      livemode: session.livemode,
      pending_webhooks: 0,
      request: null,
      type: 'checkout.session.completed'
    };

    console.log('\n📤 Envoi du webhook à localhost:3001/api/webhooks/stripe/...');

    // Envoyer au webhook local
    const response = await fetch('http://localhost:3001/api/webhooks/stripe/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Mode dev accepte cette signature
      },
      body: JSON.stringify(webhookEvent)
    });

    if (response.ok) {
      console.log('✅ Webhook traité avec succès !');
      const result = await response.json();
      console.log('   Réponse:', result);
    } else {
      console.error('❌ Erreur webhook:', response.status, response.statusText);
      const error = await response.text();
      console.error('   Détails:', error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

triggerWebhook();
