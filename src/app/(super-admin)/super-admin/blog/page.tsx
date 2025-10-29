'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: 'NEWS' | 'TUTORIAL' | 'FEATURE' | 'CASE_STUDY' | 'UPDATE'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  featuredImage?: string
  author: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  publishedAt?: Date
  createdAt: Date
}

export default function BlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | BlogPost['status']>('ALL')
  const [filterCategory, setFilterCategory] = useState<BlogPost['category']>('NEWS')

  // Formulaire
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'NEWS' as BlogPost['category'],
    featuredImage: '',
    tags: '',
    seoTitle: '',
    seoDescription: ''
  })

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const response = await fetch('/api/super-admin/blog')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/blog')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/super-admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category: 'NEWS',
          featuredImage: '',
          tags: '',
          seoTitle: '',
          seoDescription: ''
        })
        setImagePreview('')
        fetchPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Afficher la prévisualisation
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload l'image
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/super-admin/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, featuredImage: data.url }))
      } else {
        alert('Erreur lors de l\'upload de l\'image')
        setImagePreview('')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Erreur lors de l\'upload de l\'image')
      setImagePreview('')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handlePublish(id: string) {
    if (!confirm('Voulez-vous vraiment publier cet article ?')) return

    try {
      const response = await fetch(`/api/super-admin/blog/${id}/publish`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error publishing post:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return

    try {
      const response = await fetch(`/api/super-admin/blog/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const getCategoryLabel = (category: BlogPost['category']) => {
    const labels = {
      NEWS: 'Actualités',
      TUTORIAL: 'Tutoriel',
      FEATURE: 'Fonctionnalité',
      CASE_STUDY: 'Étude de cas',
      UPDATE: 'Mise à jour'
    }
    return labels[category]
  }

  const getStatusBadge = (status: BlogPost['status']) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    )
  }

  const filteredPosts = posts.filter(post => {
    if (filterStatus !== 'ALL' && post.status !== filterStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#7c3aed" }}></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📰 Nouveautés</h1>
          <p className="text-gray-600">Gérez les articles de blog et actualités de la plateforme</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-white" style={{ background: "linear-gradient(to right, #7c3aed, #6b46c1)" }}
        >
          + Nouvel Article
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="DRAFT">Brouillons</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total articles</p>
          <p className="text-3xl font-bold" style={{ color: "#7c3aed" }}>{posts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Publiés</p>
          <p className="text-3xl font-bold text-green-600">
            {posts.filter(p => p.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Brouillons</p>
          <p className="text-3xl font-bold text-gray-600">
            {posts.filter(p => p.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Ce mois-ci</p>
          <p className="text-3xl font-bold text-blue-600">
            {posts.filter(p => {
              const postDate = new Date(p.createdAt)
              const now = new Date()
              return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tous les articles</h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">Aucun article trouvé</p>
            <p className="text-sm">Créez votre premier article de blog</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(post.status)}
                    <span className="text-xs text-gray-500">{getCategoryLabel(post.category)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                  {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3e8d8', color: '#8b6f47' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    {post.publishedAt
                      ? `Publié le ${new Date(post.publishedAt).toLocaleDateString('fr-FR')}`
                      : `Créé le ${new Date(post.createdAt).toLocaleDateString('fr-FR')}`}
                  </div>

                  <div className="flex gap-2">
                    {post.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700"
                      >
                        Publier
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex-1 text-white px-3 py-2 rounded text-sm font-medium"
                      style={{ backgroundColor: "#7c3aed" }}
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouvel Article de Blog</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Les nouveautés LAIA de janvier 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Court résumé de l'article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (séparés par virgule)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="saas, beauté, gestion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image à la une</label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-gray-500">Upload en cours...</p>
                  )}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Prévisualisation"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('')
                          setFormData(prev => ({ ...prev, featuredImage: '' }))
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                  placeholder="Contenu de l'article (Markdown supporté)..."
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre SEO</label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Si vide, utilisera le titre de l'article"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description SEO</label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Si vide, utilisera le résumé"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-white"
                  style={{ background: "linear-gradient(to right, #7c3aed, #6b46c1)" }}
                >
                  Créer en brouillon
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedPost.featuredImage && (
              <img
                src={selectedPost.featuredImage}
                alt={selectedPost.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedPost.status)}
                <span className="text-sm text-gray-600">{getCategoryLabel(selectedPost.category)}</span>
              </div>

              <div>
                <p className="text-gray-600 italic">{selectedPost.excerpt}</p>
              </div>

              {selectedPost.tags && Array.isArray(selectedPost.tags) && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded text-sm" style={{ backgroundColor: '#f3e8d8', color: '#8b6f47' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="prose max-w-none whitespace-pre-wrap text-sm">
                  {selectedPost.content}
                </div>
              </div>

              {selectedPost.seoTitle && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">SEO</h4>
                  <p className="text-sm text-gray-600"><strong>Titre:</strong> {selectedPost.seoTitle}</p>
                  {selectedPost.seoDescription && (
                    <p className="text-sm text-gray-600 mt-1"><strong>Description:</strong> {selectedPost.seoDescription}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              {selectedPost.status === 'DRAFT' && (
                <button
                  onClick={() => {
                    handlePublish(selectedPost.id)
                    setSelectedPost(null)
                  }}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Publier
                </button>
              )}
              <button
                onClick={() => setSelectedPost(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
