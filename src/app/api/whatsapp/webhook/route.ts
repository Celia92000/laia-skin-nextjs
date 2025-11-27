import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { log } from '@/lib/logger';

// Webhook pour recevoir les messages WhatsApp
export async function POST(request: Request) {
  try {
    const config = await getSiteConfig();
    const siteName = config.siteName || 'Mon Institut';
    const phone = config.phone || '06 XX XX XX XX';
    const website = config.customDomain || 'https://votre-institut.fr';

    const body = await request.json();
    
    // Vérifier le token de vérification
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    // Log pour debug
    log.info('WhatsApp webhook reçu:', JSON.stringify(body, null, 2));
    
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

          // Détecter si c'est un avis (note + commentaire)
          const ratingMatch = text.match(/(\d)[\s\/]*(?:sur[\s\/]*5|étoiles?|⭐)/i);
          const starCount = (text.match(/⭐/g) || []).length;

          if (ratingMatch || (starCount > 0 && starCount <= 5)) {
            // C'est probablement un avis !
            const rating = ratingMatch ? parseInt(ratingMatch[1]) : starCount;

            // Nettoyer le commentaire
            let comment = text.replace(/^[\s\S]*?(?:note|rating|étoiles?)[\s:]*\d[\s\/]*(?:sur[\s\/]*5|étoiles?)[\s\n]*/i, '');
            comment = comment.replace(/^⭐+[\s\n]*/, '').trim();

            try {
              // Trouver le client par son numéro
              const client = await prisma.user.findFirst({
                where: { phone: from },
                select: { id: true, name: true, organizationId: true }
              });

              if (client && client.organizationId) {
                // Trouver la dernière réservation complétée
                const lastReservation = await prisma.reservation.findFirst({
                  where: {
                    userId: client.id,
                    organizationId: client.organizationId,
                    status: { in: ['completed', 'confirmed'] }
                  },
                  orderBy: { date: 'desc' }
                });

                // Créer l'avis
                await prisma.review.create({
                  data: {
                    userId: client.id,
                    organizationId: client.organizationId,
                    reservationId: lastReservation?.id,
                    serviceName: lastReservation?.services ?
                      (typeof lastReservation.services === 'string' ?
                        JSON.parse(lastReservation.services)[0] :
                        lastReservation.services[0]) :
                      'Service',
                    rating,
                    comment,
                    satisfaction: rating,
                    source: 'whatsapp',
                    approved: false // Nécessite validation admin
                  }
                });

                // Envoyer un message de remerciement
                await sendAutoReply(from,
                  `✨ Merci ${client.name} !\n\nVotre avis ${rating}⭐ a bien été reçu.\n\nIl sera publié après validation. 🙏`
                );

                log.info(`📱 Avis WhatsApp reçu de ${client.name}: ${rating}⭐`);
              }
            } catch (reviewError) {
              log.error('Erreur création avis WhatsApp:', reviewError);
            }
          }
          // Réponses automatiques simples
          else if (lowerText.includes('rdv') || lowerText.includes('rendez-vous')) {
            // Envoyer un lien de réservation
            await sendAutoReply(from,
              `Pour prendre rendez-vous, cliquez ici:\n👉 ${website}/reservation\n\nOu appelez-nous au ${phone}`
            );
          }
          else if (lowerText.includes('prix') || lowerText.includes('tarif')) {
            await sendAutoReply(from,
              `Nos tarifs:\n\n💆‍♀️ Hydro'Cleaning: 120€\n✨ Renaissance: 150€\n🌟 Hydro'Naissance: 180€\n💎 BB Glow: 90€\n💡 LED Thérapie: 60€\n\nPour plus d'infos: ${website}`
            );
          }
          else if (lowerText.includes('horaire') || lowerText.includes('ouvert')) {
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
              log.info(`Message reçu de ${client.name}: ${text}`);
            }
          } catch (dbError) {
            log.error('Erreur DB:', dbError);
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'received' });
    
  } catch (error) {
    log.error('Erreur webhook WhatsApp:', error);
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
    log.info('Webhook WhatsApp vérifié avec succès');
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
    log.error('Erreur envoi réponse auto:', error);
  }
}