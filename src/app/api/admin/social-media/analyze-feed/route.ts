import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getApiToken, getApiTokenWithMetadata } from '@/lib/api-token-manager';
import { getPrismaClient } from '@/lib/prisma';

interface MediaInsight {
  caption?: string;
  like_count?: number;
  comments_count?: number;
  media_type?: string;
  timestamp?: string;
}

interface AnalysisResult {
  toneOfVoice: string;
  topHashtags: string[];
  avgEngagement: number;
  bestPostTypes: string[];
  bestPostTimes: string[];
  topPosts: Array<{ content: string; likes: number; comments: number; type: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const authResult = await verifyAuth(request);
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const organizationId = authResult.user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
    }

    // 2. Récupérer le platform depuis le body
    const body = await request.json();
    const platform = body.platform || 'instagram'; // Par défaut Instagram

    // 3. Récupérer les tokens API de l'organisation
    let accessToken: string | null = null;
    let accountId: string | null = null;

    if (platform === 'instagram') {
      try {
        // Récupérer le token avec ses metadata depuis la base de données
        const tokenData = await getApiTokenWithMetadata('INSTAGRAM', 'access_token', organizationId);

        if (tokenData) {
          accessToken = tokenData.token;
          accountId = tokenData.metadata?.accountId || tokenData.metadata?.account_id;
          console.log('✅ [analyze-feed] Instagram token récupéré depuis la base de données');
          console.log('📊 [analyze-feed] AccountId:', accountId);
        }
      } catch (error) {
        console.error('❌ [analyze-feed] Erreur récupération token Instagram:', error);
      }

      // Fallback vers les variables d'environnement si pas de token en base
      if (!accessToken || !accountId) {
        console.log('⚠️  [analyze-feed] Fallback vers les variables d\'environnement');
        accessToken = (process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN) ?? null;
        accountId = process.env.INSTAGRAM_ACCOUNT_ID ?? null;
      }
    } else if (platform === 'facebook') {
      try {
        // Récupérer le token avec ses metadata depuis la base de données
        const tokenData = await getApiTokenWithMetadata('FACEBOOK', 'page_access_token', organizationId);

        if (tokenData) {
          accessToken = tokenData.token;
          accountId = tokenData.metadata?.pageId || tokenData.metadata?.page_id;
          console.log('✅ [analyze-feed] Facebook token récupéré depuis la base de données');
          console.log('📊 [analyze-feed] PageId:', accountId);
        }
      } catch (error) {
        console.error('❌ [analyze-feed] Erreur récupération token Facebook:', error);
      }

      // Fallback vers les variables d'environnement si pas de token en base
      if (!accessToken || !accountId) {
        console.log('⚠️  [analyze-feed] Fallback vers les variables d\'environnement');
        accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? null;
        accountId = process.env.FACEBOOK_PAGE_ID ?? null;
      }
    }

    if (!accessToken || !accountId) {
      return NextResponse.json({
        error: `Token ${platform.toUpperCase()} non configuré. Veuillez configurer vos accès dans les paramètres.`
      }, { status: 400 });
    }

    // 4. Appeler l'API Meta Graph pour récupérer les posts
    let media: MediaInsight[] = [];

    try {
      if (platform === 'instagram') {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${accountId}/media?fields=caption,like_count,comments_count,media_type,timestamp&limit=30&access_token=${accessToken}`
        );

        if (!response.ok) {
          const error = await response.json();
          console.error('❌ Erreur API Instagram:', error);

          // Messages d'erreur détaillés selon le code
          let errorMessage = 'Erreur lors de la récupération des posts Instagram';
          let helpText = '';

          if (error.error?.code === 190) {
            errorMessage = 'Token Instagram invalide ou expiré';
            helpText = 'Le token d\'accès Instagram est invalide. Veuillez générer un nouveau token depuis Meta Business Suite avec les permissions nécessaires (instagram_basic, instagram_manage_insights).';
          } else if (error.error?.code === 200 || error.error?.code === 10) {
            errorMessage = 'Vérification Meta Business requise';
            helpText = 'Votre application Meta Business doit être vérifiée pour accéder à l\'API Instagram. Rendez-vous sur developers.facebook.com pour soumettre votre application à vérification.';
          } else {
            helpText = error.error?.message || 'Erreur inconnue';
          }

          return NextResponse.json({
            error: errorMessage,
            help: helpText,
            details: error
          }, { status: 400 });
        }

        const data = await response.json();
        media = data.data || [];
      } else if (platform === 'facebook') {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${accountId}/posts?fields=message,likes.summary(true),comments.summary(true),created_time&limit=30&access_token=${accessToken}`
        );

        if (!response.ok) {
          const error = await response.json();
          console.error('Erreur API Facebook:', error);
          return NextResponse.json({
            error: 'Erreur lors de la récupération des posts Facebook',
            details: error
          }, { status: 400 });
        }

        const data = await response.json();
        media = (data.data || []).map((post: any) => ({
          caption: post.message,
          like_count: post.likes?.summary?.total_count || 0,
          comments_count: post.comments?.summary?.total_count || 0,
          media_type: 'post',
          timestamp: post.created_time
        }));
      }
    } catch (error) {
      console.error('Erreur appel API:', error);
      return NextResponse.json({
        error: 'Erreur lors de la récupération des données',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    if (media.length === 0) {
      return NextResponse.json({
        error: 'Aucun post trouvé à analyser'
      }, { status: 400 });
    }

    // 5. Analyser les données
    const analysis = analyzeMedia(media);

    // 6. Sauvegarder l'analyse dans la base de données
    const prisma = await getPrismaClient();

    const savedAnalysis = await prisma.contentAnalysis.create({
      data: {
        organizationId,
        platform,
        toneOfVoice: analysis.toneOfVoice,
        topHashtags: analysis.topHashtags,
        avgEngagement: analysis.avgEngagement,
        bestPostTypes: analysis.bestPostTypes,
        bestPostTimes: analysis.bestPostTimes,
        topPosts: analysis.topPosts,
      }
    });

    // 7. Retourner les résultats
    return NextResponse.json({
      success: true,
      analysis: {
        id: savedAnalysis.id,
        platform,
        toneOfVoice: analysis.toneOfVoice,
        topHashtags: analysis.topHashtags,
        avgEngagement: analysis.avgEngagement,
        bestPostTypes: analysis.bestPostTypes,
        bestPostTimes: analysis.bestPostTimes,
        topPosts: analysis.topPosts.slice(0, 5), // Top 5 posts
        totalPostsAnalyzed: media.length,
        analyzedAt: savedAnalysis.analyzedAt
      }
    });

  } catch (error) {
    console.error('Erreur analyse feed:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuth(request);
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const organizationId = authResult.user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
    }

    // Récupérer le platform depuis query params
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'instagram';

    // Récupérer la dernière analyse pour cette organisation et platform
    const prisma = await getPrismaClient();

    const latestAnalysis = await prisma.contentAnalysis.findFirst({
      where: {
        organizationId,
        platform
      },
      orderBy: {
        analyzedAt: 'desc'
      }
    });

    if (!latestAnalysis) {
      return NextResponse.json({
        error: 'Aucune analyse disponible. Veuillez d\'abord analyser votre feed.'
      }, { status: 404 });
    }

    return NextResponse.json({
      analysis: {
        id: latestAnalysis.id,
        platform: latestAnalysis.platform,
        toneOfVoice: latestAnalysis.toneOfVoice,
        topHashtags: latestAnalysis.topHashtags,
        avgEngagement: latestAnalysis.avgEngagement,
        bestPostTypes: latestAnalysis.bestPostTypes,
        bestPostTimes: latestAnalysis.bestPostTimes,
        topPosts: latestAnalysis.topPosts,
        analyzedAt: latestAnalysis.analyzedAt
      }
    });

  } catch (error) {
    console.error('Erreur récupération analyse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'analyse' },
      { status: 500 }
    );
  }
}

// Fonction d'analyse des médias
function analyzeMedia(media: MediaInsight[]): AnalysisResult {
  // Analyser le tone of voice
  const toneOfVoice = analyzeToneOfVoice(media);

  // Extraire et compter les hashtags
  const topHashtags = extractTopHashtags(media);

  // Calculer l'engagement moyen
  const avgEngagement = calculateAverageEngagement(media);

  // Identifier les meilleurs types de posts
  const bestPostTypes = identifyBestPostTypes(media);

  // Analyser les meilleurs horaires de publication
  const bestPostTimes = analyzeBestPostTimes(media);

  // Récupérer les top posts
  const topPosts = getTopPosts(media);

  return {
    toneOfVoice,
    topHashtags,
    avgEngagement,
    bestPostTypes,
    bestPostTimes,
    topPosts
  };
}

function analyzeToneOfVoice(media: MediaInsight[]): string {
  let friendlyCount = 0;
  let professionalCount = 0;
  let casualCount = 0;

  media.forEach(post => {
    const text = (post.caption || '').toLowerCase();

    // Indicateurs de ton amical
    const friendlyWords = ['❤️', '💕', '✨', '😍', 'merci', 'ravie', 'adorons', 'vous', 'votre'];
    const friendlyMatches = friendlyWords.filter(word => text.includes(word)).length;
    friendlyCount += friendlyMatches;

    // Indicateurs de ton professionnel
    const professionalWords = ['expertise', 'professionnel', 'technique', 'soin', 'traitement', 'résultats'];
    const professionalMatches = professionalWords.filter(word => text.includes(word)).length;
    professionalCount += professionalMatches;

    // Indicateurs de ton casual
    const casualWords = ['hey', 'coucou', 'trop', 'super', '!', 'tu', 'ton'];
    const casualMatches = casualWords.filter(word => text.includes(word)).length;
    casualCount += casualMatches;
  });

  if (friendlyCount > professionalCount && friendlyCount > casualCount) {
    return 'friendly';
  } else if (professionalCount > friendlyCount && professionalCount > casualCount) {
    return 'professional';
  } else {
    return 'casual';
  }
}

function extractTopHashtags(media: MediaInsight[]): string[] {
  const hashtagCount: Record<string, number> = {};

  media.forEach(post => {
    const text = post.caption || '';
    const hashtags = text.match(/#[\wÀ-ÿ]+/g) || [];

    hashtags.forEach(tag => {
      const normalized = tag.toLowerCase();
      hashtagCount[normalized] = (hashtagCount[normalized] || 0) + 1;
    });
  });

  // Trier par fréquence et prendre le top 10
  return Object.entries(hashtagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);
}

function calculateAverageEngagement(media: MediaInsight[]): number {
  if (media.length === 0) return 0;

  const totalEngagement = media.reduce((sum, post) => {
    return sum + (post.like_count || 0) + (post.comments_count || 0);
  }, 0);

  return Math.round(totalEngagement / media.length);
}

function identifyBestPostTypes(media: MediaInsight[]): string[] {
  const typeEngagement: Record<string, { total: number; count: number }> = {};

  media.forEach(post => {
    const type = post.media_type || 'post';
    const engagement = (post.like_count || 0) + (post.comments_count || 0);

    if (!typeEngagement[type]) {
      typeEngagement[type] = { total: 0, count: 0 };
    }

    typeEngagement[type].total += engagement;
    typeEngagement[type].count += 1;
  });

  // Calculer la moyenne par type et trier
  const avgByType = Object.entries(typeEngagement)
    .map(([type, data]) => ({
      type,
      avg: data.total / data.count
    }))
    .sort((a, b) => b.avg - a.avg);

  return avgByType.map(item => item.type);
}

function analyzeBestPostTimes(media: MediaInsight[]): string[] {
  const timeEngagement: Record<string, { total: number; count: number }> = {};

  media.forEach(post => {
    if (!post.timestamp) return;

    const date = new Date(post.timestamp);
    const hour = date.getHours();
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;

    const engagement = (post.like_count || 0) + (post.comments_count || 0);

    if (!timeEngagement[timeSlot]) {
      timeEngagement[timeSlot] = { total: 0, count: 0 };
    }

    timeEngagement[timeSlot].total += engagement;
    timeEngagement[timeSlot].count += 1;
  });

  // Calculer la moyenne par créneau et trier
  const avgByTime = Object.entries(timeEngagement)
    .map(([time, data]) => ({
      time,
      avg: data.total / data.count
    }))
    .sort((a, b) => b.avg - a.avg);

  return avgByTime.slice(0, 5).map(item => item.time);
}

function getTopPosts(media: MediaInsight[]): Array<{ content: string; likes: number; comments: number; type: string }> {
  return media
    .map(post => ({
      content: (post.caption || '').substring(0, 200),
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      type: post.media_type || 'post'
    }))
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 10);
}
