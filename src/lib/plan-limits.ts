// Limites par plan d'abonnement

export const PLAN_LIMITS = {
  SOLO: {
    maxUsers: 1,
    maxLocations: 1,
    maxStorage: 5, // GB
    price: 49, // €/mois
    name: 'Solo'
  },
  DUO: {
    maxUsers: 2,
    maxLocations: 1,
    maxStorage: 10, // GB
    price: 69, // €/mois
    name: 'Duo'
  },
  TEAM: {
    maxUsers: 5,
    maxLocations: 2,
    maxStorage: 20, // GB
    price: 119, // €/mois
    name: 'Team'
  },
  PREMIUM: {
    maxUsers: 10,
    maxLocations: 5,
    maxStorage: 50, // GB
    price: 179, // €/mois
    name: 'Premium'
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.SOLO;
}

export function canAddUser(currentUserCount: number, plan: string): boolean {
  const limits = getPlanLimits(plan);
  return currentUserCount < limits.maxUsers;
}

export function getUserLimitMessage(plan: string, currentCount: number): string {
  const limits = getPlanLimits(plan);
  return `${currentCount}/${limits.maxUsers} utilisateur(s) - Formule ${limits.name}`;
}
