import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAuthorizationUrl } from '@/lib/google-business-api';
import { log } from '@/lib/logger';

/**
 * GET /api/auth/google-business/authorize
 * Génère l'URL d'autorisation Google OAuth2 et redirige l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ORG_ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Rôle insuffisant' }, { status: 403 });
    }

    // Générer l'URL d'autorisation Google
    const authUrl = getAuthorizationUrl(decoded.organizationId);

    log.info(`[Google OAuth] URL d'autorisation générée pour ${decoded.organizationId}`);

    return NextResponse.json({ authUrl });
  } catch (error) {
    log.error('Erreur génération URL autorisation Google:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
