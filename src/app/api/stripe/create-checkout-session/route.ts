import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';
import { getSiteConfig } from '@/lib/config-service';
import { isAdminRole } from '@/lib/admin-roles';
import { getStripeConfig } from '@/lib/stripe-config';

// Schéma de validation
const checkoutSchema = z.object({
  amount: z.number().positive('Le montant doit être positif').min(0.5, 'Montant minimum 0.50€'),
  currency: z.enum(['eur', 'usd', 'gbp']).default('eur'),
  description: z.string().min(1, 'Description requise').max(200),
  reservationId: z.string().optional(),
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: Request) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const email = config.email || 'contact@institut.fr';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const website = config.customDomain || 'https://votre-institut.fr';
  const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';


  try {
    // 🔒 Rate limiting : 5 paiements max par minute (protection anti-fraude)
    const ip = getClientIp(request);
    const { success, limit, remaining } = await checkStrictRateLimit(`payment:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: `Trop de requêtes. Veuillez réessayer dans 1 minute. (${remaining}/${limit} restantes)` },
        { status: 429 }
      );
    }

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

    // Valider les données avec Zod
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Données invalides',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    const {
      amount,
      currency,
      description,
      reservationId,
      productId,
      metadata = {}
    } = validationResult.data;

    // Si c'est pour une réservation, vérifier qu'elle existe et récupérer les infos
    let reservation = null;
    if (reservationId) {
      reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          user: true,
          service: true
        }
      });

      if (!reservation) {
        return NextResponse.json({
          error: 'Réservation non trouvée'
        }, { status: 404 });
      }

      // Vérifier que l'utilisateur a le droit de payer cette réservation
      if (reservation.userId !== decoded.userId && !isAdminRole(decoded.role)) {
        return NextResponse.json({
          error: 'Non autorisé à payer cette réservation'
        }, { status: 403 });
      }

      // Vérifier que la réservation n'est pas déjà payée
      if (reservation.paymentStatus === 'paid') {
        return NextResponse.json({
          error: 'Cette réservation est déjà payée'
        }, { status: 400 });
      }
    }

    // Récupérer la configuration Stripe depuis la BDD
    let stripeConfig;
    try {
      stripeConfig = await getStripeConfig();
    } catch (error: any) {
      return NextResponse.json({
        error: 'Stripe n\'est pas configuré. Veuillez configurer Stripe dans Paramètres > Intégrations.',
        details: error.message
      }, { status: 400 });
    }

    const secretKey = stripeConfig.secretKey;
    const publishableKey = stripeConfig.publishableKey;

    if (!secretKey || !publishableKey) {
      return NextResponse.json({
        error: 'Configuration Stripe incomplète'
      }, { status: 500 });
    }

    // Créer une session Stripe Checkout
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // Récupérer l'email du client depuis la réservation ou le token
    const customerEmail = reservation?.user?.email || decoded.email;

    const sessionData: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || 'Paiement ${siteName}',
              description: reservationId ? `Réservation #${reservationId}` : undefined,
            },
            unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        userId: decoded.userId,
        reservationId: reservationId || '',
        productId: productId || '',
        ...metadata
      },
    };

    // Ajouter l'email seulement s'il existe
    if (customerEmail) {
      sessionData.customer_email = customerEmail;
    }

    // Construire le body pour Stripe (format x-www-form-urlencoded avec objets imbriqués)
    const formData = new URLSearchParams();
    formData.append('mode', sessionData.mode);
    formData.append('success_url', sessionData.success_url);
    formData.append('cancel_url', sessionData.cancel_url);

    // Payment methods
    sessionData.payment_method_types.forEach((type: string) => {
      formData.append('payment_method_types[]', type);
    });

    // Line items
    formData.append('line_items[0][price_data][currency]', sessionData.line_items[0].price_data.currency);
    formData.append('line_items[0][price_data][unit_amount]', sessionData.line_items[0].price_data.unit_amount.toString());
    formData.append('line_items[0][price_data][product_data][name]', sessionData.line_items[0].price_data.product_data.name);
    if (sessionData.line_items[0].price_data.product_data.description) {
      formData.append('line_items[0][price_data][product_data][description]', sessionData.line_items[0].price_data.product_data.description);
    }
    formData.append('line_items[0][quantity]', sessionData.line_items[0].quantity.toString());

    // Metadata
    Object.entries(sessionData.metadata).forEach(([key, value]) => {
      formData.append(`metadata[${key}]`, String(value));
    });

    // Customer email
    if (customerEmail) {
      formData.append('customer_email', customerEmail);
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      console.error('Erreur Stripe:', error);
      return NextResponse.json({
        error: error.error?.message || 'Erreur lors de la création de la session de paiement'
      }, { status: 500 });
    }

    const session = await stripeResponse.json();

    // Mettre à jour le statut de l'intégration si elle existe
    const stripeIntegration = await prisma.integration.findFirst({
      where: { type: 'stripe' }
    });

    if (stripeIntegration) {
      await prisma.integration.update({
        where: { id: stripeIntegration.id },
        data: {
          status: 'connected',
          lastSync: new Date()
        }
      });
    }

    // Si c'est pour une réservation, mettre à jour avec l'ID de session Stripe
    if (reservationId && reservation) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          stripeSessionId: session.id,
          paymentMethod: 'stripe',
          paymentStatus: 'pending'
        }
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      publicKey: publishableKey
    });

  } catch (error: any) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
