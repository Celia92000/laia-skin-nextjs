// Service WhatsApp Business API
// Options: WhatsApp Business API, Twilio, ou WATI

interface WhatsAppMessage {
  to: string; // Numéro au format international +33612345678
  message: string;
  mediaUrl?: string; // Pour envoyer des images
}

// Templates de messages WhatsApp
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

Nous avons hâte de vous voir ! 😊

_En cas d'empêchement, merci de nous prévenir au plus vite._

*LAIA SKIN Institut* 💕`,

  // Message d'anniversaire
  birthdayMessage: (data: {
    clientName: string;
  }) => `🎂 *Joyeux Anniversaire ${data.clientName}!* 🎉

Toute l'équipe de LAIA SKIN vous souhaite une merveilleuse journée ! 

🎁 *Votre cadeau :* 
**-10€ sur votre prochain soin**
_Valable tout le mois_

Réservez dès maintenant :
👉 https://laiaskin.fr/reservation

Avec toute notre affection,
*LAIA SKIN Institut* 💕`,

  // Promotion flash
  flashPromo: (data: {
    promotion: string;
    validUntil: string;
  }) => `🔥 *OFFRE FLASH EXCLUSIVE* 🔥

${data.promotion}

⏳ *Valable jusqu'au :* ${data.validUntil}

Réservez vite :
📱 Répondez "OUI" pour réserver
💻 https://laiaskin.fr/reservation

*LAIA SKIN Institut* ✨`,

  // Suivi après soin
  afterCareFollowUp: (data: {
    clientName: string;
    serviceName: string;
  }) => `💆‍♀️ *Suivi de votre soin*

Bonjour ${data.clientName},

J'espère que vous allez bien suite à votre soin d'hier ! 

Comment vous sentez-vous ? 😊

*Conseils post-soin :*
• Hydratez bien votre peau 💧
• Évitez le soleil direct ☀️
• Utilisez une protection SPF 🧴

N'hésitez pas si vous avez des questions !

*LAIA SKIN Institut* 💕`,

  // Carte de fidélité
  loyaltyUpdate: (data: {
    clientName: string;
    sessionsCount: number;
    remainingForReward: number;
  }) => `🎁 *Votre carte de fidélité*

Bonjour ${data.clientName} !

✅ Vous avez *${data.sessionsCount} séances* validées

${data.remainingForReward > 0 
  ? `⏳ Plus que *${data.remainingForReward} séances* pour obtenir *-30€* !`
  : `🎉 *Félicitations !* Vous avez droit à *-30€* sur votre prochain soin !`}

Réservez votre prochain soin :
👉 https://laiaskin.fr/reservation

*LAIA SKIN Institut* 💕`,

  // Nouveau service disponible
  newServiceAnnouncement: (data: {
    serviceName: string;
    description: string;
    specialPrice?: string;
  }) => `✨ *NOUVEAUTÉ CHEZ LAIA SKIN* ✨

🌟 *${data.serviceName}* 🌟

${data.description}

${data.specialPrice ? `💰 *Prix de lancement :* ${data.specialPrice}` : ''}

📱 Répondez "INFO" pour plus de détails
📅 Répondez "RESERVER" pour prendre RDV

*LAIA SKIN Institut* 💕`
};

// Configuration pour différents providers
export const whatsappProviders = {
  // Option 1: WhatsApp Business API Direct (Recommandé)
  meta: {
    name: 'WhatsApp Business API (Meta)',
    pricing: 'Gratuit pour 1000 conversations/mois',
    setup: `
      1. Créer un compte Meta Business
      2. Vérifier votre entreprise
      3. Obtenir un numéro WhatsApp Business
      4. Configurer les webhooks
    `,
    pros: [
      'Officiel et fiable',
      'Pas d\'intermédiaire',
      'Templates de messages approuvés',
      'Boutons interactifs'
    ],
    cons: [
      'Setup plus complexe',
      'Validation Meta requise'
    ]
  },

  // Option 2: Twilio (Plus simple)
  twilio: {
    name: 'Twilio WhatsApp',
    pricing: '~0.005€ par message',
    setup: `
      1. Créer un compte Twilio
      2. Activer WhatsApp Sandbox
      3. Obtenir les clés API
      4. Intégrer le SDK
    `,
    pros: [
      'Setup rapide',
      'Documentation excellente',
      'Support multi-canal (SMS aussi)',
      'Sandbox pour tests'
    ],
    cons: [
      'Coût par message',
      'Nécessite approbation pour production'
    ]
  },

  // Option 3: WATI (Spécialisé WhatsApp)
  wati: {
    name: 'WATI',
    pricing: 'À partir de 39€/mois',
    setup: `
      1. Créer un compte WATI
      2. Scanner QR code WhatsApp
      3. Configurer les automatisations
      4. Utiliser l'API
    `,
    pros: [
      'Interface no-code',
      'CRM intégré',
      'Chatbot inclus',
      'Broadcast lists'
    ],
    cons: [
      'Abonnement mensuel',
      'Moins flexible'
    ]
  }
};

// Fonction d'envoi via WhatsApp Business API
export async function sendWhatsAppMessage(
  message: WhatsAppMessage,
  provider: 'direct' | 'twilio' | 'meta' | 'wati' = 'direct'
): Promise<boolean> {
  
  // Formater le numéro de téléphone
  const formattedNumber = formatPhoneNumber(message.to);
  
  // Option 1: Lien direct WhatsApp (pour commencer)
  if (provider === 'direct') {
    // Cette méthode ouvre WhatsApp Web/App avec le message pré-rempli
    // Utilisé côté client uniquement
    console.log('📱 Message WhatsApp préparé pour:', formattedNumber);
    console.log('Message:', message.message.substring(0, 100) + '...');
    return true;
  }
  
  // Option 2: WhatsApp Business API (Meta)
  if (provider === 'meta') {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_BUSINESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_ID;
    
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.error('Configuration WhatsApp Business manquante');
      return false;
    }
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedNumber.replace('+', ''),
            type: 'text',
            text: {
              body: message.message
            }
          })
        }
      );
      
      const result = await response.json();
      if (result.error) {
        console.error('Erreur WhatsApp API:', result.error);
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      return false;
    }
  }
  
  // Option 3: Twilio (si configuré)
  if (provider === 'twilio') {
    // Configuration Twilio
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Sandbox number
    
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: TWILIO_WHATSAPP_FROM,
            To: `whatsapp:${formattedNumber}`,
            Body: message.message,
            ...(message.mediaUrl && { MediaUrl: message.mediaUrl })
          })
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      return false;
    }
  }
  
  // Par défaut, utiliser le mode direct (liens wa.me)
  console.log('📱 WhatsApp en mode direct:', {
    to: formattedNumber,
    preview: message.message.substring(0, 100) + '...',
    link: `https://wa.me/${formattedNumber.replace('+', '')}?text=${encodeURIComponent(message.message)}`
  });
  
  return true;
}

// Fonction pour formater les numéros de téléphone
function formatPhoneNumber(phone: string): string {
  // Retirer tous les caractères non numériques
  let cleaned = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 0, c'est probablement un numéro français
  if (cleaned.startsWith('0')) {
    cleaned = '33' + cleaned.substring(1);
  }
  
  // Ajouter le + si pas présent
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

// Fonction pour envoyer un message de groupe
export async function sendBroadcastMessage(
  numbers: string[],
  message: string
): Promise<{success: number, failed: number}> {
  let success = 0;
  let failed = 0;
  
  for (const number of numbers) {
    const sent = await sendWhatsAppMessage({
      to: number,
      message
    });
    
    if (sent) {
      success++;
    } else {
      failed++;
    }
    
    // Attendre un peu entre chaque envoi pour éviter le spam
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { success, failed };
}

// Fonction pour vérifier si un numéro WhatsApp est valide
export async function verifyWhatsAppNumber(phone: string): Promise<boolean> {
  // Ici on pourrait vérifier via l'API si le numéro a WhatsApp
  // Pour l'instant on fait une validation basique
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// Messages automatiques programmés
export const automatedMessages = {
  // Rappel 24h avant
  async sendDayBeforeReminder(reservation: any) {
    const message = whatsappTemplates.appointmentReminder({
      clientName: reservation.userName,
      time: reservation.time,
      services: reservation.services
    });
    
    return sendWhatsAppMessage({
      to: reservation.userPhone,
      message
    });
  },
  
  // Rappel 2h avant
  async sendTwoHourReminder(reservation: any) {
    const message = `⏰ Rappel: Votre RDV est dans 2h à ${reservation.time}\nLAIA SKIN Institut 💕`;
    
    return sendWhatsAppMessage({
      to: reservation.userPhone,
      message
    });
  },
  
  // Message de bienvenue pour nouveau client
  async sendWelcomeMessage(client: any) {
    const message = `Bienvenue chez LAIA SKIN ${client.name} ! 🌟\n\nNous sommes ravis de vous compter parmi nos clientes.\n\nEnregistrez ce numéro pour recevoir:\n✅ Confirmations de RDV\n🎁 Offres exclusives\n💕 Conseils beauté\n\nÀ très bientôt !\n*LAIA SKIN Institut*`;
    
    return sendWhatsAppMessage({
      to: client.phone,
      message
    });
  }
};

// Export des configurations pour l'interface admin
export const whatsappSettings = {
  enabled: false, // À activer après configuration
  provider: 'twilio', // ou 'meta' ou 'wati'
  automatedReminders: {
    dayBefore: true,
    twoHoursBefore: true,
    afterCare: true
  },
  marketingMessages: {
    birthday: true,
    promotions: false,
    newServices: false
  }
};