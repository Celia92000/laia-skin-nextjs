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

// Matrice de permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Permission[]>> = {
  SUPER_ADMIN: {
    // Accès total à tout
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

  ORG_OWNER: {
    // Accès complet à son organisation
    users: ['view', 'create', 'update', 'delete', 'manage'],
    clients: ['view', 'create', 'update', 'delete'],
    reservations: ['view', 'create', 'update', 'delete'],
    services: ['view', 'create', 'update', 'delete'],
    products: ['view', 'create', 'update', 'delete'],
    blog: ['view', 'create', 'update', 'delete'],
    reviews: ['view', 'update'],
    settings: ['view', 'update'],
    finance: ['view', 'manage'],
    stats: ['view'],
    inventory: ['view', 'create', 'update', 'delete'],
    marketing: ['view', 'create', 'update', 'delete'],
    loyalty: ['view', 'create', 'update', 'delete'],
    locations: ['view', 'create', 'update', 'delete'],
    staff: ['view', 'create', 'update', 'delete'],
  },

  ORG_ADMIN: {
    // Co-gérant avec accès étendu
    users: ['view', 'create', 'update'],
    clients: ['view', 'create', 'update', 'delete'],
    reservations: ['view', 'create', 'update', 'delete'],
    services: ['view', 'create', 'update'],
    products: ['view', 'create', 'update'],
    blog: ['view', 'create', 'update', 'delete'],
    reviews: ['view', 'update'],
    settings: ['view'],
    finance: ['view'],
    stats: ['view'],
    inventory: ['view', 'create', 'update', 'delete'],
    marketing: ['view', 'create', 'update', 'delete'],
    loyalty: ['view', 'create', 'update'],
    locations: ['view'],
    staff: ['view', 'create', 'update'],
  },

  ACCOUNTANT: {
    // Comptable avec accès financier
    users: [],
    clients: ['view'],
    reservations: ['view'],
    services: ['view'],
    products: ['view'],
    blog: [],
    reviews: [],
    settings: [],
    finance: ['view', 'create', 'update', 'manage'],
    stats: ['view'],
    inventory: ['view'],
    marketing: [],
    loyalty: [],
    locations: ['view'],
    staff: [],
  },

  LOCATION_MANAGER: {
    // Responsable de point de vente
    users: ['view'],
    clients: ['view', 'create', 'update'],
    reservations: ['view', 'create', 'update', 'delete'],
    services: ['view'],
    products: ['view'],
    blog: ['view'],
    reviews: ['view'],
    settings: ['view'],
    finance: ['view'],
    stats: ['view'],
    inventory: ['view', 'create', 'update'],
    marketing: ['view'],
    loyalty: ['view'],
    locations: ['view'],
    staff: ['view'],
  },

  STAFF: {
    // Employé/Praticien
    users: [],
    clients: ['view', 'create', 'update'],
    reservations: ['view', 'create', 'update'],
    services: ['view'],
    products: ['view'],
    blog: ['view'],
    reviews: ['view'],
    settings: [],
    finance: [],
    stats: [],
    inventory: ['view'],
    marketing: [],
    loyalty: ['view'],
    locations: ['view'],
    staff: ['view'],
  },

  RECEPTIONIST: {
    // Réceptionniste
    users: [],
    clients: ['view', 'create', 'update'],
    reservations: ['view', 'create', 'update', 'delete'],
    services: ['view'],
    products: ['view'],
    blog: ['view'],
    reviews: ['view'],
    settings: [],
    finance: [],
    stats: [],
    inventory: ['view'],
    marketing: [],
    loyalty: ['view', 'update'],
    locations: ['view'],
    staff: ['view'],
  },

  CLIENT: {
    // Client final
    users: [],
    clients: [],
    reservations: ['view', 'create'],
    services: ['view'],
    products: ['view'],
    blog: ['view'],
    reviews: ['view', 'create'],
    settings: [],
    finance: [],
    stats: [],
    inventory: [],
    marketing: [],
    loyalty: ['view'],
    locations: ['view'],
    staff: ['view'],
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

  // SUPER_ADMIN, ORG_OWNER, ORG_ADMIN ont accès à tous les emplacements de l'organisation
  if (
    userRole === 'SUPER_ADMIN' ||
    userRole === 'ORG_OWNER' ||
    userRole === 'ORG_ADMIN'
  ) {
    return true
  }

  // LOCATION_MANAGER, STAFF, RECEPTIONIST n'ont accès qu'à leurs emplacements assignés
  return userLocationIds.includes(targetLocationId)
}

/**
 * Liste des rôles disponibles avec leurs descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrateur - Accès complet à tous les instituts',
  ORG_OWNER: 'Propriétaire - Accès complet à l\'institut',
  ORG_ADMIN: 'Co-gérant - Gestion étendue de l\'institut',
  ACCOUNTANT: 'Comptable - Accès aux finances et statistiques',
  LOCATION_MANAGER: 'Responsable de point de vente',
  STAFF: 'Employé / Praticien',
  RECEPTIONIST: 'Réceptionniste',
  CLIENT: 'Client',
}

/**
 * Hiérarchie des rôles (du plus élevé au plus bas)
 */
export const ROLE_HIERARCHY: UserRole[] = [
  'SUPER_ADMIN',
  'ORG_OWNER',
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
