import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { decryptConfig } from '@/lib/encryption';
import { z } from 'zod';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';
import { getSiteConfig } from '@/lib/config-service';
import { createConnectedCheckoutSession } from '@/lib/stripe-connect-helper';
import { log } from '@/lib/logger';

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
      if (reservation.userId !== decoded.userId && (decoded.role as string) !== 'ADMIN') {
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

    // Récupérer l'organisation de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            slug: true,
            stripeConnectedAccountId: true,
            stripeChargesEnabled: true
          }
        }
      }
    });

    if (!user || !user.organization) {
      return NextResponse.json({
        error: 'Organisation introuvable'
      }, { status: 404 });
    }

    // Vérifier que l'organisation a Stripe Connect configuré
    if (!user.organization.stripeConnectedAccountId || !user.organization.stripeChargesEnabled) {
      return NextResponse.json({
        error: 'Stripe Connect n\'est pas configuré pour votre organisation. Veuillez le configurer dans Paramètres > Paiements.'
      }, { status: 400 });
    }

    // Récupérer l'email de l'utilisateur pour Stripe
    let customerEmail: string | undefined;
    if (reservation) {
      customerEmail = reservation.user.email;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { email: true }
      });
      customerEmail = user?.email;
    }

    // Créer une session Stripe Connect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    const session = await createConnectedCheckoutSession({
      organizationId: user.organization.id,
      amount: amount,
      description: description || `Paiement ${siteName}`,
      metadata: {
        userId: decoded.userId,
        reservationId: reservationId || '',
        productId: productId || '',
        ...metadata
      },
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/payment/cancel`,
      customerEmail: customerEmail
    });

    // Si c'est pour une réservation, mettre à jour avec l'ID de session Stripe
    if (reservationId && reservation) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          stripeSessionId: session.sessionId,
          paymentMethod: 'stripe',
          paymentStatus: 'pending'
        }
      });
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
      amountTotal: session.amountTotal,
      applicationFee: session.applicationFee
    });

  } catch (error: any) {
    log.error('Erreur création session Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
