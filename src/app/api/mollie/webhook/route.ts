import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptConfig } from '@/lib/encryption';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentId = body.id;

    log.info('Webhook Mollie reçu pour payment:', paymentId);

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de paiement manquant' }, { status: 400 });
    }

    // Récupérer la configuration Mollie
    const mollieIntegration = await prisma.integration.findFirst({
      where: {
        type: 'mollie',
        enabled: true
      }
    });

    if (!mollieIntegration || !mollieIntegration.config) {
      return NextResponse.json({ error: 'Mollie non configuré' }, { status: 400 });
    }

    // Déchiffrer la configuration
    let config: any;
    try {
      config = decryptConfig(mollieIntegration.config as string);
    } catch (error) {
      return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
    }

    // Récupérer le paiement depuis Mollie
    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });

    if (!paymentResponse.ok) {
      return NextResponse.json({ error: 'Erreur lors de la récupération du paiement' }, { status: 500 });
    }

    const payment = await paymentResponse.json();
    const reservationId = payment.metadata?.reservationId;

    if (!reservationId) {
      log.info('Pas de reservationId dans les metadata Mollie');
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
    if (payment.status === 'paid') {
      const paymentAmount = parseFloat(payment.amount.value);

      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          paymentStatus: 'paid',
          paymentAmount: paymentAmount,
          paymentDate: new Date(payment.paidAt),
          stripePaymentId: paymentId,
          paymentMethod: 'Mollie'
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
          currency: payment.amount.currency,
          status: 'succeeded',
          paymentMethod: 'mollie',
          stripePaymentId: paymentId,
          description: `Paiement Mollie réservation #${reservationId}`,
          metadata: JSON.stringify(payment)
        }
      });
    } else if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          paymentStatus: 'unpaid'
        }
      });
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    log.error('Erreur webhook Mollie:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
