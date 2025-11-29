import { useState, useEffect } from 'react'
import { getAllPlanHighlights, getPlanQuotas, getPlanHighlights, type PlanHighlights } from '@/lib/features-simple'
import type { OrgPlan } from '@prisma/client'

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
 * Convertit un PlanHighlights en Plan (interface existante)
 */
function convertHighlightsToPlan(h: PlanHighlights): Plan {
  const quotas = getPlanQuotas(h.id as OrgPlan)
  return {
    id: `plan-${h.id.toLowerCase()}`,
    planKey: h.id as 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM',
    name: h.name,
    displayName: `Formule ${h.name}`,
    description: h.description,
    priceMonthly: h.price,
    priceYearly: h.price * 12,
    maxLocations: typeof quotas.locations === 'number' ? quotas.locations : 999,
    maxUsers: typeof quotas.users === 'number' ? quotas.users : 999,
    maxStorage: typeof quotas.storageGB === 'number' ? quotas.storageGB : 100,
    features: h.features,
    highlights: h.featuresDetailed.slice(0, 6),
    isPopular: h.popular,
    isRecommended: h.id === 'TEAM',
    stripePriceId: null,
  }
}

/**
 * Hook pour charger les formules d'abonnement
 * Utilise la source centralisée features-simple.ts
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Utilise la source centralisée au lieu de l'API
    const highlights = getAllPlanHighlights()
    const convertedPlans = highlights.map(convertHighlightsToPlan)
    setPlans(convertedPlans)
    setLoading(false)
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
 * Utilitaire pour obtenir le prix d'un plan (compatible avec le code existant)
 * Utilise maintenant la source centralisée
 */
export function getPlanPriceFromAPI(
  planKey: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM',
  plans: Plan[]
): number {
  const plan = plans.find((p) => p.planKey === planKey)
  if (plan) return plan.priceMonthly

  // Fallback depuis la source centralisée
  const highlights = getPlanHighlights(planKey as OrgPlan)
  return highlights.price
}
