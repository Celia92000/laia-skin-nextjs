import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';

// Initialiser Stripe (la clé sera dans .env)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' })
  : null;

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    if (!stripe) {
      // Si Stripe n'est pas configuré, retourner une erreur spécifique
      return NextResponse.json({
        error: 'Stripe not configured',
        message: 'Le paiement en ligne n\'est pas encore activé. Veuillez choisir un autre mode de paiement.'
      }, { status: 400 });
    }

    const body = await request.json();
    const { items, customerEmail, orderType, shippingCost, orderId } = body;

    // Créer les line items pour Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100) // Stripe utilise les centimes
      },
      quantity: item.quantity || 1
    }));

    // Ajouter les frais de livraison si présents (produits uniquement)
    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
            description: 'Livraison à domicile'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    // 🔒 Créer la session Stripe Checkout avec organizationId
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/commande/annulee`,
      metadata: {
        orderType,
        orderId: orderId || '',
        customerEmail,
        organizationId // 🔒 CRITIQUE : Pour identifier l'organisation dans le webhook
      },
      // Permet de sauvegarder les infos de paiement pour futurs achats
      payment_intent_data: {
        metadata: {
          orderType,
          orderId: orderId || '',
          organizationId // 🔒 CRITIQUE : Pour identifier l'organisation dans le webhook
        }
      },
      // Mode de facturation
      billing_address_collection: orderType === 'product' ? 'required' : 'auto',
      shipping_address_collection: orderType === 'product' ? {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'] // Pays européens francophones
      } : undefined,
      // Locale français
      locale: 'fr'
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    log.error('Erreur Stripe:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la création de la session de paiement'
    }, { status: 500 });
  }
}
