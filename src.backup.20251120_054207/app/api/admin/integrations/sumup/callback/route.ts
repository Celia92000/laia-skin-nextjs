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
        new URL('/admin/settings?error=sumup_auth_failed', request.url)
      );
    }

    // Décoder le state pour récupérer l'organizationId
    const { organizationId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Échanger le code d'autorisation contre un access token
    const sumupClientId = process.env.SUMUP_CLIENT_ID;
    const sumupClientSecret = process.env.SUMUP_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/sumup/callback`;

    if (!sumupClientId || !sumupClientSecret) {
      throw new Error('Configuration SumUp manquante');
    }

    // Documentation: https://developer.sumup.com/docs/authorization/
    const tokenResponse = await fetch('https://api.sumup.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: sumupClientId,
        client_secret: sumupClientSecret,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      log.error('Erreur échange token SumUp:', errorData);
      throw new Error('Impossible d\'obtenir le token SumUp');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Récupérer les informations du compte SumUp
    const userInfoResponse = await fetch('https://api.sumup.com/v0.1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const userInfo = await userInfoResponse.json();
    const merchantCode = userInfo.merchant_code;
    const currency = userInfo.merchant_profile?.default_currency || 'EUR';

    // Sauvegarder dans la base de données
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        sumupConnected: true,
        sumupAccessToken: encryptConfig(access_token),
        sumupRefreshToken: refresh_token ? encryptConfig(refresh_token) : null,
        sumupTokenExpiry: new Date(Date.now() + expires_in * 1000),
        sumupMerchantCode: merchantCode,
        sumupCurrency: currency
      }
    });

    // Rediriger vers la page de paramètres avec succès
    return NextResponse.redirect(
      new URL('/admin/settings?success=sumup_connected&tab=integrations', request.url)
    );

  } catch (error: any) {
    log.error('Erreur callback SumUp:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=sumup_callback_failed', request.url)
    );
  } finally {
    await prisma.$disconnect();
  }
}
