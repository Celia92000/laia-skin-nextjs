"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AuditLog {
  id: string
  userId: string
  action: string
  targetType: string
  targetId: string | null
  organizationId: string | null
  before: any
  after: any
  ipAddress: string | null
  userAgent: string | null
  metadata: any
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  organization: {
    id: string
    name: string
    slug: string
  } | null
}

export default function AuditLogsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 })
  const [actionStats, setActionStats] = useState<{ action: string; count: number }[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })

  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    organizationId: '',
    startDate: '',
    endDate: ''
  })

  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters])

  async function fetchLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      if (filters.action) params.append('action', filters.action)
      if (filters.targetType) params.append('targetType', filters.targetType)
      if (filters.organizationId) params.append('organizationId', filters.organizationId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/super-admin/logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
        setStats(data.stats)
        setActionStats(data.actionStats)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  function getActionIcon(action: string) {
    switch (action) {
      case 'CREATE_ORG':
      case 'CREATE_USER':
      case 'CREATE_LOCATION':
        return '✨'
      case 'UPDATE_ORG':
      case 'UPDATE_USER':
      case 'UPDATE_LOCATION':
      case 'UPDATE_SETTINGS':
        return '✏️'
      case 'DELETE_ORG':
      case 'DELETE_USER':
      case 'DELETE_LOCATION':
        return '🗑️'
      case 'SUSPEND_ORG':
        return '⏸️'
      case 'ACTIVATE_ORG':
        return '▶️'
      case 'CANCEL_ORG':
        return '❌'
      case 'CHANGE_PLAN':
        return '📊'
      case 'IMPERSONATE':
        return '👁️'
      case 'END_IMPERSONATE':
        return '👋'
      case 'RESET_PASSWORD':
        return '🔑'
      default:
        return '📝'
    }
  }

  function getActionColor(action: string) {
    if (action.startsWith('CREATE')) return 'bg-green-50 border-green-200 text-green-800'
    if (action.startsWith('UPDATE')) return 'bg-blue-50 border-blue-200 text-blue-800'
    if (action.startsWith('DELETE')) return 'bg-red-50 border-red-200 text-red-800'
    if (action.includes('SUSPEND') || action.includes('CANCEL')) return 'bg-orange-50 border-orange-200 text-orange-800'
    if (action.includes('ACTIVATE')) return 'bg-green-50 border-green-200 text-green-800'
    if (action.includes('IMPERSONATE')) return 'bg-purple-50 border-purple-200 text-beige-800'
    return 'bg-gray-50 border-gray-200 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Action', 'Type', 'Organisation', 'IP', 'User Agent']
    const rows = logs.map(log => [
      formatDate(log.createdAt),
      `${log.user.name} (${log.user.email})`,
      log.action,
      log.targetType,
      log.organization?.name || '-',
      log.ipAddress || '-',
      log.userAgent || '-'
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#7c3aed" }}></div>
          <p className="text-gray-600">Chargement des logs...</p>
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
              Logs d'Audit
            </h2>
            <p className="text-gray-700">Historique de toutes les actions administratives</p>
          </div>
          <div>
            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">logs enregistrés</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-blue-700 mb-1">Aujourd'hui</div>
            <div className="text-3xl font-bold text-blue-800">{stats.today}</div>
            <div className="text-xs text-blue-600 mt-1">actions</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-purple-700 mb-1">Cette semaine</div>
            <div className="text-3xl font-bold text-beige-800">{stats.thisWeek}</div>
            <div className="text-xs mt-1" style={{ color: "#7c3aed" }}>actions</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-green-700 mb-1">Ce mois</div>
            <div className="text-3xl font-bold text-green-800">{stats.thisMonth}</div>
            <div className="text-xs text-green-600 mt-1">actions</div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {actionStats.map((stat, idx) => (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">{getActionIcon(stat.action)}</div>
                <div className="text-xs text-gray-600 mb-1">{stat.action.replace(/_/g, ' ')}</div>
                <div className="text-xl font-bold text-gray-800">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
            >
              <option value="">Toutes les actions</option>
              <option value="CREATE_ORG">Créer organisation</option>
              <option value="UPDATE_ORG">Modifier organisation</option>
              <option value="DELETE_ORG">Supprimer organisation</option>
              <option value="SUSPEND_ORG">Suspendre organisation</option>
              <option value="ACTIVATE_ORG">Activer organisation</option>
              <option value="CANCEL_ORG">Annuler organisation</option>
              <option value="CHANGE_PLAN">Changer plan</option>
              <option value="CREATE_USER">Créer utilisateur</option>
              <option value="UPDATE_USER">Modifier utilisateur</option>
              <option value="DELETE_USER">Supprimer utilisateur</option>
              <option value="IMPERSONATE">Impersonnation</option>
              <option value="END_IMPERSONATE">Fin impersonnation</option>
            </select>

            <select
              value={filters.targetType}
              onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
            >
              <option value="">Tous les types</option>
              <option value="ORGANIZATION">Organisation</option>
              <option value="USER">Utilisateur</option>
              <option value="LOCATION">Point de vente</option>
              <option value="SETTINGS">Paramètres</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
              placeholder="Date début"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
              placeholder="Date fin"
            />

            <button
              onClick={() => setFilters({ action: '', targetType: '', organizationId: '', startDate: '', endDate: '' })}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">Aucun log trouvé</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl p-2 rounded-lg border ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {log.action.replace(/_/g, ' ')} - {log.targetType}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Par <span className="font-medium">{log.user.name}</span> ({log.user.email})
                          </p>
                          {log.organization && (
                            <p className="text-sm text-gray-600">
                              Organisation: <span className="font-medium">{log.organization.name}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {log.ipAddress && <span>🌐 {log.ipAddress}</span>}
                        {log.userAgent && <span title={log.userAgent}>💻 {log.userAgent.substring(0, 50)}...</span>}
                      </div>

                      {(log.before || log.after || log.metadata) && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="text-sm hover:text-beige-800"
                            style={{ color: "#7c3aed" }}
                          >
                            {expandedLog === log.id ? '▼ Masquer détails' : '▶ Voir détails'}
                          </button>

                          {expandedLog === log.id && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                              {log.before && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Avant:</div>
                                  <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
                                    {JSON.stringify(log.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.after && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Après:</div>
                                  <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
                                    {JSON.stringify(log.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.metadata && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Métadonnées:</div>
                                  <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} logs)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
