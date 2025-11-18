'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PromoCode {
  id: string
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_TRIAL'
  value: number
  targetPlans: string[]
  maxUses?: number
  currentUses: number
  validFrom: Date
  validUntil?: Date
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED'
  createdAt: Date
}

export default function PromoCodesPage() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as PromoCode['type'],
    value: 0,
    targetPlans: [] as string[],
    maxUses: '',
    validUntil: ''
  })

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  async function fetchPromoCodes() {
    try {
      const response = await fetch('/api/super-admin/promo-codes')
      if (response.ok) {
        const data = await response.json()
        setPromoCodes(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/promo-codes')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/super-admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          validUntil: formData.validUntil || null
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          code: '',
          description: '',
          type: 'PERCENTAGE',
          value: 0,
          targetPlans: [],
          maxUses: '',
          validUntil: ''
        })
        fetchPromoCodes()
      }
    } catch (error) {
      console.error('Error creating promo code:', error)
    }
  }

  async function handleToggleStatus(id: string, currentStatus: PromoCode['status']) {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    try {
      const response = await fetch(`/api/super-admin/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchPromoCodes()
      }
    } catch (error) {
      console.error('Error updating promo code:', error)
    }
  }

  const getTypeLabel = (type: PromoCode['type']) => {
    const labels = {
      PERCENTAGE: 'Pourcentage',
      FIXED: 'Montant fixe',
      FREE_TRIAL: 'Essai gratuit'
    }
    return labels[type]
  }

  const getStatusBadge = (status: PromoCode['status']) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      DISABLED: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#7c3aed" }}></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2"> Codes Promo</h1>
          <p className="text-gray-600">Gérez les codes promotionnels pour les abonnements LAIA</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl" style={{ background: "linear-gradient(to right, #7c3aed, #6b46c1)" }}
        >
          + Nouveau Code Promo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total codes</p>
          <p className="text-3xl font-bold" style={{ color: "#7c3aed" }}>{promoCodes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Actifs</p>
          <p className="text-3xl font-bold text-green-600">
            {promoCodes.filter(p => p.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total utilisations</p>
          <p className="text-3xl font-bold text-blue-600">
            {promoCodes.reduce((sum, p) => sum + p.currentUses, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Expirés</p>
          <p className="text-3xl font-bold text-red-600">
            {promoCodes.filter(p => p.status === 'EXPIRED').length}
          </p>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tous les codes promo</h2>
        </div>

        {promoCodes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">Aucun code promo</p>
            <p className="text-sm">Créez votre premier code promo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plans</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold" style={{ color: "#7c3aed" }}>{promo.code}</div>
                        <div className="text-sm text-gray-500">{promo.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTypeLabel(promo.type)}</div>
                      <div className="text-sm font-bold text-gray-600">
                        {promo.type === 'PERCENTAGE' ? `${promo.value}%` :
                         promo.type === 'FIXED' ? `${promo.value}€` :
                         `+${promo.value} jours`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {promo.targetPlans.length === 0 ? 'Tous les plans' : promo.targetPlans.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {promo.currentUses} {promo.maxUses && `/ ${promo.maxUses}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('fr-FR') : 'Illimité'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(promo.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(promo.id, promo.status)}
                        className="hover:text-beige-900"
                        style={{ color: "#7c3aed" }}
                      >
                        {promo.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau Code Promo</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 uppercase"
                  placeholder="LAIA2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="Promotion lancement 2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PromoCode['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="PERCENTAGE">Pourcentage</option>
                    <option value="FIXED">Montant fixe (€)</option>
                    <option value="FREE_TRIAL">Essai gratuit (jours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur * {formData.type === 'PERCENTAGE' && '(%)'} {formData.type === 'FIXED' && '(€)'} {formData.type === 'FREE_TRIAL' && '(jours)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plans ciblés (laisser vide pour tous)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SOLO', 'DUO', 'TEAM', 'PREMIUM'].map(plan => (
                    <label key={plan} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetPlans.includes(plan)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, targetPlans: [...formData.targetPlans, plan] })
                          } else {
                            setFormData({ ...formData, targetPlans: formData.targetPlans.filter(p => p !== plan) })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max utilisations (optionnel)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    placeholder="Illimité"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration (optionnel)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-indigo-700"
                  style={{ background: "linear-gradient(to right, #7c3aed, #6b46c1)" }}
                >
                  Créer le code
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
