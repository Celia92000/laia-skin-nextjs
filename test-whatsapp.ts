// Charger les variables d'environnement en premier
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sendWhatsAppMessage, formatPhoneNumber } from './src/lib/whatsapp-meta';

async function testWhatsApp() {
  console.log('🚀 Test envoi WhatsApp...\n');
  
  // Configuration depuis .env.local
  console.log('📱 Configuration:');
  console.log('  - Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? '✅' : '❌');
  console.log('  - Access Token:', process.env.WHATSAPP_ACCESS_TOKEN ? '✅' : '❌');
  console.log('  - API Version:', process.env.WHATSAPP_API_VERSION || 'v18.0');
  
  // Numéro de test (le vôtre)
  const testNumber = '+33683717050';
  const formattedNumber = formatPhoneNumber(testNumber);
  
  console.log('\n📞 Numéro de test:', testNumber);
  console.log('📞 Numéro formaté:', formattedNumber);
  
  // Message de test
  const testMessage = `✨ *Test LAIA SKIN Institut* ✨

Ceci est un message de test pour vérifier que WhatsApp fonctionne correctement.

Si vous recevez ce message, la configuration est OK ! ✅

*LAIA SKIN Institut* 💕`;

  console.log('\n📨 Envoi du message de test...');
  
  try {
    const result = await sendWhatsAppMessage({
      to: testNumber,
      message: testMessage
    });
    
    if (result.success) {
      console.log('✅ Message envoyé avec succès !');
      console.log('📱 Message ID:', result.messageId);
    } else {
      console.log('❌ Échec de l\'envoi:', result.error);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer le test
testWhatsApp();