'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Testimonial {
  id: string
  clientName: string
  clientRole?: string
  clientPhoto?: string
  content: string
  rating: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  featured: boolean
  showOnLanding: boolean
  tags: string[]
  organization?: {
    id: string
    name: string
  }
  createdAt: Date
}

export default function TestimonialsPage() {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | Testimonial['status']>('ALL')

  const [formData, setFormData] = useState({
    clientName: '',
    clientRole: '',
    clientPhoto: '',
    content: '',
    rating: 5,
    tags: ''
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  async function fetchTestimonials() {
    try {
      const response = await fetch('/api/super-admin/testimonials')
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/testimonials')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/super-admin/testimonials', {
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
          clientName: '',
          clientRole: '',
          clientPhoto: '',
          content: '',
          rating: 5,
          tags: ''
        })
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error creating testimonial:', error)
    }
  }

  async function handleUpdateStatus(id: string, status: Testimonial['status']) {
    try {
      const response = await fetch(`/api/super-admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        fetchTestimonials()
        if (selectedTestimonial?.id === id) {
          setSelectedTestimonial({ ...selectedTestimonial, status })
        }
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
    }
  }

  async function handleToggleFeatured(id: string, currentFeatured: boolean) {
    try {
      const response = await fetch(`/api/super-admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured })
      })
      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
    }
  }

  async function handleToggleLanding(id: string, currentShowOnLanding: boolean) {
    try {
      const response = await fetch(`/api/super-admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnLanding: !currentShowOnLanding })
      })
      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
    }
  }

  const getStatusBadge = (status: Testimonial['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    const labels = {
      PENDING: 'En attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const filteredTestimonials = testimonials.filter(t =>
    filterStatus === 'ALL' || t.status === filterStatus
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#7c3aed" }}></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">✓ Témoignages Clients</h1>
          <p className="text-gray-600">Gérez les témoignages pour le marketing LAIA</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          style={{ background: "linear-gradient(to right, #7c3aed, #6b46c1)" }}
        >
          + Nouveau Témoignage
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvés</option>
          <option value="REJECTED">Rejetés</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total témoignages</p>
          <p className="text-3xl font-bold" style={{ color: "#7c3aed" }}>{testimonials.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">En attente</p>
          <p className="text-3xl font-bold text-yellow-600">
            {testimonials.filter(t => t.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Approuvés</p>
          <p className="text-3xl font-bold text-green-600">
            {testimonials.filter(t => t.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Mis en avant</p>
          <p className="text-3xl font-bold text-blue-600">
            {testimonials.filter(t => t.featured).length}
          </p>
        </div>
      </div>

      {/* Liste */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <p className="text-lg mb-2">Aucun témoignage trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {testimonial.clientPhoto ? (
                      <img
                        src={testimonial.clientPhoto}
                        alt={testimonial.clientName}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <span className="font-bold text-lg" style={{ color: "#7c3aed" }}>
                          {testimonial.clientName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.clientName}</p>
                      {testimonial.clientRole && (
                        <p className="text-sm text-gray-500">{testimonial.clientRole}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(testimonial.status)}
                </div>

                {/* Rating */}
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-4 line-clamp-4">{testimonial.content}</p>

                {/* Tags */}
                {testimonial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {testimonial.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  {testimonial.featured && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      ✓ Mis en avant
                    </span>
                  )}
                  {testimonial.showOnLanding && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      ✓ Page d'accueil
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {testimonial.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(testimonial.id, 'APPROVED')}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(testimonial.id, 'REJECTED')}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                  {testimonial.status === 'APPROVED' && (
                    <>
                      <button
                        onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        {testimonial.featured ? 'Retirer mise en avant' : 'Mettre en avant'}
                      </button>
                      <button
                        onClick={() => handleToggleLanding(testimonial.id, testimonial.showOnLanding)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        {testimonial.showOnLanding ? 'Retirer page accueil' : 'Afficher page accueil'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedTestimonial(testimonial)}
                    className="text-xs text-white px-3 py-1 rounded hover:bg-purple-700"
                    style={{ backgroundColor: "#7c3aed" }}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau Témoignage</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client *</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="Marie Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle/Titre</label>
                <input
                  type="text"
                  value={formData.clientRole}
                  onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="Gérante, Beauté Éternelle Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo (URL)</label>
                <input
                  type="url"
                  value={formData.clientPhoto}
                  onChange={(e) => setFormData({ ...formData, clientPhoto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                >
                  <option value="5">★★★★★ (5 étoiles)</option>
                  <option value="4">★★★★ (4 étoiles)</option>
                  <option value="3">★★★ (3 étoiles)</option>
                  <option value="2">★★ (2 étoiles)</option>
                  <option value="1">★ (1 étoile)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Témoignage *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="LAIA a transformé la gestion de mon institut..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (séparés par virgule)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="onboarding, support, features"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white rounded-lg font-semibold"
                  style={{ background: "linear-gradient(to right, #7c3aed, #6b46c1)" }}
                >
                  Créer le témoignage
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

      {/* Modal détails */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Détails du témoignage</h2>
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                {selectedTestimonial.clientPhoto && (
                  <img
                    src={selectedTestimonial.clientPhoto}
                    alt={selectedTestimonial.clientName}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                )}
                <div>
                  <p className="text-xl font-semibold">{selectedTestimonial.clientName}</p>
                  {selectedTestimonial.clientRole && (
                    <p className="text-gray-600">{selectedTestimonial.clientRole}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < selectedTestimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                {getStatusBadge(selectedTestimonial.status)}
              </div>

              <div className="border-t pt-4">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedTestimonial.content}</p>
              </div>

              {selectedTestimonial.tags.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTestimonial.tags.map((tag, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 text-sm text-gray-500">
                Créé le {new Date(selectedTestimonial.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
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
