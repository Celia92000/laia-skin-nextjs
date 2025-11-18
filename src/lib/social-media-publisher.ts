// Service de publication automatique sur les réseaux sociaux
import { getApiToken } from './api-token-manager';

interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

export class SocialMediaPublisher {

  // Instagram - via Meta Graph API
  static async publishToInstagram(
    post: {
      content: string;
      imageUrl?: string;
      hashtags?: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {
    try {
      const accessToken = await getApiToken('INSTAGRAM', 'access_token', organizationId);
      const instagramAccountId = await getApiToken('INSTAGRAM', 'account_id', organizationId)
        || process.env.INSTAGRAM_ACCOUNT_ID; // Fallback

      if (!accessToken || !instagramAccountId) {
        return {
          success: false,
          platform: 'Instagram',
          error: 'Configuration Instagram manquante (access_token, account_id)'
        };
      }

      const caption = `${post.content}\n\n${post.hashtags || ''}`.trim();

      // Créer un conteneur média
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: post.imageUrl || process.env.DEFAULT_IMAGE_URL,
            caption,
            access_token: accessToken
          })
        }
      );

      const mediaData = await mediaResponse.json();

      if (!mediaData.id) {
        throw new Error(mediaData.error?.message || 'Erreur création média');
      }

      // Publier le conteneur
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: mediaData.id,
            access_token: accessToken
          })
        }
      );

      const publishData = await publishResponse.json();

      if (!publishData.id) {
        throw new Error(publishData.error?.message || 'Erreur publication');
      }

      return {
        success: true,
        platform: 'Instagram',
        postId: publishData.id
      };

    } catch (error: any) {
      console.error('Erreur publication Instagram:', error);
      return {
        success: false,
        platform: 'Instagram',
        error: error.message
      };
    }
  }

  // Facebook - via Graph API
  static async publishToFacebook(
    post: {
      content: string;
      imageUrl?: string;
      link?: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {
    try {
      const accessToken = await getApiToken('FACEBOOK', 'page_access_token', organizationId);
      const pageId = await getApiToken('FACEBOOK', 'page_id', organizationId)
        || process.env.FACEBOOK_PAGE_ID; // Fallback

      if (!accessToken || !pageId) {
        return {
          success: false,
          platform: 'Facebook',
          error: 'Configuration Facebook manquante (page_access_token, page_id)'
        };
      }

      const body: any = {
        message: post.content,
        access_token: accessToken
      };

      if (post.imageUrl) {
        body.url = post.imageUrl;
      }

      if (post.link) {
        body.link = post.link;
      }

      const endpoint = post.imageUrl
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return {
        success: true,
        platform: 'Facebook',
        postId: data.id || data.post_id
      };

    } catch (error: any) {
      console.error('Erreur publication Facebook:', error);
      return {
        success: false,
        platform: 'Facebook',
        error: error.message
      };
    }
  }

  // LinkedIn - via LinkedIn API
  static async publishToLinkedIn(
    post: {
      content: string;
      imageUrl?: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {
    try {
      const accessToken = await getApiToken('LINKEDIN', 'access_token', organizationId);
      const personId = await getApiToken('LINKEDIN', 'person_id', organizationId)
        || process.env.LINKEDIN_PERSON_ID; // Fallback

      if (!accessToken || !personId) {
        return {
          success: false,
          platform: 'LinkedIn',
          error: 'Configuration LinkedIn manquante (access_token, person_id)'
        };
      }

      const body: any = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content
            },
            shareMediaCategory: post.imageUrl ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      if (post.imageUrl) {
        body.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          originalUrl: post.imageUrl
        }];
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.status >= 400) {
        throw new Error(data.message || 'Erreur publication LinkedIn');
      }

      return {
        success: true,
        platform: 'LinkedIn',
        postId: data.id
      };

    } catch (error: any) {
      console.error('Erreur publication LinkedIn:', error);
      return {
        success: false,
        platform: 'LinkedIn',
        error: error.message
      };
    }
  }

  // Snapchat - via Snap Kit API
  static async publishToSnapchat(
    post: {
      content: string;
      imageUrl?: string;
      videoUrl?: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {
    try {
      const accessToken = await getApiToken('SNAPCHAT', 'access_token', organizationId);

      if (!accessToken) {
        return {
          success: false,
          platform: 'Snapchat',
          error: 'Configuration Snapchat manquante (access_token)'
        };
      }

      if (!post.imageUrl && !post.videoUrl) {
        return {
          success: false,
          platform: 'Snapchat',
          error: 'Image ou vidéo requise pour Snapchat'
        };
      }

      // Snapchat utilise le Creative Kit pour publier
      const mediaType = post.videoUrl ? 'VIDEO' : 'PHOTO';
      const mediaUrl = post.videoUrl || post.imageUrl;

      const response = await fetch('https://adsapi.snapchat.com/v1/creatives', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creative: {
            name: post.content.substring(0, 50),
            type: 'SNAP_AD',
            brand_name: 'Laia Skin Institut',
            headline: post.content.substring(0, 34), // Max 34 caractères
            shareable: true,
            call_to_action: 'VIEW_MORE',
            top_snap_media_id: mediaUrl,
            top_snap_crop_position: 'MIDDLE'
          }
        })
      });

      const data = await response.json();

      if (data.request_status !== 'SUCCESS') {
        throw new Error(data.debug_message || 'Erreur publication Snapchat');
      }

      return {
        success: true,
        platform: 'Snapchat',
        postId: data.creative?.id
      };

    } catch (error: any) {
      console.error('Erreur publication Snapchat:', error);
      return {
        success: false,
        platform: 'Snapchat',
        error: error.message
      };
    }
  }

  // TikTok - via TikTok API
  static async publishToTikTok(
    post: {
      content: string;
      videoUrl?: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {
    try {
      const accessToken = await getApiToken('TIKTOK', 'access_token', organizationId);

      if (!accessToken) {
        return {
          success: false,
          platform: 'TikTok',
          error: 'Configuration TikTok manquante (access_token)'
        };
      }

      if (!post.videoUrl) {
        return {
          success: false,
          platform: 'TikTok',
          error: 'URL de vidéo requise pour TikTok'
        };
      }

      // Étape 1: Initier la création de vidéo
      const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_info: {
            title: post.content.substring(0, 150), // Max 150 caractères
            privacy_level: 'SELF_ONLY', // ou 'PUBLIC_TO_EVERYONE'
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_url: post.videoUrl
          }
        })
      });

      const initData = await initResponse.json();

      if (initData.error) {
        throw new Error(initData.error.message || 'Erreur initialisation TikTok');
      }

      return {
        success: true,
        platform: 'TikTok',
        postId: initData.data?.publish_id
      };

    } catch (error: any) {
      console.error('Erreur publication TikTok:', error);
      return {
        success: false,
        platform: 'TikTok',
        error: error.message
      };
    }
  }

  // Twitter/X - via Twitter API v2
  static async publishToTwitter(
    post: {
      content: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {
    try {
      const bearerToken = await getApiToken('TWITTER', 'bearer_token', organizationId);

      if (!bearerToken) {
        return {
          success: false,
          platform: 'Twitter',
          error: 'Configuration Twitter manquante (bearer_token)'
        };
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          text: post.content
        })
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Erreur publication Twitter');
      }

      return {
        success: true,
        platform: 'Twitter',
        postId: data.data?.id
      };

    } catch (error: any) {
      console.error('Erreur publication Twitter:', error);
      return {
        success: false,
        platform: 'Twitter',
        error: error.message
      };
    }
  }

  // Méthode principale qui route vers la bonne plateforme
  static async publish(
    platform: string,
    post: {
      content: string;
      imageUrl?: string;
      hashtags?: string;
      link?: string;
    },
    organizationId?: string | null
  ): Promise<PublishResult> {

    const normalizedPlatform = platform.toLowerCase();

    switch (normalizedPlatform) {
      case 'instagram':
        return this.publishToInstagram(post, organizationId);

      case 'facebook':
        return this.publishToFacebook(post, organizationId);

      case 'linkedin':
        return this.publishToLinkedIn(post, organizationId);

      case 'snapchat':
      case 'snap':
        return this.publishToSnapchat({
          content: post.content,
          imageUrl: post.imageUrl,
          videoUrl: post.imageUrl?.match(/\.(mp4|mov|avi)$/i) ? post.imageUrl : undefined
        }, organizationId);

      case 'tiktok':
        return this.publishToTikTok({
          content: post.content,
          videoUrl: post.imageUrl // Pour TikTok, c'est une vidéo
        }, organizationId);

      case 'twitter':
      case 'x':
        return this.publishToTwitter(post, organizationId);

      default:
        return {
          success: false,
          platform,
          error: `Plateforme non supportée: ${platform}`
        };
    }
  }

  // Vérifier si une plateforme est configurée
  static async isPlatformConfigured(platform: string, organizationId?: string | null): Promise<boolean> {
    const normalizedPlatform = platform.toLowerCase();

    try {
      switch (normalizedPlatform) {
        case 'instagram':
          try {
            return !!(
              await getApiToken('INSTAGRAM', 'access_token', organizationId) &&
              (await getApiToken('INSTAGRAM', 'account_id', organizationId) || process.env.INSTAGRAM_ACCOUNT_ID)
            );
          } catch { return false; }

        case 'facebook':
          try {
            return !!(
              await getApiToken('FACEBOOK', 'page_access_token', organizationId) &&
              (await getApiToken('FACEBOOK', 'page_id', organizationId) || process.env.FACEBOOK_PAGE_ID)
            );
          } catch { return false; }

        case 'linkedin':
          try {
            return !!(
              await getApiToken('LINKEDIN', 'access_token', organizationId) &&
              (await getApiToken('LINKEDIN', 'person_id', organizationId) || process.env.LINKEDIN_PERSON_ID)
            );
          } catch { return false; }

        case 'snapchat':
        case 'snap':
          try {
            return !!(await getApiToken('SNAPCHAT', 'access_token', organizationId));
          } catch { return false; }

        case 'tiktok':
          try {
            return !!(await getApiToken('TIKTOK', 'access_token', organizationId));
          } catch { return false; }

        case 'twitter':
        case 'x':
          try {
            return !!(await getApiToken('TWITTER', 'bearer_token', organizationId));
          } catch { return false; }

        default:
          return false;
      }
    } catch (error) {
      console.error(`Erreur vérification plateforme ${platform}:`, error);
      return false;
    }
  }

  // Obtenir toutes les plateformes configurées
  static async getConfiguredPlatforms(organizationId?: string | null): Promise<string[]> {
    const platforms = ['Instagram', 'Facebook', 'Snapchat', 'TikTok', 'LinkedIn', 'Twitter'];
    const results = await Promise.all(
      platforms.map(async (p) => ({
        platform: p,
        isConfigured: await this.isPlatformConfigured(p, organizationId)
      }))
    );
    return results.filter(r => r.isConfigured).map(r => r.platform);
  }
}
