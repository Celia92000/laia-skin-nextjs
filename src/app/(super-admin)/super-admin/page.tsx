'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  domain?: string
  subdomain?: string
  createdAt: string
  locations?: { length: number }
}

interface AnalyticsData {
  revenue: {
    mrr: number
    arr: number
    byPlan: { plan: string; revenue: number; count: number; activeCount?: number }[]
  }
  conversion: {
    trialToActive: number
    cancellationRate: number
    retentionRate: number
  }
  trial?: {
    count: number
    potentialRevenue: number
    estimatedRevenue: number
    conversionRate: number
  }
  topOrganizations: {
    byRevenue: { id: string; name: string; revenue: number }[]
    byReservations: { id: string; name: string; reservations: number }[]
  }
  growth: {
    organizations: { month: string; count: number }[]
    users: { month: string; count: number }[]
    reservations: { month: string; count: number }[]
  }
  organizationsStats: {
    id: string
    name: string
    slug: string
    status: string
    plan: string
    clients: number
    reservations: number
    revenue: number
    lastActivity: Date
    monthlyFee: number
    createdAt: Date
  }[]
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [stats, setStats] = useState<any>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('30d')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [period])

  async function loadDashboard() {
    try {
      setRefreshing(true)
      // Charger les données de base
      const [orgsRes, analyticsRes] = await Promise.all([
        fetch('/api/super-admin/organizations'),
        fetch(`/api/super-admin/analytics?period=${period}`)
      ])

      if (!orgsRes.ok || !analyticsRes.ok) {
        if (orgsRes.status === 401 || analyticsRes.status === 401) {
          router.push('/login?redirect=/super-admin')
          return
        }
        if (orgsRes.status === 403 || analyticsRes.status === 403) {
          router.push('/admin')
          return
        }
      }

      const orgsData = await orgsRes.json()
      const analyticsData = await analyticsRes.json()

      setOrganizations(orgsData.organizations || [])
      setUser(orgsData.user)
      setStats(orgsData.stats)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading || !user || !stats || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement...</p>
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

  // Statistiques par statut
  const activeOrgs = organizations.filter(o => o.status === 'ACTIVE').length
  const trialOrgs = organizations.filter(o => o.status === 'TRIAL').length

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
        {/* Bienvenue */}
        <div className="mb-8 p-8 rounded-2xl shadow-lg bg-white border-2" style={{
          borderColor: '#7c3aed'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{
                fontFamily: 'Playfair Display, serif',
                color: '#7c3aed'
              }}>
                👋 Bienvenue {user.name}
              </h2>
              <p className="text-gray-700 text-lg">
                Vous êtes connecté en tant que <strong>{user.email}</strong>
              </p>
              <p className="text-gray-600 mt-2">
                Gérez toutes les organisations de la plateforme LAIA depuis ce tableau de bord.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période d'analyse {refreshing && <span className="text-xs text-gray-500">⟳ Chargement...</span>}
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={refreshing}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
            </div>
          </div>
        </div>

        {/* Métriques financières */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div onClick={() => setOpenModal('mrr')} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-green-700">MRR (Revenus Mensuels)</p>
                <p className="text-3xl font-bold text-green-800">{formatCurrency(analytics.revenue.mrr)}</p>
                <p className="text-xs mt-2 text-green-600">Cliquer pour voir les détails</p>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
          </div>

          <div onClick={() => setOpenModal('arr')} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-blue-700">ARR (Revenus Annuels)</p>
                <p className="text-3xl font-bold text-blue-800">{formatCurrency(analytics.revenue.arr)}</p>
                <p className="text-xs mt-2 text-blue-600">Cliquer pour voir les détails</p>
              </div>
              <div className="text-5xl opacity-20">📈</div>
            </div>
          </div>

          <div onClick={() => setOpenModal('arpu')} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-amber-700">Revenu Moyen / Org</p>
                <p className="text-3xl font-bold text-amber-800">
                  {formatCurrency(analytics.revenue.byPlan.reduce((acc, p) => acc + p.revenue, 0) /
                    Math.max(analytics.revenue.byPlan.reduce((acc, p) => acc + p.count, 0), 1))}
                </p>
                <p className="text-xs mt-2 text-amber-600">Cliquer pour voir les détails</p>
              </div>
              <div className="text-5xl opacity-20">💳</div>
            </div>
          </div>
        </div>

        {/* Statistiques des essais gratuits */}
        {analytics.trial && analytics.trial.count > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 mb-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              🎁 Période d&apos;essai gratuite - Potentiel de conversion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                onClick={() => setOpenModal('trial')}
                className="bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              >
                <p className="text-sm text-blue-600 mb-1">Organisations en essai</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.trial.count}</p>
                <p className="text-xs text-blue-500 mt-1">Cliquer pour voir les détails</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-blue-600 mb-1">Revenus potentiels max</p>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(analytics.trial.potentialRevenue)}</p>
                <p className="text-xs text-blue-500 mt-1">Si 100% convertissent</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-green-600 mb-1">Revenus estimés ({analytics.trial.conversionRate}%)</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(analytics.trial.estimatedRevenue)}</p>
                <p className="text-xs text-green-500 mt-1">Basé sur taux de conversion</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-4 shadow text-white">
                <p className="text-sm mb-1 opacity-90">Impact sur MRR</p>
                <p className="text-3xl font-bold">
                  +{analytics.revenue.mrr > 0 ? Math.round((analytics.trial.estimatedRevenue / analytics.revenue.mrr) * 100) : 0}%
                </p>
                <p className="text-xs mt-1 opacity-90">Augmentation potentielle</p>
              </div>
            </div>
          </div>
        )}

        {/* Raccourcis CRM & Conversion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/super-admin/crm" className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-white/80">CRM Prospection</p>
                <p className="text-3xl font-bold text-white">Pipeline Commercial</p>
                <p className="text-xs mt-2 text-white/70">Gérer les leads et les prospects</p>
              </div>
              <div className="text-5xl opacity-30">🎯</div>
            </div>
          </Link>

          <Link href="/super-admin/conversion-funnel" className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-white/80">Funnel de Conversion</p>
                <p className="text-3xl font-bold text-white">Parcours SaaS</p>
                <p className="text-xs mt-2 text-white/70">Visiteur → Client payant</p>
              </div>
              <div className="text-5xl opacity-30">📊</div>
            </div>
          </Link>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/super-admin/organizations" className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-purple-200 hover:border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Organisations</p>
                <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>{organizations.length}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-green-600">✓ {activeOrgs} actives</span>
                  <span className="text-xs text-blue-600">△ {trialOrgs} essais</span>
                </div>
              </div>
              <div className="text-5xl opacity-20">🏢</div>
            </div>
          </Link>

          <Link href="/super-admin/organizations?tab=users" className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-pink-200 hover:border-pink-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Utilisateurs</p>
                <p className="text-3xl font-bold" style={{ color: '#e8b4b8' }}>{stats.totalUsers}</p>
                <p className="text-xs mt-2 text-gray-500">Moyenne: {organizations.length > 0 ? Math.round(stats.totalUsers / organizations.length) : 0} par org</p>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </Link>

          <div
            onClick={() => setOpenModal('reservations')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Réservations</p>
                <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>{stats.totalReservations}</p>
                <p className="text-xs mt-2 text-gray-500">Cliquer pour voir les détails</p>
              </div>
              <div className="text-5xl opacity-20">📅</div>
            </div>
          </div>

          <div
            onClick={() => setOpenModal('services')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-teal-200 hover:border-teal-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Services</p>
                <p className="text-3xl font-bold text-teal-600">{stats.totalServices}</p>
                <p className="text-xs mt-2 text-gray-500">Cliquer pour voir les détails</p>
              </div>
              <div className="text-5xl opacity-20">💆</div>
            </div>
          </div>
        </div>

        {/* Taux de conversion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-emerald-700 mb-1">Taux de conversion</div>
            <div className="text-3xl font-bold text-emerald-800">{analytics.conversion.trialToActive}%</div>
            <div className="text-xs text-emerald-600 mt-2">Essai → Payant</div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-sky-700 mb-1">Taux de rétention</div>
            <div className="text-3xl font-bold text-sky-800">{analytics.conversion.retentionRate}%</div>
            <div className="text-xs text-sky-600 mt-2">Clients actifs après 3 mois</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-rose-700 mb-1">Taux d'annulation</div>
            <div className="text-3xl font-bold text-rose-800">{analytics.conversion.cancellationRate}%</div>
            <div className="text-xs text-rose-600 mt-2">Churn mensuel</div>
          </div>
        </div>

        {/* Revenus par plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenus par Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.revenue.byPlan.map(plan => (
              <div
                key={plan.plan}
                onClick={() => setOpenModal(`plan-${plan.plan}`)}
                className="border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105 hover:border-purple-400"
              >
                <div className="text-sm text-gray-600 mb-1">{plan.plan}</div>
                <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{formatCurrency(plan.revenue)}/mois</div>
                <div className="text-xs text-gray-500 mt-1">
                  {plan.count} organisation{plan.count > 1 ? 's' : ''}
                  {(plan as any).activeCount !== undefined && (plan as any).activeCount < plan.count && (
                    <span className="text-green-600 ml-1">
                      ({(plan as any).activeCount} active{(plan as any).activeCount > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Organisations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Organisations (Revenus)</h3>
            <div className="space-y-3">
              {analytics.topOrganizations.byRevenue.slice(0, 5).map((org, idx) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(org.revenue)}/mois</div>
                    </div>
                  </div>
                  <Link
                    href={`/super-admin/organizations/${org.id}`}
                    className="text-sm"
                    style={{ color: '#7c3aed' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#8B7355'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#7c3aed'}
                  >
                    Voir →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Top Organisations (Activité)</h3>
            <div className="space-y-3">
              {analytics.topOrganizations.byReservations.slice(0, 5).map((org, idx) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.reservations} réservations</div>
                    </div>
                  </div>
                  <Link
                    href={`/super-admin/organizations/${org.id}`}
                    className="text-sm"
                    style={{ color: '#7c3aed' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#8B7355'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#7c3aed'}
                  >
                    Voir →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphiques de croissance avancés */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">📊 Évolution dans le Temps ({period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : period === '90d' ? '90 jours' : '1 an'})</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nouvelles Organisations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-700">📈 Organisations</h3>
                <span className="text-sm font-medium" style={{ color: '#7c3aed' }}>
                  Total: {analytics.growth.organizations.reduce((sum, i) => sum + i.count, 0)}
                </span>
              </div>
              <div className="space-y-3">
                {analytics.growth.organizations.map((item, idx) => {
                  const maxCount = Math.max(...analytics.growth.organizations.map(i => i.count))
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-gray-600">{item.month}</div>
                        <div className="text-xs font-semibold" style={{ color: '#7c3aed' }}>{item.count}</div>
                      </div>
                      <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#f5e6d3' }}>
                        <div
                          className="absolute h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            background: 'linear-gradient(to right, #7c3aed, #8B7355)'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nouveaux Utilisateurs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-700">👥 Utilisateurs</h3>
                <span className="text-sm text-blue-600 font-medium">
                  Total: {analytics.growth.users.reduce((sum, i) => sum + i.count, 0)}
                </span>
              </div>
              <div className="space-y-3">
                {analytics.growth.users.map((item, idx) => {
                  const maxCount = Math.max(...analytics.growth.users.map(i => i.count))
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-gray-600">{item.month}</div>
                        <div className="text-xs font-semibold text-blue-600">{item.count}</div>
                      </div>
                      <div className="relative h-3 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Réservations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-700">📅 Réservations</h3>
                <span className="text-sm text-pink-600 font-medium">
                  Total: {analytics.growth.reservations.reduce((sum, i) => sum + i.count, 0)}
                </span>
              </div>
              <div className="space-y-3">
                {analytics.growth.reservations.map((item, idx) => {
                  const maxCount = Math.max(...analytics.growth.reservations.map(i => i.count))
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-gray-600">{item.month}</div>
                        <div className="text-xs font-semibold text-pink-600">{item.count}</div>
                      </div>
                      <div className="relative h-3 bg-pink-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-500 group-hover:from-pink-600 group-hover:to-pink-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées par organisation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Performance des Organisations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Réservations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CA Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnement/mois
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière activité
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.organizationsStats.map((org) => {
                  const statusColors = {
                    ACTIVE: 'bg-green-100 text-green-800',
                    TRIAL: 'bg-blue-100 text-blue-800',
                    CANCELLED: 'bg-red-100 text-red-800',
                    SUSPENDED: 'bg-gray-100 text-gray-800'
                  }
                  const statusLabels = {
                    ACTIVE: 'Actif',
                    TRIAL: 'Essai',
                    CANCELLED: 'Annulé',
                    SUSPENDED: 'Suspendu'
                  }

                  return (
                    <tr
                      key={org.id}
                      onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
                      className="hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">@{org.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[org.status as keyof typeof statusColors]}`}>
                          {statusLabels[org.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.clients}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.reservations}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(org.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#7c3aed' }}>
                        {formatCurrency(org.monthlyFee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(org.lastActivity).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modales */}
        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal MRR */}
              {openModal === 'mrr' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">💰 MRR - Revenus Mensuels Récurrents</h3>
                    <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-green-600 mb-2">{formatCurrency(analytics.revenue.mrr)}</div>
                    <p className="text-gray-600">Revenus mensuels récurrents</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Détail par plan :</h4>
                    {analytics.revenue.byPlan.map(plan => (
                      <div key={plan.plan} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{plan.plan}</div>
                          <div className="text-sm text-gray-500">{plan.count} organisations</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(plan.revenue)}</div>
                          <div className="text-xs text-gray-500">/mois</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>MRR</strong> = Monthly Recurring Revenue, représente vos revenus mensuels récurrents générés par les abonnements actifs.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal ARR */}
              {openModal === 'arr' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">📈 ARR - Revenus Annuels Récurrents</h3>
                    <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{formatCurrency(analytics.revenue.arr)}</div>
                    <p className="text-gray-600">Revenus annuels récurrents (projection)</p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">MRR actuel</span>
                        <span className="text-lg font-semibold text-blue-600">{formatCurrency(analytics.revenue.mrr)}</span>
                      </div>
                      <div className="flex items-center justify-center my-2">
                        <span className="text-gray-400">× 12 mois</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                        <span className="text-gray-700 font-medium">ARR projeté</span>
                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.revenue.arr)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>ARR</strong> = Annual Recurring Revenue, projection de vos revenus sur 12 mois basée sur le MRR actuel (MRR × 12).
                    </p>
                  </div>
                </div>
              )}

              {/* Modal ARPU */}
              {openModal === 'arpu' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">💳 ARPU - Revenu Moyen par Organisation</h3>
                    <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2" style={{ color: '#7c3aed' }}>
                      {formatCurrency(analytics.revenue.byPlan.reduce((acc, p) => acc + p.revenue, 0) /
                        Math.max(analytics.revenue.byPlan.reduce((acc, p) => acc + p.count, 0), 1))}
                    </div>
                    <p className="text-gray-600">Revenu moyen par organisation / mois</p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(to right, #f5e6d3, #fef3e2)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Revenus totaux (MRR)</span>
                        <span className="text-lg font-semibold" style={{ color: '#7c3aed' }}>{formatCurrency(analytics.revenue.mrr)}</span>
                      </div>
                      <div className="flex items-center justify-center my-2">
                        <span className="text-gray-400">÷ {analytics.revenue.byPlan.reduce((acc, p) => acc + p.count, 0)} organisations</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#7c3aed' }}>
                        <span className="text-gray-700 font-medium">ARPU</span>
                        <span className="text-2xl font-bold" style={{ color: '#7c3aed' }}>
                          {formatCurrency(analytics.revenue.byPlan.reduce((acc, p) => acc + p.revenue, 0) /
                            Math.max(analytics.revenue.byPlan.reduce((acc, p) => acc + p.count, 0), 1))}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-3 mt-6">Revenu moyen par plan :</h4>
                    {analytics.revenue.byPlan.map(plan => {
                      const planPrices: {[key: string]: number} = { SOLO: 49, DUO: 69, TEAM: 119, PREMIUM: 179 }
                      return (
                        <div key={plan.plan} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-700">{plan.plan}</div>
                          <div className="text-lg font-semibold" style={{ color: '#7c3aed' }}>{formatCurrency(planPrices[plan.plan] || 0)}/mois</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>ARPU</strong> = Average Revenue Per User, indique le revenu moyen généré par organisation payante chaque mois.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Organisations en essai */}
              {openModal === 'trial' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">🎁 Organisations en période d&apos;essai</h3>
                    <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{analytics.trial?.count || 0}</div>
                    <p className="text-gray-600">Organisations en essai gratuit (1er mois)</p>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analytics.organizationsStats
                      .filter(org => org.status === 'TRIAL')
                      .map(org => (
                        <div key={org.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-800">{org.name}</div>
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold">
                              ESSAI
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Plan :</span>
                              <span className="ml-1 font-medium text-gray-800">{org.plan}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Clients :</span>
                              <span className="ml-1 font-medium text-gray-800">{org.clients}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Abonnement :</span>
                              <span className="ml-1 font-medium text-green-600">{formatCurrency(org.monthlyFee)}/mois</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Créé le {new Date(org.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                          <Link href={`/super-admin/organizations/${org.id}`} className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Voir détails →
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Modal Réservations */}
              {openModal === 'reservations' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">📅 Réservations par organisation</h3>
                    <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2" style={{ color: '#7c3aed' }}>{stats.totalReservations}</div>
                    <p className="text-gray-600">Réservations totales sur la plateforme</p>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analytics.organizationsStats
                      .sort((a, b) => b.reservations - a.reservations)
                      .filter(org => org.reservations > 0)
                      .map(org => (
                        <div key={org.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-800">{org.name}</div>
                            <span className="text-2xl font-bold text-purple-600">{org.reservations}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Clients :</span>
                              <span className="ml-1 font-medium text-gray-800">{org.clients}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">CA :</span>
                              <span className="ml-1 font-medium text-green-600">{formatCurrency(org.revenue)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Plan :</span>
                              <span className="ml-1 font-medium text-gray-800">{org.plan}</span>
                            </div>
                          </div>
                          <Link href={`/super-admin/organizations/${org.id}`} className="mt-2 inline-block text-xs text-purple-600 hover:text-purple-800 font-medium">
                            Voir détails →
                          </Link>
                        </div>
                      ))}
                    {analytics.organizationsStats.filter(org => org.reservations > 0).length === 0 && (
                      <p className="text-gray-500 text-center py-8">Aucune réservation enregistrée</p>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Services */}
              {openModal === 'services' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">💆 Services par organisation</h3>
                    <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-teal-600 mb-2">{stats.totalServices}</div>
                    <p className="text-gray-600">Services disponibles au total</p>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analytics.organizationsStats.map(org => (
                      <div key={org.id} className="p-4 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-800">{org.name}</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            org.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {org.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Plan :</span>
                            <span className="ml-1 font-medium text-gray-800">{org.plan}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Clients :</span>
                            <span className="ml-1 font-medium text-gray-800">{org.clients}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Réservations :</span>
                            <span className="ml-1 font-medium text-gray-800">{org.reservations}</span>
                          </div>
                        </div>
                        <Link href={`/super-admin/organizations/${org.id}`} className="mt-2 inline-block text-xs text-teal-600 hover:text-teal-800 font-medium">
                          Voir détails →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modals par Plan */}
              {['SOLO', 'DUO', 'TEAM', 'PREMIUM'].map(planName => (
                openModal === `plan-${planName}` && (
                  <div key={planName} className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">📊 Organisations - Plan {planName}</h3>
                      <button onClick={() => setOpenModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                    </div>
                    <div className="mb-6">
                      {(() => {
                        const planData = analytics.revenue.byPlan.find(p => p.plan === planName)
                        return (
                          <>
                            <div className="text-4xl font-bold mb-2" style={{ color: '#7c3aed' }}>
                              {planData?.count || 0}
                            </div>
                            <p className="text-gray-600">
                              Organisation{(planData?.count || 0) > 1 ? 's' : ''} sur le plan {planName}
                              {(planData as any)?.activeCount !== undefined && (
                                <span className="ml-2 text-green-600 font-medium">
                                  ({(planData as any).activeCount} active{(planData as any).activeCount > 1 ? 's' : ''})
                                </span>
                              )}
                            </p>
                            <div className="mt-2 text-2xl font-semibold text-green-600">
                              {formatCurrency(planData?.revenue || 0)}/mois
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analytics.organizationsStats
                        .filter(org => org.plan === planName)
                        .map(org => (
                          <div key={org.id} className={`p-4 rounded-lg border-2 hover:shadow-lg transition-all ${
                            org.status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-800">{org.name}</div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                org.status === 'ACTIVE' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                              }`}>
                                {org.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-3 text-sm mb-2">
                              <div>
                                <span className="text-gray-500">Clients :</span>
                                <span className="ml-1 font-medium text-gray-800">{org.clients}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Réservations :</span>
                                <span className="ml-1 font-medium text-gray-800">{org.reservations}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">CA :</span>
                                <span className="ml-1 font-medium text-green-600">{formatCurrency(org.revenue)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Abonnement :</span>
                                <span className="ml-1 font-medium text-purple-600">{formatCurrency(org.monthlyFee)}/mois</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Créé le {new Date(org.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                            <Link href={`/super-admin/organizations/${org.id}`} className="mt-2 inline-block text-xs text-purple-600 hover:text-purple-800 font-medium">
                              Voir détails →
                            </Link>
                          </div>
                        ))}
                      {analytics.organizationsStats.filter(org => org.plan === planName).length === 0 && (
                        <p className="text-gray-500 text-center py-8">Aucune organisation sur ce plan</p>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

    </div>
  )
}
