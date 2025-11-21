import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    log.info('Webhook SumUp reçu:', body.event_type);

    // SumUp envoie un event_type dans le webhook
    const eventType = body.event_type;
    const checkout = body.checkout || body;

    // Trouver la réservation via checkout_reference
    const reservationId = checkout.checkout_reference || checkout.id;

    if (!reservationId) {
      log.info('Pas de checkout_reference dans le webhook SumUp');
      return NextResponse.json({ received: true });
    }

    // 🔒 Trouver la réservation avec organizationId
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { userId: true, organizationId: true }
    });

    if (!reservation) {
      log.info('Réservation non trouvée:', reservationId);
      return NextResponse.json({ received: true });
    }

    // Traiter selon le statut
    if (eventType === 'CHECKOUT_PAID' || checkout.status === 'PAID') {
      const paymentAmount = checkout.amount || checkout.total_amount;

      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          paymentStatus: 'paid',
          paymentAmount: paymentAmount,
          paymentDate: new Date(checkout.date || checkout.timestamp),
          stripePaymentId: checkout.id,
          paymentMethod: 'SumUp'
        }
      });

      // 🔒 Créer une entrée dans Payment avec organizationId
      await prisma.payment.create({
        data: {
          type: 'reservation',
          reservationId: reservationId,
          userId: reservation.userId,
          organizationId: reservation.organizationId, // 🔒 Sécurité multi-tenant
          amount: paymentAmount,
          currency: checkout.currency || 'EUR',
          status: 'succeeded',
          paymentMethod: 'sumup',
          stripePaymentId: checkout.id,
          description: `Paiement SumUp réservation #${reservationId}`,
          metadata: JSON.stringify(body)
        }
      });
    } else if (eventType === 'CHECKOUT_FAILED' || checkout.status === 'FAILED') {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          paymentStatus: 'unpaid'
        }
      });
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    log.error('Erreur webhook SumUp:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
