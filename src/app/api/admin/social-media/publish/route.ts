import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { SocialMediaPublisher } from '@/lib/social-media-publisher';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer l'organizationId de l'utilisateur
    const organizationId = decoded.organizationId;

    const body = await request.json();
    const { postId, platform, content, imageUrl, hashtags, link } = body;

    let publishData: any;
    let publishPlatform: string;
    let postToUpdate: any = null;

    // Si un postId est fourni, récupérer depuis la base de données
    if (postId) {
      const post = await prisma.socialMediaPost.findUnique({
        where: { id: postId }
      }).catch(() => null);

      if (!post) {
        return NextResponse.json({ error: 'Publication non trouvée' }, { status: 404 });
      }

      if (!post.platform) {
        return NextResponse.json({
          error: 'Aucune plateforme sélectionnée pour cette publication'
        }, { status: 400 });
      }

      publishPlatform = post.platform;
      publishData = {
        content: post.content,
        hashtags: post.hashtags ?? undefined,
        imageUrl: post.mediaUrls ?
          (typeof post.mediaUrls === 'string' ? JSON.parse(post.mediaUrls)[0] : post.mediaUrls[0])
          : undefined,
        link: post.links ?
          (typeof post.links === 'string' ? JSON.parse(post.links)[0] : post.links[0])
          : undefined
      };
      postToUpdate = post;
    }
    // Sinon, publication directe avec les données fournies
    else {
      if (!platform || !content) {
        return NextResponse.json({
          error: 'Plateforme et contenu requis'
        }, { status: 400 });
      }

      publishPlatform = platform;
      publishData = {
        content,
        hashtags: hashtags ?? undefined,
        imageUrl: imageUrl ?? undefined,
        link: link ?? undefined
      };

      // Créer un enregistrement dans la base de données
      postToUpdate = await prisma.socialMediaPost.create({
        data: {
          title: content.substring(0, Math.min(50, content.length)),
          content,
          platform: publishPlatform,
          hashtags: hashtags ?? null,
          mediaUrls: imageUrl ? JSON.stringify([imageUrl]) : null,
          links: link ? JSON.stringify([link]) : null,
          scheduledDate: new Date(),
          status: 'publishing',
          userId: decoded.userId ?? null,
        }
      }).catch((err) => {
        log.error('Erreur création post:', err);
        return null;
      });
    }

    // Publier sur la plateforme avec l'organizationId
    const result = await SocialMediaPublisher.publish(publishPlatform, publishData, organizationId);

    if (result.success && postToUpdate) {
      // Mettre à jour le statut de la publication
      await prisma.socialMediaPost.update({
        where: { id: postToUpdate.id },
        data: {
          status: 'published',
          publishedAt: new Date(),
          apiPostId: result.postId ?? null,
          notes: `${postToUpdate.notes ?? ''}\n\nPublié avec succès le ${new Date().toLocaleString('fr-FR')} - ID: ${result.postId ?? 'N/A'}`
        }
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: `Publication réussie sur ${result.platform}`,
        postId: result.postId
      });
    } else if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Publication réussie sur ${result.platform}`,
        postId: result.postId
      });
    } else {
      // Marquer comme échec dans la BDD si le post existe
      if (postToUpdate) {
        await prisma.socialMediaPost.update({
          where: { id: postToUpdate.id },
          data: {
            status: 'failed',
            errorMessage: result.error ?? 'Erreur inconnue'
          }
        }).catch(() => null);
      }

      return NextResponse.json({
        success: false,
        error: result.error ?? 'Erreur lors de la publication'
      }, { status: 500 });
    }

  } catch (error: any) {
    log.error('Erreur publication:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Vérifier les plateformes configurées
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer l'organizationId de l'utilisateur
    const organizationId = decoded.organizationId;

    const configuredPlatforms = await SocialMediaPublisher.getConfiguredPlatforms(organizationId);

    const platformsStatus = {
      Instagram: await SocialMediaPublisher.isPlatformConfigured('Instagram', organizationId),
      Facebook: await SocialMediaPublisher.isPlatformConfigured('Facebook', organizationId),
      LinkedIn: await SocialMediaPublisher.isPlatformConfigured('LinkedIn', organizationId),
      Twitter: await SocialMediaPublisher.isPlatformConfigured('Twitter', organizationId),
      Snapchat: await SocialMediaPublisher.isPlatformConfigured('Snapchat', organizationId),
      TikTok: await SocialMediaPublisher.isPlatformConfigured('TikTok', organizationId),
    };

    return NextResponse.json({
      configured: configuredPlatforms,
      status: platformsStatus
    });

  } catch (error: any) {
    log.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
