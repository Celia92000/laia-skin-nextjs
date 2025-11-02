'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Location {
  id: string
  name: string
  slug: string
  address: string
  city: string
  postalCode: string
  country: string
  phone?: string
  email?: string
  isMainLocation: boolean
  active: boolean
  _count: {
    staff: number
    workingHours: number
  }
}

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      const response = await fetch('/api/admin/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Points de vente</h1>
              <p className="text-gray-600">Gérez vos différents emplacements</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
            >
              + Ajouter un emplacement
            </button>
          </div>
        </div>

        {/* Locations Grid */}
        {locations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun emplacement</h3>
            <p className="text-gray-600 mb-6">Créez votre premier point de vente pour commencer</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
            >
              + Créer un emplacement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map(location => (
              <div key={location.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                {/* Badge Principal */}
                {location.isMainLocation && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold mb-4">
                    ⭐ Principal
                  </div>
                )}

                {/* Nom */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{location.name}</h3>

                {/* Adresse */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>📍</span>
                    <div>
                      <div>{location.address}</div>
                      <div>{location.postalCode} {location.city}</div>
                      <div>{location.country}</div>
                    </div>
                  </div>

                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📞</span>
                      <span>{location.phone}</span>
                    </div>
                  )}

                  {location.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span>{location.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div>👥 {location._count.staff} employé(s)</div>
                  <div>🕐 {location._count.workingHours} horaire(s)</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/locations/${location.id}`)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                  >
                    Gérer
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${
                      location.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {location.active ? '✓ Actif' : '✗ Inactif'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Ajouter (TODO) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ajouter un emplacement</h2>
            <p className="text-gray-600 mb-6">Fonctionnalité à implémenter</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
