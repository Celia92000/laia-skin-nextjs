import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = req.headers.get('authorization');
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
    const now = new Date();

    // Trouver tous les posts planifiés dont l'heure est passée
    const postsToPublish = await prisma.socialMediaPost.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now
        }
      }
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun post à publier',
        count: 0
      });
    }

    // Mettre à jour les posts en statut "published"
    const updatePromises = postsToPublish.map(post =>
      prisma.socialMediaPost.update({
        where: { id: post.id },
        data: {
          status: 'published',
          publishedAt: now
        }
      })
    );

    await Promise.all(updatePromises);

    log.info(`✅ ${postsToPublish.length} posts publiés automatiquement`);

    return NextResponse.json({
      success: true,
      message: `${postsToPublish.length} posts publiés`,
      count: postsToPublish.length,
      posts: postsToPublish.map(p => ({
        id: p.id,
        title: p.title,
        platform: p.platform
      }))
    });

  } catch (error) {
    log.error('Erreur auto-publication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la publication automatique' },
      { status: 500 }
    );
  }
}

// GET endpoint pour vérifier les posts à publier sans les publier
export async function GET(req: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = req.headers.get('authorization');
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
    const now = new Date();

    const postsToPublish = await prisma.socialMediaPost.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now
        }
      },
      select: {
        id: true,
        title: true,
        platform: true,
        scheduledDate: true
      }
    });

    return NextResponse.json({
      count: postsToPublish.length,
      posts: postsToPublish
    });

  } catch (error) {
    log.error('Erreur vérification auto-publication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
