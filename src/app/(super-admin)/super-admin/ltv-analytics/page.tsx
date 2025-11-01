'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrganizationLTV {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: Date
  totalRevenue: number
  monthlySubscriptionFee: number
  lifetimeMonths: number
  activeMonths: number
  totalReservations: number
  averageReservationsPerMonth: number
  historicalLTV: number
  predictedLTV: number
  remainingLTV: number
  churnProbability: number
  averageLifetimeExpectancy: number
  monthlyGrowthRate: number
}

interface Stats {
  totalOrganizations: number
  averageHistoricalLTV: number
  averagePredictedLTV: number
  totalHistoricalRevenue: number
  totalPredictedRevenue: number
  totalRemainingRevenue: number
  averageChurnProbability: number
  highChurnRisk: number
  averageLifetimeMonths: number
  averageLifetimeExpectancy: number
  top10ByLTV: Array<{ name: string; predictedLTV: number; historicalLTV: number }>
  byPlan: Array<{ plan: string; count: number; averageLTV: number; totalLTV: number }>
}

export default function LTVAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<OrganizationLTV[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [calculatedAt, setCalculatedAt] = useState<string>('')
  const [sortBy, setSortBy] = useState<'predictedLTV' | 'historicalLTV' | 'remainingLTV'>('predictedLTV')

  useEffect(() => {
    fetchLTV()
  }, [])

  async function fetchLTV() {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/analytics/ltv')

      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations)
        setStats(data.stats)
        setCalculatedAt(data.calculatedAt)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/ltv-analytics')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching LTV:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getChurnColor = (prob: number) => {
    if (prob > 0.7) return 'bg-red-100 text-red-800'
    if (prob > 0.4) return 'bg-orange-100 text-orange-800'
    if (prob > 0.2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 20) return 'text-green-600'
    if (rate > 0) return 'text-blue-600'
    if (rate > -20) return 'text-orange-600'
    return 'text-red-600'
  }

  const sortedOrganizations = [...organizations].sort((a, b) => b[sortBy] - a[sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Calcul du LTV en cours...</p>
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
              💰 Analytics LTV (Lifetime Value)
            </h2>
            <p className="text-gray-700">Analyse de la valeur vie client de toutes les organisations</p>
            {calculatedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Calculé le {new Date(calculatedAt).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
          <button
            onClick={fetchLTV}
            className="px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition font-semibold border-2 shadow-sm"
            style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
          >
            🔄 Recalculer
          </button>
        </div>
      </div>

      {/* Stats principales */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6">
              <div className="text-sm text-purple-700 mb-1">LTV Moyen Prédit</div>
              <div className="text-3xl font-bold text-purple-900">{formatCurrency(stats.averagePredictedLTV)}</div>
              <div className="text-xs text-purple-600 mt-1">Par organisation</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6">
              <div className="text-sm text-green-700 mb-1">Revenu Total Prédit</div>
              <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalPredictedRevenue)}</div>
              <div className="text-xs text-green-600 mt-1">Toutes organisations</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6">
              <div className="text-sm text-blue-700 mb-1">Revenu Historique</div>
              <div className="text-3xl font-bold text-blue-900">{formatCurrency(stats.totalHistoricalRevenue)}</div>
              <div className="text-xs text-blue-600 mt-1">Déjà généré</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md p-6">
              <div className="text-sm text-amber-700 mb-1">Revenu Restant Estimé</div>
              <div className="text-3xl font-bold text-amber-900">{formatCurrency(stats.totalRemainingRevenue)}</div>
              <div className="text-xs text-amber-600 mt-1">Potentiel futur</div>
            </div>
          </div>

          {/* Stats secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Durée de vie moyenne</div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageLifetimeMonths} mois</div>
              <div className="text-xs text-gray-500 mt-1">Actuelle</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Espérance de vie</div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageLifetimeExpectancy} mois</div>
              <div className="text-xs text-gray-500 mt-1">Estimée</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Taux de churn moyen</div>
              <div className="text-2xl font-bold text-gray-900">{(stats.averageChurnProbability * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-500 mt-1">Probabilité de désabonnement</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Risque churn élevé</div>
              <div className="text-2xl font-bold text-red-600">{stats.highChurnRisk}</div>
              <div className="text-xs text-gray-500 mt-1">Organisations à surveiller</div>
            </div>
          </div>

          {/* LTV par plan */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💎 LTV par Plan d'Abonnement</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.byPlan.map(plan => (
                <div key={plan.plan} className="border-2 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="text-sm text-gray-600 mb-1">{plan.plan}</div>
                  <div className="text-2xl font-bold mb-2" style={{ color: '#7c3aed' }}>
                    {formatCurrency(plan.averageLTV)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {plan.count} organisations
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total: {formatCurrency(plan.totalLTV)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Top 10 LTV Prédit</h3>
            <div className="space-y-3">
              {stats.top10ByLTV.map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">
                        Historique: {formatCurrency(org.historicalLTV)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">
                      {formatCurrency(org.predictedLTV)}
                    </div>
                    <div className="text-xs text-gray-500">LTV prédit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tri */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Trier par:</span>
          <button
            onClick={() => setSortBy('predictedLTV')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'predictedLTV'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            LTV Prédit
          </button>
          <button
            onClick={() => setSortBy('historicalLTV')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'historicalLTV'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            LTV Historique
          </button>
          <button
            onClick={() => setSortBy('remainingLTV')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'remainingLTV'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            LTV Restant
          </button>
        </div>
      </div>

      {/* Table détaillée */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTV Prédit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTV Historique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTV Restant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée de vie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risque Churn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Croissance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                    <div className="text-xs text-gray-500">{org.plan} • {org.status}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-purple-600">{formatCurrency(org.predictedLTV)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">{formatCurrency(org.historicalLTV)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-amber-600">{formatCurrency(org.remainingLTV)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{org.lifetimeMonths} mois</div>
                    <div className="text-xs text-gray-500">Espérance: {org.averageLifetimeExpectancy} mois</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getChurnColor(org.churnProbability)}`}>
                      {(org.churnProbability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${getGrowthColor(org.monthlyGrowthRate)}`}>
                      {org.monthlyGrowthRate > 0 ? '+' : ''}{org.monthlyGrowthRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{org.totalReservations}</div>
                    <div className="text-xs text-gray-500">{org.averageReservationsPerMonth}/mois</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">📚 Comprendre le LTV</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">💰 LTV Historique</h4>
            <p>Revenu réellement généré depuis la création de l'organisation (réservations + abonnements).</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🔮 LTV Prédit</h4>
            <p>Valeur totale estimée sur toute la durée de vie client, calculée avec : ARPU × Espérance de vie.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">📈 LTV Restant</h4>
            <p>Revenu potentiel futur estimé (LTV Prédit - LTV Historique).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
