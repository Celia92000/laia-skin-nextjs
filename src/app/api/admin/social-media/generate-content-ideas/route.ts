import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getApiTokenWithMetadata } from '@/lib/api-token-manager';

interface ContentIdea {
  type: 'post' | 'reel' | 'story';
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
  tips: string[];
  visualSuggestions: string[];
  inspiration: string;
}

interface FeedPost {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
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

    const body = await request.json();
    const { platform = 'instagram', count = 5 } = body;

    // 2. Récupérer le token Instagram
    let accessToken: string | null = null;
    let accountId: string | null = null;

    try {
      const tokenData = await getApiTokenWithMetadata('INSTAGRAM', 'access_token', organizationId);
      if (tokenData) {
        accessToken = tokenData.token;
        accountId = tokenData.metadata?.accountId || tokenData.metadata?.account_id;
      }
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
    }

    // Fallback vers env si nécessaire
    if (!accessToken || !accountId) {
      accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      accountId = process.env.INSTAGRAM_ACCOUNT_ID;
    }

    if (!accessToken || !accountId) {
      return NextResponse.json({
        error: 'Token Instagram non configuré. Configurez vos accès dans les paramètres.'
      }, { status: 400 });
    }

    // 3. Récupérer les posts du feed Instagram avec plus de détails
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp&limit=30&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur API Instagram:', error);
      return NextResponse.json({
        error: 'Erreur lors de la récupération du feed Instagram'
      }, { status: 400 });
    }

    const data = await response.json();
    const posts: FeedPost[] = data.data || [];

    if (posts.length === 0) {
      return NextResponse.json({
        error: 'Aucun post trouvé sur votre feed Instagram'
      }, { status: 400 });
    }

    // 4. Analyser le feed et générer des idées inspirées
    const ideas = generateIdeasFromFeed(posts, count);

    // 5. Récupérer les meilleurs posts pour affichage
    const sortedPosts = posts
      .map(post => ({
        ...post,
        engagement: (post.like_count || 0) + (post.comments_count || 0)
      }))
      .sort((a, b) => b.engagement - a.engagement);

    const topPosts = sortedPosts.slice(0, 6).map(post => ({
      id: post.id,
      caption: post.caption,
      media_type: post.media_type,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url,
      permalink: post.permalink,
      like_count: post.like_count || 0,
      comments_count: post.comments_count || 0,
      engagement: post.engagement,
      timestamp: post.timestamp
    }));

    return NextResponse.json({
      success: true,
      ideas,
      topPosts,
      postsAnalyzed: posts.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur génération idées:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des idées de contenu' },
      { status: 500 }
    );
  }
}

function generateIdeasFromFeed(posts: FeedPost[], count: number): ContentIdea[] {
  // Analyser le feed
  const hashtags = extractTopHashtags(posts);
  const tone = analyzeTone(posts);
  const commonTopics = extractCommonTopics(posts);

  // Trier les posts par engagement
  const sortedPosts = posts
    .map(post => ({
      ...post,
      engagement: (post.like_count || 0) + (post.comments_count || 0)
    }))
    .sort((a, b) => b.engagement - a.engagement);

  // Séparer par type
  const reels = sortedPosts.filter(p => p.media_type === 'VIDEO');
  const photos = sortedPosts.filter(p => p.media_type === 'IMAGE');
  const carousels = sortedPosts.filter(p => p.media_type === 'CAROUSEL_ALBUM');

  // Générer des idées basées sur l'analyse
  const ideas: ContentIdea[] = [];

  // Idée 1 : Inspiré du meilleur post photo
  if (photos.length > 0) {
    const bestPhoto = photos[0];
    const caption = bestPhoto.caption || '';
    const extractedTopic = extractTopicFromCaption(caption) || commonTopics[0] || 'vos soins';

    ideas.push({
      type: 'post',
      title: `Post photo inspiré de votre meilleur contenu`,
      description: `Ce type de post a généré ${bestPhoto.engagement} interactions ! Recréez la magie avec un nouveau sujet.`,
      caption: generateSimilarCaption(caption, extractedTopic, tone, hashtags),
      hashtags: hashtags.slice(0, 8),
      tips: [
        'Ce format photo a très bien fonctionné',
        `Gardez le même ton ${tone === 'friendly' ? 'chaleureux et proche' : 'professionnel'}`,
        'Utilisez un éclairage similaire',
        `Votre meilleur post a obtenu ${bestPhoto.like_count} likes et ${bestPhoto.comments_count} commentaires`
      ],
      visualSuggestions: [
        'Photo haute qualité comme votre meilleur post',
        'Cadrage similaire',
        'Même style de mise en scène'
      ],
      inspiration: `Inspiré de votre post qui a généré ${bestPhoto.engagement} interactions`
    });
  }

  // Idée 2 : Inspiré du meilleur reel
  if (reels.length > 0) {
    const bestReel = reels[0];
    const caption = bestReel.caption || '';
    const extractedTopic = extractTopicFromCaption(caption) || commonTopics[0] || 'vos techniques';

    ideas.push({
      type: 'reel',
      title: `Reel inspiré de votre contenu viral`,
      description: `Votre reel sur ${extractedTopic} a cartonné avec ${bestReel.engagement} interactions ! Créez-en un similaire.`,
      caption: `🎬 ${extractedTopic.toUpperCase()} - LA TECHNIQUE\n\nDécouvrez comment nous réalisons ce soin étape par étape !\n\n${tone === 'friendly' ? '👉 Sauvegarde ce reel pour plus tard ! 💕' : '👉 Prenez rendez-vous pour l\'essayer.'}\n\n#reels #${hashtags[0] || 'beaute'}`,
      hashtags: ['reels', 'tutorial', ...hashtags.slice(0, 6)],
      tips: [
        `Vos reels génèrent en moyenne ${Math.round(reels.reduce((sum, r) => sum + r.engagement, 0) / reels.length)} interactions`,
        'Format vertical 9:16',
        'Durée idéale : 15-30 secondes',
        'Ajoutez du texte sur la vidéo',
        'Musique tendance'
      ],
      visualSuggestions: [
        'Montrez le processus étape par étape',
        'Transitions dynamiques',
        'Gros plans sur les techniques',
        'Résultat final à la fin'
      ],
      inspiration: `Inspiré de votre reel qui a obtenu ${bestReel.like_count} likes et ${bestReel.comments_count} commentaires`
    });
  }

  // Idée 3 : Inspiré du meilleur carrousel (si disponible)
  if (carousels.length > 0) {
    const bestCarousel = carousels[0];
    const caption = bestCarousel.caption || '';
    const extractedTopic = extractTopicFromCaption(caption) || commonTopics[0] || 'conseils beauté';

    ideas.push({
      type: 'post',
      title: `Carrousel inspiré de votre contenu éducatif`,
      description: `Vos carrousels génèrent ${bestCarousel.engagement} interactions ! Créez-en un nouveau sur un sujet connexe.`,
      caption: `📚 5 CHOSES À SAVOIR SUR ${extractedTopic.toUpperCase()}\n\nSwipez pour découvrir tous nos secrets ! ➡️\n\n${tone === 'friendly' ? '💕 Sauvegarde ce post pour ne rien oublier !' : 'Informations professionnelles pour des résultats optimaux.'}\n\n#${hashtags[0] || 'beaute'} #conseils`,
      hashtags: ['tutorial', 'conseils', ...hashtags.slice(0, 6)],
      tips: [
        `Vos carrousels obtiennent ${Math.round(carousels.reduce((sum, c) => sum + c.engagement, 0) / carousels.length)} interactions en moyenne`,
        'Format: 5-8 slides',
        'Un point clé par slide',
        'Design cohérent avec vos couleurs'
      ],
      visualSuggestions: [
        'Template Canva pour uniformité',
        'Même palette de couleurs',
        'Texte lisible et aéré',
        'Call-to-action sur la dernière slide'
      ],
      inspiration: `Basé sur votre carrousel qui a obtenu ${bestCarousel.engagement} interactions`
    });
  }

  // Idée 4 : Avant/Après (très populaire dans la beauté)
  ideas.push({
    type: 'post',
    title: 'Transformation avant/après',
    description: 'Les transformations génèrent toujours beaucoup d\'engagement',
    caption: `🌟 TRANSFORMATION INCROYABLE 🌟\n\nAvant ➡️ Après\n\n${tone === 'friendly' ? 'Regardez ce résultat fou ! 😍' : 'Résultats visibles dès la première séance.'}\n\n${commonTopics[0] ? `Soin: ${commonTopics[0]}` : 'Quel soin vous tente ?'}\n\n#beforeafter #transformation #${hashtags[0] || 'beaute'}`,
    hashtags: ['beforeafter', 'transformation', ...hashtags.slice(0, 6)],
    tips: [
      'Même angle et lumière pour les 2 photos',
      'Format carré ou diptyque',
      'Ajoutez une flèche entre les photos',
      'Précisez le nombre de séances'
    ],
    visualSuggestions: [
      'Diptyque côte à côte',
      'Fond neutre',
      'Cercle ou zoom sur la zone traitée'
    ],
    inspiration: 'Les avant/après génèrent 2x plus d\'engagement dans votre domaine'
  });

  // Idée 3 : Story de Q&A
  ideas.push({
    type: 'story',
    title: 'Session Questions/Réponses',
    description: 'Engagez votre communauté avec une Q&A interactive',
    caption: `💬 VOS QUESTIONS SUR ${commonTopics[0]?.toUpperCase() || 'NOS SOINS'} !\n\nJe réponds à TOUTES vos questions aujourd\'hui 👇\n\nUtilisez le sticker "Question" !`,
    hashtags: hashtags.slice(0, 5),
    tips: [
      'Utilisez le sticker "Questions" d\'Instagram',
      'Répondez en story dans les 24h',
      'Sauvegardez les questions fréquentes',
      'Créez un highlight "FAQ"'
    ],
    visualSuggestions: [
      'Fond avec vos couleurs',
      'Votre logo en filigrane',
      'Photo de vous ou de l\'institut'
    ],
    inspiration: `Votre ton ${tone} est parfait pour ce type d\'interaction`
  });

  // Idée 4 : Reel tutoriel
  if (commonTopics.length > 0) {
    ideas.push({
      type: 'reel',
      title: `Tutoriel : ${commonTopics[0]}`,
      description: `Montrez les étapes de votre soin ${commonTopics[0]} en format court`,
      caption: `🎬 LES 3 ÉTAPES DE ${commonTopics[0]?.toUpperCase()} !\n\n1️⃣ Préparation\n2️⃣ Traitement\n3️⃣ Résultat\n\nSauvegardez ce reel pour plus tard ! 📌\n\n#tutorial #${hashtags[0] || 'skincare'}`,
      hashtags: ['reels', 'tutorial', ...hashtags.slice(0, 6)],
      tips: [
        'Maximum 30 secondes',
        'Musique tendance',
        'Texte sur chaque étape',
        'Transitions dynamiques'
      ],
      visualSuggestions: [
        'Format vertical 9:16',
        'Gros plans sur les gestes',
        'Sourire final de la cliente'
      ],
      inspiration: `D'après votre feed, vos clients s'intéressent beaucoup à ${commonTopics[0]}`
    });
  }

  // Idée 5 : Post éducatif (carrousel)
  ideas.push({
    type: 'post',
    title: 'Carrousel éducatif',
    description: 'Partagez 5 conseils beauté en format carrousel',
    caption: `📚 5 CONSEILS POUR UNE PEAU PARFAITE\n\nSwipez pour découvrir mes secrets ! ➡️\n\n${tone === 'friendly' ? 'Dites-moi quel conseil vous appliquez déjà ! 💬' : 'Appliquez ces conseils pour des résultats visibles.'}\n\n#tips #${hashtags[0] || 'beaute'}`,
    hashtags: ['beautytips', 'conseils', 'skincaretips', ...hashtags.slice(0, 5)],
    tips: [
      'Format carrousel (5-8 slides)',
      'Un conseil par slide',
      'Design cohérent',
      'Call-to-action sur la dernière slide'
    ],
    visualSuggestions: [
      'Template Canva aux couleurs de votre marque',
      'Icônes pour illustrer',
      'Texte lisible et aéré'
    ],
    inspiration: `Vos hashtags ${hashtags.slice(0, 3).join(', ')} montrent que votre audience cherche des conseils`
  });

  return ideas.slice(0, count);
}

function extractTopHashtags(posts: FeedPost[]): string[] {
  const hashtagCount: Record<string, number> = {};

  posts.forEach(post => {
    const caption = post.caption || '';
    const tags = caption.match(/#[\wÀ-ÿ]+/g) || [];
    tags.forEach(tag => {
      const normalized = tag.toLowerCase().replace('#', '');
      hashtagCount[normalized] = (hashtagCount[normalized] || 0) + 1;
    });
  });

  return Object.entries(hashtagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);
}

function analyzeTone(posts: FeedPost[]): 'friendly' | 'professional' | 'casual' {
  let friendlyCount = 0;
  let professionalCount = 0;

  posts.forEach(post => {
    const text = (post.caption || '').toLowerCase();
    if (text.match(/❤️|💕|✨|😍|💖/)) friendlyCount++;
    if (text.match(/expertise|professionnel|technique|médical|résultat/)) professionalCount++;
  });

  return friendlyCount > professionalCount ? 'friendly' : 'professional';
}

function getBestPerformingTypes(posts: FeedPost[]): string[] {
  const typeEngagement: Record<string, number> = {};

  posts.forEach(post => {
    const type = post.media_type || 'IMAGE';
    const engagement = (post.like_count || 0) + (post.comments_count || 0);
    typeEngagement[type] = (typeEngagement[type] || 0) + engagement;
  });

  return Object.entries(typeEngagement)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type);
}

function extractCommonTopics(posts: FeedPost[]): string[] {
  const topics: string[] = [];
  const beautyKeywords = ['hydrafacial', 'microneedling', 'peeling', 'massage', 'soin', 'visage', 'anti-âge', 'lifting', 'botox', 'dermapen'];

  posts.forEach(post => {
    const text = (post.caption || '').toLowerCase();
    beautyKeywords.forEach(keyword => {
      if (text.includes(keyword) && !topics.includes(keyword)) {
        topics.push(keyword);
      }
    });
  });

  return topics;
}

function extractTopicFromCaption(caption: string): string | null {
  const beautyKeywords = ['hydrafacial', 'microneedling', 'peeling', 'massage', 'soin visage', 'anti-âge', 'lifting', 'botox', 'dermapen', 'microneedling', 'skincare'];
  const text = caption.toLowerCase();

  for (const keyword of beautyKeywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }

  return null;
}

function generateSimilarCaption(originalCaption: string, topic: string, tone: string, hashtags: string[]): string {
  const emojis = tone === 'friendly' ? '✨💕' : '✨';
  const cta = tone === 'friendly'
    ? `\n\nDites-moi en commentaire si vous avez déjà essayé ! 💬👇`
    : `\n\nPrenez rendez-vous dès maintenant.`;

  return `${emojis} ${topic.toUpperCase()} - DÉCOUVERTE\n\nVous avez adoré notre dernier contenu sur ${topic} ? Voici une nouvelle variation !\n\nRésultats visibles dès la première séance.${cta}\n\n#${hashtags.slice(0, 3).join(' #')}`;
}

function generateContentIdeas(topic: string, platform: string, count: number): ContentIdea[] {
  const beautyTopics = {
    'hydrafacial': [
      {
        type: 'post' as const,
        title: 'Avant/Après transformation',
        description: 'Montrez une transformation spectaculaire avec un traitement Hydrafacial',
        caption: '✨ Transformation incroyable avec l\'Hydrafacial ! Cette cliente avait des pores dilatés et un teint terne. Résultat immédiat : peau éclatante, pores resserrés, teint unifié. 🌟\n\nVous aussi vous voulez une peau de rêve ? Prenez RDV 💕',
        hashtags: ['#hydrafacial', '#skincare', '#beaute', '#soinsvisage', '#peauparfaite', '#esthetique', '#beautytreatment', '#glowingskin'],
        tips: [
          'Utilisez un fond neutre pour mettre en valeur le résultat',
          'Prenez les photos dans la même lumière',
          'Ajoutez une flèche ou un cercle pour guider le regard'
        ],
        visualSuggestions: [
          'Photo avant/après en diptyque',
          'Vidéo du traitement en accéléré',
          'Close-up sur la peau transformée'
        ]
      },
      {
        type: 'reel' as const,
        title: 'Les 3 étapes magiques de l\'Hydrafacial',
        description: 'Reel éducatif montrant les 3 phases du traitement',
        caption: '🌊 Les 3 étapes qui vont transformer votre peau :\n\n1️⃣ Nettoyage en profondeur\n2️⃣ Exfoliation douce\n3️⃣ Hydratation intense\n\nRésultat ? Une peau de bébé ! 👶✨\n\n#reels #skincareroutine #hydrafacial',
        hashtags: ['#reelsinstagram', '#beautytips', '#hydrafacial', '#tutoriel', '#skincareroutine'],
        tips: [
          'Filmez en 9:16 (format vertical)',
          'Utilisez une musique tendance',
          'Ajoutez des textes sur chaque étape',
          'Maximum 30 secondes'
        ],
        visualSuggestions: [
          'Transitions fluides entre chaque étape',
          'Gros plans sur les outils',
          'Sourire de la cliente à la fin'
        ]
      },
      {
        type: 'story' as const,
        title: 'Quiz interactif',
        description: 'Story avec quiz "Connaissez-vous les bienfaits de l\'Hydrafacial ?"',
        caption: '❓ QUIZ : Combien de temps dure un traitement Hydrafacial ?\n\nA) 15 minutes\nB) 30 minutes\nC) 1 heure\n\nRépondez en story ! 👇',
        hashtags: ['#quiz', '#hydrafacial', '#beautyquiz'],
        tips: [
          'Utilisez les stickers de sondage Instagram',
          'Posez une question par story',
          'Répondez dans la story suivante',
          'Créez une série de 3-4 questions'
        ],
        visualSuggestions: [
          'Fond coloré avec le logo',
          'Émojis pour rendre attractif',
          'Photo du traitement en arrière-plan'
        ]
      }
    ],
    'microneedling': [
      {
        type: 'post' as const,
        title: 'Démystifions le Microneedling',
        description: 'Post éducatif qui rassure sur cette technique',
        caption: '💉 Le Microneedling : votre allié anti-âge naturel !\n\n❌ Mythe : "Ça fait mal"\n✅ Réalité : Sensation de picotement léger, crème anesthésiante disponible\n\n❌ Mythe : "C\'est dangereux"\n✅ Réalité : Technique médicale prouvée, résultats visibles dès la 1ère séance\n\nQuestions ? Posez-les en commentaire ! 💬',
        hashtags: ['#microneedling', '#antiage', '#dermapen', '#skincare', '#beautytruth', '#mythesbeaute'],
        tips: [
          'Format carrousel (plusieurs images)',
          'Une idée reçue par slide',
          'Design clair et professionnel'
        ],
        visualSuggestions: [
          'Infographie avec fond pastel',
          'Icônes pour illustrer chaque point',
          'Dernière slide avec call-to-action'
        ]
      },
      {
        type: 'reel' as const,
        title: 'Le processus complet en 30 secondes',
        description: 'Time-lapse du traitement de microneedling',
        caption: '⏱️ 30 secondes pour comprendre le Microneedling !\n\nDe la préparation de la peau au résultat final. Regardez cette transformation ! ✨\n\n👉 Sauvegardez ce reel pour plus tard !\n\n#timelapse #microneedling #transformation',
        hashtags: ['#reels', '#timelapse', '#beforeafter', '#beautytreatment', '#microneedling'],
        tips: [
          'Accélérez la vidéo (2x-3x)',
          'Musique motivante et moderne',
          'Sous-titres pour expliquer chaque étape',
          'Montrez le sourire final de la cliente'
        ],
        visualSuggestions: [
          'Plan large puis zoom sur le visage',
          'Éclairage professionnel',
          'Finir sur un avant/après'
        ]
      }
    ],
    'routine': [
      {
        type: 'post' as const,
        title: 'Ma routine de soin du matin',
        description: 'Partager une routine beauté simple et efficace',
        caption: '☀️ MA ROUTINE MATINALE EN 5 ÉTAPES\n\n1️⃣ Nettoyage doux à l\'eau micellaire\n2️⃣ Sérum vitamine C\n3️⃣ Crème hydratante\n4️⃣ Contour des yeux\n5️⃣ SPF 50 (indispensable !)\n\nVous suivez quelle routine ? Dites-moi en commentaire ! 💬👇\n\n#skincareroutine #routinebeaute #morning',
        hashtags: ['#skincare', '#routine', '#beautytips', '#matinale', '#skincarecommunity'],
        tips: [
          'Photographiez tous les produits alignés',
          'Lumière naturelle',
          'Ajoutez les numéros sur l\'image'
        ],
        visualSuggestions: [
          'Flat lay avec les produits',
          'Fond en marbre ou blanc',
          'Ajoutez des fleurs ou plantes'
        ]
      },
      {
        type: 'reel' as const,
        title: 'Get Ready With Me',
        description: 'Reel GRWM appliquant la routine de soin',
        caption: '✨ GRWM : Ma routine de soin complète !\n\nJe vous montre comment j\'applique mes soins pour une peau parfaite toute la journée 💕\n\nQuelle est votre étape préférée ?\n\n#grwm #getreadywithme #skincare #routine',
        hashtags: ['#grwm', '#getreadywithme', '#morningroutine', '#reels', '#skincareroutine'],
        tips: [
          'Filmez face caméra',
          'Musique entraînante',
          'Accélérez certaines parties',
          'Interaction visuelle (clin d\'œil, sourire)'
        ],
        visualSuggestions: [
          'Bonne lumière (ring light)',
          'Miroir en arrière-plan',
          'Montrez l\'application de chaque produit'
        ]
      }
    ],
    'conseils': [
      {
        type: 'post' as const,
        title: 'Top 5 des erreurs beauté',
        description: 'Liste des erreurs courantes à éviter',
        caption: '🚫 TOP 5 DES ERREURS QUI ABÎMENT VOTRE PEAU\n\n1. Dormir avec du maquillage\n2. Ne pas mettre de SPF tous les jours\n3. Sur-exfolier sa peau\n4. Utiliser de l\'eau trop chaude\n5. Toucher son visage avec les mains sales\n\nCoupable ? 🙋‍♀️ On fait toutes ces erreurs !\n\n#beautytips #skincaremistakes #conseils',
        hashtags: ['#beautytips', '#skincare', '#conseils', '#erreurs', '#skincaretips'],
        tips: [
          'Format carrousel coloré',
          'Une erreur par slide',
          'Ajoutez une solution pour chaque erreur'
        ],
        visualSuggestions: [
          'Design fun avec émojis',
          'Couleurs vives et attractives',
          'Dernière slide : "Sauvegardez ce post"'
        ]
      }
    ]
  };

  // Générer des idées génériques si le topic n'est pas reconnu
  const topicIdeas = beautyTopics[topic as keyof typeof beautyTopics] || [
    {
      type: 'post' as const,
      title: `Inspirations ${topic}`,
      description: `Contenu inspirant autour de ${topic}`,
      caption: `✨ Découvrez nos conseils sur ${topic} !\n\nPartagez vos expériences en commentaire 💬\n\n#${topic.replace(/\s+/g, '')} #beaute #inspiration`,
      hashtags: [`#${topic.replace(/\s+/g, '')}`, '#beaute', '#institut', '#soins'],
      tips: [
        'Soyez authentique',
        'Utilisez des photos de qualité',
        'Engagez votre communauté'
      ],
      visualSuggestions: [
        'Photos professionnelles',
        'Éclairage naturel',
        'Mise en scène soignée'
      ]
    }
  ];

  return topicIdeas.slice(0, count);
}
