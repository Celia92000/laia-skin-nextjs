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
    const { apiKey, merchantCode, mode } = body;

    if (!apiKey || !merchantCode) {
      return NextResponse.json({ error: 'API Key et Merchant Code requis' }, { status: 400 });
    }

    // URL de base (SumUp n'a pas d'environnement sandbox distinct visible dans leur API publique)
    const baseUrl = 'https://api.sumup.com/v0.1';

    // Tester la connexion en récupérant les infos du merchant
    const merchantResponse = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!merchantResponse.ok) {
      const errorText = await merchantResponse.text();
      let errorMessage = 'Clé API SumUp invalide';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Si ce n'est pas du JSON, utiliser le message par défaut
      }
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const merchantData = await merchantResponse.json();

    // Vérifier que le merchant code correspond
    if (merchantData.merchant_code && merchantData.merchant_code !== merchantCode) {
      return NextResponse.json({
        error: 'Le Merchant Code ne correspond pas au compte'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie à SumUp',
      merchant: {
        merchantCode: merchantData.merchant_code,
        email: merchantData.email,
        country: merchantData.country,
        currency: merchantData.currency,
        mobilePhone: merchantData.mobile_phone,
        businessName: merchantData.doing_business_as?.business_name
      }
    });

  } catch (error: any) {
    log.error('Erreur test connexion SumUp:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors du test de connexion'
    }, { status: 500 });
  }
}
