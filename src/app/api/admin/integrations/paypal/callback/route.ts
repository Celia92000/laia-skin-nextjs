import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encryptConfig } from '@/lib/encryption';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/admin/settings?error=paypal_auth_failed', request.url)
      );
    }

    // Décoder le state pour récupérer l'organizationId
    const { organizationId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Échanger le code d'autorisation contre un access token
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/paypal/callback`;

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('Configuration PayPal manquante');
    }

    // Documentation: https://developer.paypal.com/api/rest/reference/identity/
    const tokenResponse = await fetch('https://api.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      log.error('Erreur échange token PayPal:', errorData);
      throw new Error('Impossible d\'obtenir le token PayPal');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Récupérer les informations du compte PayPal
    const userInfoResponse = await fetch('https://api.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const userInfo = await userInfoResponse.json();
    const merchantId = userInfo.user_id || userInfo.payer_id;
    const email = userInfo.email || userInfo.emails?.[0]?.value;

    // Sauvegarder dans la base de données
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        paypalConnected: true,
        paypalAccessToken: encryptConfig(access_token),
        paypalRefreshToken: refresh_token ? encryptConfig(refresh_token) : null,
        paypalTokenExpiry: new Date(Date.now() + expires_in * 1000),
        paypalMerchantId: merchantId,
        paypalEmail: email
      }
    });

    // Rediriger vers la page de paramètres avec succès
    return NextResponse.redirect(
      new URL('/admin/settings?success=paypal_connected&tab=integrations', request.url)
    );

  } catch (error: any) {
    log.error('Erreur callback PayPal:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=paypal_callback_failed', request.url)
    );
  } finally {
    await prisma.$disconnect();
  }
}
