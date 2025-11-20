"use client"

import { useEffect, useState } from 'react'

interface Metrics {
  monthlyRevenue: number
  potentialRevenue: number
  upcomingRevenue: {
    count: number
    amount: number
  }
  totalCustomers: number
  activeCustomers: number
  trialCustomers: number
  suspendedCustomers: number
  newCustomers: number
  conversionRate: number
  growthRate: number
  planDistribution: Array<{
    plan: string
    count: number
    revenue: number
  }>
  generatedAt: string
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/super-admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMetrics(data.metrics)
        } else {
          setError('Erreur chargement métriques')
        }
      })
      .catch(err => {
        console.error(err)
        setError('Erreur serveur')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            ⚠️ {error || 'Impossible de charger les métriques'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Dashboard Métriques
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de LAIA Connect • Mis à jour:{' '}
            {new Date(metrics.generatedAt).toLocaleString('fr-FR')}
          </p>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenus mensuels */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-2">
              💰 Revenus Mensuels
            </div>
            <div className="text-4xl font-bold mb-1">
              {metrics.monthlyRevenue.toLocaleString('fr-FR')} €
            </div>
            <div className="text-sm opacity-75">
              +{metrics.potentialRevenue} € potentiels (trials)
            </div>
          </div>

          {/* Total clients */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-2">
              👥 Total Clients
            </div>
            <div className="text-4xl font-bold mb-1">
              {metrics.totalCustomers}
            </div>
            <div className="text-sm opacity-75">
              {metrics.activeCustomers} actifs • {metrics.trialCustomers} en trial
            </div>
          </div>

          {/* Nouveaux clients */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-2">
              ✨ Nouveaux (30j)
            </div>
            <div className="text-4xl font-bold mb-1">
              +{metrics.newCustomers}
            </div>
            <div className={`text-sm ${metrics.growthRate >= 0 ? 'opacity-75' : 'opacity-90'}`}>
              {metrics.growthRate >= 0 ? '📈' : '📉'} {Math.abs(metrics.growthRate)}% vs mois dernier
            </div>
          </div>
        </div>

        {/* Métriques secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Taux de conversion */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-sm text-gray-600 mb-2">
              Taux de Conversion
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {metrics.conversionRate}%
            </div>
            <div className="text-xs text-gray-500">
              Trial → Active (90j)
            </div>
          </div>

          {/* Prochaines facturations */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-sm text-gray-600 mb-2">
              Facturations (7j)
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {metrics.upcomingRevenue.count}
            </div>
            <div className="text-xs text-gray-500">
              {metrics.upcomingRevenue.amount} € attendus
            </div>
          </div>

          {/* Clients actifs */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-sm text-gray-600 mb-2">
              Clients Actifs
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {metrics.activeCustomers}
            </div>
            <div className="text-xs text-gray-500">
              Paient actuellement
            </div>
          </div>

          {/* Clients suspendus */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-sm text-gray-600 mb-2">
              Suspendus
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {metrics.suspendedCustomers}
            </div>
            <div className="text-xs text-gray-500">
              Paiement échoué
            </div>
          </div>
        </div>

        {/* Répartition par plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📈 Répartition par Plan
          </h2>

          <div className="space-y-4">
            {metrics.planDistribution.map(plan => {
              const percentage = metrics.totalCustomers > 0
                ? (plan.count / metrics.totalCustomers) * 100
                : 0

              return (
                <div key={plan.plan}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-gray-900">
                        {plan.plan}
                      </div>
                      <div className="text-sm text-gray-600">
                        {plan.count} clients
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {plan.revenue} €/mois
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% du total
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/super-admin/organizations"
            className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition text-center"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-semibold text-gray-900">
              Gérer les Organisations
            </div>
          </a>

          <a
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition text-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold text-gray-900">
              Voir les Erreurs (Sentry)
            </div>
          </a>

          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition text-center"
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="font-semibold text-gray-900">
              Paiements (Stripe)
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
