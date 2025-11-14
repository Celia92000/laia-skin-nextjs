import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getApiTokenWithMetadata } from '@/lib/api-token-manager';
import { log } from '@/lib/logger';

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

    // Récupérer le token Instagram
    let accessToken: string | null = null;
    let accountId: string | null = null;

    try {
      const tokenData = await getApiTokenWithMetadata('INSTAGRAM', 'access_token', organizationId);
      if (tokenData) {
        accessToken = tokenData.token;
        accountId = tokenData.metadata?.accountId || tokenData.metadata?.account_id;
      }
    } catch (error) {
      log.error('❌ Erreur récupération token:', error);
    }

    // Fallback vers env
    if (!accessToken || !accountId) {
      accessToken = (process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN) ?? null;
      accountId = process.env.INSTAGRAM_ACCOUNT_ID ?? null;
    }

    if (!accessToken || !accountId) {
      return NextResponse.json({
        error: 'Token Instagram non configuré'
      }, { status: 400 });
    }

    // Récupérer les insights du compte Instagram
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/insights?metric=follower_count,impressions,reach,profile_views&period=week&access_token=${accessToken}`
    );

    if (!insightsResponse.ok) {
      log.error('Erreur API Instagram Insights');
      // Si les insights ne sont pas disponibles, retourner des données de base
    }

    // Récupérer les informations du compte
    const accountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}?fields=followers_count,media_count,username,name&access_token=${accessToken}`
    );

    if (!accountResponse.ok) {
      const error = await accountResponse.json();
      log.error('Erreur API Instagram:', error);
      return NextResponse.json({
        error: 'Erreur lors de la récupération des données Instagram'
      }, { status: 400 });
    }

    const accountData = await accountResponse.json();

    // Récupérer les posts récents avec leurs métriques
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media?fields=like_count,comments_count,media_type,timestamp&limit=50&access_token=${accessToken}`
    );

    let mediaData: any = { data: [] };
    if (mediaResponse.ok) {
      mediaData = await mediaResponse.json();
    }

    // Calculer les statistiques
    const posts = mediaData.data || [];

    // Engagement total cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const postsThisWeek = posts.filter((post: any) =>
      new Date(post.timestamp) >= oneWeekAgo
    );

    const engagementThisWeek = postsThisWeek.reduce((sum: number, post: any) =>
      sum + (post.like_count || 0) + (post.comments_count || 0), 0
    );

    // Engagement moyen par post
    const avgEngagement = posts.length > 0
      ? posts.reduce((sum: number, post: any) =>
          sum + (post.like_count || 0) + (post.comments_count || 0), 0
        ) / posts.length
      : 0;

    // Posts ce mois-ci
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const postsThisMonth = posts.filter((post: any) =>
      new Date(post.timestamp) >= oneMonthAgo
    );

    // Analyser les meilleurs types de contenu
    const typeEngagement: Record<string, { total: number; count: number }> = {};

    posts.forEach((post: any) => {
      const type = post.media_type || 'IMAGE';
      const engagement = (post.like_count || 0) + (post.comments_count || 0);

      if (!typeEngagement[type]) {
        typeEngagement[type] = { total: 0, count: 0 };
      }

      typeEngagement[type].total += engagement;
      typeEngagement[type].count += 1;
    });

    const topContentTypes = Object.entries(typeEngagement)
      .map(([type, data]) => ({
        type,
        avgEngagement: data.count > 0 ? data.total / data.count : 0,
        label: type === 'VIDEO' ? 'Reels' : type === 'CAROUSEL_ALBUM' ? 'Carrousels' : 'Photos'
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    return NextResponse.json({
      success: true,
      insights: {
        followers: accountData.followers_count || 0,
        totalPosts: accountData.media_count || 0,
        engagement: {
          thisWeek: engagementThisWeek,
          average: Math.round(avgEngagement),
          growth: engagementThisWeek > 0 ? '+' + Math.round((engagementThisWeek / (posts.length || 1)) * 10) + '%' : '0%'
        },
        posts: {
          thisMonth: postsThisMonth.length,
          thisWeek: postsThisWeek.length
        },
        topContentTypes: topContentTypes.slice(0, 4).map(type => ({
          ...type,
          percentage: type.avgEngagement > 0
            ? Math.round((type.avgEngagement / avgEngagement) * 100) + '%'
            : '0%'
        })),
        account: {
          username: accountData.username,
          name: accountData.name
        }
      },
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    log.error('Erreur récupération insights:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des insights' },
      { status: 500 }
    );
  }
}
