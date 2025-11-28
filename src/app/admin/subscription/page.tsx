"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LaiaInvoicesSection from '@/components/LaiaInvoicesSection'
import { getPlanPrice, getPlanQuotas, getPlanName, getFeaturesForPlan, type OrgFeatures } from '@/lib/features-simple'
import type { OrgPlan } from '@prisma/client'

// Définition des fonctionnalités pour l'affichage
const FEATURES_INFO: { key: keyof OrgFeatures; label: string; icon: string }[] = [
  { key: 'featureCRM', label: 'CRM & Pipeline', icon: '🎯' },
  { key: 'featureEmailing', label: 'Email Marketing', icon: '📧' },
  { key: 'featureBlog', label: 'Blog', icon: '📝' },
  { key: 'featureShop', label: 'Boutique', icon: '🛍️' },
  { key: 'featureWhatsApp', label: 'WhatsApp', icon: '💬' },
  { key: 'featureSMS', label: 'SMS', icon: '📱' },
  { key: 'featureSocialMedia', label: 'Réseaux Sociaux', icon: '📲' },
  { key: 'featureStock', label: 'Stock Avancé', icon: '📦' },
]

// Configuration des plans pour l'affichage
const PLANS_CONFIG = [
  { id: 'SOLO', popular: false },
  { id: 'DUO', popular: false },
  { id: 'TEAM', popular: true },
  { id: 'PREMIUM', popular: false },
] as const

interface Organization {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | null
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganization()
  }, [])

  async function fetchOrganization() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/organization', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      } else if (response.status === 401) {
        router.push('/connexion')
      }
    } catch (error) {
      console.error('Erreur chargement organisation:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysLeft = (dateString: string) => {
    const now = new Date()
    const endDate = new Date(dateString)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  async function handleCancelSubscription() {
    if (!organization?.stripeSubscriptionId) return

    setCancelling(true)
    try {
      const response = await fetch('/api/admin/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (response.ok) {
        alert('✅ Votre abonnement sera résilié à la fin de la période en cours.')
        setShowCancelModal(false)
        fetchOrganization() // Recharger les données
      } else {
        const data = await response.json()
        alert('❌ Erreur : ' + (data.error || 'Impossible de résilier'))
      }
    } catch (error) {
      console.error('Erreur résiliation:', error)
      alert('❌ Erreur lors de la résiliation')
    } finally {
      setCancelling(false)
    }
  }

  async function handleChangePlan(newPlan: string) {
    if (!organization) return
    if (newPlan === organization.plan) return

    setChangingPlan(newPlan)
    try {
      const response = await fetch('/api/admin/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPlan })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          // Redirection vers Stripe Checkout pour upgrade
          window.location.href = data.checkoutUrl
        } else {
          alert('✅ Votre plan a été modifié avec succès !')
          fetchOrganization()
        }
      } else {
        const data = await response.json()
        alert('❌ Erreur : ' + (data.error || 'Impossible de changer de plan'))
      }
    } catch (error) {
      console.error('Erreur changement de plan:', error)
      alert('❌ Erreur lors du changement de plan')
    } finally {
      setChangingPlan(null)
    }
  }

  // Helper pour formater les quotas
  const formatQuota = (value: number | string) => {
    if (typeof value === 'string') return value
    return value.toLocaleString('fr-FR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Organisation non trouvée</p>
        </div>
      </div>
    )
  }

  const isActive = organization.status === 'ACTIVE'
  const isTrial = organization.status === 'TRIAL'
  const isCancelled = organization.status === 'CANCELLED' || organization.status === 'SUSPENDED'
  const daysLeft = organization.trialEndsAt ? getDaysLeft(organization.trialEndsAt) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-purple-200 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">💳 Abonnement & Facturation</h1>
              <p className="text-purple-100">Gérez votre abonnement {organization.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statut actuel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Statut actuel</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Statut</div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    ✓ Actif
                  </span>
                )}
                {isTrial && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    🎁 Essai gratuit
                  </span>
                )}
                {isCancelled && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    ⚠️ {organization.status === 'CANCELLED' ? 'Annulé' : 'Suspendu'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Plan actuel</div>
              <div className="text-2xl font-bold text-purple-600">{organization.plan}</div>
            </div>

            {isTrial && organization.trialEndsAt && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Fin de l'essai</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(organization.trialEndsAt)}
                </div>
                <div className={`text-sm font-medium mt-1 ${daysLeft <= 3 ? 'text-red-600' : 'text-blue-600'}`}>
                  {daysLeft > 0 ? `${daysLeft} jour(s) restant(s)` : 'Expiré'}
                </div>
              </div>
            )}

            {isActive && organization.currentPeriodEnd && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Prochaine facturation</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(organization.currentPeriodEnd)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Changer de plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🔄 Changer de plan</h2>
          <p className="text-gray-600 mb-6">Comparez les plans et changez à tout moment. Le changement prend effet immédiatement.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS_CONFIG.map(({ id: planId, popular }) => {
              const price = getPlanPrice(planId as 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM')
              const quotas = getPlanQuotas(planId as 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM')
              const name = getPlanName(planId as 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM')
              const isCurrentPlan = organization.plan === planId
              const currentPlanPrice = getPlanPrice(organization.plan as 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM')
              const isUpgrade = price > currentPlanPrice
              const isDowngrade = price < currentPlanPrice

              return (
                <div
                  key={planId}
                  className={`relative rounded-xl border-2 p-5 transition-all ${
                    isCurrentPlan
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                      : popular
                      ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  {/* Badge populaire ou plan actuel */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                        PLAN ACTUEL
                      </span>
                    </div>
                  )}
                  {popular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                        POPULAIRE
                      </span>
                    </div>
                  )}

                  {/* Header du plan */}
                  <div className="text-center mb-4 pt-2">
                    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-purple-600">{price}€</span>
                      <span className="text-gray-500">/mois</span>
                    </div>
                  </div>

                  {/* Quotas */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">👤 Utilisateurs</span>
                      <span className="font-semibold">{formatQuota(quotas.users)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">📍 Sites</span>
                      <span className="font-semibold">{formatQuota(quotas.locations)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💾 Stockage</span>
                      <span className="font-semibold">{typeof quotas.storageGB === 'string' ? quotas.storageGB : `${quotas.storageGB} Go`}</span>
                    </div>
                  </div>

                  {/* Fonctionnalités */}
                  {(() => {
                    const features = getFeaturesForPlan(planId as OrgPlan)
                    return (
                      <div className="border-t border-gray-200 pt-3 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Fonctionnalités</p>
                        <div className="space-y-1.5">
                          {FEATURES_INFO.map(({ key, label, icon }) => {
                            const hasFeature = features[key]
                            return (
                              <div key={key} className="flex items-center gap-2 text-sm">
                                {hasFeature ? (
                                  <span className="text-green-500 font-bold">✓</span>
                                ) : (
                                  <span className="text-gray-300">✗</span>
                                )}
                                <span className={hasFeature ? 'text-gray-800' : 'text-gray-400'}>
                                  {icon} {label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Bouton d'action */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 bg-purple-100 text-purple-600 rounded-lg font-semibold cursor-default"
                    >
                      ✓ Plan actuel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChangePlan(planId)}
                      disabled={changingPlan !== null}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                        isUpgrade
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {changingPlan === planId ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Traitement...
                        </span>
                      ) : isUpgrade ? (
                        `⬆️ Passer à ${name}`
                      ) : (
                        `⬇️ Passer à ${name}`
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Comment ça marche ?</strong><br />
              • <strong>Upgrade</strong> : Le changement est immédiat, vous êtes facturé au prorata.<br />
              • <strong>Downgrade</strong> : Prend effet à la fin de votre période de facturation actuelle.
            </p>
          </div>
        </div>

        {/* Factures d'abonnement LAIA */}
        <div className="mb-8">
          <LaiaInvoicesSection />
        </div>

        {/* Informations */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ℹ️ Informations</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Plan actuel</div>
              <div className="text-lg font-bold text-purple-600">{organization.plan}</div>
            </div>

            {organization.stripeCustomerId && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Gestion de l'abonnement</div>
                <a
                  href="/api/admin/customer-portal"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Gérer mon abonnement Stripe
                </a>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Besoin d'aide ?</strong> Pour toute question concernant votre abonnement,
                contactez notre support à <a href="mailto:support@laia.fr" className="underline">support@laia.fr</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
