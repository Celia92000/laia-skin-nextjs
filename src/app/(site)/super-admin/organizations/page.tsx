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

export default function OrganizationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'organizations' | 'users'>('organizations')
  const [loading, setLoading] = useState(true)

  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [orgSearchTerm, setOrgSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [orgSortBy, setOrgSortBy] = useState('createdAt')
  const [orgSortOrder, setOrgSortOrder] = useState<'asc' | 'desc'>('desc')

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [userStatusFilter, setUserStatusFilter] = useState('ALL')
  const [orgFilter, setOrgFilter] = useState('ALL')
  const [userSortBy, setUserSortBy] = useState('createdAt')
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(50)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (activeTab === 'organizations') {
      applyOrgFilters()
    } else {
      applyUserFilters()
    }
  }, [
    organizations,
    orgSearchTerm,
    planFilter,
    statusFilter,
    orgSortBy,
    orgSortOrder,
    users,
    userSearchTerm,
    roleFilter,
    userStatusFilter,
    orgFilter,
    userSortBy,
    userSortOrder,
    activeTab
  ])

  async function fetchData() {
    setLoading(true)
    try {
      const [orgsRes, usersRes] = await Promise.all([
        fetch('/api/super-admin/organizations-list'),
        fetch('/api/super-admin/all-users')
      ])

      if (orgsRes.ok) {
        const data = await orgsRes.json()
        setOrganizations(data.organizations)
      } else if (orgsRes.status === 401) {
        router.push('/login?redirect=/super-admin')
        return
      } else if (orgsRes.status === 403) {
        router.push('/admin')
        return
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Organizations filters
  function applyOrgFilters() {
    if (!organizations) return

    let filtered = [...organizations]

    if (orgSearchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
        org.subdomain.toLowerCase().includes(orgSearchTerm.toLowerCase())
      )
    }

    if (planFilter !== 'ALL') {
      filtered = filtered.filter(org => org.plan === planFilter)
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(org => org.status === statusFilter)
    }

    filtered.sort((a, b) => {
      let aVal: any = a[orgSortBy as keyof Organization]
      let bVal: any = b[orgSortBy as keyof Organization]

      if (orgSortBy === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (orgSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredOrgs(filtered)
  }

  // Users filters
  function applyUserFilters() {
    if (!users) return

    let filtered = [...users]

    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.organization?.name.toLowerCase().includes(userSearchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (userStatusFilter === 'ACTIVE') {
      filtered = filtered.filter(user => user.isActive)
    } else if (userStatusFilter === 'INACTIVE') {
      filtered = filtered.filter(user => !user.isActive)
    }

    if (orgFilter !== 'ALL') {
      filtered = filtered.filter(user => user.organization?.id === orgFilter)
    }

    filtered.sort((a, b) => {
      let aVal: any = a[userSortBy as keyof User]
      let bVal: any = b[userSortBy as keyof User]

      if (userSortBy === 'createdAt' || userSortBy === 'lastLoginAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }

      if (userSortBy === 'organization') {
        aVal = a.organization?.name || ''
        bVal = b.organization?.name || ''
      }

      if (userSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  async function handleOrgExportCSV() {
    if (!filteredOrgs || filteredOrgs.length === 0) return

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

  async function handleUserExportCSV() {
    if (!filteredUsers || filteredUsers.length === 0) return

    const csv = [
      ['Nom', 'Email', 'Rôle', 'Organisation', 'Statut', 'Créé le', 'Dernière connexion'].join(','),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.organization?.name || 'N/A',
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
        fetchData()
      } else {
        const error = await response.json()
        alert(`❌ Erreur : ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#d4b5a0' }}></div>
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
    TEAM: 'bg-amber-100 text-amber-800',
    PREMIUM: 'bg-indigo-100 text-indigo-800',
  }

  const roleColors: { [key: string]: string } = {
    SUPER_ADMIN: 'bg-red-100 text-red-800',
    ORG_OWNER: 'bg-amber-100 text-amber-800',
    ORG_ADMIN: 'bg-indigo-100 text-indigo-800',
    LOCATION_MANAGER: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-green-100 text-green-800',
    RECEPTIONIST: 'bg-yellow-100 text-yellow-800',
    CLIENT: 'bg-gray-100 text-gray-800'
  }

  // User stats
  const activeUsers = users?.filter(u => u.isActive).length || 0
  const inactiveUsers = users?.filter(u => !u.isActive).length || 0
  const roleStats = {
    SUPER_ADMIN: users?.filter(u => u.role === 'SUPER_ADMIN').length || 0,
    ORG_OWNER: users?.filter(u => u.role === 'ORG_OWNER').length || 0,
    ORG_ADMIN: users?.filter(u => u.role === 'ORG_ADMIN').length || 0,
    LOCATION_MANAGER: users?.filter(u => u.role === 'LOCATION_MANAGER').length || 0,
    STAFF: users?.filter(u => u.role === 'STAFF').length || 0,
    RECEPTIONIST: users?.filter(u => u.role === 'RECEPTIONIST').length || 0,
    CLIENT: users?.filter(u => u.role === 'CLIENT').length || 0
  }

  // Pagination for users
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser) || []
  const totalPages = Math.ceil((filteredUsers?.length || 0) / usersPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #d4b5a0, #c9a589)' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/super-admin" className="text-white/80 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === 'organizations' ? '🏢 Organisations' : '👥 Utilisateurs'}
              </h1>
              <p className="text-white/90">
                {activeTab === 'organizations'
                  ? `${filteredOrgs?.length || 0} organisation${(filteredOrgs?.length || 0) > 1 ? 's' : ''}`
                  : `${users?.length || 0} utilisateurs au total`
                }
              </p>
            </div>
            {activeTab === 'organizations' && (
              <Link
                href="/super-admin/organizations/new"
                className="px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition font-semibold"
                style={{ color: '#b8935f' }}
              >
                + Nouvelle organisation
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'organizations'
                  ? 'bg-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={activeTab === 'organizations' ? { color: '#b8935f' } : {}}
            >
              🏢 Organisations
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={activeTab === 'users' ? { color: '#b8935f' } : {}}
            >
              👥 Utilisateurs
            </button>
          </div>
        </div>
      </div>

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
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
                  value={orgSearchTerm}
                  onChange={(e) => setOrgSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    value={orgSortBy}
                    onChange={(e) => setOrgSortBy(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="createdAt">Date création</option>
                    <option value="name">Nom</option>
                    <option value="plan">Plan</option>
                    <option value="status">Statut</option>
                  </select>
                  <button
                    onClick={() => setOrgSortOrder(orgSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {orgSortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Affichage de {filteredOrgs?.length || 0} sur {organizations?.length || 0} organisations
              </div>
              <button
                onClick={handleOrgExportCSV}
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

            {(filteredOrgs?.length || 0) === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune organisation trouvée</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total Utilisateurs</div>
              <div className="text-3xl font-bold" style={{ color: '#b8935f' }}>{users?.length || 0}</div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-green-600">✓ {activeUsers} actifs</span>
                <span className="text-red-600">✗ {inactiveUsers} inactifs</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Propriétaires</div>
              <div className="text-3xl font-bold" style={{ color: '#b8935f' }}>{roleStats.ORG_OWNER}</div>
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
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
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
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
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
                    value={userSortBy}
                    onChange={(e) => setUserSortBy(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="createdAt">Date création</option>
                    <option value="lastLoginAt">Dernière connexion</option>
                    <option value="name">Nom</option>
                    <option value="organization">Organisation</option>
                  </select>
                  <button
                    onClick={() => setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {userSortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Affichage de {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers?.length || 0)} sur {filteredUsers?.length || 0} utilisateurs
              </div>
              <button
                onClick={handleUserExportCSV}
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
                              style={{ color: '#b8935f' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#8B7355'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#b8935f'}
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

            {(filteredUsers?.length || 0) === 0 && (
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
      )}
    </div>
  )
}
