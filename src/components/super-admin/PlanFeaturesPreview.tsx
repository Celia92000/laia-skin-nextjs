'use client'

import { OrgPlan } from '@prisma/client'
import { getFeaturesForPlan, getPlanName, getPlanPrice } from '@/lib/features-simple'

interface PlanFeaturesPreviewProps {
  selectedPlan: OrgPlan
}

export default function PlanFeaturesPreview({ selectedPlan }: PlanFeaturesPreviewProps) {
  const features = getFeaturesForPlan(selectedPlan)
  const planName = getPlanName(selectedPlan)
  const planPrice = getPlanPrice(selectedPlan)

  if (!features || !planName || !planPrice) {
    return null
  }

  return (
    <div className="border-2 rounded-xl p-6" style={{ borderColor: '#d4b5a0', backgroundColor: '#fafaf9' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2" style={{ borderColor: '#d4b5a0' }}>
        <h3 className="text-xl font-bold text-gray-900">
          Plan {planName}
        </h3>
        <div className="text-3xl font-bold" style={{ color: '#d4b5a0' }}>
          {planPrice}€<span className="text-lg text-gray-500">/mois</span>
        </div>
      </div>

      {/* Fonctionnalités TOUJOURS incluses */}
      <div className="space-y-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <span>✅</span>
            <span>Toujours inclus (tous les plans)</span>
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2 text-green-900">
              <span>📅</span> Réservations en ligne + rappels automatiques
            </div>
            <div className="flex items-center gap-2 text-green-900">
              <span>💆</span> Catalogue de services complet
            </div>
            <div className="flex items-center gap-2 text-green-900">
              <span>👥</span> Gestion des clients + fidélisation
            </div>
            <div className="flex items-center gap-2 text-green-900">
              <span>⭐</span> Avis clients + photos avant/après
            </div>
            <div className="flex items-center gap-2 text-green-900">
              <span>💰</span> Comptabilité + factures + exports
            </div>
            <div className="flex items-center gap-2 text-green-900">
              <span>🎨</span> Design personnalisable (couleurs + logo)
            </div>
            <div className="flex items-center gap-2 text-green-900">
              <span>🔒</span> SSL + hébergement + sauvegardes
            </div>
          </div>
        </div>

        {/* Fonctionnalités avancées selon le plan */}
        {(features.featureBlog || features.featureCRM || features.featureEmailing ||
          features.featureShop || features.featureWhatsApp || features.featureSMS ||
          features.featureSocialMedia || features.featureStock) ? (
          <>
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mt-6">
              ✨ Fonctionnalités avancées de ce plan
            </h4>

            {/* Base features */}
            <div className="grid grid-cols-1 gap-3">

              {/* Advanced features */}
              {features.featureBlog && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-medium text-gray-900">Blog</div>
                <div className="text-xs text-gray-500">Articles + SEO</div>
              </div>
            </div>
          )}

          {features.featureCRM && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-medium text-gray-900">CRM</div>
                <div className="text-xs text-gray-500">Leads + prospects + pipeline</div>
              </div>
            </div>
          )}

          {features.featureEmailing && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-medium text-gray-900">Email Marketing</div>
                <div className="text-xs text-gray-500">Campagnes + automations</div>
              </div>
            </div>
          )}

          {features.featureShop && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">🛍️</span>
              <div>
                <div className="font-medium text-gray-900">Boutique</div>
                <div className="text-xs text-gray-500">Produits + formations</div>
              </div>
            </div>
          )}

          {features.featureWhatsApp && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">💬</span>
              <div>
                <div className="font-medium text-gray-900">WhatsApp</div>
                <div className="text-xs text-gray-500">Marketing + automations</div>
              </div>
            </div>
          )}

          {features.featureSMS && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-medium text-gray-900">SMS</div>
                <div className="text-xs text-gray-500">Campagnes + automations</div>
              </div>
            </div>
          )}

          {features.featureSocialMedia && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">📲</span>
              <div>
                <div className="font-medium text-gray-900">Réseaux Sociaux</div>
                <div className="text-xs text-gray-500">Instagram + Facebook + TikTok</div>
              </div>
            </div>
          )}

          {features.featureStock && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-medium text-gray-900">Stock Avancé</div>
                <div className="text-xs text-gray-500">Inventaire + alertes + fournisseurs</div>
              </div>
            </div>
          )}
            </div>
          </>
        ) : (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 <strong>Plan {planName}</strong> : Aucune fonctionnalité avancée. Passez à DUO+ pour débloquer Blog, CRM et Email Marketing.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
