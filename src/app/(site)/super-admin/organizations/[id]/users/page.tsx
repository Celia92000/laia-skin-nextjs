"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  lastLoginAt: string | null
  isActive: boolean
  locations: { id: string; name: string }[]
}

interface Organization {
  id: string
  name: string
  slug: string
}

export default function OrganizationUsersPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  useEffect(() => {
    fetchUsers()
  }, [params.id])

  async function fetchUsers() {
    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/users`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
        setUsers(data.users)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error changing role:', error)
    }
  }

  async function handleDeleteUser(userId: string, userEmail: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) return

    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Utilisateur supprimé avec succès')
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleColors: { [key: string]: string } = {
    ORG_OWNER: 'bg-purple-100 text-purple-800',
    ORG_ADMIN: 'bg-indigo-100 text-indigo-800',
    LOCATION_MANAGER: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-green-100 text-green-800',
    RECEPTIONIST: 'bg-yellow-100 text-yellow-800',
    CLIENT: 'bg-gray-100 text-gray-800'
  }

  const roleLabels: { [key: string]: string } = {
    ORG_OWNER: 'Propriétaire',
    ORG_ADMIN: 'Admin Org',
    LOCATION_MANAGER: 'Manager',
    STAFF: 'Personnel',
    RECEPTIONIST: 'Réceptionniste',
    CLIENT: 'Client'
  }

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
          <h1 className="text-3xl font-bold mb-2">Utilisateurs - {organization.name}</h1>
          <p className="text-purple-100">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ORG_OWNER">Propriétaire</option>
                <option value="ORG_ADMIN">Admin Org</option>
                <option value="LOCATION_MANAGER">Manager</option>
                <option value="STAFF">Personnel</option>
                <option value="RECEPTIONIST">Réceptionniste</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emplacements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}
                      >
                        <option value="ORG_OWNER">Propriétaire</option>
                        <option value="ORG_ADMIN">Admin Org</option>
                        <option value="LOCATION_MANAGER">Manager</option>
                        <option value="STAFF">Personnel</option>
                        <option value="RECEPTIONIST">Réceptionniste</option>
                        <option value="CLIENT">Client</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.locations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.locations.map(loc => (
                              <span key={loc.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {loc.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Tous</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`px-3 py-1 text-xs font-semibold rounded ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
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

        <div className="mt-4 text-sm text-gray-600">
          Affichage de {filteredUsers.length} sur {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
