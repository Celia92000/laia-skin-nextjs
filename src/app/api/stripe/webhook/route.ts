import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptConfig } from '@/lib/encryption';
import { generateInvoiceNumber, getNextBillingDate } from '@/lib/subscription-billing';
import { sendInvoiceEmail } from '@/lib/email-service';
import { getAddonById, parseOrganizationAddons } from '@/lib/addons';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    // Récupérer la configuration Stripe
    const stripeIntegration = await prisma.integration.findFirst({
      where: {
        type: 'stripe',
        enabled: true
      }
    });

    if (!stripeIntegration || !stripeIntegration.config) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 400 });
    }

    // Déchiffrer la configuration
    let config: any;
    try {
      config = decryptConfig(stripeIntegration.config as string);
    } catch (error) {
      return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
    }

    if (!config.webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret manquant' }, { status: 500 });
    }

    // Vérifier la signature du webhook
    const stripe = require('stripe')(config.secretKey);
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, config.webhookSecret);
    } catch (err: any) {
      console.error('Erreur de vérification webhook:', err);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Traiter les événements Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // Récupérer les métadonnées
        const reservationId = session.metadata?.reservationId;
        const userId = session.metadata?.userId;

        if (reservationId) {
          // 🔒 Récupérer la réservation avec son organizationId
          const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            select: { organizationId: true }
          });

          if (!reservation) {
            console.error(`Réservation ${reservationId} non trouvée`);
            break;
          }

          // Mettre à jour la réservation
          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'paid',
              paymentAmount: session.amount_total / 100,
              paymentDate: new Date(),
              stripePaymentId: session.payment_intent,
              paymentMethod: 'Stripe'
            }
          });

          // Créer une entrée dans Payment avec organizationId
          await prisma.payment.create({
            data: {
              type: 'reservation',
              reservationId: reservationId,
              userId: userId || session.customer_email || '',
              organizationId: reservation.organizationId, // 🔒 Sécurité multi-tenant
              amount: session.amount_total / 100, // Convertir de centimes en euros
              currency: session.currency,
              status: 'succeeded',
              paymentMethod: 'stripe',
              stripePaymentId: session.payment_intent,
              stripeSessionId: session.id,
              stripeCustomerId: session.customer,
              description: `Paiement réservation #${reservationId}`,
              metadata: JSON.stringify(session.metadata)
            }
          });
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;

        // Trouver la réservation associée
        const reservation = await prisma.reservation.findFirst({
          where: { stripePaymentId: paymentIntent.id }
        });

        if (reservation) {
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
              paymentStatus: 'paid'
            }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;

        // Trouver la réservation associée
        const failedReservation = await prisma.reservation.findFirst({
          where: { stripePaymentId: failedPayment.id }
        });

        if (failedReservation) {
          await prisma.reservation.update({
            where: { id: failedReservation.id },
            data: {
              paymentStatus: 'unpaid'
            }
          });
        }
        break;

      case 'charge.refunded':
        const refund = event.data.object;

        // Trouver le paiement associé
        const payment = await prisma.payment.findFirst({
          where: { stripeChargeId: refund.id }
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'refunded'
            }
          });

          // Si c'est une réservation, mettre à jour son statut
          if (payment.reservationId) {
            await prisma.reservation.update({
              where: { id: payment.reservationId },
              data: {
                paymentStatus: 'refunded'
              }
            });
          }
        }
        break;

      case 'invoice.payment_succeeded':
        // Paiement d'abonnement réussi (prélèvement SEPA)
        const invoice = event.data.object;

        // Trouver l'organisation via le customer ID Stripe
        const org = await prisma.organization.findFirst({
          where: { stripeCustomerId: invoice.customer }
        });

        if (org) {
          const invoiceNumber = generateInvoiceNumber();
          const amount = invoice.amount_paid / 100; // Convertir de centimes en euros

          // Générer les lignes de facture
          const lineItems = [];

          // Récupérer le prix du plan
          const planPrices: Record<string, number> = {
            SOLO: 49,
            DUO: 69,
            TEAM: 119,
            PREMIUM: 179
          };
          const basePlanPrice = planPrices[org.plan as keyof typeof planPrices] || 49;

          lineItems.push({
            description: `Abonnement ${org.plan}`,
            quantity: 1,
            unitPrice: basePlanPrice,
            total: basePlanPrice
          });

          // Ajouter les add-ons récurrents
          if (org.addons) {
            const addonsData = parseOrganizationAddons(org.addons);
            for (const addonId of addonsData.recurring) {
              const addon = getAddonById(addonId);
              if (addon) {
                lineItems.push({
                  description: `${addon.name} (mensuel)`,
                  quantity: 1,
                  unitPrice: addon.price,
                  total: addon.price
                });
              }
            }
          }

          // Créer la facture dans la base de données
          const newInvoice = await prisma.invoice.create({
            data: {
              organizationId: org.id,
              invoiceNumber,
              amount,
              plan: org.plan,
              status: 'PAID', // Paiement déjà réussi
              issueDate: new Date(),
              dueDate: new Date(), // Déjà payée
              paidAt: new Date(),
              description: `Abonnement ${org.plan} - Paiement mensuel`,
              metadata: {
                type: 'subscription',
                stripeInvoiceId: invoice.id,
                lineItems
              } as any
            }
          });

          // Mettre à jour la date de prochain prélèvement
          const nextBillingDate = getNextBillingDate(new Date());
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              lastBillingDate: new Date(),
              lastPaymentDate: new Date(),
              nextBillingDate,
              status: 'ACTIVE' // Passer en ACTIVE si c'était en TRIAL
            }
          });

          // Envoyer l'email de facture
          try {
            await sendInvoiceEmail({
              organizationName: org.name,
              ownerEmail: org.billingEmail || org.ownerEmail,
              invoiceNumber,
              amount,
              dueDate: new Date(),
              plan: org.plan,
              lineItems: lineItems as any,
            });
            console.log(`📧 Facture ${invoiceNumber} envoyée à ${org.billingEmail || org.ownerEmail}`);
          } catch (emailError) {
            console.error('⚠️ Erreur envoi email facture:', emailError);
          }

          console.log(`✅ Facture ${invoiceNumber} générée pour ${org.name} - ${amount}€`);
        }
        break;

      case 'invoice.payment_failed':
        // Paiement d'abonnement échoué
        const failedInvoice = event.data.object;

        const failedOrg = await prisma.organization.findFirst({
          where: { stripeCustomerId: failedInvoice.customer }
        });

        if (failedOrg) {
          // Marquer la dernière facture comme impayée
          await prisma.invoice.updateMany({
            where: {
              organizationId: failedOrg.id,
              status: 'PENDING'
            },
            data: {
              status: 'OVERDUE'
            }
          });

          // Mettre l'organisation en SUSPENDED
          await prisma.organization.update({
            where: { id: failedOrg.id },
            data: {
              status: 'SUSPENDED'
            }
          });

          console.log(`⚠️ Paiement échoué pour ${failedOrg.name} - Organisation suspendue`);
        }
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
