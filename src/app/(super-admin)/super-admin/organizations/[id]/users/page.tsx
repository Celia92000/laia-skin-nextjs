"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrganizationUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'STAFF'
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/super-admin/organizations/${id}/users`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      const url = editingUser
        ? `/api/super-admin/organizations/${id}/users/${editingUser.id}`
        : `/api/super-admin/organizations/${id}/users`

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès'
        })
        setShowModal(false)
        setEditingUser(null)
        setFormData({ email: '', password: '', name: '', phone: '', role: 'STAFF' })
        fetchData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de l\'opération' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const response = await fetch(`/api/super-admin/organizations/${id}/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Utilisateur supprimé avec succès' })
        fetchData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  const openEditModal = (user: any) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      phone: user.phone || '',
      role: user.role
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({ email: '', password: '', name: '', phone: '', role: 'STAFF' })
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

  const canAddUser = users.length < organization.maxUsers
  const usagePercent = (users.length / organization.maxUsers) * 100

  const roleLabels: { [key: string]: string } = {
    ORG_OWNER: 'Propriétaire',
    ORG_ADMIN: 'Admin',
    ACCOUNTANT: 'Comptable',
    LOCATION_MANAGER: 'Responsable point de vente',
    STAFF: 'Employé',
    RECEPTIONIST: 'Réceptionniste',
    CLIENT: 'Client'
  }

  const roleColors: { [key: string]: string } = {
    ORG_OWNER: 'bg-purple-100 text-beige-800',
    ORG_ADMIN: 'bg-indigo-100 text-indigo-800',
    ACCOUNTANT: 'bg-orange-100 text-orange-800',
    LOCATION_MANAGER: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-green-100 text-green-800',
    RECEPTIONIST: 'bg-yellow-100 text-yellow-800',
    CLIENT: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href={`/super-admin/organizations/${id}`} className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour à l'organisation
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              Utilisateurs de {organization.name}
            </h2>
            <p className="text-gray-700">Gérer les identifiants et les accès</p>
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
                Plan <strong>{organization.plan}</strong> : {users.length} / {organization.maxUsers} utilisateurs
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
              <strong>Attention :</strong> La limite d'utilisateurs est atteinte. Mettez à niveau le plan pour ajouter plus d'utilisateurs.
            </p>
          )}
        </div>

        {/* Bouton d'ajout */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Tous les utilisateurs ({users.length})
          </h2>
          <button
            onClick={openCreateModal}
            disabled={!canAddUser}
            className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canAddUser ? 'linear-gradient(135deg, #7c3aed 0%, #e8b4b8 100%)' : '#9ca3af'
            }}
          >
            + Créer un utilisateur
          </button>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Modifier
                    </button>
                    {user.role !== 'ORG_ADMIN' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#7c3aed' }}>
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ backgroundColor: 'white' }}
                >
                  <option value="ORG_ADMIN">Admin (accès complet)</option>
                  <option value="ACCOUNTANT">Comptable (accès finances)</option>
                  <option value="LOCATION_MANAGER">Responsable point de vente</option>
                  <option value="STAFF">Employé</option>
                  <option value="RECEPTIONIST">Réceptionniste</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
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
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
