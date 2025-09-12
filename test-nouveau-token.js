// Test du nouveau token WhatsApp avec toutes les permissions
const axios = require('axios');

const TOKEN = 'EAFWQV0qPjVQBPVbuyZAUDXzNy4nbeugYZBGrukyblA0AuA5L3zw5yGULmGJtbZCiRxI4a58h09M1IcbfyJ456TljbhpeTZBYAPdEv9o0ZAr4ZCr3fZC6pUf6e3ZAZC2FZCfgLBlvOJRtMdcFazy0UPZBHhIUlOOC1Md0CZCMAn81uhLMRi7tQYmgibBcfnUxyZA1n6O9xXQZDZD';
const PHONE_NUMBER_ID = '672520675954185';
const BUSINESS_ACCOUNT_ID = '1741901383229296';

async function testNouveauToken() {
  console.log('🔍 Test du nouveau token WhatsApp...\n');
  console.log('Token:', TOKEN.substring(0, 30) + '...\n');
  
  // Test 1: Vérifier les permissions
  console.log('📌 Test 1: Vérification des permissions');
  try {
    const permsResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/permissions',
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    
    console.log('✅ Permissions obtenues:');
    if (permsResponse.data.data) {
      permsResponse.data.data.forEach(p => {
        const icon = p.status === 'granted' ? '✅' : '❌';
        console.log(`   ${icon} ${p.permission}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur permissions:', error.response?.data?.error?.message || error.message);
  }
  
  // Test 2: Accès au Business Account
  console.log('\n📌 Test 2: Accès au Business Account WhatsApp');
  try {
    const businessResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        params: { fields: 'id,name' }
      }
    );
    console.log('✅ Business Account accessible');
    console.log('   ID:', businessResponse.data.id);
    console.log('   Nom:', businessResponse.data.name || 'Sans nom');
  } catch (error) {
    console.log('❌ Erreur Business Account:', error.response?.data?.error?.message || error.message);
  }
  
  // Test 3: Accès direct au numéro WhatsApp
  console.log('\n📌 Test 3: Accès au numéro WhatsApp');
  try {
    const phoneResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        params: { fields: 'display_phone_number,verified_name,id,quality_rating' }
      }
    );
    console.log('✅ Numéro WhatsApp accessible !');
    console.log('   Numéro:', phoneResponse.data.display_phone_number);
    console.log('   ID:', phoneResponse.data.id);
    console.log('   Nom vérifié:', phoneResponse.data.verified_name || 'Non vérifié');
    console.log('   Qualité:', phoneResponse.data.quality_rating || 'Non défini');
  } catch (error) {
    console.log('❌ Erreur accès numéro:', error.response?.data?.error?.message || error.message);
  }
  
  // Test 4: Envoi d'un message test
  console.log('\n📌 Test 4: Envoi d\'un message test');
  try {
    const messageResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: '33683717050', // Votre numéro sans le +
        type: 'text',
        text: {
          body: '🎉 Félicitations ! WhatsApp API est maintenant configuré pour LAIA Skin Institut !\n\n✅ Token permanent actif\n✅ Permissions configurées\n✅ Prêt pour l\'intégration\n\n💆‍♀️ LAIA Skin Institut'
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
    console.log('   Statut:', messageResponse.data.messages[0].message_status || 'Envoyé');
    
  } catch (error) {
    console.log('❌ Erreur envoi message:', error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.error_data) {
      console.log('   Détails:', error.response.data.error.error_data.details);
    }
  }
  
  // Test 5: Vérifier la validité du token
  console.log('\n📌 Test 5: Informations du token');
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
    
    if (debugResponse.data.data) {
      const tokenData = debugResponse.data.data;
      console.log('✅ Token valide');
      console.log('   Type:', tokenData.type);
      console.log('   App ID:', tokenData.app_id);
      
      if (tokenData.expires_at) {
        const expiry = new Date(tokenData.expires_at * 1000);
        console.log('   Expire le:', expiry.toLocaleString('fr-FR'));
      } else {
        console.log('   ✨ Token permanent (n\'expire pas)');
      }
    }
  } catch (error) {
    console.log('❌ Erreur debug token:', error.response?.data?.error?.message || error.message);
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE LA CONFIGURATION WHATSAPP');
  console.log('='.repeat(60));
  console.log('Token:', TOKEN.substring(0, 30) + '...');
  console.log('Phone Number ID:', PHONE_NUMBER_ID);
  console.log('Business Account ID:', BUSINESS_ACCOUNT_ID);
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('1. ✅ Token configuré dans .env.local');
  console.log('2. ⏳ Configurer le webhook sur Meta for Developers');
  console.log('3. ⏳ Déployer sur Vercel avec les nouvelles variables');
  console.log('4. ⏳ Tester les messages entrants/sortants en production');
  
  console.log('\n💡 Configuration du Webhook:');
  console.log('   URL: https://votre-app.vercel.app/api/whatsapp/webhook');
  console.log('   Token de vérification: laia_skin_webhook_2025');
  console.log('   Champs: messages, message_status');
}

testNouveauToken();