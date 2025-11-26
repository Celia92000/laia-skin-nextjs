import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-session';
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';
import { syncGoogleReviews } from '@/lib/google-business-api';

export async function POST(request: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    // Vérifier l'authentification
    const user = await getCurrentUser();
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'organisation est connectée à Google My Business
    const orgConfig = await prisma.organizationConfig.findUnique({
      where: { organizationId: user.organizationId ?? undefined },
      select: {
        googleBusinessConnected: true,
        googleBusinessAccountId: true,
      },
    });

    if (!orgConfig || !orgConfig.googleBusinessConnected) {
      return NextResponse.json({
        error: 'Organisation non connectée à Google My Business. Veuillez d\'abord vous connecter.'
      }, { status: 400 });
    }

    // Synchroniser les avis avec l'API Google My Business
    log.info(`[Google Reviews Sync] Démarrage pour ${user.organizationId}`);

    const result = await syncGoogleReviews(user.organizationId);

    log.info(`[Google Reviews Sync] Terminé: ${result.synced} avis synchronisés, ${result.errors} erreurs`);

    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée: ${result.synced} avis synchronisés`,
      synced: result.synced,
      errors: result.errors,
      total: result.total
    });
  } catch (error) {
    log.error('Erreur synchronisation Google:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}
