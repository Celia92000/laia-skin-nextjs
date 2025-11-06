'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Star, Sparkles, ArrowRight } from 'lucide-react'
import { Plan } from '@/hooks/usePlans'

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans')
        if (res.ok) {
          const data = await res.json()
          setPlans(data.plans)
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des formules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/platform" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            LAIA Connect
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            Connexion
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Choisissez votre formule
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Toutes les formules incluent 30 jours d'essai gratuit, sans engagement.
          Changez ou annulez à tout moment.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 flex flex-col ${
                plan.isPopular || plan.isRecommended
                  ? 'ring-2 ring-purple-500 transform scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {/* Badges */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3" />
                    POPULAIRE
                  </div>
                </div>
              )}
              {plan.isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    RECOMMANDÉ
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                {/* Prix */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.priceMonthly}€
                  </span>
                  <span className="text-gray-600">/mois</span>
                </div>
                <p className="text-sm text-gray-500">
                  ou {plan.priceYearly}€/an
                </p>
              </div>

              {/* Limites */}
              <div className="space-y-2 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">📍</span>
                  <span className="text-gray-700">
                    {plan.maxLocations === 999 ? 'Illimité' : plan.maxLocations} emplacement{plan.maxLocations > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">👥</span>
                  <span className="text-gray-700">
                    {plan.maxUsers === 999 ? 'Illimité' : plan.maxUsers} utilisateur{plan.maxUsers > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">💾</span>
                  <span className="text-gray-700">{plan.maxStorage} GB stockage</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {plan.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                href={`/onboarding?plan=${plan.planKey}`}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center flex items-center justify-center gap-2 transition ${
                  plan.isPopular || plan.isRecommended
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Démarrer l'essai gratuit
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ/Info */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Questions fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🎁 L'essai gratuit est-il vraiment gratuit ?
              </h3>
              <p className="text-gray-600 text-sm">
                Oui ! 30 jours d'essai complet, aucune carte bancaire requise. Testez toutes les fonctionnalités sans engagement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🔄 Puis-je changer de formule ?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolument. Changez de formule à tout moment depuis votre espace admin. Les changements sont immédiats.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                💳 Quels modes de paiement acceptez-vous ?
              </h3>
              <p className="text-gray-600 text-sm">
                Prélèvement SEPA automatique. Paiement sécurisé et factures envoyées par email chaque mois.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🆘 Quel support est inclus ?
              </h3>
              <p className="text-gray-600 text-sm">
                Toutes les formules incluent le support email. Les formules TEAM et PREMIUM bénéficient d'un support prioritaire.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Besoin d'aide pour choisir ? Nous sommes là pour vous conseiller
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
