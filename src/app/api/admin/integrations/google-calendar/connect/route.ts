import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: payload.organizationId },
      select: {
        googleCalendarConnected: true,
        googleCalendarEmail: true,
        googleCalendarId: true
      }
    });

    return NextResponse.json({
      connected: org?.googleCalendarConnected || false,
      email: org?.googleCalendarEmail,
      calendarId: org?.googleCalendarId
    });
  } catch (error: any) {
    log.error('Erreur GET Google Calendar status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier le token JWT
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { organizationId } = payload;

    // Récupérer les credentials Google depuis les variables d'environnement
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/google-calendar/callback`;

    if (!googleClientId) {
      return NextResponse.json({
        error: 'Google Calendar OAuth non configuré. Contactez le support LAIA.'
      }, { status: 500 });
    }

    // Générer un state pour la sécurité OAuth
    const state = Buffer.from(JSON.stringify({
      organizationId,
      timestamp: Date.now()
    })).toString('base64');

    // Construire l'URL d'autorisation Google
    // Documentation: https://developers.google.com/calendar/api/guides/auth
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', googleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email');
    authUrl.searchParams.set('access_type', 'offline'); // Pour obtenir un refresh token
    authUrl.searchParams.set('prompt', 'consent'); // Force l'écran de consentement pour obtenir refresh token
    authUrl.searchParams.set('state', state);

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error: any) {
    log.error('Erreur Google Calendar OAuth:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
