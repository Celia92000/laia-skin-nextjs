// Script pour tester le token WhatsApp
const axios = require('axios');

const TOKEN = 'EAFWQV0qPjVQBPVAwK2f2zaLeCx36pZCVWlp8Ds0Xb7Vvj2cyjGW8FCKFGYA4uaJOkQZBYZA8balWgZC81gvPVgdLy6wrwxNXPbjgS4u04ZBkn9UBakZBDSfZC1V8GktwQhAbBUFXQhFNG9TDKQOfhHgmm3KVE0ir6RhmxrnUv0nUFwa8LCntZBcakZC1QY3ZBnYVLDkAZDZD';
const PHONE_NUMBER_ID = '672520675954185';

async function testToken() {
  console.log('🔍 Test du token WhatsApp...\n');
  
  try {
    // Test 1: Vérifier le business account
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    console.log('✅ Token valide !');
    console.log('📱 Numéro:', response.data.display_phone_number);
    console.log('✉️ ID:', response.data.id);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Token invalide ou expiré');
      console.log('Erreur:', error.response.data.error.message);
      console.log('\n📋 Solutions:');
      console.log('1. Générez un nouveau token sur https://developers.facebook.com');
      console.log('2. Vérifiez que l\'app est bien configurée');
      console.log('3. Utilisez un token permanent au lieu du temporaire');
    } else {
      console.log('❌ Erreur de connexion:', error.message);
    }
  }
}

testToken();