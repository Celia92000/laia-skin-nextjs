"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  subdomain: string
  domain: string | null
  createdAt: string
  locations: any[]
}

export default function OrganizationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [organizations, searchTerm, planFilter, statusFilter, sortBy, sortOrder])

  async function fetchOrganizations() {
    try {
      const response = await fetch('/api/super-admin/organizations-list')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...organizations]

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre plan
    if (planFilter !== 'ALL') {
      filtered = filtered.filter(org => org.plan === planFilter)
    }

    // Filtre statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(org => org.status === statusFilter)
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Organization]
      let bVal: any = b[sortBy as keyof Organization]

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredOrgs(filtered)
  }

  async function handleExportCSV() {
    const csv = [
      ['Nom', 'Slug', 'Plan', 'Statut', 'Emplacements', 'Créé le'].join(','),
      ...filteredOrgs.map(org => [
        org.name,
        org.slug,
        org.plan,
        org.status,
        org.locations?.length || 0,
        new Date(org.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `organisations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  async function handleDelete(org: Organization) {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer "${org.name}" ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n- Tous les utilisateurs\n- Tous les emplacements\n- Toutes les réservations\n- Tous les services et produits\n- Toutes les données associées`)) {
      return
    }

    const confirmText = prompt(`Pour confirmer, tapez le nom de l'organisation : "${org.name}"`)
    if (confirmText !== org.name) {
      alert('Le nom ne correspond pas. Suppression annulée.')
      return
    }

    try {
      const response = await fetch(`/api/super-admin/organizations/${org.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ Organisation supprimée avec succès')
        fetchOrganizations() // Recharger la liste
      } else {
        const error = await response.json()
        alert(`❌ Erreur : ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
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

  const statusColors: { [key: string]: string } = {
    ACTIVE: 'bg-green-100 text-green-800',
    TRIAL: 'bg-blue-100 text-blue-800',
    SUSPENDED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const planColors: { [key: string]: string } = {
    SOLO: 'bg-gray-100 text-gray-800',
    DUO: 'bg-blue-100 text-blue-800',
    TEAM: 'bg-purple-100 text-purple-800',
    PREMIUM: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/super-admin" className="text-purple-200 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">📋 Toutes les Organisations</h1>
              <p className="text-purple-100">{filteredOrgs.length} organisation{filteredOrgs.length > 1 ? 's' : ''}</p>
            </div>
            <Link
              href="/super-admin/organizations/new"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              + Nouvelle organisation
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom, slug, subdomain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan
              </label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Tous les plans</option>
                <option value="SOLO">SOLO</option>
                <option value="DUO">DUO</option>
                <option value="TEAM">TEAM</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="TRIAL">Essai</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="createdAt">Date création</option>
                  <option value="name">Nom</option>
                  <option value="plan">Plan</option>
                  <option value="status">Statut</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Affichage de {filteredOrgs.length} sur {organizations.length} organisations
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              📥 Exporter CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emplacements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domaine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">@{org.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${planColors[org.plan] || 'bg-gray-100 text-gray-800'}`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[org.status]}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {org.locations?.length || 0} emplacements
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {org.domain || (
                        <span className="text-gray-400">{org.subdomain}.platform.com</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/super-admin/organizations/${org.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          👁️ Voir
                        </Link>
                        <Link
                          href={`/super-admin/organizations/${org.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ✏️ Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(org)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrgs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune organisation trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
