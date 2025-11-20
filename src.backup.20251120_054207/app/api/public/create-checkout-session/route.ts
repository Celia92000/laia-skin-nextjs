import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

const PLAN_PRICES = {
  SOLO: 49,
  DUO: 69,
  TEAM: 119,
  PREMIUM: 179
}

/**
 * POST /api/public/create-checkout-session
 * Créer une session Stripe Checkout pour le paiement
 */
export async function POST(request: Request) {
  try {
    const { planId, amount, leadId, customerEmail, metadata } = await request.json()

    if (!planId || !amount || !leadId || !customerEmail) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `LAIA Connect - Plan ${planId}`,
              description: `Abonnement mensuel ${PLAN_PRICES[planId as keyof typeof PLAN_PRICES]}€/mois + 30 jours d'essai gratuit`,
              images: ['https://laiaskin.com/logo.png'] // Remplacer par votre logo
            },
            unit_amount: amount * 100, // Montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&lead_id=${leadId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel?lead_id=${leadId}`,
      metadata: {
        leadId,
        planId,
        ...metadata
      },
      // Période d'essai de 30 jours
      subscription_data: undefined, // Pour l'instant, paiement unique
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      }
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    log.error('Erreur création session Stripe:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
