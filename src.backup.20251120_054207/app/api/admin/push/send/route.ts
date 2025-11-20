import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
// import { getPrismaClient } from '@/lib/prisma';
// import { verifyAuth } from '@/lib/auth';
// import webpush from 'web-push';

// TEMPORAIREMENT DÉSACTIVÉ: Le modèle pushSubscription n'existe pas dans le schéma Prisma
// TODO: Ajouter le modèle pushSubscription dans schema.prisma si nécessaire

// Configurer web-push avec les clés VAPID
// const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
// const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
// const vapidEmail = process.env.VAPID_EMAIL || 'mailto:contact@laiaskin.com';

// if (vapidPublicKey && vapidPrivateKey) {
//   webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
// }

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
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { title, message, url, target } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      );
    }

    // Récupérer les subscriptions selon la cible
    let whereClause: any = {
      organizationId: decoded.organizationId
    };

    if (target === 'clients') {
      whereClause.user = { role: 'CLIENT' };
    } else if (target === 'staff') {
      whereClause.user = {
        role: { in: ['ORG_ADMIN', 'STAFF', 'RECEPTIONIST', 'LOCATION_MANAGER'] }
      };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause,
      select: {
        id: true,
        endpoint: true,
        auth: true,
        p256dh: true
      }
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Aucun abonné trouvé' },
        { status: 404 }
      );
    }

    // Préparer le payload de notification
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: url || '/' },
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Ouvrir'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ]
    });

    // Envoyer les notifications
    let sentCount = 0;
    const failedSubscriptions: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                auth: sub.auth,
                p256dh: sub.p256dh
              }
            },
            payload
          );
          sentCount++;
        } catch (error: any) {
          log.error(`[Push Send] Erreur pour ${sub.endpoint}:`, error.message);

          // Si la subscription est invalide (410 Gone), la supprimer
          if (error.statusCode === 410) {
            failedSubscriptions.push(sub.id);
          }
        }
      })
    );

    // Supprimer les subscriptions invalides
    if (failedSubscriptions.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: failedSubscriptions } }
      });
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedSubscriptions.length
    });
  } catch (error) {
    log.error('[Push Send] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des notifications' },
      { status: 500 }
    );
  }
  */
}
