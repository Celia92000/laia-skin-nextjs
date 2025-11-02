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

  // DUO+ : Onglets de contenu et marketing de base
  featureBlog: boolean          // Onglet Blog complet (articles + catégories + SEO)
  featureCRM: boolean           // Onglet CRM complet (leads + prospects + pipeline + segmentation)
  featureEmailing: boolean      // Onglet Email Marketing complet (campagnes + automations + analytics)

  // TEAM+ : Onglets e-commerce et communication avancée
  featureShop: boolean          // Onglet Boutique complet (produits + formations + commandes + stock léger)
  featureWhatsApp: boolean      // Onglet WhatsApp complet (marketing + automations)
  featureSMS: boolean           // Onglet SMS complet (campagnes + automations)
  featureSocialMedia: boolean   // Onglet Réseaux Sociaux complet (Instagram + Facebook + TikTok + programmation)

  // PREMIUM : Onglets avancés
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
  // DUO - 89€/mois
  // Petit institut 2-3 personnes
  // ==========================================
  DUO: {
    // Onglets débloqués
    featureBlog: true,          // ✅ Onglet Blog complet
    featureCRM: true,           // ✅ Onglet CRM complet
    featureEmailing: true,      // ✅ Onglet Email Marketing complet
    featureWhatsApp: true,      // ✅ Onglet WhatsApp complet (messages auto)
    featureShop: true,          // ✅ Onglet Boutique complet (produits + formations)

    // Onglets toujours cachés
    featureSMS: false,
    featureSocialMedia: false,
    featureStock: false,

    // Limites
    featureMultiLocation: false,  // 1 seul emplacement
    featureMultiUser: true,       // ✅ 3 utilisateurs max
  },

  // ==========================================
  // TEAM - 149€/mois
  // Institut établi, multi-emplacements
  // ==========================================
  TEAM: {
    // Tout de DUO +
    featureBlog: true,
    featureCRM: true,
    featureEmailing: true,

    // Nouveaux onglets
    featureShop: true,          // ✅ Onglet Boutique complet (produits + formations)
    featureWhatsApp: true,      // ✅ Onglet WhatsApp complet
    featureSMS: true,           // ✅ Onglet SMS complet
    featureSocialMedia: true,   // ✅ Onglet Réseaux Sociaux complet
    featureStock: true,         // ✅ Onglet Stock avancé complet

    // Limites
    featureMultiLocation: true,   // ✅ 3 emplacements max
    featureMultiUser: true,       // ✅ 10 utilisateurs max
  },

  // ==========================================
  // PREMIUM - 249€/mois
  // Chaîne/Franchise
  // ==========================================
  PREMIUM: {
    // Tout de TEAM +
    featureBlog: true,
    featureCRM: true,
    featureEmailing: true,
    featureShop: true,
    featureWhatsApp: true,
    featureSMS: true,
    featureSocialMedia: true,

    // Tous les onglets débloqués
    featureStock: true,         // ✅ Onglet Stock avancé complet

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
    DUO: 89,
    TEAM: 149,
    PREMIUM: 249,
    STARTER: 49,
    ESSENTIAL: 89,
    PROFESSIONAL: 149,
    ENTERPRISE: 249,
  }
  return prices[plan]
}

/**
 * Retourne la description du plan
 */
export function getPlanDescription(plan: OrgPlan): string {
  const descriptions: Record<OrgPlan, string> = {
    SOLO: 'Parfait pour une esthéticienne indépendante seule',
    DUO: 'Pour un petit institut avec 2-3 personnes',
    TEAM: 'Pour les instituts établis avec plusieurs emplacements',
    PREMIUM: 'Pour les chaînes et franchises',
    STARTER: 'Parfait pour une esthéticienne indépendante seule',
    ESSENTIAL: 'Pour un petit institut avec 2-3 personnes',
    PROFESSIONAL: 'Pour les instituts établis avec plusieurs emplacements',
    ENTERPRISE: 'Pour les chaînes et franchises',
  }
  return descriptions[plan]
}
