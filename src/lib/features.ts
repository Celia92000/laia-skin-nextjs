/**
 * 🎯 LAIA CONNECT - Gestion complète des fonctionnalités par forfait
 * Configuration exhaustive de toutes les features du système
 */

import { OrgPlan } from '@prisma/client'

/**
 * Interface complète de toutes les features disponibles
 */
export interface OrgFeatures {
  // === CORE (Toujours activé) ===
  // featureReservations: boolean  // Toujours activé
  // featureServices: boolean      // Toujours activé
  // featureClients: boolean       // Toujours activé
  // featurePlanning: boolean      // Toujours activé
  // featureStats: boolean         // Toujours activé (limité selon rôle)

  // === CONTENU & MARKETING ===
  featureBlog: boolean                // Articles/actualités

  // === E-COMMERCE ===
  featureProducts: boolean            // Boutique produits
  featureFormations: boolean          // Vente de formations
  featureOrders: boolean              // Gestion des commandes (produits + formations)
  featureGiftCards: boolean           // Cartes cadeaux

  // === CRM & PROSPECTION ===
  featureCRM: boolean                 // CRM complet (leads, prospects, clients)
  featureLeads: boolean               // Formulaire de contact & gestion leads
  featureClientSegmentation: boolean  // Segmentation clients avancée

  // === FIDÉLISATION ===
  featureLoyalty: boolean             // Programme de fidélité
  featureLoyaltyAdvanced: boolean     // Paliers VIP, points, récompenses
  featureReferral: boolean            // Programme de parrainage

  // === COMMUNICATION ===
  featureEmailing: boolean            // Emails marketing
  featureEmailAutomation: boolean     // Automations email avancées
  featureWhatsApp: boolean            // Messages WhatsApp
  featureWhatsAppAutomation: boolean  // Automations WhatsApp
  featureSMS: boolean                 // SMS marketing

  // === RÉSEAUX SOCIAUX ===
  featureSocialMedia: boolean         // Publication réseaux sociaux
  featureSocialSchedule: boolean      // Programmation publications
  featureInstagram: boolean           // Intégration Instagram
  featureFacebook: boolean            // Intégration Facebook
  featureTikTok: boolean              // Intégration TikTok

  // === GESTION AVANCÉE ===
  featureStock: boolean               // Gestion de stock
  featureStockAlerts: boolean         // Alertes stock bas
  featureMultiLocation: boolean       // Multi-emplacements
  featureMultiUser: boolean           // Multi-utilisateurs
  featureRoles: boolean               // Gestion des rôles avancée

  // === COMPTABILITÉ & FINANCE ===
  featureAccounting: boolean          // Comptabilité
  featureInvoices: boolean            // Génération factures
  featureExports: boolean             // Export données (CSV, Excel)
  featureReports: boolean             // Rapports avancés

  // === AVIS & RÉPUTATION ===
  featureReviews: boolean             // Gestion avis clients
  featureReviewsAdvanced: boolean     // Photos avant/après, évolution client
  featureGoogleReviews: boolean       // Sync avis Google

  // === PAIEMENTS ===
  featureStripe: boolean              // Paiement en ligne Stripe
  featurePaymentTracking: boolean     // Suivi paiements avancé
  featureRefunds: boolean             // Gestion remboursements

  // === PERSONNALISATION ===
  featureCustomDomain: boolean        // Nom de domaine personnalisé
  featureCustomDesign: boolean        // Personnalisation design complète
  featureCustomEmails: boolean        // Emails personnalisés (from)
  featureSEO: boolean                 // Outils SEO avancés

  // === SUPPORT ===
  featurePrioritySupport: boolean     // Support prioritaire
  featureOnboarding: boolean          // Accompagnement onboarding
  featureDedicatedAccount: boolean    // Account manager dédié
}

/**
 * 🎯 Configuration des features par forfait
 */
export const PLAN_FEATURES: Record<OrgPlan, OrgFeatures> = {
  // ==========================================
  // SOLO - 49€/mois
  // Institut indépendant, 1 emplacement, 1 admin
  // ==========================================
  SOLO: {
    // CORE: Toujours activé (réservations, services, clients, planning, stats de base)

    // Contenu
    featureBlog: false,

    // E-commerce
    featureProducts: false,
    featureFormations: false,
    featureOrders: false,
    featureGiftCards: true,  // ✅ Cartes cadeaux (essentiel pour tous)

    // CRM
    featureCRM: false,
    featureLeads: true,  // ✅ Formulaire de contact basique
    featureClientSegmentation: false,

    // Fidélisation
    featureLoyalty: true,   // ✅ Fidélité basique (compteur séances)
    featureLoyaltyAdvanced: false,
    featureReferral: false,

    // Communication
    featureEmailing: true,   // ✅ Emails basiques (confirmation, rappel)
    featureEmailAutomation: false,
    featureWhatsApp: true,   // ✅ WhatsApp basique
    featureWhatsAppAutomation: false,
    featureSMS: false,

    // Réseaux sociaux
    featureSocialMedia: false,
    featureSocialSchedule: false,
    featureInstagram: false,
    featureFacebook: false,
    featureTikTok: false,

    // Gestion
    featureStock: false,
    featureStockAlerts: false,
    featureMultiLocation: false,  // 1 seul emplacement
    featureMultiUser: false,      // 1 seul admin
    featureRoles: false,

    // Comptabilité
    featureAccounting: true,    // ✅ Comptabilité basique
    featureInvoices: true,      // ✅ Factures simples
    featureExports: false,
    featureReports: false,

    // Avis
    featureReviews: true,       // ✅ Avis clients basiques
    featureReviewsAdvanced: false,
    featureGoogleReviews: false,

    // Paiements
    featureStripe: true,        // ✅ Paiement en ligne
    featurePaymentTracking: false,
    featureRefunds: false,

    // Personnalisation
    featureCustomDomain: false,
    featureCustomDesign: true,  // ✅ Design de base (couleurs, logo)
    featureCustomEmails: false,
    featureSEO: false,

    // Support
    featurePrioritySupport: false,
    featureOnboarding: false,   // Support email standard
    featureDedicatedAccount: false,
  },

  // ==========================================
  // DUO - 89€/mois
  // Institut en croissance, 1 emplacement, 3 utilisateurs
  // ==========================================
  DUO: {
    // Contenu
    featureBlog: true,  // ✅ Blog pour SEO

    // E-commerce
    featureProducts: false,
    featureFormations: false,
    featureOrders: false,
    featureGiftCards: true,

    // CRM
    featureCRM: true,   // ✅ CRM complet
    featureLeads: true,
    featureClientSegmentation: false,

    // Fidélisation
    featureLoyalty: true,
    featureLoyaltyAdvanced: true,  // ✅ Paliers VIP, points
    featureReferral: true,         // ✅ Parrainage

    // Communication
    featureEmailing: true,
    featureEmailAutomation: true,  // ✅ Automations emails
    featureWhatsApp: true,
    featureWhatsAppAutomation: false,
    featureSMS: false,

    // Réseaux sociaux
    featureSocialMedia: false,
    featureSocialSchedule: false,
    featureInstagram: false,
    featureFacebook: false,
    featureTikTok: false,

    // Gestion
    featureStock: false,
    featureStockAlerts: false,
    featureMultiLocation: false,  // 1 seul emplacement
    featureMultiUser: true,       // ✅ 3 utilisateurs
    featureRoles: true,           // ✅ Gestion rôles basique

    // Comptabilité
    featureAccounting: true,
    featureInvoices: true,
    featureExports: true,   // ✅ Export CSV
    featureReports: false,

    // Avis
    featureReviews: true,
    featureReviewsAdvanced: true,   // ✅ Photos avant/après
    featureGoogleReviews: false,

    // Paiements
    featureStripe: true,
    featurePaymentTracking: true,   // ✅ Suivi paiements
    featureRefunds: false,

    // Personnalisation
    featureCustomDomain: false,
    featureCustomDesign: true,
    featureCustomEmails: false,
    featureSEO: true,   // ✅ SEO basique

    // Support
    featurePrioritySupport: false,
    featureOnboarding: true,  // ✅ Onboarding guidé
    featureDedicatedAccount: false,
  },

  // ==========================================
  // TEAM - 149€/mois
  // Institut établi, 3 emplacements, 10 utilisateurs
  // ==========================================
  TEAM: {
    // Contenu
    featureBlog: true,

    // E-commerce
    featureProducts: true,      // ✅ Boutique produits
    featureFormations: false,
    featureOrders: true,        // ✅ Gestion commandes produits
    featureGiftCards: true,

    // CRM
    featureCRM: true,
    featureLeads: true,
    featureClientSegmentation: true,  // ✅ Segmentation avancée

    // Fidélisation
    featureLoyalty: true,
    featureLoyaltyAdvanced: true,
    featureReferral: true,

    // Communication
    featureEmailing: true,
    featureEmailAutomation: true,
    featureWhatsApp: true,
    featureWhatsAppAutomation: true,  // ✅ Automations WhatsApp
    featureSMS: true,                 // ✅ SMS marketing

    // Réseaux sociaux
    featureSocialMedia: true,         // ✅ Publications réseaux sociaux
    featureSocialSchedule: true,      // ✅ Programmation
    featureInstagram: true,           // ✅ Instagram
    featureFacebook: true,            // ✅ Facebook
    featureTikTok: false,

    // Gestion
    featureStock: false,              // Pas encore de gestion stock
    featureStockAlerts: false,
    featureMultiLocation: true,       // ✅ 3 emplacements
    featureMultiUser: true,           // ✅ 10 utilisateurs
    featureRoles: true,

    // Comptabilité
    featureAccounting: true,
    featureInvoices: true,
    featureExports: true,
    featureReports: true,   // ✅ Rapports avancés

    // Avis
    featureReviews: true,
    featureReviewsAdvanced: true,
    featureGoogleReviews: true,  // ✅ Sync Google Reviews

    // Paiements
    featureStripe: true,
    featurePaymentTracking: true,
    featureRefunds: true,  // ✅ Gestion remboursements

    // Personnalisation
    featureCustomDomain: true,   // ✅ Domaine personnalisé
    featureCustomDesign: true,
    featureCustomEmails: true,   // ✅ Emails from personnalisés
    featureSEO: true,

    // Support
    featurePrioritySupport: true,  // ✅ Support prioritaire
    featureOnboarding: true,
    featureDedicatedAccount: false,
  },

  // ==========================================
  // PREMIUM - 249€/mois
  // Chaîne/Franchise, illimité
  // ==========================================
  PREMIUM: {
    // Contenu
    featureBlog: true,

    // E-commerce
    featureProducts: true,
    featureFormations: true,    // ✅ Vente de formations
    featureOrders: true,
    featureGiftCards: true,

    // CRM
    featureCRM: true,
    featureLeads: true,
    featureClientSegmentation: true,

    // Fidélisation
    featureLoyalty: true,
    featureLoyaltyAdvanced: true,
    featureReferral: true,

    // Communication
    featureEmailing: true,
    featureEmailAutomation: true,
    featureWhatsApp: true,
    featureWhatsAppAutomation: true,
    featureSMS: true,

    // Réseaux sociaux
    featureSocialMedia: true,
    featureSocialSchedule: true,
    featureInstagram: true,
    featureFacebook: true,
    featureTikTok: true,  // ✅ TikTok

    // Gestion
    featureStock: true,         // ✅ Gestion de stock complète
    featureStockAlerts: true,   // ✅ Alertes stock
    featureMultiLocation: true, // ✅ Illimité
    featureMultiUser: true,     // ✅ Illimité
    featureRoles: true,

    // Comptabilité
    featureAccounting: true,
    featureInvoices: true,
    featureExports: true,
    featureReports: true,

    // Avis
    featureReviews: true,
    featureReviewsAdvanced: true,
    featureGoogleReviews: true,

    // Paiements
    featureStripe: true,
    featurePaymentTracking: true,
    featureRefunds: true,

    // Personnalisation
    featureCustomDomain: true,
    featureCustomDesign: true,
    featureCustomEmails: true,
    featureSEO: true,

    // Support
    featurePrioritySupport: true,
    featureOnboarding: true,
    featureDedicatedAccount: true,  // ✅ Account manager dédié
  },

  // Anciens plans (compatibilité)
  STARTER: {
    ...({} as OrgFeatures), // Mapper vers SOLO
  },
  ESSENTIAL: {
    ...({} as OrgFeatures), // Mapper vers DUO
  },
  PROFESSIONAL: {
    ...({} as OrgFeatures), // Mapper vers TEAM
  },
  ENTERPRISE: {
    ...({} as OrgFeatures), // Mapper vers PREMIUM
  },
}

// Mapping des anciens plans
PLAN_FEATURES.STARTER = PLAN_FEATURES.SOLO
PLAN_FEATURES.ESSENTIAL = PLAN_FEATURES.DUO
PLAN_FEATURES.PROFESSIONAL = PLAN_FEATURES.TEAM
PLAN_FEATURES.ENTERPRISE = PLAN_FEATURES.PREMIUM

/**
 * Informations détaillées sur les features
 */
export interface FeatureInfo {
  id: keyof OrgFeatures
  name: string
  description: string
  icon: string
  category: 'core' | 'content' | 'ecommerce' | 'crm' | 'loyalty' | 'communication' | 'social' | 'management' | 'accounting' | 'reviews' | 'payment' | 'customization' | 'support'
  availableFrom: OrgPlan[]
}

export const FEATURES_INFO: FeatureInfo[] = [
  // === CONTENU ===
  {
    id: 'featureBlog',
    name: 'Blog / Actualités',
    description: 'Publiez des articles pour améliorer votre référencement',
    icon: '📝',
    category: 'content',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },

  // === E-COMMERCE ===
  {
    id: 'featureProducts',
    name: 'Boutique Produits',
    description: 'Vendez vos produits de beauté en ligne',
    icon: '🛍️',
    category: 'ecommerce',
    availableFrom: ['TEAM', 'PREMIUM'],
  },
  {
    id: 'featureFormations',
    name: 'Vente de Formations',
    description: 'Proposez des formations professionnelles',
    icon: '🎓',
    category: 'ecommerce',
    availableFrom: ['PREMIUM'],
  },
  {
    id: 'featureGiftCards',
    name: 'Cartes Cadeaux',
    description: 'Créez et gérez des cartes cadeaux',
    icon: '🎁',
    category: 'ecommerce',
    availableFrom: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'],
  },

  // === CRM ===
  {
    id: 'featureCRM',
    name: 'CRM Complet',
    description: 'Gérez vos prospects et conversions',
    icon: '📊',
    category: 'crm',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },
  {
    id: 'featureClientSegmentation',
    name: 'Segmentation Clients',
    description: 'Segmentation avancée par tags et critères',
    icon: '🎯',
    category: 'crm',
    availableFrom: ['TEAM', 'PREMIUM'],
  },

  // === FIDÉLISATION ===
  {
    id: 'featureLoyaltyAdvanced',
    name: 'Fidélité Avancée',
    description: 'Paliers VIP, points, récompenses personnalisées',
    icon: '⭐',
    category: 'loyalty',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },
  {
    id: 'featureReferral',
    name: 'Parrainage',
    description: 'Programme de parrainage automatisé',
    icon: '🤝',
    category: 'loyalty',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },

  // === COMMUNICATION ===
  {
    id: 'featureEmailAutomation',
    name: 'Email Automation',
    description: 'Scénarios d\'emails automatisés',
    icon: '📧',
    category: 'communication',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },
  {
    id: 'featureWhatsAppAutomation',
    name: 'WhatsApp Automation',
    description: 'Messages WhatsApp automatisés',
    icon: '💬',
    category: 'communication',
    availableFrom: ['TEAM', 'PREMIUM'],
  },
  {
    id: 'featureSMS',
    name: 'SMS Marketing',
    description: 'Campagnes SMS',
    icon: '📱',
    category: 'communication',
    availableFrom: ['TEAM', 'PREMIUM'],
  },

  // === RÉSEAUX SOCIAUX ===
  {
    id: 'featureSocialMedia',
    name: 'Réseaux Sociaux',
    description: 'Publication automatique Instagram, Facebook',
    icon: '📸',
    category: 'social',
    availableFrom: ['TEAM', 'PREMIUM'],
  },
  {
    id: 'featureTikTok',
    name: 'TikTok',
    description: 'Intégration TikTok',
    icon: '🎵',
    category: 'social',
    availableFrom: ['PREMIUM'],
  },

  // === GESTION ===
  {
    id: 'featureStock',
    name: 'Gestion de Stock',
    description: 'Suivez votre inventaire en temps réel',
    icon: '📦',
    category: 'management',
    availableFrom: ['PREMIUM'],
  },
  {
    id: 'featureMultiLocation',
    name: 'Multi-Emplacements',
    description: 'Gérez plusieurs points de vente',
    icon: '🏢',
    category: 'management',
    availableFrom: ['TEAM', 'PREMIUM'],
  },
  {
    id: 'featureMultiUser',
    name: 'Multi-Utilisateurs',
    description: 'Équipe de collaborateurs avec rôles',
    icon: '👥',
    category: 'management',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },

  // === COMPTABILITÉ ===
  {
    id: 'featureExports',
    name: 'Export Données',
    description: 'Exportez vos données (CSV, Excel)',
    icon: '📤',
    category: 'accounting',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },
  {
    id: 'featureReports',
    name: 'Rapports Avancés',
    description: 'Analyses et rapports détaillés',
    icon: '📈',
    category: 'accounting',
    availableFrom: ['TEAM', 'PREMIUM'],
  },

  // === AVIS ===
  {
    id: 'featureReviewsAdvanced',
    name: 'Photos Avant/Après',
    description: 'Évolution client avec photos',
    icon: '📷',
    category: 'reviews',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },
  {
    id: 'featureGoogleReviews',
    name: 'Sync Google Reviews',
    description: 'Synchronisation avis Google',
    icon: '⭐',
    category: 'reviews',
    availableFrom: ['TEAM', 'PREMIUM'],
  },

  // === PERSONNALISATION ===
  {
    id: 'featureCustomDomain',
    name: 'Domaine Personnalisé',
    description: 'Votre propre nom de domaine',
    icon: '🌐',
    category: 'customization',
    availableFrom: ['TEAM', 'PREMIUM'],
  },
  {
    id: 'featureSEO',
    name: 'Outils SEO',
    description: 'Optimisation référencement',
    icon: '🔍',
    category: 'customization',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },

  // === SUPPORT ===
  {
    id: 'featurePrioritySupport',
    name: 'Support Prioritaire',
    description: 'Réponse en moins de 4h',
    icon: '🚀',
    category: 'support',
    availableFrom: ['TEAM', 'PREMIUM'],
  },
  {
    id: 'featureOnboarding',
    name: 'Onboarding Guidé',
    description: 'Accompagnement personnalisé',
    icon: '🎯',
    category: 'support',
    availableFrom: ['DUO', 'TEAM', 'PREMIUM'],
  },
  {
    id: 'featureDedicatedAccount',
    name: 'Account Manager Dédié',
    description: 'Un interlocuteur dédié',
    icon: '👨‍💼',
    category: 'support',
    availableFrom: ['PREMIUM'],
  },
]

/**
 * Retourne les features activées pour un plan donné
 */
export function getFeaturesForPlan(plan: OrgPlan): OrgFeatures {
  return PLAN_FEATURES[plan]
}

/**
 * Vérifie si une feature est disponible pour un plan
 */
export function isFeatureAvailableForPlan(
  feature: keyof OrgFeatures,
  plan: OrgPlan
): boolean {
  return PLAN_FEATURES[plan][feature]
}

/**
 * Retourne le plan minimum requis pour une feature
 */
export function getMinimumPlanForFeature(
  feature: keyof OrgFeatures
): OrgPlan | null {
  const featureInfo = FEATURES_INFO.find((f) => f.id === feature)
  return featureInfo?.availableFrom[0] || null
}

/**
 * Retourne le nom français du plan
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
 * Prix adaptés aux revenus des instituts esthétiques
 */
export function getPlanPrice(plan: OrgPlan): number {
  const prices: Record<OrgPlan, number> = {
    SOLO: 49,      // Institut solo - 1 personne (3% du revenu ~1500€)
    DUO: 69,       // Petit institut - 2-3 personnes (4% du revenu ~2000€)
    TEAM: 119,     // Institut moyen - multi-emplacements (5% du revenu ~3000€)
    PREMIUM: 179,  // Grand institut/chaîne (moins de 3% du revenu >8000€)
    STARTER: 49,
    ESSENTIAL: 89,
    PROFESSIONAL: 149,
    ENTERPRISE: 249,
  }
  return prices[plan]
}

/**
 * Retourne la description complète d'un plan
 */
export function getPlanDescription(plan: OrgPlan): string {
  const descriptions: Record<OrgPlan, string> = {
    SOLO: 'Parfait pour un institut indépendant avec 1 emplacement',
    DUO: 'Pour un institut en croissance avec une petite équipe',
    TEAM: 'Pour les instituts établis avec plusieurs emplacements',
    PREMIUM: 'Pour les chaînes et franchises, tout illimité',
    STARTER: 'Parfait pour un institut indépendant avec 1 emplacement',
    ESSENTIAL: 'Pour un institut en croissance avec une petite équipe',
    PROFESSIONAL: 'Pour les instituts établis avec plusieurs emplacements',
    ENTERPRISE: 'Pour les chaînes et franchises, tout illimité',
  }
  return descriptions[plan]
}
