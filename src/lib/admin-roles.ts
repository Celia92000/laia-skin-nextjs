/**
 * Vérifie si un rôle a des privilèges administratifs
 * Les rôles admin sont : SUPER_ADMIN, ORG_ADMIN
 */
export function isAdminRole(role: string): boolean {
  const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
  return adminRoles.includes(role);
}

/**
 * Vérifie si un rôle est un super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Vérifie si un rôle peut gérer une organisation (propriétaire ou admin)
 */
export function canManageOrganization(role: string): boolean {
  return ['SUPER_ADMIN', 'ORG_ADMIN'].includes(role);
}

/**
 * Vérifie si un rôle peut accéder aux fonctionnalités comptables
 */
export function hasAccountingAccess(role: string): boolean {
  return ['SUPER_ADMIN', 'ORG_ADMIN', 'ACCOUNTANT'].includes(role);
}

/**
 * Vérifie si un rôle peut gérer un emplacement spécifique
 */
export function canManageLocation(role: string): boolean {
  return ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER'].includes(role);
}
