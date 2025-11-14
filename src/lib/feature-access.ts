import { OrgPlan, UserRole } from '@prisma/client'
import { OrgFeatures, PLAN_FEATURES } from './features-simple'

/**
 * 🔐 CONTRÔLE D'ACCÈS AUX FEATURES
 *
 * Vérifie si un utilisateur avec un rôle donné peut accéder à une feature
 * selon la formule de l'organisation
 */

/**
 * Type pour les features vérifiables
 */
export type FeatureKey = keyof OrgFeatures

/**
 * Rôles qui ont accès complet à toutes les features disponibles dans la formule
 */
const FULL_ACCESS_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ORG_OWNER'
]

/**
 * Mapping des rôles vers les features autorisées
 * (indépendamment de la formule - si la formule inclut la feature, le rôle y a-t-il accès ?)
 */
const ROLE_FEATURE_ACCESS: Record<UserRole, Partial<Record<FeatureKey, boolean>>> = {
  // Accès complet pour les admins (vérifié par FULL_ACCESS_ROLES)
  SUPER_ADMIN: {},
  ORG_OWNER: {},

  // Comptable : Accès aux features liées à la gestion financière et clients
  ACCOUNTANT: {
    featureCRM: true,          // ✅ Peut voir les clients/prospects
    featureEmailing: false,    // ❌ Ne peut pas envoyer d'emails marketing
    featureBlog: false,        // ❌ Pas d'accès au blog
    featureShop: true,         // ✅ Peut voir les commandes (facturation)
    featureWhatsApp: false,    // ❌ Pas de marketing WhatsApp
    featureSMS: false,         // ❌ Pas de marketing SMS
    featureSocialMedia: false, // ❌ Pas de réseaux sociaux
    featureStock: true,        // ✅ Peut voir le stock (inventaire)
    featureMultiLocation: true,
    featureMultiUser: true,
  },

  // Responsable d'emplacement : Accès à son emplacement uniquement
  LOCATION_MANAGER: {
    featureCRM: true,          // ✅ Peut voir les clients de son emplacement
    featureEmailing: false,    // ❌ Pas d'email marketing
    featureBlog: false,        // ❌ Pas de blog
    featureShop: true,         // ✅ Peut gérer les ventes de son emplacement
    featureWhatsApp: false,    // ❌ Pas de WhatsApp
    featureSMS: false,         // ❌ Pas de SMS
    featureSocialMedia: false, // ❌ Pas de réseaux sociaux
    featureStock: true,        // ✅ Peut gérer le stock de son emplacement
    featureMultiLocation: true,
    featureMultiUser: true,
  },

  // Employé : Accès opérationnel de base
  STAFF: {
    featureCRM: true,          // ✅ Peut voir les clients (pour les RDV)
    featureEmailing: false,    // ❌ Pas d'email marketing
    featureBlog: false,        // ❌ Pas de blog
    featureShop: true,         // ✅ Peut vendre des produits
    featureWhatsApp: false,    // ❌ Pas de WhatsApp
    featureSMS: false,         // ❌ Pas de SMS
    featureSocialMedia: false, // ❌ Pas de réseaux sociaux
    featureStock: false,       // ❌ Pas d'accès au stock
    featureMultiLocation: false,
    featureMultiUser: true,
  },

  // Réceptionniste : Accès minimal (RDV et clients)
  RECEPTIONIST: {
    featureCRM: true,          // ✅ Peut voir les clients (pour les RDV)
    featureEmailing: false,    // ❌ Pas d'email marketing
    featureBlog: false,        // ❌ Pas de blog
    featureShop: false,        // ❌ Pas de vente
    featureWhatsApp: false,    // ❌ Pas de WhatsApp
    featureSMS: false,         // ❌ Pas de SMS
    featureSocialMedia: false, // ❌ Pas de réseaux sociaux
    featureStock: false,       // ❌ Pas de stock
    featureMultiLocation: false,
    featureMultiUser: true,
  },

  // Client : Aucun accès aux features admin
  CLIENT: {
    featureCRM: false,
    featureEmailing: false,
    featureBlog: false,
    featureShop: false,
    featureWhatsApp: false,
    featureSMS: false,
    featureSocialMedia: false,
    featureStock: false,
    featureMultiLocation: false,
    featureMultiUser: false,
  },
}

/**
 * Vérifie si une feature est disponible pour un plan donné
 */
export function isFeatureAvailableInPlan(
  feature: FeatureKey,
  plan: OrgPlan
): boolean {
  const planFeatures = PLAN_FEATURES[plan]
  if (!planFeatures) return false
  return planFeatures[feature] === true
}

/**
 * Vérifie si un rôle a accès à une feature (indépendamment de la formule)
 */
export function doesRoleHaveAccessToFeature(
  feature: FeatureKey,
  role: UserRole
): boolean {
  // Les rôles avec accès complet ont accès à toutes les features
  if (FULL_ACCESS_ROLES.includes(role)) {
    return true
  }

  // Sinon, vérifier dans le mapping des rôles
  const roleAccess = ROLE_FEATURE_ACCESS[role]
  return roleAccess[feature] === true
}

/**
 * 🎯 FONCTION PRINCIPALE
 * Vérifie si un utilisateur peut accéder à une feature selon :
 * 1. La formule de l'organisation (la feature est-elle incluse ?)
 * 2. Le rôle de l'utilisateur (a-t-il les droits d'accès ?)
 */
export function canAccessFeature(
  feature: FeatureKey,
  plan: OrgPlan,
  role: UserRole
): boolean {
  // 1. Vérifier si la feature est disponible dans la formule
  const isInPlan = isFeatureAvailableInPlan(feature, plan)
  if (!isInPlan) {
    return false // Feature pas dans la formule = accès refusé
  }

  // 2. Vérifier si le rôle a accès à cette feature
  const roleHasAccess = doesRoleHaveAccessToFeature(feature, role)
  return roleHasAccess
}

/**
 * Récupère toutes les features accessibles pour un utilisateur
 */
export function getAccessibleFeatures(
  plan: OrgPlan,
  role: UserRole
): Partial<OrgFeatures> {
  const planFeatures = PLAN_FEATURES[plan]
  const accessibleFeatures: Partial<OrgFeatures> = {}

  // Pour chaque feature du plan, vérifier si le rôle y a accès
  Object.keys(planFeatures).forEach((key) => {
    const featureKey = key as FeatureKey
    if (canAccessFeature(featureKey, plan, role)) {
      accessibleFeatures[featureKey] = true
    } else {
      accessibleFeatures[featureKey] = false
    }
  })

  return accessibleFeatures
}

/**
 * Vérifie si un utilisateur peut accéder à une route spécifique
 * Mapping des routes vers les features requises
 */
const ROUTE_FEATURE_MAPPING: Record<string, FeatureKey | 'always'> = {
  // Routes toujours accessibles (fonctionnalités de base)
  '/admin': 'always',
  '/admin/dashboard': 'always',
  '/admin/settings': 'always',
  '/admin/planning': 'always',
  '/admin/reservations': 'always',
  '/admin/services': 'always',
  '/admin/clients': 'always',
  '/admin/finances': 'always',
  '/admin/reviews': 'always',
  '/admin/loyalty': 'always',
  '/admin/users': 'always', // Mais contrôlé par rôle (ORG_OWNER, SUPER_ADMIN uniquement)
  '/admin/permissions': 'always', // Mais contrôlé par rôle
  '/admin/templates': 'always',
  '/admin/subscription': 'always',
  '/admin/rate-laia': 'always',
  '/admin/database-migration': 'always', // Admin uniquement

  // Routes conditionnelles selon les features
  '/admin/blog': 'featureBlog',
  '/admin/crm': 'featureCRM',
  '/admin/emailing': 'featureEmailing',
  '/admin/shop': 'featureShop',
  '/admin/whatsapp': 'featureWhatsApp',
  '/admin/sms': 'featureSMS',
  '/admin/social-media': 'featureSocialMedia',
  '/admin/instagram-setup': 'featureSocialMedia',
  '/admin/campaign-test': 'featureEmailing',
  '/admin/communications': 'featureEmailing', // Communications = emailing/SMS/WhatsApp
  '/admin/stock': 'featureStock',
  '/admin/locations': 'featureMultiLocation',
}

/**
 * Vérifie si un utilisateur peut accéder à une route
 */
export function canAccessRoute(
  route: string,
  plan: OrgPlan,
  role: UserRole
): boolean {
  const requiredFeature = ROUTE_FEATURE_MAPPING[route]

  if (!requiredFeature) {
    // Route non mappée = accès refusé par défaut (sécurité)
    return false
  }

  if (requiredFeature === 'always') {
    // Route toujours disponible
    return true
  }

  // Vérifier l'accès à la feature
  return canAccessFeature(requiredFeature, plan, role)
}
