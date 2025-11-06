/**
 * Gestion des features par organisation avec support des customisations
 */

import { OrgPlan } from '@prisma/client'
import { PLAN_FEATURES, OrgFeatures } from './features'

/**
 * Calcule les features effectives d'une organisation
 * en tenant compte des customisations du super-admin
 */
export function getOrganizationFeatures(
  plan: OrgPlan,
  customFeaturesEnabled?: string | null,
  customFeaturesDisabled?: string | null
): OrgFeatures {
  // Features de base du plan
  const basePlanFeatures = { ...PLAN_FEATURES[plan] }

  // Parser les custom features
  const featuresEnabled: string[] = customFeaturesEnabled
    ? JSON.parse(customFeaturesEnabled)
    : []
  const featuresDisabled: string[] = customFeaturesDisabled
    ? JSON.parse(customFeaturesDisabled)
    : []

  // Appliquer les customisations
  const finalFeatures = { ...basePlanFeatures } as any

  // Activer les features ajoutées manuellement
  featuresEnabled.forEach((feature) => {
    if (feature in finalFeatures) {
      finalFeatures[feature] = true
    }
  })

  // Désactiver les features retirées manuellement
  featuresDisabled.forEach((feature) => {
    if (feature in finalFeatures) {
      finalFeatures[feature] = false
    }
  })

  return finalFeatures as OrgFeatures
}

/**
 * Retourne la liste des features qui sont customisées pour une organisation
 */
export function getCustomizedFeatures(
  plan: OrgPlan,
  customFeaturesEnabled?: string | null,
  customFeaturesDisabled?: string | null
): {
  enabled: string[]
  disabled: string[]
} {
  const featuresEnabled: string[] = customFeaturesEnabled
    ? JSON.parse(customFeaturesEnabled)
    : []
  const featuresDisabled: string[] = customFeaturesDisabled
    ? JSON.parse(customFeaturesDisabled)
    : []

  return {
    enabled: featuresEnabled,
    disabled: featuresDisabled,
  }
}
