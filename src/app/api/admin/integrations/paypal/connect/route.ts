import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: payload.organizationId },
      select: {
        paypalConnected: true,
        paypalEmail: true,
        paypalMerchantId: true
      }
    });

    return NextResponse.json({
      connected: org?.paypalConnected || false,
      email: org?.paypalEmail,
      merchantId: org?.paypalMerchantId
    });
  } catch (error: any) {
    log.error('Erreur GET PayPal status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier le token JWT
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { organizationId } = payload;

    // Récupérer les credentials PayPal depuis les variables d'environnement
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/paypal/callback`;

    if (!paypalClientId) {
      return NextResponse.json({
        error: 'PayPal OAuth non configuré. Contactez le support LAIA.'
      }, { status: 500 });
    }

    // Générer un state pour la sécurité OAuth
    const state = Buffer.from(JSON.stringify({
      organizationId,
      timestamp: Date.now()
    })).toString('base64');

    // Construire l'URL d'autorisation PayPal
    // Documentation: https://developer.paypal.com/api/rest/authentication/
    const authUrl = new URL('https://www.paypal.com/connect');
    authUrl.searchParams.set('flowEntry', 'static');
    authUrl.searchParams.set('client_id', paypalClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email https://uri.paypal.com/services/payments/payment https://uri.paypal.com/services/payments/realtimepayment');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error: any) {
    log.error('Erreur PayPal OAuth:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
