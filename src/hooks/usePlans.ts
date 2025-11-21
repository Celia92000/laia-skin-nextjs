import { useState, useEffect } from 'react'

export interface Plan {
  id: string
  planKey: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  name: string
  displayName: string
  description: string
  priceMonthly: number
  priceYearly: number
  maxLocations: number
  maxUsers: number
  maxStorage: number
  features: string[]
  highlights: string[]
  isPopular: boolean
  isRecommended: boolean
  stripePriceId: string | null
}

/**
 * Hook pour charger les formules d'abonnement depuis l'API
 * Utilise un fallback vers les prix hardcodés si l'API échoue
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans')
        if (res.ok) {
          const data = await res.json()
          setPlans(data.plans)
        } else {
          // Fallback vers prix hardcodés
          setPlans(getFallbackPlans())
        }
      } catch (err) {
        console.error('Error fetching plans:', err)
        setError(err as Error)
        // Fallback vers prix hardcodés
        setPlans(getFallbackPlans())
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return { plans, loading, error }
}

/**
 * Récupère un plan spécifique par sa clé
 */
export function usePlan(planKey: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM') {
  const { plans, loading, error } = usePlans()
  const plan = plans.find((p) => p.planKey === planKey)

  return { plan, loading, error }
}

/**
 * Plans fallback si l'API n'est pas disponible
 */
function getFallbackPlans(): Plan[] {
  return [
    {
      id: 'fallback-solo',
      planKey: 'SOLO',
      name: 'Solo',
      displayName: 'Formule Solo',
      description: 'Parfait pour un institut indépendant avec 1 emplacement',
      priceMonthly: 49,
      priceYearly: 49 * 12,
      maxLocations: 1,
      maxUsers: 1,
      maxStorage: 5,
      features: [],
      highlights: [
        'Réservations en ligne illimitées',
        'Planning intelligent',
        'Paiements en ligne (Stripe)',
        'Site web personnalisable',
        'Support email standard',
      ],
      isPopular: false,
      isRecommended: false,
      stripePriceId: null,
    },
    {
      id: 'fallback-duo',
      planKey: 'DUO',
      name: 'Duo',
      displayName: 'Formule Duo',
      description: 'Pour un institut en croissance avec une petite équipe',
      priceMonthly: 69,
      priceYearly: 69 * 12,
      maxLocations: 1,
      maxUsers: 3,
      maxStorage: 10,
      features: [],
      highlights: [
        'Tout de SOLO +',
        'CRM complet',
        'Email automation',
        '3 utilisateurs',
        'Outils SEO',
      ],
      isPopular: true,
      isRecommended: false,
      stripePriceId: null,
    },
    {
      id: 'fallback-team',
      planKey: 'TEAM',
      name: 'Team',
      displayName: 'Formule Team',
      description: 'Pour les instituts établis avec plusieurs emplacements',
      priceMonthly: 119,
      priceYearly: 119 * 12,
      maxLocations: 3,
      maxUsers: 10,
      maxStorage: 25,
      features: [],
      highlights: [
        'Tout de DUO +',
        'Boutique produits',
        'WhatsApp & SMS automation',
        'Publications réseaux sociaux',
        '3 emplacements',
        'Support prioritaire',
      ],
      isPopular: false,
      isRecommended: true,
      stripePriceId: null,
    },
    {
      id: 'fallback-premium',
      planKey: 'PREMIUM',
      name: 'Premium',
      displayName: 'Formule Premium',
      description: 'Pour les chaînes et franchises, tout illimité',
      priceMonthly: 179,
      priceYearly: 179 * 12,
      maxLocations: 999,
      maxUsers: 999,
      maxStorage: 100,
      features: [],
      highlights: [
        'Tout de TEAM +',
        'Gestion de stock complète',
        'Emplacements illimités',
        'Utilisateurs illimités',
        'Account manager dédié',
      ],
      isPopular: false,
      isRecommended: false,
      stripePriceId: null,
    },
  ]
}

/**
 * Utilitaire pour obtenir le prix d'un plan (compatible avec le code existant)
 */
export function getPlanPriceFromAPI(
  planKey: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM',
  plans: Plan[]
): number {
  const plan = plans.find((p) => p.planKey === planKey)
  return plan?.priceMonthly || getFallbackPrice(planKey)
}

function getFallbackPrice(planKey: string): number {
  const prices: Record<string, number> = {
    SOLO: 49,
    DUO: 69,
    TEAM: 119,
    PREMIUM: 179,
  }
  return prices[planKey] || 0
}
