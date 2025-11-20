import { NextResponse } from 'next/server';
import { isAdminRole } from '@/lib/admin-roles';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !isAdminRole(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, clientSecret, mode } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Client ID et Client Secret requis' }, { status: 400 });
    }

    // URL de base selon le mode
    const baseUrl = mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    // 1. Obtenir un access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      return NextResponse.json({
        error: error.error_description || 'Identifiants PayPal invalides'
      }, { status: 400 });
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // 2. Vérifier le compte en récupérant les infos
    const accountResponse = await fetch(`${baseUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    let accountInfo = null;
    if (accountResponse.ok) {
      accountInfo = await accountResponse.json();
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie à PayPal',
      mode: mode,
      account: accountInfo ? {
        userId: accountInfo.user_id,
        email: accountInfo.emails?.[0]?.value,
        name: accountInfo.name,
        accountType: accountInfo.account_type,
        verified: accountInfo.verified_account
      } : null
    });

  } catch (error: any) {
    log.error('Erreur test connexion PayPal:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors du test de connexion'
    }, { status: 500 });
  }
}
