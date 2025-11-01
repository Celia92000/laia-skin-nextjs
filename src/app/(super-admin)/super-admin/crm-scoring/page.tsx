'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ScoredOrganization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  recency: {
    score: number
    daysSinceLastActivity: number
    lastReservationDate: string | null
  }
  frequency: {
    score: number
    totalReservations: number
    averagePerMonth: number
  }
  monetary: {
    score: number
    totalRevenue: number
    averageOrderValue: number
  }
  rfmScore: number
  segment: string
  churnRisk: string
  activeClients: number
  totalClients: number
  createdAt: string
}

interface Stats {
  total: number
  bySegment: Record<string, number>
  byChurnRisk: Record<string, number>
  averageScore: number
}

export default function CRMScoringPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [organizations, setOrganizations] = useState<ScoredOrganization[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [calculatedAt, setCalculatedAt] = useState<string>('')
  const [filterSegment, setFilterSegment] = useState<string>('all')
  const [filterChurnRisk, setFilterChurnRisk] = useState<string>('all')

  useEffect(() => {
    fetchScoring()
  }, [])

  async function fetchScoring() {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/crm/scoring')

      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations)
        setStats(data.stats)
        setCalculatedAt(data.calculatedAt)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/crm-scoring')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching scoring:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshScoring() {
    try {
      setRefreshing(true)
      const response = await fetch('/api/super-admin/crm/scoring/refresh', {
        method: 'POST'
      })

      if (response.ok) {
        await fetchScoring()
        alert('✅ Scores RFM recalculés avec succès !')
      }
    } catch (error) {
      console.error('Error refreshing scoring:', error)
      alert('❌ Erreur lors du recalcul des scores')
    } finally {
      setRefreshing(false)
    }
  }

  const filteredOrganizations = organizations.filter(org => {
    if (filterSegment !== 'all' && org.segment !== filterSegment) return false
    if (filterChurnRisk !== 'all' && org.churnRisk !== filterChurnRisk) return false
    return true
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    if (score >= 20) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getChurnRiskColor = (risk: string) => {
    if (risk === 'Faible') return 'bg-green-100 text-green-800'
    if (risk === 'Moyen') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Champions': 'bg-purple-100 text-purple-800',
      'Loyaux': 'bg-blue-100 text-blue-800',
      'Gros dépensiers': 'bg-green-100 text-green-800',
      'Prometteurs': 'bg-cyan-100 text-cyan-800',
      'À risque': 'bg-orange-100 text-orange-800',
      'Hibernation': 'bg-yellow-100 text-yellow-800',
      'Perdus': 'bg-red-100 text-red-800',
      'Dormant': 'bg-gray-100 text-gray-800'
    }
    return colors[segment] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Calcul des scores RFM en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              📊 Scoring RFM Automatique
            </h2>
            <p className="text-gray-700">Analyse Recency, Frequency, Monetary de toutes les organisations</p>
            {calculatedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Dernière mise à jour : {new Date(calculatedAt).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
          <button
            onClick={handleRefreshScoring}
            disabled={refreshing}
            className="px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition font-semibold border-2 shadow-sm disabled:opacity-50"
            style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
          >
            {refreshing ? '⟳ Recalcul...' : '🔄 Recalculer les scores'}
          </button>
        </div>
      </div>

      {/* Stats globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Score moyen</div>
            <div className={`text-4xl font-bold ${getScoreColor(stats.averageScore).split(' ')[0]}`}>
              {stats.averageScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">/100</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Champions</div>
            <div className="text-4xl font-bold text-purple-600">{stats.bySegment['Champions'] || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Meilleurs clients</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">À risque</div>
            <div className="text-4xl font-bold text-orange-600">{stats.bySegment['À risque'] || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Besoin d'attention</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Perdus</div>
            <div className="text-4xl font-bold text-red-600">
              {stats.bySegment['Perdus'] || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Réactivation nécessaire</div>
          </div>
        </div>
      )}

      {/* Segments */}
      {stats && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Distribution par segment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.bySegment).map(([segment, count]) => (
              <div
                key={segment}
                className="p-4 rounded-lg border-2 hover:shadow-md transition cursor-pointer"
                onClick={() => setFilterSegment(segment)}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getSegmentColor(segment)}`}>
                  {segment}
                </div>
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-500">
                  {Math.round((count / stats.total) * 100)}% du total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risque de churn */}
      {stats && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Risque de désabonnement (Churn)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.byChurnRisk).map(([risk, count]) => (
              <div
                key={risk}
                className="p-6 rounded-lg border-2 hover:shadow-md transition cursor-pointer"
                onClick={() => setFilterChurnRisk(risk)}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getChurnRiskColor(risk)}`}>
                  Risque {risk}
                </div>
                <div className="text-3xl font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {Math.round((count / stats.total) * 100)}% des organisations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tous les segments</option>
              <option value="Champions">Champions</option>
              <option value="Loyaux">Loyaux</option>
              <option value="Gros dépensiers">Gros dépensiers</option>
              <option value="Prometteurs">Prometteurs</option>
              <option value="À risque">À risque</option>
              <option value="Hibernation">Hibernation</option>
              <option value="Perdus">Perdus</option>
              <option value="Dormant">Dormant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risque de churn</label>
            <select
              value={filterChurnRisk}
              onChange={(e) => setFilterChurnRisk(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tous les risques</option>
              <option value="Faible">Faible</option>
              <option value="Moyen">Moyen</option>
              <option value="Élevé">Élevé</option>
            </select>
          </div>

          {(filterSegment !== 'all' || filterChurnRisk !== 'all') && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterSegment('all')
                  setFilterChurnRisk('all')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table des organisations */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score RFM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">R-F-M</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risque Churn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clients actifs</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                    <div className="text-xs text-gray-500">{org.plan}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(org.rfmScore)}`}>
                      {org.rfmScore}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSegmentColor(org.segment)}`}>
                      {org.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded ${getScoreColor(org.recency.score * 20)}`}>
                        R:{org.recency.score}
                      </span>
                      <span className={`px-2 py-1 rounded ${getScoreColor(org.frequency.score * 20)}`}>
                        F:{org.frequency.score}
                      </span>
                      <span className={`px-2 py-1 rounded ${getScoreColor(org.monetary.score * 20)}`}>
                        M:{org.monetary.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {org.monetary.totalRevenue.toLocaleString('fr-FR')}€
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {org.frequency.totalReservations}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getChurnRiskColor(org.churnRisk)}`}>
                      {org.churnRisk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {org.activeClients} / {org.totalClients}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune organisation trouvée avec ces filtres
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">📚 Comprendre le scoring RFM</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🕒 Recency (Récence)</h4>
            <p className="text-sm text-blue-700">
              Depuis combien de temps le client a-t-il effectué sa dernière réservation ? Plus c'est récent, mieux c'est.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🔄 Frequency (Fréquence)</h4>
            <p className="text-sm text-blue-700">
              Combien de réservations le client a-t-il effectuées ? Plus il y en a, plus il est engagé.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">💰 Monetary (Monétaire)</h4>
            <p className="text-sm text-blue-700">
              Combien le client a-t-il dépensé au total ? Plus il dépense, plus sa valeur est élevée.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
