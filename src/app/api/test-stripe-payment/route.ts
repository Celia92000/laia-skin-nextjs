import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();

    // Vérifier que la clé Stripe est configurée
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Clé Stripe non configurée' },
        { status: 500 }
      );
    }

    // Initialiser Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Créer une session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'eur',
            product_data: {
              name: 'Test Paiement Stripe',
              description: 'Test de configuration Stripe Production',
            },
            unit_amount: amount || 50, // montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/test-stripe?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/test-stripe?canceled=true`,
      metadata: {
        test: 'true',
        purpose: 'Configuration validation',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erreur lors de la création du paiement',
        type: error.type,
      },
      { status: 500 }
    );
  }
}
