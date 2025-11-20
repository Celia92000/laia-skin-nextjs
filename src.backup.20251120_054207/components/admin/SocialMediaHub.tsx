"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMagic, FaChartLine, FaLightbulb } from 'react-icons/fa';
import DragDropCalendar from './DragDropCalendar';
import ContentIdeasGenerator from './ContentIdeasGenerator';
import PostGenerator from './PostGenerator';
import TrendingInspirations from './TrendingInspirations';

export default function SocialMediaHub() {
  const [activeTab, setActiveTab] = useState<'plan' | 'generator' | 'stats'>('plan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Fetch insights when stats tab is active
  useEffect(() => {
    if (activeTab === 'stats' && !insights && !isLoadingInsights) {
      fetchInsights();
    }
  }, [activeTab]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      } else {
        const error = await response.json();
        setInsightsError(error.error || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error) {
      console.error('Erreur fetch insights:', error);
      setInsightsError('Erreur lors de la récupération des statistiques');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const analyzeFeed = async (platform: string = 'instagram') => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/analyze-feed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setShowAnalysisModal(true);
      } else {
        const error = await response.json();
        const errorMsg = error.error || 'Erreur lors de l\'analyse';
        const helpMsg = error.help ? `\n\n${error.help}` : '';
        alert(errorMsg + helpMsg);
      }
    } catch (error) {
      console.error('Erreur analyse:', error);
      alert('Erreur lors de l\'analyse du feed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200">
            <h1 className="text-2xl font-serif font-bold text-[#8B6F5C]">
              Gestion des Réseaux Sociaux
            </h1>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 px-6 py-4 bg-amber-50/30">
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'plan'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaCalendarAlt className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Planifier</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'generator'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaMagic className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Générateur d'idées</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaChartLine className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Analyse</div>
              </div>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div>
          {activeTab === 'plan' && <DragDropCalendar />}

          {activeTab === 'generator' && (
            <div className="space-y-6">
              {/* Générateur de posts visuels */}
              <PostGenerator />

              {/* Posts tendances pour inspiration */}
              <TrendingInspirations />

              {/* Générateur d'idées de contenus basé sur votre feed */}
              <ContentIdeasGenerator />

              {/* Conseils personnalisés */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                <h2 className="text-xl font-serif font-bold text-[#8B6F5C] mb-6 flex items-center gap-2">
                  <FaLightbulb className="text-[#8B6F5C]" /> Conseils personnalisés
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
                    <span className="text-2xl">✅</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Excellente fréquence de publication</h4>
                      <p className="text-sm text-gray-600">Vous publiez 3-4 fois par semaine, c'est parfait pour maintenir l'engagement !</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Variez vos horaires</h4>
                      <p className="text-sm text-gray-600">Testez différents horaires de publication pour toucher plus d'audience. Les stories du matin (8-10h) ont un excellent taux de visibilité.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Plus de Reels</h4>
                      <p className="text-sm text-gray-600">Les Reels génèrent 3x plus d'engagement que les posts classiques. Essayez d'en publier 2-3 par semaine.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Continuez les transformations</h4>
                      <p className="text-sm text-gray-600">Vos posts avant/après sont vos meilleurs performers ! Publiez-en au moins 1 par semaine.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Bouton Analyser mon feed */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#8B6F5C] mb-2">
                      🤖 Analyse IA de votre feed
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Analysez votre feed Instagram pour obtenir des insights personnalisés et générer du contenu optimisé
                    </p>
                  </div>
                  <button
                    onClick={() => analyzeFeed('instagram')}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-6 py-3 bg-[#8B6F5C] text-white rounded-xl hover:bg-[#6d5847] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <FaChartLine />
                        Analyser mon feed Instagram
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats dashboard */}
              {isLoadingInsights ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 animate-pulse">
                      <div className="h-10 w-10 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : insightsError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-600 mb-3">⚠️ {insightsError}</p>
                  <button
                    onClick={fetchInsights}
                    className="px-4 py-2 bg-[#8B6F5C] text-white rounded-lg hover:bg-[#6d5847] transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : insights ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                    <div className="text-4xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-[#8B6F5C] mb-1">Engagement</h3>
                    <p className="text-3xl font-bold text-[#8B6F5C] mb-1">{insights.engagement?.growth || '0%'}</p>
                    <p className="text-sm text-gray-500">
                      {insights.engagement?.thisWeek || 0} interactions cette semaine
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-semibold text-[#8B6F5C] mb-1">Abonnés</h3>
                    <p className="text-3xl font-bold text-[#8B6F5C] mb-1">{insights.followers?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-lg font-semibold text-[#8B6F5C] mb-1">Publications</h3>
                    <p className="text-3xl font-bold text-[#8B6F5C] mb-1">{insights.posts?.thisMonth || 0}</p>
                    <p className="text-sm text-gray-500">
                      Ce mois-ci • {insights.totalPosts || 0} au total
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Best performing content */}
              {insights && insights.topContentTypes && insights.topContentTypes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                  <h2 className="text-xl font-serif font-bold text-[#8B6F5C] mb-6 flex items-center gap-2">
                    <span>🏆</span> Vos meilleurs types de contenu
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    {insights.topContentTypes.map((content: any, idx: number) => {
                      const getIcon = (type: string) => {
                        if (type === 'VIDEO') return '🎬';
                        if (type === 'CAROUSEL_ALBUM') return '📸';
                        return '🖼️';
                      };

                      const percentage = parseInt(content.percentage) || 0;

                      return (
                        <div key={idx} className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{getIcon(content.type)}</span>
                            <div>
                              <h4 className="font-semibold text-[#8B6F5C]">{content.label}</h4>
                              <p className="text-sm text-gray-600">
                                {Math.round(content.avgEngagement)} interactions en moyenne
                              </p>
                            </div>
                          </div>
                          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#8B6F5C] transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'analyse */}
      {showAnalysisModal && analysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-2">
                    🎯 Analyse de votre feed {analysis.platform}
                  </h2>
                  <p className="text-purple-100 text-sm">
                    {analysis.totalPostsAnalyzed} posts analysés • {new Date(analysis.analyzedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Tone of Voice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-[#8B6F5C] mb-3">🎨 Ton de voix</h3>
                <p className="text-gray-700 text-lg capitalize font-semibold">
                  {analysis.toneOfVoice === 'friendly' ? '💕 Amical et chaleureux' :
                   analysis.toneOfVoice === 'professional' ? '👔 Professionnel et expert' :
                   '😊 Casual et décontracté'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Engagement moyen</h3>
                  <p className="text-3xl font-bold text-green-600">{analysis.avgEngagement}</p>
                  <p className="text-xs text-gray-500 mt-1">likes + commentaires</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Top posts</h3>
                  <p className="text-3xl font-bold text-purple-600">{analysis.topPosts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">posts performants</p>
                </div>
              </div>

              {/* Top Hashtags */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-[#8B6F5C] mb-3">#️⃣ Hashtags performants</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.topHashtags.map((tag: string, idx: number) => (
                    <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-amber-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Post Types */}
              <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                <h3 className="text-lg font-bold text-[#8B6F5C] mb-3">📱 Types de contenu qui fonctionnent</h3>
                <div className="space-y-2">
                  {analysis.bestPostTypes.map((type: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-pink-200">
                      <span className="text-2xl">
                        {type === 'VIDEO' || type === 'REEL' ? '🎬' : type === 'CAROUSEL_ALBUM' ? '📸' : '🖼️'}
                      </span>
                      <span className="font-semibold text-gray-700 capitalize">
                        {type === 'VIDEO' ? 'Vidéos' : type === 'CAROUSEL_ALBUM' ? 'Carrousels' : type === 'IMAGE' ? 'Photos' : type}
                      </span>
                      <span className="ml-auto text-pink-600 font-bold">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Post Times */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-bold text-[#8B6F5C] mb-3">⏰ Meilleurs horaires de publication</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.bestPostTimes.map((time: string, idx: number) => (
                    <div key={idx} className="bg-white px-4 py-2 rounded-lg border border-orange-300 font-semibold text-gray-700">
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Posts */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-[#8B6F5C] mb-4">🏆 Vos meilleurs posts</h3>
                <div className="space-y-3">
                  {analysis.topPosts.slice(0, 5).map((post: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-yellow-300">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-700 line-clamp-2 flex-1">{post.content}</p>
                        <span className="ml-3 text-xs text-gray-500 whitespace-nowrap">{post.type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-pink-600">❤️ {post.likes}</span>
                        <span className="text-blue-600">💬 {post.comments}</span>
                        <span className="ml-auto text-gray-500">Total: {post.likes + post.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="flex-1 bg-[#8B6F5C] text-white py-3 rounded-xl font-semibold hover:bg-[#6d5847] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
