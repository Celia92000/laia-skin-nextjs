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

    // Déchiffrer la configuration
    let config: any;
    try {
      config = decryptConfig(paypalIntegration.config as string);
    } catch (error) {
      log.error('Erreur déchiffrement config PayPal:', error);
      return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
    }

    if (!config.clientId || !config.clientSecret) {
      return NextResponse.json({ error: 'Configuration PayPal incomplète' }, { status: 500 });
    }

    // URL de base selon le mode
    const baseUrl = config.mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    // 1. Obtenir un access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      log.error('Erreur authentification PayPal:', error);
      return NextResponse.json({ error: 'Erreur d\'authentification PayPal' }, { status: 500 });
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // 2. Créer une commande PayPal
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            },
            description: description || 'Paiement réservation',
            reference_id: reservationId
          }
        ],
        application_context: {
          brand_name: 'LAIA Skin Institut',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/paypal/capture?reservationId=${reservationId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/paiement-annule`
        }
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      log.error('Erreur création commande PayPal:', error);
      return NextResponse.json({ error: 'Erreur de création de commande PayPal' }, { status: 500 });
    }

    const orderData = await orderResponse.json();

    // Trouver le lien d'approbation
    const approveLink = orderData.links.find((link: any) => link.rel === 'approve');

    if (!approveLink) {
      return NextResponse.json({ error: 'Lien de paiement non trouvé' }, { status: 500 });
    }

    // Mettre à jour la réservation avec l'ID de commande PayPal
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripePaymentId: orderData.id // On réutilise ce champ pour stocker l'order ID PayPal
      }
    });

    return NextResponse.json({
      success: true,
      url: approveLink.href,
      orderId: orderData.id
    });

  } catch (error: any) {
    log.error('Erreur création commande PayPal:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
