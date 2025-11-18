import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptConfig } from '@/lib/encryption';
import { log } from '@/lib/logger';

/**
 * Callback OAuth Treatwell
 * GET /api/admin/integrations/treatwell/callback
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Gérer les erreurs OAuth
    if (error) {
      log.error('Erreur OAuth Treatwell:', error);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=treatwell_${error}`;
      return NextResponse.redirect(redirectUrl);
    }

    if (!code || !state) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=treatwell_missing_params`;
      return NextResponse.redirect(redirectUrl);
    }

    // Décoder le state pour récupérer l'organization ID
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    const { organizationId, userId } = decodedState;

    if (!organizationId) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=treatwell_invalid_state`;
      return NextResponse.redirect(redirectUrl);
    }

    // Échanger le code contre un access token
    const treatwellClientId = process.env.TREATWELL_CLIENT_ID;
    const treatwellClientSecret = process.env.TREATWELL_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const redirectUri = `${baseUrl}/api/admin/integrations/treatwell/callback`;

    if (!treatwellClientId || !treatwellClientSecret) {
      log.error('Configuration Treatwell manquante');
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=treatwell_config_missing`;
      return NextResponse.redirect(redirectUrl);
    }

    // Appel à l'API Treatwell pour échanger le code
    const tokenResponse = await fetch('https://connect.treatwell.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: treatwellClientId,
        client_secret: treatwellClientSecret
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      log.error('Erreur échange token Treatwell:', errorData);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=treatwell_token_exchange_failed`;
      return NextResponse.redirect(redirectUrl);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Récupérer les informations du salon Treatwell
    const venueResponse = await fetch('https://api.treatwell.com/v1/venues/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    let venueId = null;
    let venueName = null;

    if (venueResponse.ok) {
      const venueData = await venueResponse.json();
      venueId = venueData.id;
      venueName = venueData.name;
    }

    // Chiffrer les tokens avant stockage
    const encryptedAccessToken = encryptConfig(access_token);
    const encryptedRefreshToken = refresh_token ? encryptConfig(refresh_token) : null;

    // Mettre à jour l'organisation avec les credentials Treatwell
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        treatwellConnected: true,
        treatwellAccessToken: encryptedAccessToken,
        treatwellRefreshToken: encryptedRefreshToken,
        treatwellTokenExpiry: new Date(Date.now() + expires_in * 1000),
        treatwellVenueId: venueId,
        treatwellVenueName: venueName
      }
    });

    log.info(`✅ Treatwell connecté pour organisation ${organizationId} (${venueName})`);

    // Rediriger vers les paramètres avec succès
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&success=treatwell_connected`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    log.error('Erreur callback Treatwell:', error);
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=site&error=treatwell_callback_error`;
    return NextResponse.redirect(redirectUrl);
  }
}
