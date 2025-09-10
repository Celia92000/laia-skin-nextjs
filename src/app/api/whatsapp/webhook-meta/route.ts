import { NextRequest, NextResponse } from 'next/server';

// Webhook pour recevoir les messages WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log pour debug
    console.log('Webhook WhatsApp reçu:', JSON.stringify(body, null, 2));

    // Traiter les messages entrants
    if (body.entry && body.entry[0]?.changes) {
      const changes = body.entry[0].changes;
      
      for (const change of changes) {
        if (change.field === 'messages') {
          const messages = change.value.messages;
          
          if (messages && messages.length > 0) {
            for (const message of messages) {
              console.log('Message reçu de:', message.from);
              console.log('Type:', message.type);
              
              if (message.type === 'text') {
                console.log('Contenu:', message.text.body);
                
                // Ici vous pouvez ajouter la logique pour traiter les messages
                // Par exemple, répondre automatiquement, créer un ticket, etc.
                await handleIncomingMessage({
                  from: message.from,
                  text: message.text.body,
                  timestamp: message.timestamp
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur webhook WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

// Vérification du webhook (pour la configuration initiale)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Vérifier le token
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook WhatsApp vérifié avec succès');
      // Renvoyer le challenge pour valider le webhook
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.error('Token de vérification invalide');
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Erreur vérification webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// Fonction pour traiter les messages entrants
async function handleIncomingMessage({ from, text, timestamp }: {
  from: string;
  text: string;
  timestamp: string;
}) {
  // Analyser le message
  const lowerText = text.toLowerCase();
  
  // Réponses automatiques simples
  if (lowerText.includes('bonjour') || lowerText.includes('salut')) {
    // Envoyer un message de bienvenue
    console.log('Message de bienvenue à envoyer à:', from);
  } else if (lowerText.includes('horaire') || lowerText.includes('ouvert')) {
    // Envoyer les horaires
    console.log('Horaires à envoyer à:', from);
  } else if (lowerText.includes('annuler') || lowerText.includes('modifier')) {
    // Rediriger vers le service client
    console.log('Demande de modification/annulation de:', from);
  }
  
  // Vous pouvez ajouter ici :
  // - Sauvegarde en base de données
  // - Notification à l'admin
  // - Réponse automatique via l'API WhatsApp
  // - Création d'un ticket support
}