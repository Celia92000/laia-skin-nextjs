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

    // Récupérer la configuration SumUp
    const sumupIntegration = await prisma.integration.findFirst({
      where: {
        type: 'sumup',
        enabled: true
      }
    });

    if (!sumupIntegration || !sumupIntegration.config) {
      return NextResponse.json({ error: 'SumUp non configuré' }, { status: 400 });
    }

    // Déchiffrer la configuration
    let config: any;
    try {
      config = decryptConfig(sumupIntegration.config as string);
    } catch (error) {
      log.error('Erreur déchiffrement config SumUp:', error);
      return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
    }

    if (!config.apiKey || !config.merchantCode) {
      return NextResponse.json({ error: 'Configuration SumUp incomplète' }, { status: 500 });
    }

    // Créer un checkout SumUp
    const checkoutResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        checkout_reference: reservationId,
        amount: amount,
        currency: currency,
        merchant_code: config.merchantCode,
        description: description || 'Paiement réservation',
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/paiement-reussi`,
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/paiement-reussi`
      })
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      log.error('Erreur création checkout SumUp:', errorText);
      let errorMessage = 'Erreur de création de checkout SumUp';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Si ce n'est pas du JSON, utiliser le message par défaut
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const checkoutData = await checkoutResponse.json();

    // Mettre à jour la réservation avec l'ID de checkout SumUp
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripePaymentId: checkoutData.id // On réutilise ce champ pour stocker l'ID checkout SumUp
      }
    });

    // SumUp retourne l'URL dans checkoutData
    const checkoutUrl = `https://pay.sumup.com/checkout/${checkoutData.id}`;

    return NextResponse.json({
      success: true,
      url: checkoutUrl,
      checkoutId: checkoutData.id
    });

  } catch (error: any) {
    log.error('Erreur création checkout SumUp:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
