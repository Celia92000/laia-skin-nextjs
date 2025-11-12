import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

/**
 * API - Créer un paiement unique (migration de données, services ponctuels)
 *
 * POST /api/create-one-time-payment
 *
 * Body:
 * {
 *   amount: number,        // Montant en euros
 *   description: string,   // Description du service
 *   metadata?: object      // Métadonnées optionnelles
 * }
 */
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Récupérer l'utilisateur avec son organization
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            stripeCustomerId: true
          }
        }
      }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { amount, description, metadata } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description requise' }, { status: 400 });
    }

    // Récupérer ou créer le customer Stripe
    let stripeCustomerId = user.organization?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Créer un nouveau customer Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.organization?.name || user.name,
        metadata: {
          organizationId: user.organizationId,
          userId: user.id
        }
      });

      stripeCustomerId = customer.id;

      // Sauvegarder le customer ID dans l'organisation
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: { stripeCustomerId: customer.id }
      });
    }

    // Créer une Stripe Checkout Session pour paiement unique
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // ⚠️ Mode 'payment' pour paiement unique (pas abonnement)
      customer: stripeCustomerId,
      payment_method_types: ['card'], // Carte bancaire uniquement pour paiements ponctuels
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
              description: 'Paiement unique - LAIA Connect'
            },
            unit_amount: Math.round(amount * 100) // Montant en centimes
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        metadata: {
          organizationId: user.organizationId,
          userId: user.id,
          type: 'one_time_payment',
          ...metadata
        }
      },
      metadata: {
        organizationId: user.organizationId,
        userId: user.id,
        type: 'one_time_payment',
        description,
        ...metadata
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/payments?canceled=true`,
      billing_address_collection: 'auto',
      locale: 'fr'
    });

    console.log(`✅ Paiement unique créé: ${checkoutSession.id} - ${amount}€ - ${description}`);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });

  } catch (error: any) {
    console.error('❌ Erreur création paiement unique:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
