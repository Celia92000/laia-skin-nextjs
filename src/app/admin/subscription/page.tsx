"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LaiaInvoicesSection from '@/components/LaiaInvoicesSection'

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
