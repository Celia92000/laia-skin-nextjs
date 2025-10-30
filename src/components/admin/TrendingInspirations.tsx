"use client";

import { useState } from 'react';
import { FaFire, FaHeart, FaComment, FaExternalLinkAlt, FaVideo, FaImage, FaSpinner, FaLightbulb } from 'react-icons/fa';

interface TrendingPost {
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
  account_name?: string;
  account_username?: string;
}

const CATEGORIES = [
  { id: 'all', name: 'Tout voir', icon: '🔥' },
  { id: 'skincare', name: 'Soins visage', icon: '✨' },
  { id: 'beforeafter', name: 'Avant/Après', icon: '⭐' },
  { id: 'tutorial', name: 'Tutoriels', icon: '📚' },
  { id: 'products', name: 'Produits', icon: '💄' },
];

export default function TrendingInspirations() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);

  const loadTrendingPosts = async () => {
    setLoading(true);
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
        alert(error.error || 'Erreur lors du chargement des tendances');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des tendances');
    } finally {
      setLoading(false);
    }
  };

  const filterPostsByCategory = (posts: TrendingPost[]) => {
    if (activeCategory === 'all') return posts;

    return posts.filter(post => {
      const caption = (post.caption || '').toLowerCase();

      switch (activeCategory) {
        case 'skincare':
          return caption.includes('skin') || caption.includes('face') || caption.includes('glow') || caption.includes('hydra');
        case 'beforeafter':
          return caption.includes('before') || caption.includes('after') || caption.includes('transformation');
        case 'tutorial':
          return caption.includes('how') || caption.includes('step') || caption.includes('tutorial') || caption.includes('guide');
        case 'products':
          return caption.includes('product') || caption.includes('review') || caption.includes('favorite');
        default:
          return true;
      }
    });
  };

  const filteredPosts = filterPostsByCategory(trendingPosts);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-[#8B6F5C] flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Posts tendances pour vous inspirer
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Découvrez ce qui marche dans votre secteur
          </p>
        </div>

        {!loading && trendingPosts.length === 0 && (
          <button
            onClick={loadTrendingPosts}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2"
          >
            <FaFire />
            Voir les tendances
          </button>
        )}

        {trendingPosts.length > 0 && (
          <button
            onClick={loadTrendingPosts}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        )}
      </div>

      {/* Categories */}
      {trendingPosts.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-orange-500" />
        </div>
      )}

      {/* Posts grid */}
      {!loading && filteredPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Image/Video */}
              <div className="relative aspect-square bg-gray-100">
                {post.media_type === 'VIDEO' ? (
                  <div className="relative w-full h-full">
                    <img
                      src={post.thumbnail_url || post.media_url}
                      alt="Trending post"
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
                ) : (
                  <img
                    src={post.media_url}
                    alt="Trending post"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23c9a589" width="400" height="400"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="48" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPost%3C/text%3E%3C/svg%3E';
                    }}
                  />
                )}

                {/* Overlay avec compte */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-xs font-semibold">@{post.account_username}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Engagement */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-red-500">
                    <FaHeart className="text-sm" />
                    <span className="text-sm font-semibold">{post.like_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-500">
                    <FaComment className="text-sm" />
                    <span className="text-sm font-semibold">{post.comments_count.toLocaleString()}</span>
                  </div>
                  <div className="ml-auto px-2 py-1 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <FaFire className="text-xs" />
                    {post.engagement.toLocaleString()}
                  </div>
                </div>

                {/* Caption preview */}
                {post.caption && (
                  <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                    {post.caption}
                  </p>
                )}

                {/* Info badge */}
                <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 rounded-lg border border-orange-200 text-xs font-semibold">
                  <FaLightbulb />
                  Exemple d'inspiration
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && trendingPosts.length === 0 && (
        <div className="text-center py-12 px-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-200">
          <FaFire className="text-6xl text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Découvrez ce qui marche</h3>
          <p className="text-gray-600 mb-6">
            Explorez les posts les plus populaires dans votre secteur pour vous inspirer
          </p>
        </div>
      )}

      {/* No results for category */}
      {!loading && trendingPosts.length > 0 && filteredPosts.length === 0 && (
        <div className="text-center py-12 px-6">
          <p className="text-gray-500">Aucun post trouvé dans cette catégorie</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all text-sm font-medium"
          >
            Voir tous les posts
          </button>
        </div>
      )}
    </div>
  );
}
