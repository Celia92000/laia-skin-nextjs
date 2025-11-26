import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getGoogleBusinessAccounts } from '@/lib/google-business-api';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/auth/google-business/callback
 * Callback OAuth2 Google - Reçoit le code d'autorisation et sauvegarde les tokens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // organizationId
    const error = searchParams.get('error');

    if (error) {
      log.error(`[Google OAuth] Erreur autorisation: ${error}`);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin?tab=reviews&google_error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Code ou state manquant' }, { status: 400 });
    }

    const organizationId = state;

    log.info(`[Google OAuth] Callback reçu pour ${organizationId}`);

    // Échanger le code contre des tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      throw new Error('Access token manquant');
    }

    // Calculer la date d'expiration
    const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // Sauvegarder les tokens dans la base de données
    await prisma.organizationConfig.updateMany({
      where: { organizationId },
      data: {
        googleBusinessConnected: true,
        googleBusinessAccessToken: tokens.access_token,
        googleBusinessRefreshToken: tokens.refresh_token || undefined,
        googleBusinessTokenExpiry: tokenExpiry,
        googleBusinessEmail: tokens.scope?.includes('email') ? 'email@example.com' : null, // TODO: récupérer le vrai email
      },
    });

    log.info(`[Google OAuth] Tokens sauvegardés pour ${organizationId}`);

    // Récupérer les comptes Google My Business et sauvegarder le premier
    try {
      // Créer un client OAuth2 temporaire avec les tokens
      const { google } = require('googleapis');
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials(tokens);

      // Récupérer les comptes
      const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth: oauth2Client });
      const accountsResponse = await mybusiness.accounts.list();
      const accounts = accountsResponse.data.accounts || [];

      if (accounts.length > 0) {
        const firstAccount = accounts[0];
        log.info(`[Google OAuth] Compte trouvé: ${firstAccount.name}`);

        // Sauvegarder l'ID du compte
        await prisma.organizationConfig.updateMany({
          where: { organizationId },
          data: {
            googleBusinessAccountId: firstAccount.name || undefined,
          },
        });
      }
    } catch (accountError) {
      log.error('[Google OAuth] Erreur récupération comptes:', accountError);
      // Ne pas bloquer si ça échoue
    }

    // Rediriger vers l'admin avec un message de succès
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin?tab=reviews&google_connected=true`
    );
  } catch (error) {
    log.error('[Google OAuth] Erreur callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin?tab=reviews&google_error=callback_failed`
    );
  }
}
