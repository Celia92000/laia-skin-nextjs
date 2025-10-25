'use client';

import { useState, useEffect } from 'react';
import {
  Send, Image as ImageIcon, Hash, Link as LinkIcon, CheckCircle, XCircle,
  Clock, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const PLATFORMS: Platform[] = [
  { id: 'Instagram', name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-500' },
  { id: 'Facebook', name: 'Facebook', icon: '👥', color: 'from-blue-500 to-blue-600' },
  { id: 'Snapchat', name: 'Snapchat', icon: '👻', color: 'from-yellow-400 to-yellow-500' },
  { id: 'TikTok', name: 'TikTok', icon: '🎵', color: 'from-gray-900 to-pink-500' },
  { id: 'LinkedIn', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-700' },
  { id: 'Twitter', name: 'Twitter', icon: '🐦', color: 'from-sky-400 to-blue-500' },
];

interface PublicationHistory {
  id: string;
  platform: string;
  content: string;
  status: string;
  publishedAt: Date | null;
  apiPostId: string | null;
  errorMessage: string | null;
}

export default function SocialMediaPublisher() {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [link, setLink] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [configuredPlatforms, setConfiguredPlatforms] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<PublicationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchConfiguredPlatforms();
  }, []);

  const fetchConfiguredPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/publish', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const configured = new Set<string>();

        Object.entries(data.status || {}).forEach(([platform, isConfigured]) => {
          if (isConfigured) {
            configured.add(platform);
          }
        });

        setConfiguredPlatforms(configured);
      }
    } catch (error) {
      console.error('Erreur chargement plateformes:', error);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
      } else {
        newSet.add(platformId);
      }
      return newSet;
    });
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      alert('Veuillez entrer un contenu pour la publication');
      return;
    }

    if (selectedPlatforms.size === 0) {
      alert('Veuillez sélectionner au moins une plateforme');
      return;
    }

    setPublishing(true);
    setResults([]);

    try {
      const token = localStorage.getItem('token');
      const publishPromises = Array.from(selectedPlatforms).map(async (platform) => {
        const response = await fetch('/api/admin/social-media/publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform,
            content,
            imageUrl: imageUrl || undefined,
            hashtags: hashtags || undefined,
            link: link || undefined,
          }),
        });

        const data = await response.json();
        return {
          platform,
          ...data
        };
      });

      const publishResults = await Promise.all(publishPromises);
      setResults(publishResults);

      // Réinitialiser le formulaire si toutes les publications ont réussi
      if (publishResults.every(r => r.success)) {
        setContent('');
        setImageUrl('');
        setHashtags('');
        setLink('');
        setSelectedPlatforms(new Set());
      }

    } catch (error) {
      console.error('Erreur publication:', error);
      setResults([{
        platform: 'Erreur',
        success: false,
        error: 'Erreur de connexion au serveur'
      }]);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Publier sur les Réseaux Sociaux</h2>
            <p className="text-sm text-gray-600 mt-1">
              Créez et publiez du contenu sur vos réseaux sociaux configurés
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire de publication */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-4">
          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu de la publication <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez votre publication..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} caractères
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="inline w-4 h-4 mr-1" />
              URL de l'image (optionnel)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pour Instagram, TikTok et Snapchat, une image est recommandée
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-1" />
              Hashtags (optionnel)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#beauté #soinspeau #laiaskin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            />
          </div>

          {/* Lien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="inline w-4 h-4 mr-1" />
              Lien (optionnel)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://votre-site.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            />
          </div>

          {/* Sélection des plateformes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plateformes <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => {
                const isConfigured = configuredPlatforms.has(platform.id);
                const isSelected = selectedPlatforms.has(platform.id);

                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => isConfigured && togglePlatform(platform.id)}
                    disabled={!isConfigured}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                        : isConfigured
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium text-gray-900">{platform.name}</p>
                        <p className="text-xs text-gray-500">
                          {isConfigured ? 'Configuré' : 'Non configuré'}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-[#d4b5a0]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Configurez vos plateformes dans l'onglet "Réseaux Sociaux" si elles n'apparaissent pas comme disponibles
            </p>
          </div>

          {/* Bouton de publication */}
          <div className="pt-4">
            <button
              onClick={handlePublish}
              disabled={publishing || selectedPlatforms.size === 0 || !content.trim()}
              className="w-full px-6 py-3 bg-[#d4b5a0] text-white rounded-lg font-medium hover:bg-[#c9a084] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publication en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publier sur {selectedPlatforms.size} plateforme{selectedPlatforms.size > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Résultats de publication */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Résultats de publication</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.platform}
                    </p>
                    <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.success
                        ? result.message || 'Publication réussie'
                        : result.error || 'Erreur lors de la publication'
                      }
                    </p>
                    {result.postId && (
                      <p className="text-xs text-green-600 mt-1">
                        ID de publication : {result.postId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avertissement si aucune plateforme configurée */}
      {configuredPlatforms.size === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Aucune plateforme configurée</p>
              <p>
                Vous devez d'abord configurer vos tokens d'accès pour les réseaux sociaux que vous souhaitez utiliser.
                Rendez-vous dans la section "Configuration des tokens" ci-dessus.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
