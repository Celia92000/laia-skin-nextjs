"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AnalyticsData {
  growth: {
    organizations: { month: string; count: number }[]
    users: { month: string; count: number }[]
    reservations: { month: string; count: number }[]
  }
  conversion: {
    trialToActive: number
    cancellationRate: number
    retentionRate: number
  }
  revenue: {
    mrr: number
    arr: number
    byPlan: { plan: string; revenue: number; count: number }[]
  }
  topOrganizations: {
    byRevenue: { id: string; name: string; revenue: number }[]
    byReservations: { id: string; name: string; reservations: number }[]
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/super-admin/analytics?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
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
              <h1 className="text-3xl font-bold mb-2">📊 Analytics & Rapports</h1>
              <p className="text-purple-100">Analyse détaillée de la plateforme</p>
            </div>
            <div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Revenus MRR/ARR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">MRR (Monthly Recurring Revenue)</div>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(analytics.revenue.mrr)}</div>
            <div className="text-xs text-gray-500 mt-2">Revenus mensuels récurrents</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">ARR (Annual Recurring Revenue)</div>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(analytics.revenue.arr)}</div>
            <div className="text-xs text-gray-500 mt-2">Revenus annuels récurrents</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Revenu moyen par org</div>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(analytics.revenue.byPlan.reduce((acc, p) => acc + p.revenue, 0) /
                Math.max(analytics.revenue.byPlan.reduce((acc, p) => acc + p.count, 0), 1))}
            </div>
            <div className="text-xs text-gray-500 mt-2">ARPU mensuel</div>
          </div>
        </div>

        {/* Taux de conversion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-green-700 mb-1">Taux de conversion</div>
            <div className="text-3xl font-bold text-green-800">{analytics.conversion.trialToActive}%</div>
            <div className="text-xs text-green-600 mt-2">Essai → Payant</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-blue-700 mb-1">Taux de rétention</div>
            <div className="text-3xl font-bold text-blue-800">{analytics.conversion.retentionRate}%</div>
            <div className="text-xs text-blue-600 mt-2">Clients actifs après 3 mois</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-red-700 mb-1">Taux d'annulation</div>
            <div className="text-3xl font-bold text-red-800">{analytics.conversion.cancellationRate}%</div>
            <div className="text-xs text-red-600 mt-2">Churn mensuel</div>
          </div>
        </div>

        {/* Revenus par plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenus par Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.revenue.byPlan.map(plan => (
              <div key={plan.plan} className="border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{plan.plan}</div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(plan.revenue)}</div>
                <div className="text-xs text-gray-500 mt-1">{plan.count} organisations</div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphiques de croissance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Organisations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelles Organisations</h3>
            <div className="space-y-2">
              {analytics.growth.organizations.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-purple-100 rounded" style={{ width: `${(item.count / Math.max(...analytics.growth.organizations.map(i => i.count))) * 100}%` }}>
                      <div className="h-full bg-purple-600 rounded flex items-center justify-end pr-2">
                        <span className="text-white text-xs font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utilisateurs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouveaux Utilisateurs</h3>
            <div className="space-y-2">
              {analytics.growth.users.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-blue-100 rounded" style={{ width: `${(item.count / Math.max(...analytics.growth.users.map(i => i.count))) * 100}%` }}>
                      <div className="h-full bg-blue-600 rounded flex items-center justify-end pr-2">
                        <span className="text-white text-xs font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Réservations */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Réservations par Mois</h3>
            <div className="space-y-2">
              {analytics.growth.reservations.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-pink-100 rounded" style={{ width: `${(item.count / Math.max(...analytics.growth.reservations.map(i => i.count))) * 100}%` }}>
                      <div className="h-full bg-pink-600 rounded flex items-center justify-end pr-2">
                        <span className="text-white text-xs font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Organisations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top par revenus */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Organisations (Revenus)</h3>
            <div className="space-y-3">
              {analytics.topOrganizations.byRevenue.map((org, idx) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(org.revenue)}/mois</div>
                    </div>
                  </div>
                  <Link
                    href={`/super-admin/organizations/${org.id}`}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Voir →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Top par réservations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Top Organisations (Activité)</h3>
            <div className="space-y-3">
              {analytics.topOrganizations.byReservations.map((org, idx) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.reservations} réservations</div>
                    </div>
                  </div>
                  <Link
                    href={`/super-admin/organizations/${org.id}`}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Voir →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
