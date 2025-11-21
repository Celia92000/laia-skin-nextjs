"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  organization: {
    id: string
    name: string
    slug: string
  } | null
  locations: { id: string; name: string }[]
}

export default function GlobalUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [orgFilter, setOrgFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(50)

  const [organizations, setOrganizations] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, roleFilter, statusFilter, orgFilter, sortBy, sortOrder])

  async function fetchData() {
    try {
      const [usersRes, orgsRes] = await Promise.all([
        fetch('/api/super-admin/all-users'),
        fetch('/api/super-admin/organizations-list')
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      } else if (usersRes.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (usersRes.status === 403) {
        router.push('/admin')
      }

      if (orgsRes.ok) {
        const data = await orgsRes.json()
        setOrganizations(data.organizations)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...users]

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(user =>
        (user.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (user.organization?.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
      )
    }

    // Filtre rôle
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filtre statut
    if (statusFilter === 'ACTIVE') {
      filtered = filtered.filter(user => user.isActive)
    } else if (statusFilter === 'INACTIVE') {
      filtered = filtered.filter(user => !user.isActive)
    }

    // Filtre organisation
    if (orgFilter !== 'ALL') {
      filtered = filtered.filter(user => user.organization?.id === orgFilter)
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof User]
      let bVal: any = b[sortBy as keyof User]

      if (sortBy === 'createdAt' || sortBy === 'lastLoginAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }

      if (sortBy === 'organization') {
        aVal = a.organization?.name ?? ''
        bVal = b.organization?.name ?? ''
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  async function handleExportCSV() {
    const csv = [
      ['Nom', 'Email', 'Rôle', 'Organisation', 'Statut', 'Créé le', 'Dernière connexion'].join(','),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.organization?.name ?? 'N/A',
        user.isActive ? 'Actif' : 'Inactif',
        new Date(user.createdAt).toLocaleDateString('fr-FR'),
        user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `utilisateurs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  async function handleImpersonate(userId: string) {
    try {
      const response = await fetch('/api/super-admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.redirect
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/super-admin/all-users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#7c3aed" }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const roleColors: { [key: string]: string } = {
    SUPER_ADMIN: 'bg-red-100 text-red-800',
    ORG_OWNER: 'bg-purple-100 text-beige-800',
    ORG_ADMIN: 'bg-indigo-100 text-indigo-800',
    LOCATION_MANAGER: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-green-100 text-green-800',
    RECEPTIONIST: 'bg-yellow-100 text-yellow-800',
    CLIENT: 'bg-gray-100 text-gray-800'
  }

  // Stats
  const activeUsers = users.filter(u => u.isActive).length
  const inactiveUsers = users.filter(u => !u.isActive).length
  const roleStats = {
    SUPER_ADMIN: users.filter(u => u.role === 'SUPER_ADMIN').length,
    ORG_OWNER: users.filter(u => u.role === 'ORG_ADMIN').length,
    ORG_ADMIN: users.filter(u => u.role === 'ORG_ADMIN').length,
    LOCATION_MANAGER: users.filter(u => u.role === 'LOCATION_MANAGER').length,
    STAFF: users.filter(u => u.role === 'STAFF').length,
    RECEPTIONIST: users.filter(u => u.role === 'RECEPTIONIST').length,
    CLIENT: users.filter(u => u.role === 'CLIENT').length
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              Gestion Globale des Utilisateurs
            </h2>
            <p className="text-gray-700">{users.length} utilisateurs au total</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Utilisateurs</div>
            <div className="text-3xl font-bold" style={{ color: "#7c3aed" }}>{users.length}</div>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-green-600">✓ {activeUsers} actifs</span>
              <span className="text-red-600">✗ {inactiveUsers} inactifs</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Propriétaires</div>
            <div className="text-3xl font-bold" style={{ color: "#7c3aed" }}>{roleStats.ORG_OWNER}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Personnel</div>
            <div className="text-3xl font-bold text-blue-600">
              {roleStats.STAFF + roleStats.RECEPTIONIST + roleStats.LOCATION_MANAGER}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Clients</div>
            <div className="text-3xl font-bold text-green-600">{roleStats.CLIENT}</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, email, organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ORG_OWNER">Propriétaires</option>
                <option value="ORG_ADMIN">Admins Org</option>
                <option value="LOCATION_MANAGER">Managers</option>
                <option value="STAFF">Personnel</option>
                <option value="RECEPTIONIST">Réceptionnistes</option>
                <option value="CLIENT">Clients</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="ALL">Tous</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organisation</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="ALL">Toutes</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="createdAt">Date création</option>
                  <option value="lastLoginAt">Dernière connexion</option>
                  <option value="name">Nom</option>
                  <option value="organization">Organisation</option>
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
              Affichage de {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière connexion</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.organization?.name || <span className="text-gray-400">Aucune</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {user.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleImpersonate(user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            🔐
                          </button>
                        )}
                        {user.organization && (
                          <Link
                            href={`/super-admin/organizations/${user.organization.id}`}
                            className="hover-text-beige-900"
                            style={{ color: "#7c3aed" }}
                          >
                            Org
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
