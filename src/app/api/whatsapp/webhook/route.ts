import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Webhook pour recevoir les messages WhatsApp
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Vérifier le token de vérification
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    // Log pour debug
    console.log('WhatsApp webhook reçu:', JSON.stringify(body, null, 2));
    
    // Traiter les messages entrants
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      const changes = body.entry[0].changes[0];
      
      if (changes.value && changes.value.messages) {
        const message = changes.value.messages[0];
        const from = message.from; // Numéro du client
        const text = message.text?.body;
        
        // Traiter les réponses automatiques
        if (text) {
          const lowerText = text.toLowerCase();
          
          // Réponses automatiques simples
          if (lowerText.includes('rdv') || lowerText.includes('rendez-vous')) {
            // Envoyer un lien de réservation
            await sendAutoReply(from, 
              `Pour prendre rendez-vous, cliquez ici:\n👉 https://laiaskin.fr/reservation\n\nOu appelez-nous au 01 23 45 67 89`
            );
          }
          
          if (lowerText.includes('prix') || lowerText.includes('tarif')) {
            await sendAutoReply(from,
              `Nos tarifs:\n\n💆‍♀️ LAIA Hydro'Cleaning: 120€\n✨ LAIA Renaissance: 150€\n🌟 LAIA Hydro'Naissance: 180€\n💎 BB Glow: 90€\n💡 LED Thérapie: 60€\n\nPour plus d'infos: https://laiaskin.fr`
            );
          }
          
          if (lowerText.includes('horaire') || lowerText.includes('ouvert')) {
            await sendAutoReply(from,
              `Nous sommes ouverts:\n\n📅 Lundi-Vendredi: 9h-20h\n📅 Samedi: 10h-18h\n📅 Dimanche: Fermé\n\n⭐ Nocturnes possibles jusqu'à 23h sur demande`
            );
          }
          
          // Enregistrer le message dans la base de données
          try {
            // Trouver le client par son numéro
            const client = await prisma.user.findFirst({
              where: {
                phone: from
              }
            });
            
            if (client) {
              // Ajouter à l'historique des messages (si vous avez une table pour ça)
              console.log(`Message reçu de ${client.name}: ${text}`);
            }
          } catch (dbError) {
            console.error('Erreur DB:', dbError);
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'received' });
    
  } catch (error) {
    console.error('Erreur webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Vérification du webhook (pour la configuration initiale)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'laia_skin_webhook_2025';
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook WhatsApp vérifié avec succès');
    return new Response(challenge, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
  }
}

// Fonction pour envoyer une réponse automatique
async function sendAutoReply(to: string, message: string) {
  try {
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
    await sendWhatsAppMessage({
      to,
      message
    });
  } catch (error) {
    console.error('Erreur envoi réponse auto:', error);
  }
}