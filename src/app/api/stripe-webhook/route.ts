import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPrismaClient } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // 🔒 Récupérer l'organizationId depuis les metadata Stripe
        const orderId = session.metadata?.orderId;
        const organizationId = session.metadata?.organizationId;

        if (!organizationId) {
          console.error('⚠️ organizationId manquant dans les metadata Stripe');
          break;
        }

        if (orderId) {
          // 🔒 Vérifier que la commande appartient à cette organisation
          const order = await prisma.order.findFirst({
            where: {
              id: orderId,
              organizationId: organizationId
            }
          });

          if (!order) {
            console.error(`⚠️ Commande ${orderId} non trouvée pour l'organisation ${organizationId}`);
            break;
          }

          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'paid',
              paymentDate: new Date(),
              paymentMethod: 'card',
              transactionId: session.payment_intent as string,
              status: 'confirmed'
            }
          });

          // Si c'est une prestation, mettre à jour la réservation
          if (session.metadata?.orderType === 'service') {
            if (order.userId) {
              // 🔒 Trouver la réservation correspondante DANS CETTE ORGANISATION
              const recentReservation = await prisma.reservation.findFirst({
                where: {
                  userId: order.userId,
                  organizationId: organizationId,
                  paymentStatus: 'unpaid'
                },
                orderBy: { createdAt: 'desc' }
              });

              if (recentReservation) {
                await prisma.reservation.update({
                  where: { id: recentReservation.id },
                  data: {
                    paymentStatus: 'paid',
                    paymentDate: new Date(),
                    paymentMethod: 'card',
                    paymentAmount: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'confirmed'
                  }
                });
              }
            }
          }

          console.log(`✅ Paiement confirmé pour la commande ${orderId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // 🔒 Récupérer l'organizationId depuis les metadata
        const orderId = paymentIntent.metadata?.orderId;
        const organizationId = paymentIntent.metadata?.organizationId;

        if (!organizationId) {
          console.error('⚠️ organizationId manquant dans les metadata PaymentIntent');
          break;
        }

        if (orderId) {
          // 🔒 Vérifier que la commande appartient à cette organisation
          const order = await prisma.order.findFirst({
            where: {
              id: orderId,
              organizationId: organizationId
            }
          });

          if (!order) {
            console.error(`⚠️ Commande ${orderId} non trouvée pour l'organisation ${organizationId}`);
            break;
          }

          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'failed',
              status: 'cancelled'
            }
          });

          console.log(`❌ Paiement échoué pour la commande ${orderId}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        // 🔒 Récupérer l'organizationId depuis le payment_intent
        if (charge.payment_intent) {
          // Récupérer le PaymentIntent complet pour accéder aux metadata
          const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
          const organizationId = paymentIntent.metadata?.organizationId;

          if (!organizationId) {
            console.error('⚠️ organizationId manquant dans les metadata PaymentIntent');
            break;
          }

          // 🔒 Chercher les commandes UNIQUEMENT dans cette organisation
          const orders = await prisma.order.findMany({
            where: {
              transactionId: charge.payment_intent as string,
              organizationId: organizationId
            }
          });

          for (const order of orders) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'refunded',
                status: 'cancelled'
              }
            });
          }

          console.log(`💰 Remboursement effectué pour ${orders.length} commande(s)`);
        }
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Erreur webhook:', error);
    return NextResponse.json({
      error: error.message || 'Erreur webhook'
    }, { status: 500 });
  }
}
