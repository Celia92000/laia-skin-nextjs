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

    const subscription = await request.json();
    const prisma = await getPrismaClient();

    // Vérifier si une subscription existe déjà pour cet endpoint
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      // Mettre à jour
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId: decoded.userId,
          organizationId: decoded.organizationId,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          expirationTime: subscription.expirationTime
        }
      });
    } else {
      // Créer
      await prisma.pushSubscription.create({
        data: {
          userId: decoded.userId,
          organizationId: decoded.organizationId,
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          expirationTime: subscription.expirationTime
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('[Push Subscribe] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    );
  }
  */
}
