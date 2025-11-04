import { prisma } from './prisma'

/**
 * Gestionnaire des modules complémentaires (add-ons) et options supplémentaires
 * Permet aux clients d'ajouter des modules des formules supérieures à leur plan de base
 */

export interface Addon {
  id: string
  name: string
  description: string
  monthlyPrice: number
  requiredPlan?: string // Plan minimum requis (null = disponible pour tous)
  category: 'module' | 'option' // module = feature des plans supérieurs, option = add-on supplémentaire
  featureKey?: string // Clé de la feature à activer dans Organization
}

/**
 * Catalogue des modules complémentaires disponibles
 */
export const AVAILABLE_ADDONS: Addon[] = [
  // MODULES des formules supérieures
  {
    id: 'blog',
    name: 'Blog',
    description: 'Créez et publiez des articles de blog pour partager vos conseils beauté',
    monthlyPrice: 15,
    requiredPlan: 'SOLO', // Disponible pour SOLO (inclus dans DUO+)
    category: 'module',
    featureKey: 'featureBlog'
  },
  {
    id: 'products',
    name: 'Boutique Produits',
    description: 'Vendez vos produits en ligne avec gestion des stocks',
    monthlyPrice: 30,
    requiredPlan: 'SOLO', // Disponible pour SOLO et DUO (inclus dans TEAM+)
    category: 'module',
    featureKey: 'featureProducts'
  },
  {
    id: 'crm',
    name: 'CRM & Prospection',
    description: 'Gestion avancée des prospects et pipeline commercial',
    monthlyPrice: 40,
    requiredPlan: 'SOLO', // Disponible pour SOLO et DUO (inclus dans TEAM+)
    category: 'module',
    featureKey: 'featureCRM'
  },
  {
    id: 'stock',
    name: 'Gestion de Stock Avancée',
    description: 'Suivi détaillé des stocks de consommables et produits',
    monthlyPrice: 25,
    requiredPlan: 'SOLO', // Disponible pour tous (inclus dans PREMIUM)
    category: 'module',
    featureKey: 'featureStock'
  },
  {
    id: 'formations',
    name: 'Vente de Formations',
    description: 'Créez et vendez vos formations en ligne',
    monthlyPrice: 50,
    requiredPlan: 'SOLO', // Disponible pour tous (inclus dans PREMIUM)
    category: 'module',
    featureKey: 'featureFormations'
  },

  // OPTIONS SUPPLÉMENTAIRES (add-ons)
  {
    id: 'whatsapp_automation',
    name: 'Automatisation WhatsApp',
    description: 'Envoi automatique de rappels et messages personnalisés par WhatsApp',
    monthlyPrice: 20,
    category: 'option'
  },
  {
    id: 'instagram_scheduler',
    name: 'Planificateur Instagram',
    description: 'Planifiez et publiez automatiquement vos posts Instagram',
    monthlyPrice: 25,
    category: 'option'
  },
  {
    id: 'sms_marketing',
    name: 'SMS Marketing',
    description: 'Campagnes SMS pour fidéliser vos clients (500 SMS/mois inclus)',
    monthlyPrice: 30,
    category: 'option'
  },
  {
    id: 'gift_cards',
    name: 'Cartes Cadeaux',
    description: 'Créez et vendez des cartes cadeaux dématérialisées',
    monthlyPrice: 15,
    category: 'option'
  },
  {
    id: 'loyalty_advanced',
    name: 'Programme de Fidélité Avancé',
    description: 'Système de points, paliers VIP et récompenses personnalisées',
    monthlyPrice: 20,
    category: 'option'
  },
  {
    id: 'multi_location',
    name: 'Multi-emplacements (+5 emplacements)',
    description: 'Ajoutez 5 emplacements supplémentaires à votre forfait',
    monthlyPrice: 50,
    category: 'option'
  },
  {
    id: 'priority_support',
    name: 'Support Prioritaire',
    description: 'Assistance prioritaire par email, chat et téléphone',
    monthlyPrice: 35,
    category: 'option'
  },
  {
    id: 'custom_domain_ssl',
    name: 'Domaine Personnalisé avec SSL',
    description: 'Configurez votre propre nom de domaine avec certificat SSL',
    monthlyPrice: 10,
    category: 'option'
  }
]

/**
 * Détermine quels modules sont déjà inclus dans un plan
 */
export function getIncludedFeatures(plan: string): string[] {
  switch (plan) {
    case 'SOLO':
      return [] // Aucune feature incluse
    case 'DUO':
      return ['blog']
    case 'TEAM':
      return ['blog', 'products', 'crm']
    case 'PREMIUM':
      return ['blog', 'products', 'crm', 'stock', 'formations']
    default:
      return []
  }
}

/**
 * Récupère les add-ons disponibles pour un plan donné
 */
export function getAvailableAddonsForPlan(plan: string): Addon[] {
  const includedFeatures = getIncludedFeatures(plan)

  return AVAILABLE_ADDONS.filter(addon => {
    // Si c'est un module déjà inclus dans le plan, on ne le propose pas
    if (addon.category === 'module' && addon.featureKey && includedFeatures.includes(addon.id)) {
      return false
    }

    // Si le module nécessite un plan minimum, vérifier
    if (addon.requiredPlan) {
      const planOrder = { SOLO: 1, DUO: 2, TEAM: 3, PREMIUM: 4 }
      const currentPlanLevel = planOrder[plan as keyof typeof planOrder] || 0
      const requiredPlanLevel = planOrder[addon.requiredPlan as keyof typeof planOrder] || 0

      return currentPlanLevel >= requiredPlanLevel
    }

    return true
  })
}

/**
 * Active des add-ons pour une organisation
 */
export async function activateAddons(organizationId: string, addonIds: string[]) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { addons: true, plan: true }
  })

  if (!organization) {
    throw new Error('Organisation non trouvée')
  }

  // Parser les addons actuels
  const currentAddons = organization.addons ? JSON.parse(organization.addons) : { active: [], history: [] }

  // Filtrer les addons valides
  const validAddons = addonIds.filter(id =>
    AVAILABLE_ADDONS.some(addon => addon.id === id)
  )

  // Calculer le coût mensuel supplémentaire
  const additionalCost = validAddons.reduce((sum, id) => {
    const addon = AVAILABLE_ADDONS.find(a => a.id === id)
    return sum + (addon?.monthlyPrice || 0)
  }, 0)

  // Mettre à jour les addons
  const newAddons = {
    active: validAddons,
    history: [
      ...currentAddons.history,
      {
        action: 'activate',
        addons: validAddons,
        date: new Date().toISOString(),
        monthlyCost: additionalCost
      }
    ]
  }

  // Activer les features correspondantes
  const updateData: any = {
    addons: JSON.stringify(newAddons)
  }

  validAddons.forEach(id => {
    const addon = AVAILABLE_ADDONS.find(a => a.id === id)
    if (addon?.featureKey) {
      updateData[addon.featureKey] = true
    }
  })

  await prisma.organization.update({
    where: { id: organizationId },
    data: updateData
  })

  return {
    activatedAddons: validAddons,
    additionalMonthlyCost: additionalCost,
    totalMonthlyCost: getBasePlanPrice(organization.plan) + additionalCost
  }
}

/**
 * Désactive des add-ons
 */
export async function deactivateAddons(organizationId: string, addonIds: string[]) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { addons: true, plan: true }
  })

  if (!organization) {
    throw new Error('Organisation non trouvée')
  }

  const currentAddons = organization.addons ? JSON.parse(organization.addons) : { active: [], history: [] }

  // Retirer les addons de la liste active
  const remainingAddons = currentAddons.active.filter((id: string) => !addonIds.includes(id))

  // Calculer le nouveau coût
  const newMonthlyCost = remainingAddons.reduce((sum: number, id: string) => {
    const addon = AVAILABLE_ADDONS.find(a => a.id === id)
    return sum + (addon?.monthlyPrice || 0)
  }, 0)

  const newAddons = {
    active: remainingAddons,
    history: [
      ...currentAddons.history,
      {
        action: 'deactivate',
        addons: addonIds,
        date: new Date().toISOString(),
        monthlyCost: newMonthlyCost
      }
    ]
  }

  // Désactiver les features
  const updateData: any = {
    addons: JSON.stringify(newAddons)
  }

  addonIds.forEach(id => {
    const addon = AVAILABLE_ADDONS.find(a => a.id === id)
    if (addon?.featureKey) {
      // Vérifier si la feature n'est pas incluse dans le plan de base
      const includedFeatures = getIncludedFeatures(organization.plan)
      if (!includedFeatures.includes(id)) {
        updateData[addon.featureKey] = false
      }
    }
  })

  await prisma.organization.update({
    where: { id: organizationId },
    data: updateData
  })

  return {
    deactivatedAddons: addonIds,
    remainingAddons,
    newMonthlyCost: getBasePlanPrice(organization.plan) + newMonthlyCost
  }
}

/**
 * Récupère les add-ons actifs d'une organisation
 */
export async function getActiveAddons(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { addons: true, plan: true }
  })

  if (!organization) {
    throw new Error('Organisation non trouvée')
  }

  const currentAddons = organization.addons ? JSON.parse(organization.addons) : { active: [] }

  return currentAddons.active.map((id: string) =>
    AVAILABLE_ADDONS.find(addon => addon.id === id)
  ).filter(Boolean)
}

/**
 * Calcule le coût total mensuel (plan + addons)
 */
export async function calculateTotalMonthlyCost(organizationId: string): Promise<number> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { addons: true, plan: true }
  })

  if (!organization) {
    throw new Error('Organisation non trouvée')
  }

  const baseCost = getBasePlanPrice(organization.plan)
  const currentAddons = organization.addons ? JSON.parse(organization.addons) : { active: [] }

  const addonsCost = currentAddons.active.reduce((sum: number, id: string) => {
    const addon = AVAILABLE_ADDONS.find(a => a.id === id)
    return sum + (addon?.monthlyPrice || 0)
  }, 0)

  return baseCost + addonsCost
}

/**
 * Prix de base par plan
 */
function getBasePlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    SOLO: 49,
    DUO: 69,
    TEAM: 119,
    PREMIUM: 179
  }
  return prices[plan] || 49
}
