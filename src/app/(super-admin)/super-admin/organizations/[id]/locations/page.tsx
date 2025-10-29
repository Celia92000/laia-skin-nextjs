"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrganizationLocationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    isMainLocation: false,
    active: true
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/super-admin/organizations/${id}/locations`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
        setLocations(data.locations)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      const url = editingLocation
        ? `/api/super-admin/organizations/${id}/locations/${editingLocation.id}`
        : `/api/super-admin/organizations/${id}/locations`

      const response = await fetch(url, {
        method: editingLocation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingLocation ? 'Emplacement modifié avec succès' : 'Emplacement créé avec succès'
        })
        setShowModal(false)
        setEditingLocation(null)
        setFormData({
          name: '',
          slug: '',
          address: '',
          city: '',
          postalCode: '',
          phone: '',
          email: '',
          isMainLocation: false,
          active: true
        })
        fetchData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de l\'opération' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  const handleDelete = async (locationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) return

    try {
      const response = await fetch(`/api/super-admin/organizations/${id}/locations/${locationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Emplacement supprimé avec succès' })
        fetchData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  const openEditModal = (location: any) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      slug: location.slug,
      address: location.address,
      city: location.city,
      postalCode: location.postalCode,
      phone: location.phone || '',
      email: location.email || '',
      isMainLocation: location.isMainLocation,
      active: location.active
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingLocation(null)
    setFormData({
      name: '',
      slug: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      isMainLocation: false,
      active: true
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Organisation non trouvée</h1>
          <Link href="/super-admin" className="text-indigo-600 hover:text-indigo-800 underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const canAddLocation = locations.length < organization.maxLocations
  const usagePercent = (locations.length / organization.maxLocations) * 100

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href={`/super-admin/organizations/${id}`} className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour à l'organisation
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              Points de vente de {organization.name}
            </h2>
            <p className="text-gray-700">Gérer les emplacements de l'organisation</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Limite du forfait */}
        <div className="mb-8 p-6 rounded-xl border-2" style={{
          borderColor: usagePercent >= 100 ? '#ef4444' : '#7c3aed',
          backgroundColor: usagePercent >= 100 ? '#fef2f2' : '#faf7f3'
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: usagePercent >= 100 ? '#dc2626' : '#7c3aed' }}>
                {usagePercent >= 100 ? '⚠️ Limite atteinte' : '📊 Utilisation du forfait'}
              </h3>
              <p className="text-gray-700 mt-1">
                Plan <strong>{organization.plan}</strong> : {locations.length} / {organization.maxLocations} emplacement(s)
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: usagePercent >= 100 ? '#dc2626' : '#7c3aed' }}>
                {usagePercent.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(usagePercent, 100)}%`,
                backgroundColor: usagePercent >= 100 ? '#ef4444' : usagePercent >= 80 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
          {usagePercent >= 100 && (
            <p className="mt-3 text-sm text-red-700">
              <strong>Attention :</strong> La limite d'emplacements est atteinte. Mettez à niveau le plan pour ajouter plus d'emplacements.
            </p>
          )}
        </div>

        {/* Bouton d'ajout */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Tous les emplacements ({locations.length})
          </h2>
          <button
            onClick={openCreateModal}
            disabled={!canAddLocation}
            className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canAddLocation ? 'linear-gradient(135deg, #7c3aed 0%, #e8b4b8 100%)' : '#9ca3af'
            }}
          >
            + Créer un emplacement
          </button>
        </div>

        {/* Liste des emplacements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-500">@{location.slug}</p>
                </div>
                <div className="flex gap-2">
                  {location.isMainLocation && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{
                      backgroundColor: '#7c3aed',
                      color: 'white'
                    }}>
                      Principal
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    location.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {location.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  📍 {location.address}
                </p>
                <p className="text-sm text-gray-600">
                  {location.postalCode} {location.city}
                </p>
                {location.phone && (
                  <p className="text-sm text-gray-600">
                    📞 {location.phone}
                  </p>
                )}
                {location.email && (
                  <p className="text-sm text-gray-600">
                    ✉️ {location.email}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => openEditModal(location)}
                  className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                >
                  ✏️ Modifier
                </button>
                {!location.isMainLocation && (
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    🗑️ Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#7c3aed' }}>
              {editingLocation ? 'Modifier l\'emplacement' : 'Créer un emplacement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'emplacement *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const slug = name.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                      setFormData({ ...formData, name, slug })
                    }}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Ex: Institut Paris Centre"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (généré automatiquement)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="123 Rue de la Beauté"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="75001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="+33 1 00 00 00 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="contact@institut.fr"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isMainLocation}
                      onChange={(e) => setFormData({ ...formData, isMainLocation: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                      style={{ accentColor: '#7c3aed' }}
                    />
                    <span className="ml-2 text-sm text-gray-700">Emplacement principal</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                      style={{ accentColor: '#7c3aed' }}
                    />
                    <span className="ml-2 text-sm text-gray-700">Actif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingLocation(null)
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg font-semibold transition"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #e8b4b8 100%)'
                  }}
                >
                  {editingLocation ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
