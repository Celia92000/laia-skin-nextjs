import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

/**
 * API Super-Admin - Créer un lien de paiement unique pour un client
 *
 * POST /api/super-admin/create-payment-link
 *
 * Body:
 * {
 *   customerEmail: string,
 *   amount: number,
 *   description: string
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

    // 🔒 Vérifier que c'est un SUPER_ADMIN
    const superAdmin = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        role: 'SUPER_ADMIN'
      }
    });

    if (!superAdmin) {
      return NextResponse.json({ error: 'Accès refusé - Super-admin uniquement' }, { status: 403 });
    }

    const { customerEmail, amount, description } = await request.json();

    // Validation
    if (!customerEmail || !amount || !description) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Créer une Stripe Checkout Session pour paiement unique
    // Le customer sera créé automatiquement par Stripe si l'email n'existe pas
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // Paiement unique
      customer_email: customerEmail,
      payment_method_types: ['card'], // Carte bancaire avec 3D Secure automatique
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
              description: 'Service ponctuel - LAIA Connect'
            },
            unit_amount: Math.round(amount * 100) // Montant en centimes
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        metadata: {
          type: 'one_time_service',
          createdBy: superAdmin.id,
          customerEmail,
          description
        }
      },
      metadata: {
        type: 'one_time_service',
        createdBy: superAdmin.id,
        customerEmail,
        description
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/canceled`,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      locale: 'fr'
    });

    console.log(`✅ Lien de paiement créé par ${superAdmin.email}:`);
    console.log(`   Email: ${customerEmail}`);
    console.log(`   Montant: ${amount}€`);
    console.log(`   Description: ${description}`);
    console.log(`   Session ID: ${checkoutSession.id}`);

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      amount,
      description
    });

  } catch (error: any) {
    console.error('❌ Erreur création lien de paiement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du lien' },
      { status: 500 }
    );
  }
}
