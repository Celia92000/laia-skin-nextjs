import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Clé Stripe non configurée' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
    });
  } catch (error: any) {
    console.error('Erreur récupération session Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de la session' },
      { status: 500 }
    );
  }
}
