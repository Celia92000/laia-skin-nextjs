'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface KnowledgeBaseArticle {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  content: string
  tags: string[]
  published: boolean
  featured: boolean
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  relatedArticles?: string[]
  createdBy?: {
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

interface Stats {
  total: number
  published: number
  featured: number
  totalViews: number
  totalHelpful: number
  byCategory: Array<{ category: string; count: number }>
}

export default function KnowledgeBasePage() {
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, searchTerm])

  async function fetchArticles() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/super-admin/knowledge-base?${params}`)

      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'GETTING_STARTED': '🚀 Démarrage',
      'RESERVATIONS': '📅 Réservations',
      'PAYMENTS': '💳 Paiements',
      'SETTINGS': '⚙️ Paramètres',
      'INTEGRATIONS': '🔌 Intégrations',
      'TROUBLESHOOTING': '🔧 Dépannage',
      'BILLING': '💰 Facturation',
      'API': '👨‍💻 API',
      'SECURITY': '🔒 Sécurité',
      'BEST_PRACTICES': '💡 Bonnes pratiques'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'GETTING_STARTED': 'bg-blue-100 text-blue-800',
      'RESERVATIONS': 'bg-purple-100 text-purple-800',
      'PAYMENTS': 'bg-green-100 text-green-800',
      'SETTINGS': 'bg-gray-100 text-gray-800',
      'INTEGRATIONS': 'bg-cyan-100 text-cyan-800',
      'TROUBLESHOOTING': 'bg-orange-100 text-orange-800',
      'BILLING': 'bg-emerald-100 text-emerald-800',
      'API': 'bg-indigo-100 text-indigo-800',
      'SECURITY': 'bg-red-100 text-red-800',
      'BEST_PRACTICES': 'bg-amber-100 text-amber-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getHelpfulPercentage = (article: KnowledgeBaseArticle) => {
    const total = article.helpfulCount + article.notHelpfulCount
    if (total === 0) return 0
    return Math.round((article.helpfulCount / total) * 100)
  }

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement de la base de connaissance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              📚 Base de Connaissance Support
            </h2>
            <p className="text-gray-700">Articles d'aide et documentation pour les utilisateurs de LAIA</p>
          </div>
          <button
            className="px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition font-semibold border-2 shadow-sm"
            style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
          >
            + Nouvel article
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total articles</div>
            <div className="text-4xl font-bold text-purple-600">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Publiés</div>
            <div className="text-4xl font-bold text-green-600">{stats.published}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">En vedette</div>
            <div className="text-4xl font-bold text-amber-600">{stats.featured}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Vues totales</div>
            <div className="text-4xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">👍 Utiles</div>
            <div className="text-4xl font-bold text-green-600">{stats.totalHelpful}</div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Titre, tags, contenu..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="GETTING_STARTED">🚀 Démarrage</option>
              <option value="RESERVATIONS">📅 Réservations</option>
              <option value="PAYMENTS">💳 Paiements</option>
              <option value="SETTINGS">⚙️ Paramètres</option>
              <option value="INTEGRATIONS">🔌 Intégrations</option>
              <option value="TROUBLESHOOTING">🔧 Dépannage</option>
              <option value="BILLING">💰 Facturation</option>
              <option value="API">👨‍💻 API</option>
              <option value="SECURITY">🔒 Sécurité</option>
              <option value="BEST_PRACTICES">💡 Bonnes pratiques</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition cursor-pointer"
            onClick={() => {
              setSelectedArticle(article)
              setShowPreview(true)
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
                {getCategoryLabel(article.category)}
              </span>
              {article.featured && (
                <span className="text-2xl" title="Article en vedette">⭐</span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.summary}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
              <div className="flex items-center gap-4">
                <span>👁️ {article.viewCount}</span>
                <span className="text-green-600">👍 {article.helpfulCount}</span>
              </div>
              <div className="text-xs">
                {getHelpfulPercentage(article)}% utile
              </div>
            </div>

            {!article.published && (
              <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded text-center">
                ⚠️ Brouillon
              </div>
            )}
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg">Aucun article trouvé</p>
          <p className="text-sm mt-2">Modifiez vos filtres ou créez un nouvel article</p>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreview && selectedArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(selectedArticle.category)}`}>
                      {getCategoryLabel(selectedArticle.category)}
                    </span>
                    {selectedArticle.featured && <span className="text-2xl">⭐</span>}
                    {selectedArticle.published ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        ✓ Publié
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        ⚠️ Brouillon
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedArticle.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedArticle.summary}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl ml-4"
                >
                  ×
                </button>
              </div>

              <div className="prose max-w-none mb-6">
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br/>') }}
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-6">
                    <span>👁️ {selectedArticle.viewCount} vues</span>
                    <span className="text-green-600">👍 {selectedArticle.helpfulCount}</span>
                    <span className="text-red-600">👎 {selectedArticle.notHelpfulCount}</span>
                    <span className="font-semibold">{getHelpfulPercentage(selectedArticle)}% utile</span>
                  </div>
                  <div>
                    Créé le {new Date(selectedArticle.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                  ✏️ Modifier
                </button>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold">
                  🔗 Copier le lien
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .markdown-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        .markdown-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        .markdown-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .markdown-content ul {
          list-style-type: disc;
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        .markdown-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
