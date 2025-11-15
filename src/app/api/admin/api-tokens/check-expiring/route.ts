import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkExpiringTokens } from '@/lib/api-token-manager';
import { log } from '@/lib/logger';

// GET - Vérifie les tokens qui vont expirer bientôt
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
    if (!auth.isValid || !auth.user || !allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const expiringTokens = await checkExpiringTokens(days);

    const sanitized = expiringTokens.map(token => ({
      id: token.id,
      service: token.service,
      name: token.name,
      expiresAt: token.expiresAt,
      daysLeft: token.expiresAt
        ? Math.ceil((new Date(token.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return NextResponse.json({
      count: expiringTokens.length,
      tokens: sanitized,
      message: `${expiringTokens.length} token(s) expirent dans les ${days} prochains jours`,
    });
  } catch (error) {
    log.error('Erreur vérification tokens expirants:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
