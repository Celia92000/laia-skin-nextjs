"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  organizationId: string | null
  userId: string | null
  read: boolean
  actionUrl: string | null
  metadata: any
  createdAt: string
  organization: {
    id: string
    name: string
    slug: string
    subdomain: string
  } | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 })
  const [filter, setFilter] = useState('all') // all, unread, read
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  useEffect(() => {
    fetchNotifications()
  }, [filter, typeFilter])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('filter', filter)
      if (typeFilter) params.append('type', typeFilter)

      const response = await fetch(`/api/super-admin/notifications?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setStats(data.stats)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(ids: string[], read = true) {
    try {
      const response = await fetch('/api/super-admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids, read })
      })
      if (response.ok) {
        fetchNotifications()
        setSelectedNotifications([])
      }
    } catch (error) {
      console.error('Error marking notifications:', error)
    }
  }

  async function deleteNotifications(ids: string[]) {
    if (!confirm(`Supprimer ${ids.length} notification(s) ?`)) return

    try {
      const response = await fetch(`/api/super-admin/notifications?ids=${ids.join(',')}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchNotifications()
        setSelectedNotifications([])
      }
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
  }

  function toggleSelectAll() {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map(n => n.id))
    }
  }

  function toggleSelect(id: string) {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id))
    } else {
      setSelectedNotifications([...selectedNotifications, id])
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'TRIAL_EXPIRING_7D':
      case 'TRIAL_EXPIRING_3D':
        return '⏰'
      case 'TRIAL_EXPIRED':
        return '⚠️'
      case 'LIMIT_REACHED_80':
      case 'LIMIT_REACHED_100':
        return '📊'
      case 'PAYMENT_FAILED':
        return '💳'
      case 'INACTIVE_ORG':
        return '😴'
      case 'NEW_ORGANIZATION':
        return '🎉'
      case 'CANCELLED_SUBSCRIPTION':
        return '❌'
      default:
        return '📢'
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'NEW_ORGANIZATION':
        return 'bg-green-50 border-green-200'
      case 'TRIAL_EXPIRING_7D':
        return 'bg-yellow-50 border-yellow-200'
      case 'TRIAL_EXPIRING_3D':
      case 'TRIAL_EXPIRED':
        return 'bg-orange-50 border-orange-200'
      case 'PAYMENT_FAILED':
      case 'CANCELLED_SUBSCRIPTION':
        return 'bg-red-50 border-red-200'
      case 'LIMIT_REACHED_80':
      case 'LIMIT_REACHED_100':
        return 'bg-purple-50 border-purple-200'
      case 'INACTIVE_ORG':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#7c3aed" }}></div>
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    )
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
              Notifications & Alertes
            </h2>
            <p className="text-gray-700">Centre de notifications de la plateforme</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">notifications</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-orange-700 mb-1">Non lues</div>
            <div className="text-3xl font-bold text-orange-800">{stats.unread}</div>
            <div className="text-xs text-orange-600 mt-1">à traiter</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-green-700 mb-1">Lues</div>
            <div className="text-3xl font-bold text-green-800">{stats.read}</div>
            <div className="text-xs text-green-600 mt-1">traitées</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all' ? 'text-white' : 'bg-gray-100 text-gray-700'
                }`}
                style={filter === 'all' ? { backgroundColor: "#7c3aed" } : {}}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'unread' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Non lues ({stats.unread})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'read' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Lues ({stats.read})
              </button>
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium"
            >
              <option value="">Tous les types</option>
              <option value="NEW_ORGANIZATION">Nouvelles organisations</option>
              <option value="TRIAL_EXPIRING_7D">Essais expirant 7j</option>
              <option value="TRIAL_EXPIRING_3D">Essais expirant 3j</option>
              <option value="TRIAL_EXPIRED">Essais expirés</option>
              <option value="LIMIT_REACHED_80">Limites 80%</option>
              <option value="LIMIT_REACHED_100">Limites 100%</option>
              <option value="PAYMENT_FAILED">Paiements échoués</option>
              <option value="INACTIVE_ORG">Organisations inactives</option>
              <option value="CANCELLED_SUBSCRIPTION">Abonnements annulés</option>
            </select>

            {/* Bulk actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => markAsRead(selectedNotifications, true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Marquer comme lues ({selectedNotifications.length})
                </button>
                <button
                  onClick={() => markAsRead(selectedNotifications, false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  ⭯ Marquer comme non lues
                </button>
                <button
                  onClick={() => deleteNotifications(selectedNotifications)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🗑️ Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">Aucune notification</p>
            </div>
          ) : (
            <div>
              {/* Select all */}
              <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === notifications.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded focus:ring-2 focus:ring-amber-500"
                  style={{ color: "#7c3aed" }}
                />
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length > 0
                    ? `${selectedNotifications.length} sélectionné(s)`
                    : 'Tout sélectionner'}
                </span>
              </div>

              {/* Notifications */}
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${
                      notification.read ? 'bg-white' : 'bg-blue-50 border-l-blue-500'
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelect(notification.id)}
                        className="w-5 h-5 mt-1 rounded focus:ring-2 focus:ring-amber-500"
                        style={{ color: "#7c3aed" }}
                      />

                      <div className={`text-3xl p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            {notification.organization && (
                              <p className="text-sm text-gray-600">
                                Organisation: <span className="font-medium">{notification.organization.name}</span>
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{notification.message}</p>

                        <div className="flex items-center gap-3">
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-sm hover:text-beige-800 font-medium"
                              style={{ color: "#7c3aed" }}
                            >
                              Voir l'organisation →
                            </Link>
                          )}

                          {!notification.read && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className="text-sm text-green-600 hover:text-green-800"
                            >
                              ✓ Marquer comme lu
                            </button>
                          )}

                          {notification.read && (
                            <button
                              onClick={() => markAsRead([notification.id], false)}
                              className="text-sm text-orange-600 hover:text-orange-800"
                            >
                              ⭯ Marquer comme non lu
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotifications([notification.id])}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
