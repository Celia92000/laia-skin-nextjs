import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptConfig } from '@/lib/encryption';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = 'EUR', description, reservationId } = body;

    if (!amount || !reservationId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
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
      log.error('Erreur déchiffrement config Mollie:', error);
      return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
    }

    if (!config.apiKey) {
      return NextResponse.json({ error: 'Configuration Mollie incomplète' }, { status: 500 });
    }

    // Créer un paiement Mollie
    const paymentResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        amount: {
          currency: currency,
          value: amount.toFixed(2)
        },
        description: description || 'Paiement réservation',
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/paiement-reussi`,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/mollie/webhook`,
        metadata: {
          reservationId: reservationId,
          source: 'admin_panel'
        }
      })
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      log.error('Erreur création paiement Mollie:', error);
      return NextResponse.json({ error: 'Erreur de création de paiement Mollie' }, { status: 500 });
    }

    const paymentData = await paymentResponse.json();

    // Mettre à jour la réservation avec l'ID de paiement Mollie
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripePaymentId: paymentData.id // On réutilise ce champ pour stocker l'ID paiement Mollie
      }
    });

    return NextResponse.json({
      success: true,
      url: paymentData._links.checkout.href,
      paymentId: paymentData.id
    });

  } catch (error: any) {
    log.error('Erreur création paiement Mollie:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
