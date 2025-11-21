// Système de gestion des permissions multi-tenant
import { UserRole } from '@prisma/client'

// Définition des permissions par ressource
export type Permission =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'

export type Resource =
  | 'users'
  | 'clients'
  | 'reservations'
  | 'services'
  | 'products'
  | 'blog'
  | 'reviews'
  | 'settings'
  | 'finance'
  | 'stats'
  | 'inventory'
  | 'marketing'
  | 'loyalty'
  | 'locations'
  | 'staff'

// Matrice de permissions par rôle (OPTIMISÉE)
const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Permission[]>> = {
  SUPER_ADMIN: {
    // Accès total à tout (LAIA équipe)
    users: ['view', 'create', 'update', 'delete', 'manage'],
    clients: ['view', 'create', 'update', 'delete', 'manage'],
    reservations: ['view', 'create', 'update', 'delete', 'manage'],
    services: ['view', 'create', 'update', 'delete', 'manage'],
    products: ['view', 'create', 'update', 'delete', 'manage'],
    blog: ['view', 'create', 'update', 'delete', 'manage'],
    reviews: ['view', 'create', 'update', 'delete', 'manage'],
    settings: ['view', 'create', 'update', 'delete', 'manage'],
    finance: ['view', 'create', 'update', 'delete', 'manage'],
    stats: ['view', 'manage'],
    inventory: ['view', 'create', 'update', 'delete', 'manage'],
    marketing: ['view', 'create', 'update', 'delete', 'manage'],
    loyalty: ['view', 'create', 'update', 'delete', 'manage'],
    locations: ['view', 'create', 'update', 'delete', 'manage'],
    staff: ['view', 'create', 'update', 'delete', 'manage'],
  },

  ORG_ADMIN: {
    // Propriétaire/Admin institut - Accès complet à son organisation
    users: ['view', 'create', 'update', 'delete', 'manage'],
    clients: ['view', 'create', 'update', 'delete', 'manage'],
    reservations: ['view', 'create', 'update', 'delete', 'manage'],
    services: ['view', 'create', 'update', 'delete', 'manage'],
    products: ['view', 'create', 'update', 'delete', 'manage'],
    blog: ['view', 'create', 'update', 'delete', 'manage'],
    reviews: ['view', 'update', 'delete', 'manage'],
    settings: ['view', 'update', 'manage'],
    finance: ['view', 'create', 'update', 'delete', 'manage'],
    stats: ['view', 'manage'],
    inventory: ['view', 'create', 'update', 'delete', 'manage'],
    marketing: ['view', 'create', 'update', 'delete', 'manage'],
    loyalty: ['view', 'create', 'update', 'delete', 'manage'],
    locations: ['view', 'create', 'update', 'delete', 'manage'],
    staff: ['view', 'create', 'update', 'delete', 'manage'],
  },

  ACCOUNTANT: {
    // Comptable - Accès financier complet + reporting
    users: [],
    clients: ['view'], // Voir clients pour factures
    reservations: ['view'], // Voir RDV pour rapprochement paiements
    services: ['view'], // Voir services pour tarifs
    products: ['view'], // Voir produits pour inventaire
    blog: [],
    reviews: [],
    settings: ['view'], // Voir config pour TVA, etc.
    finance: ['view', 'create', 'update', 'delete', 'manage'], // Accès total finance
    stats: ['view', 'manage'], // Rapports financiers
    inventory: ['view', 'update'], // Peut ajuster stocks pour compta
    marketing: [],
    loyalty: ['view'], // Voir programme pour valorisation comptable
    locations: ['view'],
    staff: [],
  },

  LOCATION_MANAGER: {
    // Responsable de salon - Gestion opérationnelle complète de son salon
    users: ['view', 'update'], // Voir équipe + modifier planning
    clients: ['view', 'create', 'update', 'delete'], // Gestion clients complète
    reservations: ['view', 'create', 'update', 'delete', 'manage'], // Gestion RDV complète
    services: ['view', 'update'], // Peut ajuster tarifs locaux
    products: ['view', 'update'], // Gestion produits du salon
    blog: ['view', 'create'], // Peut publier actus du salon
    reviews: ['view', 'update'], // Gérer avis clients
    settings: ['view', 'update'], // Config salon (horaires, etc.)
    finance: ['view', 'create'], // Voir finances + encaisser
    stats: ['view', 'manage'], // Stats détaillées du salon
    inventory: ['view', 'create', 'update', 'delete'], // Gestion stock complète
    marketing: ['view', 'create'], // Campagnes locales
    loyalty: ['view', 'update', 'manage'], // Gérer points clients
    locations: ['view', 'update'], // Config son salon
    staff: ['view', 'update', 'manage'], // Gérer son équipe
  },

  STAFF: {
    // Employé/Praticien - Focus sur ses rendez-vous et clients
    users: [], // Pas de gestion utilisateurs
    clients: ['view', 'create', 'update'], // Gestion basique clients
    reservations: ['view', 'create', 'update', 'delete'], // Gestion complète de SES RDV
    services: ['view'], // Consultation uniquement
    products: ['view', 'update'], // Peut vendre produits (update = ajout panier)
    blog: ['view'],
    reviews: ['view'], // Voir avis sur ses prestations
    settings: [],
    finance: [], // Pas d'accès finances
    stats: ['view'], // Voir ses propres stats
    inventory: ['view', 'update'], // Utiliser produits (décrémente stock)
    marketing: [],
    loyalty: ['view', 'update'], // Attribuer points après presta
    locations: ['view'],
    staff: ['view'], // Voir collègues pour planning
  },

  RECEPTIONIST: {
    // Réceptionniste - Accueil, planning, encaissement
    users: [],
    clients: ['view', 'create', 'update', 'manage'], // Gestion clients complète
    reservations: ['view', 'create', 'update', 'delete', 'manage'], // Gestion planning complète
    services: ['view', 'create'], // Voir + suggérer nouveaux services
    products: ['view', 'create', 'update'], // Vente produits
    blog: ['view'],
    reviews: ['view', 'create'], // Collecter avis clients
    settings: ['view'], // Consultation horaires, etc.
    finance: ['view', 'create'], // Encaisser paiements
    stats: ['view'], // Statistiques d'accueil
    inventory: ['view', 'update'], // Vente = décrémente stock
    marketing: ['view'], // Voir campagnes en cours
    loyalty: ['view', 'update', 'manage'], // Gestion complète fidélité
    locations: ['view'],
    staff: ['view'], // Voir planning équipe
  },

  CLIENT: {
    // Client final - Espace client autonome
    users: [],
    clients: ['view', 'update'], // Voir et modifier SON profil uniquement
    reservations: ['view', 'create', 'delete'], // Gérer SES RDV (réserver, annuler)
    services: ['view'], // Catalogue services
    products: ['view'], // Catalogue produits
    blog: ['view'], // Actualités institut
    reviews: ['view', 'create', 'update'], // Lire et écrire avis, modifier le sien
    settings: ['view'], // Voir horaires, contact
    finance: ['view'], // Voir SES factures uniquement
    stats: [], // Pas de stats
    inventory: [], // Pas d'accès stock
    marketing: ['view'], // Recevoir newsletters
    loyalty: ['view'], // Voir SES points fidélité
    locations: ['view'], // Voir adresses salons
    staff: ['view'], // Voir praticiens pour choisir
  },
}

/**
 * Vérifie si un utilisateur a une permission spécifique sur une ressource
 */
export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  permission: Permission,
  customPermissions?: Record<string, boolean>
): boolean {
  // Vérifier les permissions personnalisées d'abord
  if (customPermissions) {
    const customKey = `can${permission.charAt(0).toUpperCase() + permission.slice(1)}${
      resource.charAt(0).toUpperCase() + resource.slice(1)
    }`
    if (customPermissions[customKey] !== undefined) {
      return customPermissions[customKey]
    }
  }

  // Vérifier les permissions du rôle
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  if (!rolePermissions || !rolePermissions[resource]) {
    return false
  }

  return rolePermissions[resource].includes(permission)
}

/**
 * Vérifie si un utilisateur peut gérer (tous les accès) une ressource
 */
export function canManage(
  userRole: UserRole,
  resource: Resource,
  customPermissions?: Record<string, boolean>
): boolean {
  return hasPermission(userRole, resource, 'manage', customPermissions)
}

/**
 * Récupère toutes les permissions d'un rôle pour une ressource
 */
export function getPermissions(
  userRole: UserRole,
  resource: Resource
): Permission[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  if (!rolePermissions || !rolePermissions[resource]) {
    return []
  }
  return rolePermissions[resource]
}

/**
 * Vérifie si un utilisateur a accès à une organisation
 */
export function hasOrganizationAccess(
  userRole: UserRole,
  userOrgId: string | null,
  targetOrgId: string
): boolean {
  // SUPER_ADMIN a accès à toutes les organisations
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  // Les autres rôles n'ont accès qu'à leur propre organisation
  return userOrgId === targetOrgId
}

/**
 * Vérifie si un utilisateur a accès à un emplacement (location)
 */
export function hasLocationAccess(
  userRole: UserRole,
  userOrgId: string | null,
  targetOrgId: string,
  userLocationIds: string[],
  targetLocationId: string
): boolean {
  // Vérifier l'accès à l'organisation d'abord
  if (!hasOrganizationAccess(userRole, userOrgId, targetOrgId)) {
    return false
  }

  // SUPER_ADMIN, ORG_OWNER ont accès à tous les emplacements de l'organisation
  if (
    userRole === 'SUPER_ADMIN' ||
    userRole === 'ORG_ADMIN'
  ) {
    return true
  }

  // LOCATION_MANAGER, STAFF, RECEPTIONIST n'ont accès qu'à leurs emplacements assignés
  return userLocationIds.includes(targetLocationId)
}

/**
 * Liste des rôles disponibles avec leurs descriptions (OPTIMISÉES)
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrateur LAIA - Accès complet multi-tenant',
  ORG_ADMIN: 'Propriétaire / Gérant - Accès total à son institut',
  ACCOUNTANT: 'Comptable - Gestion financière et rapports',
  LOCATION_MANAGER: 'Responsable de Salon - Gestion opérationnelle complète',
  STAFF: 'Employé(e) / Praticien(ne) - Gestion de ses rendez-vous',
  RECEPTIONIST: 'Réceptionniste - Accueil, planning et encaissement',
  CLIENT: 'Client - Réservation et gestion de compte',
}

/**
 * Hiérarchie des rôles (du plus élevé au plus bas)
 */
export const ROLE_HIERARCHY: UserRole[] = [
  'SUPER_ADMIN',
  'ORG_ADMIN',
  'LOCATION_MANAGER',
  'STAFF',
  'RECEPTIONIST',
  'CLIENT',
]

/**
 * Vérifie si un rôle est supérieur à un autre
 */
export function isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role1) < ROLE_HIERARCHY.indexOf(role2)
}
