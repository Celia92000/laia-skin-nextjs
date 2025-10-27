'use client'

import { OrgPlan } from '@prisma/client'
import {
  ADDON_OPTIONS,
  ALWAYS_INCLUDED,
  getAddonsForPlan,
  formatAddonPrice,
  getAddonBadge,
  calculateRecurringAddons,
  calculateOneTimeAddons,
} from '@/lib/addons'
import { getPlanPrice } from '@/lib/features-simple'
import { useState, useEffect } from 'react'

interface AddonSelectorProps {
  selectedPlan: OrgPlan
  onAddonsChange: (addons: string[]) => void
}

export default function AddonSelector({ selectedPlan, onAddonsChange }: AddonSelectorProps) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const availableAddons = getAddonsForPlan(selectedPlan)

  useEffect(() => {
    onAddonsChange(selectedAddons)
  }, [selectedAddons, onAddonsChange])

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    )
  }

  const basePlanPrice = getPlanPrice(selectedPlan)
  const recurringTotal = calculateRecurringAddons(selectedAddons)
  const oneTimeTotal = calculateOneTimeAddons(selectedAddons)

  // Séparer les add-ons par catégorie
  const setupAddons = availableAddons.filter((a) => a.category === 'setup')
  const customizationAddons = availableAddons.filter((a) => a.category === 'customization')
  const featureAddons = availableAddons.filter((a) => a.category === 'features')

  return (
    <div className="space-y-6">
      {/* Avantages toujours inclus */}
      <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">✅ Toujours inclus</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALWAYS_INCLUDED.map((feature) => (
            <div key={feature.id} className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">{feature.icon}</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">{feature.name}</div>
                <div className="text-xs text-gray-600">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Options de démarrage */}
      {setupAddons.length > 0 && (
        <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Aide au démarrage (optionnel)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Services d'accompagnement pour migrer les données du client et configurer son espace
          </p>

          <div className="space-y-3">
            {setupAddons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id)

              return (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-white shadow-sm'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{addon.icon}</span>
                      <span className="font-semibold text-gray-900">{addon.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{addon.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-indigo-600">
                      {formatAddonPrice(addon)}
                    </div>
                    <div className="text-xs text-gray-500">paiement unique</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Fonctionnalités supplémentaires */}
      {featureAddons.length > 0 && (
        <div className="border-2 rounded-lg p-6 bg-gradient-to-br from-amber-50 to-orange-50" style={{ borderColor: '#d4b5a0' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ✨ Fonctionnalités Supplémentaires
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Débloquez des onglets supplémentaires non inclus dans le forfait {selectedPlan}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featureAddons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id)
              const badge = getAddonBadge(addon)

              return (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-amber-400'
                  }`}
                  style={isSelected ? { borderColor: '#d4b5a0' } : {}}
                >
                  {badge && (
                    <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full bg-amber-500 text-white">
                      {badge}
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-1 w-5 h-5 rounded focus:ring-2"
                    style={{ accentColor: '#d4b5a0' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{addon.icon}</span>
                      <span className="font-semibold text-gray-900">{addon.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{addon.description}</p>
                    <div className="text-lg font-bold" style={{ color: '#d4b5a0' }}>
                      {formatAddonPrice(addon)}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Options mensuelles de personnalisation */}
      {customizationAddons.length > 0 && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🌐 Options de Personnalisation
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Domaine personnalisé et suppression de la mention "Propulsé par LAIA"
          </p>

          <div className="space-y-3">
            {customizationAddons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id)

              return (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-white shadow-sm'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{addon.icon}</span>
                      <span className="font-semibold text-gray-900">{addon.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{addon.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-indigo-600">
                      {formatAddonPrice(addon)}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Récapitulatif simple */}
      {selectedAddons.length > 0 && (
        <div className="border-2 border-indigo-200 rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Récapitulatif</h3>

          <div className="space-y-3">
            {oneTimeTotal > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Aide au démarrage :</span>
                <span className="text-xl font-bold text-gray-900">{oneTimeTotal}€</span>
              </div>
            )}

            {recurringTotal > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Options mensuelles :</span>
                <span className="text-xl font-bold text-gray-900">+{recurringTotal}€/mois</span>
              </div>
            )}

            {oneTimeTotal > 0 && (
              <div className="border-t pt-3 mt-2">
                <div className="text-sm text-gray-600 mb-2">
                  Coût total premier mois :
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {basePlanPrice + recurringTotal + oneTimeTotal}€
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ({basePlanPrice}€ formule + {recurringTotal}€ options + {oneTimeTotal}€ démarrage)
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Puis {basePlanPrice + recurringTotal}€/mois les mois suivants
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
