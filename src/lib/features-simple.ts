/**
 * 🎯 LAIA CONNECT - Gestion simplifiée des fonctionnalités
 * RÈGLE D'OR : 1 ONGLET = TOUT OU RIEN
 */

import { OrgPlan } from '@prisma/client'

/**
 * Interface ultra-simplifiée : chaque feature = 1 onglet complet
 */
export interface OrgFeatures {
  // === ONGLETS CONDITIONNELS (selon forfait) ===

  // DUO : Marketing de base
  featureCRM: boolean           // Onglet CRM complet (leads + prospects + pipeline + segmentation)
  featureEmailing: boolean      // Onglet Email Marketing complet (campagnes + automations + analytics)

  // TEAM : E-commerce et communication complète
  featureBlog: boolean          // Onglet Blog complet (articles + catégories + SEO)
  featureShop: boolean          // Onglet Boutique complet (produits + formations + commandes + stock léger)
  featureWhatsApp: boolean      // Onglet WhatsApp complet (marketing + automations)
  featureSMS: boolean           // Onglet SMS complet (campagnes + automations)
  featureSocialMedia: boolean   // Onglet Réseaux Sociaux complet (Instagram + Facebook + TikTok + programmation)

  // PREMIUM : Outils avancés pour scale
  featureStock: boolean         // Onglet Stock avancé complet (inventaire + alertes + fournisseurs)

  // === LIMITES TECHNIQUES ===
  featureMultiLocation: boolean // Multi-emplacements (TEAM+)
  featureMultiUser: boolean     // Multi-utilisateurs (DUO+)
}

/**
 * Configuration simplifiée par forfait
 *
 * ONGLETS TOUJOURS DISPONIBLES (tous forfaits) :
 * - Dashboard
 * - Planning
 * - Réservations (avec paiements Stripe intégré)
 * - Services
 * - Clients
 * - Fidélité (TOUT : compteur + paliers VIP + points + parrainage + cartes cadeaux)
 * - Avis (TOUT : collecte + photos avant/après + sync Google)
 * - Comptabilité (TOUT : factures + exports + rapports)
 * - Design & Apparence (TOUT : couleurs + logo + templates + sections)
 * - Guide de Formation (TOUT : fiches + tutoriels pour utiliser LAIA)
 * - Paramètres
 */
export const PLAN_FEATURES: Record<OrgPlan, OrgFeatures> = {
  // ==========================================
  // SOLO - 49€/mois
  // Esthéticienne indépendante seule
  // ==========================================
  SOLO: {
    // Aucun onglet avancé
    featureBlog: false,
    featureCRM: false,
    featureEmailing: false,
    featureShop: false,
    featureWhatsApp: false,
    featureSMS: false,
    featureSocialMedia: false,
    featureStock: false,

    // Limites
    featureMultiLocation: false,  // 1 seul emplacement
    featureMultiUser: false,      // 1 seul utilisateur
  },

  // ==========================================
  // DUO - 69€/mois
  // Petit institut 2-3 personnes - Marketing de base
  // ==========================================
  DUO: {
    // Marketing de base débloqué
    featureCRM: true,           // ✅ Onglet CRM complet
    featureEmailing: true,      // ✅ Onglet Email Marketing complet

    // Onglets e-commerce et communication restent cachés
    featureBlog: false,
    featureShop: false,
    featureWhatsApp: false,
    featureSMS: false,
    featureSocialMedia: false,
    featureStock: false,

    // Limites
    featureMultiLocation: false,  // 1 seul emplacement
    featureMultiUser: true,       // ✅ 3 utilisateurs max
  },

  // ==========================================
  // TEAM - 119€/mois
  // Institut établi - E-commerce et communication complète
  // ==========================================
  TEAM: {
    // Tout de DUO +
    featureCRM: true,
    featureEmailing: true,

    // E-commerce et communication débloqués
    featureBlog: true,          // ✅ Onglet Blog complet
    featureShop: true,          // ✅ Onglet Boutique complet (produits + formations)
    featureWhatsApp: true,      // ✅ Onglet WhatsApp complet
    featureSMS: true,           // ✅ Onglet SMS complet
    featureSocialMedia: true,   // ✅ Onglet Réseaux Sociaux complet

    // Stock avancé reste pour PREMIUM
    featureStock: false,

    // Limites
    featureMultiLocation: true,   // ✅ 3 emplacements max
    featureMultiUser: true,       // ✅ 5 utilisateurs max
  },

  // ==========================================
  // PREMIUM - 179€/mois
  // Chaîne/Franchise - Outils avancés pour scale
  // ==========================================
  PREMIUM: {
    // Tout de TEAM +
    featureCRM: true,
    featureEmailing: true,
    featureBlog: true,
    featureShop: true,
    featureWhatsApp: true,
    featureSMS: true,
    featureSocialMedia: true,

    // Outils avancés débloqués
    featureStock: true,         // ✅ Onglet Stock avancé complet (inventaire + alertes + fournisseurs)

    // Limites
    featureMultiLocation: true,   // ✅ Illimité
    featureMultiUser: true,       // ✅ Illimité
  },

  // Anciens plans (compatibilité)
  STARTER: {} as OrgFeatures,
  ESSENTIAL: {} as OrgFeatures,
  PROFESSIONAL: {} as OrgFeatures,
  ENTERPRISE: {} as OrgFeatures,
}

// Mapping des anciens plans
PLAN_FEATURES.STARTER = PLAN_FEATURES.SOLO
PLAN_FEATURES.ESSENTIAL = PLAN_FEATURES.DUO
PLAN_FEATURES.PROFESSIONAL = PLAN_FEATURES.TEAM
PLAN_FEATURES.ENTERPRISE = PLAN_FEATURES.PREMIUM

/**
 * Informations sur les onglets
 */
export interface TabInfo {
  id: keyof OrgFeatures | 'always'
  name: string
  description: string
  icon: string
  alwaysAvailable?: boolean // Toujours dispo tous forfaits
}

export const TABS_INFO: TabInfo[] = [
  // Toujours disponibles
  { id: 'always', name: 'Dashboard', description: 'Tableau de bord et statistiques', icon: '📊', alwaysAvailable: true },
  { id: 'always', name: 'Planning', description: 'Calendrier et disponibilités', icon: '📅', alwaysAvailable: true },
  { id: 'always', name: 'Réservations', description: 'Gestion des rendez-vous et paiements', icon: '💆', alwaysAvailable: true },
  { id: 'always', name: 'Services', description: 'Catalogue de prestations', icon: '✨', alwaysAvailable: true },
  { id: 'always', name: 'Clients', description: 'Gestion des clients et historique', icon: '👥', alwaysAvailable: true },
  { id: 'always', name: 'Fidélité', description: 'Programme complet (paliers + points + parrainage + cartes)', icon: '🎁', alwaysAvailable: true },
  { id: 'always', name: 'Avis', description: 'Collecte + photos avant/après + Google Reviews', icon: '⭐', alwaysAvailable: true },
  { id: 'always', name: 'Comptabilité', description: 'Factures + exports + rapports', icon: '💰', alwaysAvailable: true },
  { id: 'always', name: 'Design', description: 'Apparence complète (couleurs + templates + sections)', icon: '🎨', alwaysAvailable: true },
  { id: 'always', name: 'Guide de Formation', description: 'Fiches et tutoriels pour utiliser LAIA', icon: '🎓', alwaysAvailable: true },
  { id: 'always', name: 'Paramètres', description: 'Configuration générale', icon: '⚙️', alwaysAvailable: true },

  // Conditionnels
  { id: 'featureBlog', name: 'Blog', description: 'Articles + catégories + SEO', icon: '📝' },
  { id: 'featureCRM', name: 'CRM', description: 'Leads + prospects + pipeline + segmentation', icon: '🎯' },
  { id: 'featureEmailing', name: 'Email Marketing', description: 'Campagnes + automations + analytics', icon: '📧' },
  { id: 'featureShop', name: 'Boutique', description: 'Produits + formations + commandes + stock', icon: '🛍️' },
  { id: 'featureWhatsApp', name: 'WhatsApp', description: 'Marketing + automations', icon: '💬' },
  { id: 'featureSMS', name: 'SMS', description: 'Campagnes + automations', icon: '📱' },
  { id: 'featureSocialMedia', name: 'Réseaux Sociaux', description: 'Instagram + Facebook + TikTok + programmation', icon: '📲' },
  { id: 'featureStock', name: 'Stock Avancé', description: 'Inventaire + alertes + fournisseurs', icon: '📦' },
]

/**
 * Récupère les features d'un forfait
 */
export function getFeaturesForPlan(plan: OrgPlan): OrgFeatures {
  const features = PLAN_FEATURES[plan]
  if (!features || Object.keys(features).length === 0) {
    // Par défaut, retourner les features SOLO si plan invalide
    return PLAN_FEATURES.SOLO
  }
  return features
}

/**
 * Vérifie si une feature est disponible pour un plan
 */
export function isFeatureAvailableForPlan(feature: keyof OrgFeatures, plan: OrgPlan): boolean {
  return PLAN_FEATURES[plan][feature]
}

/**
 * 🎯 FONCTION PRINCIPALE : Calculer les features actives d'une organisation
 * Prend en compte le forfait de base + les add-ons achetés
 */
export function getActiveFeatures(
  plan: OrgPlan,
  addonsJson: string | null
): OrgFeatures {
  // 1. Partir des features du forfait de base
  const baseFeatures = { ...PLAN_FEATURES[plan] }

  // 2. Si pas d'add-ons, retourner les features de base
  if (!addonsJson) {
    return baseFeatures
  }

  // 3. Parser les add-ons actifs
  let addons: { recurring: string[] } = { recurring: [] }
  try {
    addons = JSON.parse(addonsJson)
  } catch {
    return baseFeatures
  }

  // 4. Activer les features débloquées par les add-ons récurrents
  const recurringAddons = addons.recurring || []

  // Mapping add-on ID -> feature à activer
  const addonFeatureMapping: Record<string, keyof OrgFeatures> = {
    'feature-blog': 'featureBlog',
    'feature-crm': 'featureCRM',
    'feature-emailing': 'featureEmailing',
    'feature-shop': 'featureShop',
    'feature-whatsapp': 'featureWhatsApp',
    'feature-sms': 'featureSMS',
    'feature-social-media': 'featureSocialMedia',
    'feature-stock': 'featureStock',
  }

  // Activer les features des add-ons achetés
  recurringAddons.forEach((addonId) => {
    const featureKey = addonFeatureMapping[addonId]
    if (featureKey) {
      baseFeatures[featureKey] = true
    }
  })

  return baseFeatures
}

/**
 * Retourne le nom du plan
 */
export function getPlanName(plan: OrgPlan): string {
  const names: Record<OrgPlan, string> = {
    SOLO: 'Solo',
    DUO: 'Duo',
    TEAM: 'Team',
    PREMIUM: 'Premium',
    STARTER: 'Solo',
    ESSENTIAL: 'Duo',
    PROFESSIONAL: 'Team',
    ENTERPRISE: 'Premium',
  }
  return names[plan]
}

/**
 * Retourne le prix du plan
 */
export function getPlanPrice(plan: OrgPlan): number {
  const prices: Record<OrgPlan, number> = {
    SOLO: 49,
    DUO: 69,
    TEAM: 119,
    PREMIUM: 179,
    STARTER: 49,
    ESSENTIAL: 69,
    PROFESSIONAL: 119,
    ENTERPRISE: 179,
  }
  return prices[plan]
}

/**
 * Retourne la description du plan
 */
export function getPlanDescription(plan: OrgPlan): string {
  const descriptions: Record<OrgPlan, string> = {
    SOLO: 'Parfait pour une esthéticienne indépendante seule - Base uniquement',
    DUO: 'Pour un petit institut 2-3 personnes - Marketing de base (CRM + Email)',
    TEAM: 'Pour les instituts établis - E-commerce et communication complète',
    PREMIUM: 'Pour les chaînes et franchises - Outils avancés pour scale',
    STARTER: 'Parfait pour une esthéticienne indépendante seule',
    ESSENTIAL: 'Pour un petit institut avec 2-3 personnes',
    PROFESSIONAL: 'Pour les instituts établis avec plusieurs emplacements',
    ENTERPRISE: 'Pour les chaînes et franchises',
  }
  return descriptions[plan]
}

/**
 * Quotas/limites par plan - pour affichage sur le site vitrine
 */
export interface PlanQuotas {
  users: number | 'Illimité'
  locations: number | 'Illimité'
  storageGB: number | 'Illimité'
  emailsPerMonth: number | 'Illimité'
  whatsappPerMonth: number | 'Illimité'
  smsPerMonth: number | 'Non inclus' | 'Illimité'
}

/**
 * Retourne les quotas d'un plan (pour affichage client)
 * Répartition équitable - mise à jour Nov 2024
 */
export function getPlanQuotas(plan: OrgPlan): PlanQuotas {
  const quotas: Record<OrgPlan, PlanQuotas> = {
    // SOLO 49€ - Esthéticienne indépendante
    SOLO: {
      users: 1,
      locations: 1,
      storageGB: 5,
      emailsPerMonth: 1000,
      whatsappPerMonth: 200,
      smsPerMonth: 'Non inclus',
    },
    // DUO 69€ - Petit institut 2-3 personnes
    DUO: {
      users: 3,
      locations: 1,
      storageGB: 15,
      emailsPerMonth: 2000,
      whatsappPerMonth: 500,
      smsPerMonth: 'Non inclus',
    },
    // TEAM 119€ - Institut établi
    TEAM: {
      users: 8,
      locations: 3,
      storageGB: 30,
      emailsPerMonth: 5000,
      whatsappPerMonth: 1000,
      smsPerMonth: 200,
    },
    // PREMIUM 179€ - Chaîne / Franchise
    PREMIUM: {
      users: 'Illimité',
      locations: 'Illimité',
      storageGB: 'Illimité',
      emailsPerMonth: 'Illimité',
      whatsappPerMonth: 'Illimité',
      smsPerMonth: 1000,
    },
    // Anciens plans (compatibilité)
    STARTER: {
      users: 1,
      locations: 1,
      storageGB: 5,
      emailsPerMonth: 1000,
      whatsappPerMonth: 200,
      smsPerMonth: 'Non inclus',
    },
    ESSENTIAL: {
      users: 3,
      locations: 1,
      storageGB: 15,
      emailsPerMonth: 2000,
      whatsappPerMonth: 500,
      smsPerMonth: 'Non inclus',
    },
    PROFESSIONAL: {
      users: 8,
      locations: 3,
      storageGB: 30,
      emailsPerMonth: 5000,
      whatsappPerMonth: 1000,
      smsPerMonth: 200,
    },
    ENTERPRISE: {
      users: 'Illimité',
      locations: 'Illimité',
      storageGB: 'Illimité',
      emailsPerMonth: 'Illimité',
      whatsappPerMonth: 'Illimité',
      smsPerMonth: 1000,
    },
  }
  return quotas[plan]
}

/**
 * Formate une valeur de quota pour affichage
 */
export function formatQuotaValue(value: number | string): string {
  if (typeof value === 'string') return value
  return value.toLocaleString('fr-FR')
}
