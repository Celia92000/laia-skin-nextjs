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
        sumupConnected: true,
        sumupMerchantCode: true,
        sumupCurrency: true
      }
    });

    return NextResponse.json({
      connected: org?.sumupConnected || false,
      merchantCode: org?.sumupMerchantCode,
      currency: org?.sumupCurrency
    });
  } catch (error: any) {
    log.error('Erreur GET SumUp status:', error);
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

    // Récupérer les credentials SumUp depuis les variables d'environnement
    const sumupClientId = process.env.SUMUP_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/sumup/callback`;

    if (!sumupClientId) {
      return NextResponse.json({
        error: 'SumUp OAuth non configuré. Contactez le support LAIA.'
      }, { status: 500 });
    }

    // Générer un state pour la sécurité OAuth
    const state = Buffer.from(JSON.stringify({
      organizationId,
      timestamp: Date.now()
    })).toString('base64');

    // Construire l'URL d'autorisation SumUp
    // Documentation: https://developer.sumup.com/docs/oauth/
    const authUrl = new URL('https://api.sumup.com/authorize');
    authUrl.searchParams.set('client_id', sumupClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'payments transactions.history user.profile');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error: any) {
    log.error('Erreur SumUp OAuth:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
