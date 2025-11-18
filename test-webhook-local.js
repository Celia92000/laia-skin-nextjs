// Test du webhook en local
const axios = require('axios');

const WEBHOOK_URL = 'http://localhost:5555/api/whatsapp/webhook';
const VERIFY_TOKEN = 'laia_skin_webhook_2025';

async function testWebhook() {
  console.log('🔍 Test du webhook WhatsApp...\n');
  
  // Test 1: Vérification du webhook (comme Meta le fait)
  console.log('📌 Test 1: Vérification du webhook (GET)');
  try {
    const verifyResponse = await axios.get(WEBHOOK_URL, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': 'test_challenge_123'
      }
    });
    
    if (verifyResponse.data === 'test_challenge_123') {
      console.log('✅ Webhook vérifié avec succès !');
      console.log('   Challenge retourné:', verifyResponse.data);
    } else {
      console.log('❌ Réponse incorrecte:', verifyResponse.data);
    }
  } catch (error) {
    console.log('❌ Erreur vérification:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Le serveur Next.js n\'est pas démarré');
      console.log('   Lancez: npm run dev');
    }
  }
  
  // Test 2: Envoi d'un webhook de message (POST)
  console.log('\n📌 Test 2: Simulation de réception de message (POST)');
  try {
    const messagePayload = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '33612345678',
              text: {
                body: 'Test message pour le webhook'
              }
            }]
          }
        }]
      }]
    };
    
    const postResponse = await axios.post(WEBHOOK_URL, messagePayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook POST accepté');
    console.log('   Réponse:', postResponse.data);
  } catch (error) {
    console.log('❌ Erreur POST:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Configuration du webhook pour Meta:');
  console.log('='.repeat(50));
  console.log('URL de rappel: https://votre-app.vercel.app/api/whatsapp/webhook');
  console.log('Jeton de vérification: laia_skin_webhook_2025');
  console.log('\n💡 Si le test local fonctionne mais pas sur Meta:');
  console.log('1. Vérifiez que l\'app est déployée sur Vercel');
  console.log('2. Vérifiez l\'URL exacte de votre app Vercel');
  console.log('3. Assurez-vous que les variables d\'environnement sont configurées sur Vercel');
}

testWebhook();