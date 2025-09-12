// Test complet du token WhatsApp avec vérification des permissions
const axios = require('axios');

const TOKEN = 'EAFWQV0qPjVQBPVAwK2f2zaLeCx36pZCVWlp8Ds0Xb7Vvj2cyjGW8FCKFGYA4uaJOkQZBYZA8balWgZC81gvPVgdLy6wrwxNXPbjgS4u04ZBkn9UBakZBDSfZC1V8GktwQhAbBUFXQhFNG9TDKQOfhHgmm3KVE0ir6RhmxrnUv0nUFwa8LCntZBcakZC1QY3ZBnYVLDkAZDZD';
const PHONE_NUMBER_ID = '672520675954185';
const BUSINESS_ACCOUNT_ID = '1741901383229296';

async function testWhatsApp() {
  console.log('🔍 Test complet du token WhatsApp...\n');
  
  // Test 1: Vérifier le token lui-même
  console.log('📌 Test 1: Validation du token');
  try {
    const debugResponse = await axios.get(
      'https://graph.facebook.com/debug_token',
      {
        params: {
          input_token: TOKEN,
          access_token: TOKEN
        }
      }
    );
    console.log('✅ Token valide');
    console.log('   Type:', debugResponse.data.data.type);
    console.log('   App ID:', debugResponse.data.data.app_id);
    console.log('   Valide:', debugResponse.data.data.is_valid);
    
    if (debugResponse.data.data.expires_at) {
      const expiry = new Date(debugResponse.data.data.expires_at * 1000);
      console.log('   Expire:', expiry.toLocaleString());
    } else {
      console.log('   ✨ Token permanent (n\'expire pas)');
    }
    
    console.log('   Scopes:', debugResponse.data.data.scopes?.join(', ') || 'Aucun');
  } catch (error) {
    console.log('❌ Erreur validation token:', error.response?.data?.error?.message || error.message);
  }
  
  console.log('\n📌 Test 2: Accès au Business Account');
  try {
    const businessResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        },
        params: {
          fields: 'id,name,phone_numbers'
        }
      }
    );
    console.log('✅ Business Account accessible');
    console.log('   ID:', businessResponse.data.id);
    console.log('   Nom:', businessResponse.data.name);
  } catch (error) {
    console.log('❌ Erreur Business Account:', error.response?.data?.error?.message || error.message);
  }
  
  console.log('\n📌 Test 3: Liste des numéros WhatsApp');
  try {
    const numbersResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}/phone_numbers`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log('✅ Numéros WhatsApp:');
    if (numbersResponse.data.data && numbersResponse.data.data.length > 0) {
      numbersResponse.data.data.forEach(phone => {
        console.log(`   📱 ${phone.display_phone_number} (ID: ${phone.id})`);
        console.log(`      Vérifié: ${phone.verified_name || 'Non vérifié'}`);
      });
    } else {
      console.log('   Aucun numéro trouvé');
    }
  } catch (error) {
    console.log('❌ Erreur liste numéros:', error.response?.data?.error?.message || error.message);
  }
  
  console.log('\n📌 Test 4: Accès direct au numéro');
  try {
    const phoneResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        },
        params: {
          fields: 'display_phone_number,verified_name,id'
        }
      }
    );
    console.log('✅ Numéro accessible directement');
    console.log('   Numéro:', phoneResponse.data.display_phone_number);
    console.log('   ID:', phoneResponse.data.id);
  } catch (error) {
    console.log('❌ Erreur accès numéro:', error.response?.data?.error?.message || error.message);
  }
  
  console.log('\n📌 Test 5: Envoi d\'un message test');
  try {
    // Envoyer un message test à votre propre numéro
    const messageResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: '33683717050', // Votre numéro sans le +
        type: 'text',
        text: {
          body: '✅ Test WhatsApp API - LAIA Skin Institut\n\nCe message confirme que l\'intégration WhatsApp fonctionne correctement !'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Message test envoyé avec succès !');
    console.log('   Message ID:', messageResponse.data.messages[0].id);
  } catch (error) {
    console.log('❌ Erreur envoi message:', error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.error_data) {
      console.log('   Détails:', JSON.stringify(error.response.data.error.error_data, null, 2));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Résumé de la configuration WhatsApp:');
  console.log('='.repeat(50));
  console.log('Token:', TOKEN.substring(0, 20) + '...');
  console.log('Phone Number ID:', PHONE_NUMBER_ID);
  console.log('Business Account ID:', BUSINESS_ACCOUNT_ID);
  console.log('\n💡 Prochaines étapes:');
  console.log('1. Si le token est valide, configurez le webhook sur Meta');
  console.log('2. URL du webhook: https://votre-domaine.vercel.app/api/whatsapp/webhook');
  console.log('3. Token de vérification: laia_skin_webhook_2025');
  console.log('4. Champs à souscrire: messages, message_status');
}

testWhatsApp();