import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
// import { getPrismaClient } from '@/lib/prisma';
// import { verifyAuth } from '@/lib/auth';

// TEMPORAIREMENT DÉSACTIVÉ: Le modèle pushSubscription n'existe pas dans le schéma Prisma
// TODO: Ajouter le modèle pushSubscription dans schema.prisma si nécessaire

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Push notifications temporairement désactivées - Modèle pushSubscription manquant' },
    { status: 501 }
  );

  /*
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { endpoint } = await request.json();
    const prisma = await getPrismaClient();

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: decoded.userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('[Push Unsubscribe] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors du désabonnement' },
      { status: 500 }
    );
  }
  */
}
