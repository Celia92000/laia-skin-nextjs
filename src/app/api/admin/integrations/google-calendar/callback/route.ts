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
        new URL('/admin/settings?error=google_auth_failed', request.url)
      );
    }

    // Décoder le state pour récupérer l'organizationId
    const { organizationId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Échanger le code d'autorisation contre un access token
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/google-calendar/callback`;

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Configuration Google manquante');
    }

    // Documentation: https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code: code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      log.error('Erreur échange token Google:', errorData);
      throw new Error('Impossible d\'obtenir le token Google');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Récupérer les informations du compte Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const userInfo = await userInfoResponse.json();
    const email = userInfo.email;

    // Récupérer le calendrier principal
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const calendarData = await calendarResponse.json();
    const primaryCalendar = calendarData.items?.find((cal: any) => cal.primary);
    const calendarId = primaryCalendar?.id || 'primary';

    // Sauvegarder dans la base de données
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        googleCalendarConnected: true,
        googleCalendarAccessToken: encryptConfig(access_token),
        googleCalendarRefreshToken: refresh_token ? encryptConfig(refresh_token) : null,
        googleCalendarTokenExpiry: new Date(Date.now() + expires_in * 1000),
        googleCalendarId: calendarId,
        googleCalendarEmail: email
      }
    });

    // Rediriger vers la page de paramètres avec succès
    return NextResponse.redirect(
      new URL('/admin/settings?success=google_calendar_connected&tab=integrations', request.url)
    );

  } catch (error: any) {
    log.error('Erreur callback Google Calendar:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=google_callback_failed', request.url)
    );
  } finally {
    await prisma.$disconnect();
  }
}
