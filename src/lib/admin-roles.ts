/**
 * Liste des rôles autorisés à accéder aux fonctionnalités admin
 */
export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ORG_OWNER',
  'ORG_ADMIN',
  'ACCOUNTANT',
  'LOCATION_MANAGER',
  'STAFF',
  'RECEPTIONIST',
  'ADMIN',
  'admin',
  'EMPLOYEE',
  'COMPTABLE',
  'STAGIAIRE'
] as const;

/**
 * Vérifie si un rôle est un rôle admin
 */
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as any);
}

/**
 * Vérifie si un utilisateur a un rôle admin
 */
export function hasAdminAccess(user: { role: string } | null | undefined): boolean {
  return user ? isAdminRole(user.role) : false;
}
