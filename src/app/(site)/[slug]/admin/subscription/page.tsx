"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    fetchOrganization()
  }, [])

  async function fetchOrganization() {
    setLoading(true)
    try {
      const response = await fetch(`/api/${slug}/organization`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      } else if (response.status === 401) {
        router.push(`/${slug}/login`)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubscribe(plan: string) {
    if (!organization) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/${slug}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        const data = await response.json()
        // Rediriger vers Stripe Checkout
        window.location.href = data.url
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création de la session de paiement')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur serveur')
    } finally {
      setProcessing(false)
    }
  }

  const plans = [
    {
      id: 'SOLO',
      name: 'Solo',
      price: 49,
      features: [
        '1 emplacement',
        '10 utilisateurs',
        '100 services',
        '50 produits',
        'Support email',
        'Réservations illimitées'
      ],
      color: 'from-gray-500 to-gray-600',
      recommended: false
    },
    {
      id: 'DUO',
      name: 'Duo',
      price: 89,
      features: [
        '2 emplacements',
        '25 utilisateurs',
        '250 services',
        '150 produits',
        'Support prioritaire',
        'Réservations illimitées',
        'Export de données'
      ],
      color: 'from-blue-500 to-blue-600',
      recommended: true
    },
    {
      id: 'TEAM',
      name: 'Team',
      price: 149,
      features: [
        '5 emplacements',
        '100 utilisateurs',
        '500 services',
        '500 produits',
        'Support prioritaire 24/7',
        'Réservations illimitées',
        'Export de données',
        'API access',
        'Formation personnalisée'
      ],
      color: 'from-purple-500 to-purple-600',
      recommended: false
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 249,
      features: [
        'Emplacements illimités',
        'Utilisateurs illimités',
        'Services illimités',
        'Produits illimités',
        'Support dédié 24/7',
        'Réservations illimitées',
        'Export de données',
        'API access complet',
        'Formation personnalisée',
        'Développement sur mesure',
        'Manager dédié'
      ],
      color: 'from-indigo-500 to-indigo-600',
      recommended: false
    }
  ]

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
              <Link href={`/${slug}/admin`} className="text-purple-200 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">💳 Abonnement & Facturation</h1>
              <p className="text-purple-100">Gérez votre abonnement {organization.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status actuel */}
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

          {isTrial && daysLeft <= 7 && daysLeft > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-yellow-600 text-2xl mr-3">⏰</div>
                <div>
                  <div className="text-sm font-medium text-yellow-800">
                    Votre période d'essai se termine bientôt !
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    Choisissez un plan ci-dessous pour continuer à utiliser toutes les fonctionnalités après le {formatDate(organization.trialEndsAt!)}.
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-red-600 text-2xl mr-3">⚠️</div>
                <div>
                  <div className="text-sm font-medium text-red-800">
                    Votre abonnement est {organization.status === 'CANCELLED' ? 'annulé' : 'suspendu'}
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    Souscrivez à un plan pour réactiver votre compte et retrouver l'accès à toutes les fonctionnalités.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plans disponibles */}
        {(!isActive || isCancelled) && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choisissez votre plan</h2>
              <p className="text-gray-600">
                {isTrial
                  ? 'Sélectionnez le plan qui correspond à vos besoins pour continuer après l\'essai'
                  : 'Réactivez votre compte en choisissant un plan'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                    plan.recommended ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      RECOMMANDÉ
                    </div>
                  )}

                  <div className={`h-2 bg-gradient-to-r ${plan.color}`}></div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                      <span className="text-gray-600">/mois</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <span className="text-green-500 mr-2 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={processing || organization.plan === plan.id}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                        organization.plan === plan.id
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : plan.recommended
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                      } disabled:opacity-50`}
                    >
                      {processing
                        ? 'Traitement...'
                        : organization.plan === plan.id
                        ? 'Plan actuel'
                        : isActive
                        ? 'Changer de plan'
                        : 'Souscrire'}
                    </button>

                    {organization.plan === plan.id && isActive && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Votre plan actuel
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Si déjà actif, montrer info abonnement */}
        {isActive && !isCancelled && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎉 Votre abonnement est actif</h2>
            <p className="text-gray-600 mb-4">
              Vous êtes actuellement sur le plan <strong className="text-purple-600">{organization.plan}</strong> à{' '}
              <strong>{plans.find(p => p.id === organization.plan)?.price}€/mois</strong>.
            </p>

            <div className="flex gap-4">
              <Link
                href={`/${slug}/admin`}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Retour au dashboard
              </Link>

              {organization.stripeCustomerId && (
                <a
                  href={`/api/${slug}/customer-portal`}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Gérer mon abonnement Stripe
                </a>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Conseil :</strong> Pour modifier votre plan, annuler ou mettre à jour votre carte bancaire,
                utilisez le portail client Stripe ci-dessus.
              </p>
            </div>
          </div>
        )}

        {/* Factures d'abonnement LAIA */}
        <div className="mb-8">
          <LaiaInvoicesSection />
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">❓ Questions fréquentes</h2>

          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-purple-600">
                Puis-je changer de plan à tout moment ?
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                Oui, vous pouvez upgrader ou downgrader à tout moment. Le prorata sera calculé automatiquement.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-purple-600">
                Que se passe-t-il si j'annule mon abonnement ?
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                Vous garderez l'accès jusqu'à la fin de la période déjà payée. Après, votre compte sera suspendu.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-purple-600">
                Puis-je obtenir un remboursement ?
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                Les paiements mensuels ne sont pas remboursables, mais vous pouvez annuler à tout moment pour éviter les prochains paiements.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-purple-600">
                Mes données sont-elles sécurisées ?
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                Oui, tous les paiements sont traités de manière sécurisée par Stripe. Nous ne stockons jamais vos informations bancaires.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
