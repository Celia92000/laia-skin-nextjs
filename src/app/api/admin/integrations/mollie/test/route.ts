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
    const { apiKey, mode } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API requise' }, { status: 400 });
    }

    // Vérifier que la clé correspond au mode
    const keyPrefix = mode === 'test' ? 'test_' : 'live_';
    if (!apiKey.startsWith(keyPrefix)) {
      return NextResponse.json({
        error: `La clé doit commencer par ${keyPrefix} pour le mode ${mode}`
      }, { status: 400 });
    }

    // Tester la connexion en récupérant le profil
    const profileResponse = await fetch('https://api.mollie.com/v2/profiles/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      return NextResponse.json({
        error: error.detail || 'Clé API Mollie invalide'
      }, { status: 400 });
    }

    const profile = await profileResponse.json();

    // Récupérer aussi les méthodes de paiement disponibles
    const methodsResponse = await fetch('https://api.mollie.com/v2/methods', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    let methods = [];
    if (methodsResponse.ok) {
      const methodsData = await methodsResponse.json();
      methods = methodsData.count > 0 ? methodsData._embedded.methods.map((m: any) => m.description) : [];
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie à Mollie',
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        website: profile.website,
        status: profile.status,
        review: profile.review
      },
      availableMethods: methods
    });

  } catch (error: any) {
    log.error('Erreur test connexion Mollie:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors du test de connexion'
    }, { status: 500 });
  }
}
