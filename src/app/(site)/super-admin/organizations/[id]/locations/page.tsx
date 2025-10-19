"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Location {
  id: string
  name: string
  slug: string
  address: string
  city: string
  postalCode: string
  phone: string | null
  email: string | null
  isMainLocation: boolean
  active: boolean
}

interface Organization {
  id: string
  name: string
  slug: string
  maxLocations: number
}

export default function OrganizationLocationsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    active: true
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/locations`)
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

  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      active: true
    })
    setEditingLocation(null)
    setShowAddModal(false)
  }

  function handleEdit(location: Location) {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      slug: location.slug,
      address: location.address,
      city: location.city,
      postalCode: location.postalCode,
      phone: location.phone || '',
      email: location.email || '',
      active: location.active
    })
    setShowAddModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const url = editingLocation
        ? `/api/super-admin/organizations/${params.id}/locations/${editingLocation.id}`
        : `/api/super-admin/organizations/${params.id}/locations`

      const method = editingLocation ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingLocation ? 'Emplacement modifié avec succès' : 'Emplacement créé avec succès')
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  async function handleDelete(locationId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) return

    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/locations/${locationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Emplacement supprimé avec succès')
        fetchData()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Erreur lors de la suppression')
    }
  }

  async function handleToggleActive(locationId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/locations/${locationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Organisation non trouvée</h1>
          <Link href="/super-admin" className="text-purple-600 hover:text-purple-800 underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const canAddMore = locations.length < organization.maxLocations

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href={`/super-admin/organizations/${params.id}`}
            className="text-purple-200 hover:text-white mb-2 inline-block"
          >
            ← Retour à l'organisation
          </Link>
          <h1 className="text-3xl font-bold mb-2">Emplacements - {organization.name}</h1>
          <p className="text-purple-100">
            {locations.length} / {organization.maxLocations} emplacements
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Liste des emplacements</h2>
            <p className="text-gray-600 mt-1">Gérez les points de vente de l'organisation</p>
          </div>
          {canAddMore ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              + Ajouter un emplacement
            </button>
          ) : (
            <div className="text-sm text-red-600 font-medium">
              Limite d'emplacements atteinte ({organization.maxLocations})
            </div>
          )}
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                location.active ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-500">/{location.slug}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {location.isMainLocation && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                      Principal
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleActive(location.id, location.active)}
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      location.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {location.active ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>📍 {location.address}</p>
                <p>{location.postalCode} {location.city}</p>
                {location.phone && <p>📞 {location.phone}</p>}
                {location.email && <p>✉️ {location.email}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                  ✏️ Modifier
                </button>
                {!location.isMainLocation && (
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                  >
                    🗑️ Supprimer
                  </button>
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                <a
                  href={`/${organization.slug}/${location.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-3 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition"
                >
                  🌐 Voir le site
                </a>
              </div>
            </div>
          ))}
        </div>

        {locations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Aucun emplacement</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              + Créer le premier emplacement
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingLocation ? 'Modifier l\'emplacement' : 'Nouvel emplacement'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setFormData({
                          ...formData,
                          name,
                          slug: editingLocation ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Emplacement actif
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    {editingLocation ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
