"use client"

import { useEffect, useState } from 'react'
import { Check, X, Edit, Save, Plus, Star, Sparkles } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  planKey: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  name: string
  displayName: string
  description: string
  priceMonthly: number
  priceYearly: number | null
  maxLocations: number
  maxUsers: number
  maxStorage: number
  features: string[]
  highlights: string[]
  isPopular: boolean
  isRecommended: boolean
  displayOrder: number
  stripePriceId: string | null
  isActive: boolean
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<SubscriptionPlan>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      const res = await fetch('/api/super-admin/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Erreur chargement plans:', error)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(plan: SubscriptionPlan) {
    setEditingPlan(plan.id)
    setEditData({
      displayName: plan.displayName,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      maxLocations: plan.maxLocations,
      maxUsers: plan.maxUsers,
      maxStorage: plan.maxStorage,
      highlights: plan.highlights,
      isPopular: plan.isPopular,
      isRecommended: plan.isRecommended,
      isActive: plan.isActive
    })
  }

  function cancelEdit() {
    setEditingPlan(null)
    setEditData({})
  }

  async function savePlan(planId: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/super-admin/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (res.ok) {
        await fetchPlans()
        setEditingPlan(null)
        setEditData({})
      } else {
        alert('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function addHighlight() {
    setEditData({
      ...editData,
      highlights: [...(editData.highlights || []), '']
    })
  }

  function removeHighlight(index: number) {
    const newHighlights = [...(editData.highlights || [])]
    newHighlights.splice(index, 1)
    setEditData({ ...editData, highlights: newHighlights })
  }

  function updateHighlight(index: number, value: string) {
    const newHighlights = [...(editData.highlights || [])]
    newHighlights[index] = value
    setEditData({ ...editData, highlights: newHighlights })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Formules d'Abonnement</h1>
        <p className="text-gray-600 mt-2">
          Configurez les prix, fonctionnalités et limites de chaque formule LAIA Connect
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {plans
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((plan) => {
            const isEditing = editingPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                  plan.isPopular ? 'border-yellow-400' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {plan.planKey}
                      </h2>
                      {plan.isPopular && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          POPULAIRE
                        </span>
                      )}
                      {plan.isRecommended && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          RECOMMANDÉ
                        </span>
                      )}
                      {!plan.isActive && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          INACTIF
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom d'affichage
                          </label>
                          <input
                            type="text"
                            value={editData.displayName || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, displayName: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editData.description || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, description: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl font-semibold text-gray-900 mb-1">
                          {plan.displayName}
                        </p>
                        <p className="text-gray-600">{plan.description}</p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => savePlan(plan.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(plan)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix mensuel
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.priceMonthly || 0}
                        onChange={(e) =>
                          setEditData({ ...editData, priceMonthly: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{plan.priceMonthly}€/mois</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix annuel (optionnel)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.priceYearly || 0}
                        onChange={(e) =>
                          setEditData({ ...editData, priceYearly: parseInt(e.target.value) || null })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Laisser vide si x12"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {plan.priceYearly || plan.priceMonthly * 12}€/an
                      </p>
                    )}
                  </div>
                </div>

                {/* Limites */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      📍 Emplacements
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.maxLocations || 0}
                        onChange={(e) =>
                          setEditData({ ...editData, maxLocations: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-xl font-bold text-blue-900">
                        {plan.maxLocations === 999 ? 'Illimité' : plan.maxLocations}
                      </p>
                    )}
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      👥 Utilisateurs
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.maxUsers || 0}
                        onChange={(e) =>
                          setEditData({ ...editData, maxUsers: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-xl font-bold text-purple-900">
                        {plan.maxUsers === 999 ? 'Illimité' : plan.maxUsers}
                      </p>
                    )}
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-900 mb-1">
                      💾 Stockage (GB)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.maxStorage || 0}
                        onChange={(e) =>
                          setEditData({ ...editData, maxStorage: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-xl font-bold text-green-900">{plan.maxStorage} GB</p>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Points forts (affichés sur la page tarifs)
                    </label>
                    {isEditing && (
                      <button
                        onClick={addHighlight}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        Ajouter
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      {editData.highlights?.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => updateHighlight(index, e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg"
                            placeholder="Ex: CRM complet"
                          />
                          <button
                            onClick={() => removeHighlight(index)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {plan.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Badges */}
                {isEditing && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.isPopular || false}
                        onChange={(e) =>
                          setEditData({ ...editData, isPopular: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Badge "Populaire"</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.isRecommended || false}
                        onChange={(e) =>
                          setEditData({ ...editData, isRecommended: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Badge "Recommandé"</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.isActive !== false}
                        onChange={(e) =>
                          setEditData({ ...editData, isActive: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Formule active</span>
                    </label>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Les modifications sont appliquées immédiatement sur tout le site LAIA Connect</li>
          <li>• Les prix affectent uniquement les nouvelles souscriptions</li>
          <li>• Les organisations existantes conservent leur tarif actuel</li>
          <li>• Les fonctionnalités sont gérées dans le fichier features.ts</li>
        </ul>
      </div>
    </div>
  )
}
