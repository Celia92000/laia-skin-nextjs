"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOrganizationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    legalName: '',
    type: 'SINGLE_LOCATION',
    plan: 'SOLO',
    ownerEmail: '',
    ownerPhone: '',
    domain: '',
    subdomain: '',

    // Configuration de base
    siteName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',

    // Emplacement principal
    locationName: '',
    locationAddress: '',
    locationCity: '',
    locationPostalCode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-générer le slug à partir du nom
    if (name === 'name') {
      const slug = value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
        .replace(/(^-|-$)/g, '') // Enlever les tirets au début et à la fin
      setFormData(prev => ({ ...prev, slug, subdomain: slug, siteName: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/super-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/super-admin/organizations/${data.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">➕ Nouvelle Organisation</h1>
          <p className="text-purple-100">Créer un nouvel institut de beauté</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations principales */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Informations principales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'institut *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Beauté Éternelle Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    pattern="[a-z0-9-]+"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="beaute-eternelle-paris"
                  />
                  <p className="mt-1 text-xs text-gray-500">Utilisé dans l'URL (lettres minuscules, chiffres et tirets uniquement)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdomain *
                  </label>
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    required
                    pattern="[a-z0-9-]+"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="beaute-eternelle"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.subdomain}.platform.com</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="SINGLE_LOCATION">Un seul emplacement</option>
                    <option value="MULTI_LOCATION">Plusieurs emplacements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan d'abonnement *
                  </label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="SOLO">SOLO - 49€/mois</option>
                    <option value="DUO">DUO - 99€/mois</option>
                    <option value="TEAM">TEAM - 199€/mois</option>
                    <option value="PREMIUM">PREMIUM - 399€/mois</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email du propriétaire *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="proprietaire@beaute-eternelle.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
              </div>
            </div>

            {/* Domaines */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Domaines (optionnel)
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domaine personnalisé
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="beaute-eternelle.fr"
                  />
                  <p className="mt-1 text-xs text-gray-500">Domaine personnalisé (nécessite configuration DNS)</p>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer l\'organisation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
