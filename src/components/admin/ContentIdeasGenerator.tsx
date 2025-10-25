"use client";

import { useState } from 'react';
import { FaLightbulb, FaInstagram, FaImage, FaVideo, FaClipboardList, FaHeart, FaComment, FaExternalLinkAlt } from 'react-icons/fa';

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

interface InstagramPost {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count: number;
  comments_count: number;
  engagement: number;
  timestamp?: string;
}

export default function ContentIdeasGenerator() {
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [topPosts, setTopPosts] = useState<InstagramPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<InstagramPost[]>([]);
  const [postsAnalyzed, setPostsAnalyzed] = useState(0);

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/generate-content-ideas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform: 'instagram', count: 5 })
      });

      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas);
        setTopPosts(data.topPosts || []);
        setPostsAnalyzed(data.postsAnalyzed);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la génération des idées');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération des idées');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingPosts = async () => {
    setLoadingTrending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/trending-posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrendingPosts(data.trendingPosts || []);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors du chargement des posts tendances');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des posts tendances');
    } finally {
      setLoadingTrending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reel':
        return <FaVideo className="text-red-500" />;
      case 'story':
        return <FaImage className="text-purple-500" />;
      default:
        return <FaInstagram className="text-pink-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reel':
        return 'Reel';
      case 'story':
        return 'Story';
      default:
        return 'Post';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de génération */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#8B6F5C] mb-2">
              💡 Générateur d'idées de contenus
            </h3>
            <p className="text-gray-600 text-sm">
              Obtenez des idées de publications, reels et stories inspirées de votre feed Instagram actuel
            </p>
          </div>
          <button
            onClick={generateIdeas}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#8B6F5C] text-white rounded-xl hover:bg-[#6d5847] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Génération...
              </>
            ) : (
              <>
                <FaLightbulb />
                Générer des idées
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nombre de posts analysés */}
      {postsAnalyzed > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            ✅ <strong>{postsAnalyzed} publications</strong> de votre feed Instagram ont été analysées pour générer ces idées personnalisées
          </p>
        </div>
      )}

      {/* Vos vrais posts et reels Instagram */}
      {topPosts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Publications (Photos et Carrousels) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#8B6F5C] flex items-center gap-2">
                <FaImage className="text-pink-500" />
                Vos Publications
              </h3>
              <p className="text-xs text-gray-500">
                Par engagement
              </p>
            </div>

            <div className="space-y-4">
              {topPosts
                .filter(post => post.media_type !== 'VIDEO')
                .slice(0, 3)
                .map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={post.media_url}
                        alt="Post"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23c9a589" width="400" height="400"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="48" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPost%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-red-500">
                          <FaHeart className="text-sm" />
                          <span className="text-sm font-semibold">{post.like_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-500">
                          <FaComment className="text-sm" />
                          <span className="text-sm font-semibold">{post.comments_count}</span>
                        </div>
                        <div className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {post.engagement} interactions
                        </div>
                      </div>
                      {post.caption && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {post.caption}
                        </p>
                      )}
                      {post.permalink && (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-[#8B6F5C] hover:text-[#6d5847] font-semibold"
                        >
                          <FaExternalLinkAlt />
                          Voir sur Instagram
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Reels (Vidéos) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#8B6F5C] flex items-center gap-2">
                <FaVideo className="text-red-500" />
                Vos Reels
              </h3>
              <p className="text-xs text-gray-500">
                Par engagement
              </p>
            </div>

            <div className="space-y-4">
              {topPosts
                .filter(post => post.media_type === 'VIDEO')
                .slice(0, 3)
                .map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={post.thumbnail_url || post.media_url}
                        alt="Reel thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23d4b5a0" width="400" height="400"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="48" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EReel%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1">
                        <FaVideo className="text-xs" />
                        <span className="text-xs font-semibold">Reel</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-red-500">
                          <FaHeart className="text-sm" />
                          <span className="text-sm font-semibold">{post.like_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-500">
                          <FaComment className="text-sm" />
                          <span className="text-sm font-semibold">{post.comments_count}</span>
                        </div>
                        <div className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {post.engagement} interactions
                        </div>
                      </div>
                      {post.caption && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {post.caption}
                        </p>
                      )}
                      {post.permalink && (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-[#8B6F5C] hover:text-[#6d5847] font-semibold"
                        >
                          <FaExternalLinkAlt />
                          Voir sur Instagram
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Liste des idées de posts à créer */}
      {ideas.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#8B6F5C]">
              💡 Nouvelles idées de posts à créer
            </h3>
            <p className="text-sm text-gray-500">
              Basées sur l'analyse de votre feed Instagram
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ideas.map((idea, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Mockup visuel du post */}
                <div className="relative aspect-square bg-gradient-to-br from-[#d4b5a0] to-[#c9a589] flex items-center justify-center p-8">
                  <div className="text-center text-white">
                    {idea.type === 'reel' ? (
                      <>
                        <FaVideo className="text-6xl mx-auto mb-4 opacity-90" />
                        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-semibold">
                          REEL
                        </div>
                      </>
                    ) : idea.type === 'story' ? (
                      <>
                        <FaImage className="text-6xl mx-auto mb-4 opacity-90" />
                        <div className="absolute top-4 right-4 bg-purple-600/70 px-3 py-1 rounded-full text-xs font-semibold">
                          STORY
                        </div>
                      </>
                    ) : (
                      <>
                        <FaInstagram className="text-6xl mx-auto mb-4 opacity-90" />
                        <div className="absolute top-4 right-4 bg-pink-600/70 px-3 py-1 rounded-full text-xs font-semibold">
                          POST
                        </div>
                      </>
                    )}
                    <h4 className="text-xl font-bold mb-2">{idea.title}</h4>
                    <p className="text-sm opacity-90">{idea.description}</p>
                  </div>
                </div>

                {/* Contenu de l'idée */}
                <div className="p-5">
                  {/* Caption suggérée */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase flex items-center gap-2">
                      <FaInstagram className="text-pink-500" />
                      Caption suggérée
                    </h5>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{idea.caption}</p>
                  </div>

                  {/* Hashtags */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Hashtags recommandés</h5>
                    <div className="flex flex-wrap gap-2">
                      {idea.hashtags.slice(0, 6).map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase flex items-center gap-1">
                      <FaClipboardList className="text-xs" />
                      Conseils de création
                    </h5>
                    <ul className="space-y-1.5">
                      {idea.tips.slice(0, 3).map((tip, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5 font-bold">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions visuelles */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Suggestions visuelles</h5>
                    <ul className="space-y-1.5">
                      {idea.visualSuggestions.slice(0, 3).map((suggestion, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Inspiration */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 italic flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      <span><strong>Basé sur :</strong> {idea.inspiration}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* État vide */}
      {!loading && ideas.length === 0 && (
        <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-sm border border-amber-200">
          <FaLightbulb className="text-6xl text-amber-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Prêt à booster votre créativité ?</h3>
          <p className="text-gray-600 mb-6">
            Cliquez sur "Générer des idées" pour obtenir des suggestions de contenus personnalisées basées sur votre feed Instagram
          </p>
        </div>
      )}
    </div>
  );
}
