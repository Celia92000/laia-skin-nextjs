import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import crypto from 'crypto';
import { log } from '@/lib/logger';

// Vérifier la signature du webhook Resend
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: NextRequest) {
  const config = await getSiteConfig();
  const email = config.email || 'contact@institut.fr';
  const phone = config.phone || '06 XX XX XX XX';
  const website = config.customDomain || 'https://votre-institut.fr';


  const prisma = await getPrismaClient();
  
  try {
    // Récupérer le body brut pour vérifier la signature
    const body = await request.text();
    const signature = request.headers.get('svix-signature') || 
                     request.headers.get('webhook-signature') || '';
    
    // Secret du webhook (à configurer dans Resend)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';
    
    // Vérifier la signature si configurée
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      log.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parser le JSON
    const data = JSON.parse(body);
    log.info('Webhook Resend reçu:', data);
    
    // Traiter selon le type d'événement
    switch (data.type) {
      case 'email.sent':
        // Email envoyé avec succès
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { 
              to: data.data.to?.[0] || '',
              createdAt: {
                gte: new Date(Date.now() - 60000) // Dans la dernière minute
              }
            },
            data: {
              status: 'sent',
              resendId: data.data.email_id
            }
          });
        }
        break;
        
      case 'email.delivered':
        // Email délivré
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { resendId: data.data.email_id },
            data: { status: 'delivered' }
          });
        }
        break;
        
      case 'email.opened':
        // Email ouvert
        if (data.data.email_id) {
          const email = await prisma.emailHistory.findFirst({
            where: { resendId: data.data.email_id }
          });

          if (email) {
            await prisma.emailHistory.update({
              where: { id: email.id },
              data: {
                status: 'opened',
                openedAt: email.openedAt || new Date(data.data.opened_at || Date.now()),
                openCount: (email.openCount || 0) + 1
              }
            });
          }
        }
        break;

      case 'email.clicked':
        // Lien cliqué
        if (data.data.email_id) {
          const email = await prisma.emailHistory.findFirst({
            where: { resendId: data.data.email_id }
          });

          if (email) {
            await prisma.emailHistory.update({
              where: { id: email.id },
              data: {
                status: 'clicked',
                clickedAt: email.clickedAt || new Date(data.data.clicked_at || Date.now()),
                clickCount: (email.clickCount || 0) + 1
              }
            });
          }
        }
        break;
        
      case 'email.bounced':
      case 'email.bounce':
        // Email rejeté
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { resendId: data.data.email_id },
            data: {
              status: 'bounced',
              errorMessage: data.data.bounce_type || 'Email bounced'
            }
          });
        }
        break;
        
      case 'email.received':
      case 'inbound':
        // Email reçu (réponse du client)
        log.info('Email entrant reçu:', data.data);

        const inboundEmail = data.data;
        if (inboundEmail) {
          // 🔒 Trouver l'organisation basée sur l'email destinataire
          const toEmail = inboundEmail.to?.[0] || inboundEmail.to_email || '${email}';
          const orgConfig = await prisma.organizationConfig.findFirst({
            where: { email: toEmail },
            select: { organizationId: true }
          });

          // Si on ne trouve pas l'org par email, utiliser l'organisation par défaut ou null
          const organizationId = orgConfig?.organizationId || null;

          // Enregistrer l'email entrant
          await prisma.emailHistory.create({
            data: {
              from: inboundEmail.from || inboundEmail.from_email || '',
              to: toEmail,
              subject: inboundEmail.subject || 'Sans objet',
              content: inboundEmail.html || inboundEmail.text || inboundEmail.body || '',
              direction: 'incoming',
              status: 'received',
              resendId: inboundEmail.email_id || inboundEmail.id,
              createdAt: inboundEmail.created_at ? new Date(inboundEmail.created_at) : new Date(),
              organizationId: organizationId || undefined
            }
          });

          log.info('Email entrant enregistré');
        }
        break;
        
      default:
        log.info('Type d\'événement non géré:', data.type);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    log.error('Erreur webhook Resend:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

// Pour recevoir les emails entrants, il faut aussi supporter GET (pour la vérification)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook Resend configuré'
  });
}