import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * Initier la connexion OAuth avec Treatwell
 * POST /api/admin/integrations/treatwell/connect
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur et son organisation
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est bien propriétaire ou admin
    if (!['ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Construire l'URL OAuth de Treatwell
    const treatwellClientId = process.env.TREATWELL_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const redirectUri = `${baseUrl}/api/admin/integrations/treatwell/callback`;

    if (!treatwellClientId) {
      return NextResponse.json(
        { error: 'Configuration Treatwell manquante. Contactez le support.' },
        { status: 500 }
      );
    }

    // State contient l'ID de l'organisation (pour le retrouver au callback)
    const state = Buffer.from(JSON.stringify({
      organizationId: user.organization.id,
      userId: user.id
    })).toString('base64');

    // URL d'autorisation Treatwell OAuth 2.0
    const authUrl = new URL('https://connect.treatwell.com/oauth/authorize');
    authUrl.searchParams.set('client_id', treatwellClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'appointments:read appointments:write venues:read');
    authUrl.searchParams.set('state', state);

    log.info(`🔗 Redirection OAuth Treatwell pour ${user.organization.name}`);

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error) {
    log.error('Erreur connexion Treatwell:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * Récupérer le statut de connexion Treatwell
 * GET /api/admin/integrations/treatwell/connect
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            treatwellConnected: true,
            treatwellVenueId: true,
            treatwellVenueName: true
          }
        }
      }
    });

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      connected: user.organization.treatwellConnected || false,
      venueId: user.organization.treatwellVenueId,
      venueName: user.organization.treatwellVenueName
    });

  } catch (error) {
    log.error('Erreur récupération statut Treatwell:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
