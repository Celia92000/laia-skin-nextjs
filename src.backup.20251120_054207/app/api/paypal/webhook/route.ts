import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptConfig } from '@/lib/encryption';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    log.info('Webhook PayPal reçu:', event.event_type);

    // Récupérer la configuration PayPal
    const paypalIntegration = await prisma.integration.findFirst({
      where: {
        type: 'paypal',
        enabled: true
      }
    });

    if (!paypalIntegration || !paypalIntegration.config) {
      return NextResponse.json({ error: 'PayPal non configuré' }, { status: 400 });
    }

    // Traiter les événements PayPal
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'CHECKOUT.ORDER.APPROVED':
        const resource = event.resource;
        const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          // 🔒 Trouver la réservation avec organizationId
          const reservation = await prisma.reservation.findFirst({
            where: { stripePaymentId: orderId },
            select: { id: true, userId: true, organizationId: true, totalPrice: true }
          });

          if (reservation) {
            // Extraire le montant depuis les purchase_units ou amount
            let paymentAmount = 0;
            if (resource.purchase_units && resource.purchase_units[0]) {
              paymentAmount = parseFloat(resource.purchase_units[0].amount.value);
            } else if (resource.amount) {
              paymentAmount = parseFloat(resource.amount.value);
            }

            await prisma.reservation.update({
              where: { id: reservation.id },
              data: {
                paymentStatus: 'paid',
                paymentAmount: paymentAmount || reservation.totalPrice,
                paymentDate: new Date(),
                paymentMethod: 'PayPal'
              }
            });

            // 🔒 Créer une entrée dans Payment avec organizationId
            await prisma.payment.create({
              data: {
                type: 'reservation',
                reservationId: reservation.id,
                userId: reservation.userId,
                organizationId: reservation.organizationId, // 🔒 Sécurité multi-tenant
                amount: paymentAmount || reservation.totalPrice || 0,
                currency: 'EUR',
                status: 'succeeded',
                paymentMethod: 'paypal',
                stripePaymentId: orderId,
                description: `Paiement PayPal réservation #${reservation.id}`,
                metadata: JSON.stringify(event)
              }
            });
          }
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'CHECKOUT.ORDER.VOIDED':
        const failedOrderId = event.resource.id;

        // Trouver la réservation associée
        const failedReservation = await prisma.reservation.findFirst({
          where: { stripePaymentId: failedOrderId }
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

      default:
        log.info(`Événement PayPal non géré: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    log.error('Erreur webhook PayPal:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
