// Service WhatsApp Business API avec Meta (Facebook)
import axios from 'axios';

const WHATSAPP_API_URL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v18.0'}`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

interface WhatsAppMessage {
  to: string; // Numéro au format international sans le +
  message: string;
  template?: string;
  templateParams?: any[];
}

// Fonction pour envoyer un message texte simple
export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials manquantes');
    return { success: false, error: 'Configuration WhatsApp incomplète' };
  }

  try {
    // Nettoyer le numéro (enlever le + et les espaces)
    const phoneNumber = to.replace(/[^0-9]/g, '');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0].id,
      data: response.data
    };
  } catch (error: any) {
    console.error('Erreur WhatsApp:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// Fonction pour envoyer un template de message
export async function sendWhatsAppTemplate({ 
  to, 
  template, 
  templateParams = [] 
}: WhatsAppMessage) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials manquantes');
    return { success: false, error: 'Configuration WhatsApp incomplète' };
  }

  try {
    const phoneNumber = to.replace(/[^0-9]/g, '');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: template,
          language: {
            code: 'fr'
          },
          components: templateParams.length > 0 ? [
            {
              type: 'body',
              parameters: templateParams.map(param => ({
                type: 'text',
                text: param
              }))
            }
          ] : undefined
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0].id,
      data: response.data
    };
  } catch (error: any) {
    console.error('Erreur WhatsApp Template:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// Templates de messages formatés
export const whatsappTemplates = {
  // Confirmation de réservation
  reservationConfirmation: (data: {
    clientName: string;
    date: string;
    time: string;
    services: string[];
    totalPrice: number;
  }) => `✨ *LAIA SKIN Institut* ✨

Bonjour ${data.clientName} ! 👋

Votre réservation est *confirmée* ✅

📅 *Date :* ${data.date}
⏰ *Heure :* ${data.time}
💆‍♀️ *Services :* 
${data.services.map(s => `  • ${s}`).join('\n')}
💰 *Total :* ${data.totalPrice}€

📍 *Adresse :* 123 Rue de la Beauté, 75001 Paris

À très bientôt ! 💕

_Pour annuler ou modifier, répondez à ce message._`,

  // Rappel de rendez-vous
  appointmentReminder: (data: {
    clientName: string;
    time: string;
    services: string[];
  }) => `⏰ *Rappel de rendez-vous*

Bonjour ${data.clientName} ! 

Nous vous rappelons votre rendez-vous *demain* :

🕐 *Heure :* ${data.time}
💆‍♀️ *Services :* ${data.services.join(', ')}

Nous avons hâte de vous accueillir ! 

*LAIA SKIN Institut* 
123 Rue de la Beauté, Paris`,

  // Message de bienvenue
  welcomeMessage: (clientName: string) => `Bienvenue chez *LAIA SKIN Institut* ${clientName} ! 🌟

Nous sommes ravis de vous compter parmi nos clientes.

Pour toute question, n'hésitez pas à nous contacter par ce canal WhatsApp.

À très bientôt ! 💕`,

  // Promotion
  promotionMessage: (data: {
    clientName: string;
    offer: string;
    validUntil: string;
  }) => `🎁 *Offre spéciale pour vous ${data.clientName}* !

${data.offer}

✨ Valable jusqu'au ${data.validUntil}

Réservez vite votre soin sur notre site ou répondez à ce message !

*LAIA SKIN Institut*`
};

// Fonction helper pour formater les numéros de téléphone
export function formatPhoneNumber(phone: string): string {
  // Enlever tous les caractères non numériques
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // Si le numéro commence par 0, le remplacer par 33
  if (cleaned.startsWith('0')) {
    cleaned = '33' + cleaned.substring(1);
  }
  
  // Si le numéro ne commence pas par 33, l'ajouter
  if (!cleaned.startsWith('33')) {
    cleaned = '33' + cleaned;
  }
  
  return cleaned;
}

// Vérifier le status d'un message
export async function getMessageStatus(messageId: string) {
  if (!ACCESS_TOKEN) {
    return { success: false, error: 'Configuration WhatsApp incomplète' };
  }

  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    return {
      success: true,
      status: response.data.status,
      data: response.data
    };
  } catch (error: any) {
    console.error('Erreur status WhatsApp:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}