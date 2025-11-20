import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptConfig } from '@/lib/encryption';
import { log } from '@/lib/logger';

/**
 * Callback OAuth Planity
 * GET /api/admin/integrations/planity/callback
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Gérer les erreurs OAuth
    if (error) {
      log.error('Erreur OAuth Planity:', error);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=planity_${error}`;
      return NextResponse.redirect(redirectUrl);
    }

    if (!code || !state) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=planity_missing_params`;
      return NextResponse.redirect(redirectUrl);
    }

    // Décoder le state pour récupérer l'organization ID
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    const { organizationId, userId } = decodedState;

    if (!organizationId) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=planity_invalid_state`;
      return NextResponse.redirect(redirectUrl);
    }

    // Échanger le code contre un access token
    const planityClientId = process.env.PLANITY_CLIENT_ID;
    const planityClientSecret = process.env.PLANITY_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const redirectUri = `${baseUrl}/api/admin/integrations/planity/callback`;

    if (!planityClientId || !planityClientSecret) {
      log.error('Configuration Planity manquante');
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=planity_config_missing`;
      return NextResponse.redirect(redirectUrl);
    }

    // Appel à l'API Planity pour échanger le code
    const tokenResponse = await fetch('https://oauth.planity.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: planityClientId,
        client_secret: planityClientSecret
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      log.error('Erreur échange token Planity:', errorData);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=planity_token_exchange_failed`;
      return NextResponse.redirect(redirectUrl);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Récupérer les informations du compte Planity
    const businessResponse = await fetch('https://api.planity.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    let businessId = null;
    let businessName = null;

    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      businessId = businessData.id;
      businessName = businessData.name;
    }

    // Chiffrer les tokens avant stockage
    const encryptedAccessToken = encryptConfig(access_token);
    const encryptedRefreshToken = refresh_token ? encryptConfig(refresh_token) : null;

    // Mettre à jour l'organisation avec les credentials Planity
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        planityConnected: true,
        planityAccessToken: encryptedAccessToken,
        planityRefreshToken: encryptedRefreshToken,
        planityTokenExpiry: new Date(Date.now() + expires_in * 1000),
        planityBusinessId: businessId,
        planityBusinessName: businessName
      }
    });

    log.info(`✅ Planity connecté pour organisation ${organizationId} (${businessName})`);

    // Rediriger vers les paramètres avec succès
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&success=planity_connected`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    log.error('Erreur callback Planity:', error);
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=planity_callback_error`;
    return NextResponse.redirect(redirectUrl);
  }
}
