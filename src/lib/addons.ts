/**
 * 🎯 OPTIONS SUPPLÉMENTAIRES PAYANTES - LAIA CONNECT
 *
 * Options au-delà des forfaits de base (SOLO/DUO/TEAM/PREMIUM)
 */

import { OrgPlan } from '@prisma/client'

/**
 * Type d'addon
 */
export type AddonType = 'recurring' | 'one-time'

/**
 * Catégorie d'addon
 */
export type AddonCategory = 'setup' | 'customization' | 'storage' | 'support' | 'marketing' | 'features'

/**
 * Interface d'une option supplémentaire
 */
export interface AddonOption {
  id: string
  name: string
  description: string
  price: number // Prix en euros
  type: AddonType // Récurrent (mensuel) ou ponctuel
  category: AddonCategory
  availableFor: OrgPlan[] // Forfaits pouvant acheter cette option
  icon: string // Emoji
  popular?: boolean // Badge "Populaire"
  recommended?: boolean // Badge "Recommandé"
  unlocks?: string // Feature débloquée (pour les add-ons de features)
}

/**
 * 📦 CATALOGUE DES OPTIONS SUPPLÉMENTAIRES
 */
export const ADDON_OPTIONS: AddonOption[] = [
  // === AIDE AU DÉMARRAGE ===
  {
    id: 'migration-assistance',
    name: 'Migration Assistée',
    description: 'Récupération des données depuis l\'ancien système du client (clients, rendez-vous, historique)',
    price: 199, // Prix psychologique adapté aux budgets instituts
    type: 'one-time',
    category: 'setup',
    availableFor: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'],
    icon: '🚀',
    popular: true,
  },

  // === OPTIONS MENSUELLES ===
  {
    id: 'custom-domain',
    name: 'Nom de Domaine Personnalisé',
    description: 'Permet au client d\'utiliser son propre domaine (ex: mon-institut.fr au lieu de mon-institut.laiaconnect.fr)',
    price: 15, // Prix accessible, équivalent à un café/jour
    type: 'recurring',
    category: 'customization',
    availableFor: ['SOLO', 'DUO'], // Déjà inclus en TEAM+
    icon: '🌐',
  },
  {
    id: 'white-label',
    name: 'White Label',
    description: 'Suppression de toute mention "Propulsé par LAIA Connect" sur le site du client',
    price: 19, // Prix psychologique sous la barre des 20€
    type: 'recurring',
    category: 'customization',
    availableFor: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'], // Disponible pour tous
    icon: '⭐',
  },

  // === ADD-ONS DE FEATURES (Débloquer des onglets) ===
  {
    id: 'feature-blog',
    name: 'Onglet Blog',
    description: 'Débloquez l\'onglet Blog complet (articles + catégories + SEO)',
    price: 15,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO'], // Déjà inclus en DUO+
    icon: '📝',
    unlocks: 'featureBlog',
  },
  {
    id: 'feature-crm',
    name: 'Onglet CRM',
    description: 'Débloquez l\'onglet CRM complet (leads + prospects + pipeline)',
    price: 20,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO'], // Déjà inclus en DUO+
    icon: '🎯',
    unlocks: 'featureCRM',
    popular: true,
  },
  {
    id: 'feature-emailing',
    name: 'Onglet Email Marketing',
    description: 'Débloquez l\'onglet Email Marketing complet (campagnes + automations)',
    price: 15,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO'], // Déjà inclus en DUO+
    icon: '📧',
  },
  {
    id: 'feature-shop',
    name: 'Onglet Boutique',
    description: 'Débloquez l\'onglet Boutique complet (produits + formations + commandes)',
    price: 25,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO', 'DUO'], // Déjà inclus en TEAM+
    icon: '🛍️',
    unlocks: 'featureShop',
  },
  {
    id: 'feature-whatsapp',
    name: 'Onglet WhatsApp',
    description: 'Débloquez l\'onglet WhatsApp complet (marketing + automations)',
    price: 20,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO', 'DUO'], // Déjà inclus en TEAM+
    icon: '💬',
    unlocks: 'featureWhatsApp',
  },
  {
    id: 'feature-social-media',
    name: 'Onglet Réseaux Sociaux',
    description: 'Débloquez l\'onglet Réseaux Sociaux complet (Instagram + Facebook + TikTok)',
    price: 25,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO', 'DUO'], // Déjà inclus en TEAM+
    icon: '📲',
    unlocks: 'featureSocialMedia',
    popular: true,
  },
  {
    id: 'feature-stock',
    name: 'Onglet Stock Avancé',
    description: 'Débloquez l\'onglet Stock Avancé complet (inventaire + alertes + fournisseurs)',
    price: 25,
    type: 'recurring',
    category: 'features',
    availableFor: ['SOLO', 'DUO'], // Déjà inclus en TEAM+ et PREMIUM
    icon: '📦',
    unlocks: 'featureStock',
  },
]

/**
 * ✅ AVANTAGES TOUJOURS INCLUS (PAS DES ADD-ONS)
 *
 * À afficher dans tous les forfaits pour rassurer les clients
 */
export interface AlwaysIncludedFeature {
  id: string
  name: string
  description: string
  icon: string
}

export const ALWAYS_INCLUDED: AlwaysIncludedFeature[] = [
  {
    id: 'ssl-security',
    name: 'Sécurité SSL',
    description: 'Certificat SSL gratuit et automatique pour votre site',
    icon: '🔒',
  },
  {
    id: 'hosting',
    name: 'Hébergement Haute Performance',
    description: 'Hébergement cloud sécurisé inclus (99.9% uptime)',
    icon: '☁️',
  },
  {
    id: 'backups',
    name: 'Sauvegardes Automatiques',
    description: 'Sauvegardes quotidiennes de toutes vos données',
    icon: '💾',
  },
  {
    id: 'updates',
    name: 'Mises à Jour Automatiques',
    description: 'Nouvelles fonctionnalités et correctifs inclus',
    icon: '🔄',
  },
  {
    id: 'training-guide',
    name: 'Guide de Formation Complet',
    description: 'Fiches pratiques et tutoriels pour maîtriser la plateforme',
    icon: '🎓',
  },
  {
    id: 'gdpr',
    name: 'Conformité RGPD',
    description: 'Conforme RGPD, hébergement en France',
    icon: '🇫🇷',
  },
]

/**
 * Récupérer un addon par son ID
 */
export function getAddonById(addonId: string): AddonOption | undefined {
  return ADDON_OPTIONS.find(addon => addon.id === addonId)
}

/**
 * Récupérer les addons disponibles pour un forfait
 */
export function getAddonsForPlan(plan: OrgPlan): AddonOption[] {
  return ADDON_OPTIONS.filter(addon => addon.availableFor.includes(plan))
}

/**
 * Récupérer les addons d'une catégorie
 */
export function getAddonsByCategory(category: AddonCategory): AddonOption[] {
  return ADDON_OPTIONS.filter(addon => addon.category === category)
}

/**
 * Calculer le coût total des addons récurrents
 */
export function calculateRecurringAddons(addonIds: string[] | undefined): number {
  // Protection contre addonIds undefined ou null
  if (!addonIds || !Array.isArray(addonIds)) {
    return 0
  }

  return addonIds.reduce((total, id) => {
    const addon = getAddonById(id)
    if (addon && addon.type === 'recurring') {
      return total + addon.price
    }
    return total
  }, 0)
}

/**
 * Calculer le coût total des addons ponctuels
 */
export function calculateOneTimeAddons(addonIds: string[] | undefined): number {
  // Protection contre addonIds undefined ou null
  if (!addonIds || !Array.isArray(addonIds)) {
    return 0
  }

  return addonIds.reduce((total, id) => {
    const addon = getAddonById(id)
    if (addon && addon.type === 'one-time') {
      return total + addon.price
    }
    return total
  }, 0)
}

/**
 * Vérifier si un addon est disponible pour un forfait
 */
export function isAddonAvailableForPlan(addonId: string, plan: OrgPlan): boolean {
  const addon = getAddonById(addonId)
  return addon ? addon.availableFor.includes(plan) : false
}

/**
 * Formater le prix d'un addon
 */
export function formatAddonPrice(addon: AddonOption): string {
  if (addon.type === 'recurring') {
    return `${addon.price}€/mois`
  }
  return `${addon.price}€`
}

/**
 * Obtenir le badge d'un addon (Populaire, Recommandé)
 */
export function getAddonBadge(addon: AddonOption): string | null {
  if (addon.popular) return 'Populaire'
  if (addon.recommended) return 'Recommandé'
  return null
}

/**
 * Interface pour le tracking des addons actifs d'une organisation
 */
export interface OrganizationAddons {
  recurring: string[] // IDs des addons récurrents actifs
  oneTime: string[] // IDs des addons ponctuels déjà achetés
  history: AddonPurchaseHistory[]
}

/**
 * Historique d'achat d'addon
 */
export interface AddonPurchaseHistory {
  addonId: string
  purchaseDate: string // ISO date
  price: number
  type: AddonType
  status: 'active' | 'cancelled' | 'completed'
}

/**
 * Parser les addons depuis le JSON stocké en DB
 */
export function parseOrganizationAddons(addonsJson: string | null): OrganizationAddons {
  if (!addonsJson) {
    return {
      recurring: [],
      oneTime: [],
      history: [],
    }
  }

  try {
    return JSON.parse(addonsJson) as OrganizationAddons
  } catch {
    return {
      recurring: [],
      oneTime: [],
      history: [],
    }
  }
}

/**
 * Sérialiser les addons pour stockage en DB
 */
export function serializeOrganizationAddons(addons: OrganizationAddons): string {
  return JSON.stringify(addons)
}
