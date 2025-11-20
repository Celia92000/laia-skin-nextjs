/**
 * Configuration des SLA (Service Level Agreement) pour les tickets
 * Définit les délais de réponse et de résolution selon la priorité
 */

export const SLA_CONFIG = {
  URGENT: {
    responseHours: 1, // 1 heure pour la première réponse
    resolutionHours: 4, // 4 heures pour la résolution
  },
  HIGH: {
    responseHours: 4, // 4 heures pour la première réponse
    resolutionHours: 24, // 24 heures (1 jour) pour la résolution
  },
  MEDIUM: {
    responseHours: 24, // 24 heures pour la première réponse
    resolutionHours: 72, // 72 heures (3 jours) pour la résolution
  },
  LOW: {
    responseHours: 48, // 48 heures pour la première réponse
    resolutionHours: 168, // 168 heures (7 jours) pour la résolution
  },
} as const

export type TicketPriority = keyof typeof SLA_CONFIG

/**
 * Calculer la deadline SLA à partir d'une date de début et d'un nombre d'heures
 */
export function calculateSLADeadline(startDate: Date, hours: number): Date {
  const deadline = new Date(startDate)
  deadline.setHours(deadline.getHours() + hours)
  return deadline
}

/**
 * Calculer les deadlines SLA pour un ticket
 */
export function calculateTicketSLADeadlines(createdAt: Date, priority: TicketPriority) {
  const slaConfig = SLA_CONFIG[priority]

  return {
    responseDeadline: calculateSLADeadline(createdAt, slaConfig.responseHours),
    resolutionDeadline: calculateSLADeadline(createdAt, slaConfig.resolutionHours),
  }
}

/**
 * Vérifier si un SLA est en violation
 */
export function isSLABreached(deadline: Date | null, completedAt: Date | null): boolean {
  if (!deadline) return false

  const now = new Date()
  const checkDate = completedAt || now

  return checkDate > deadline
}

/**
 * Calculer le temps restant avant violation du SLA (en heures)
 */
export function getTimeUntilSLABreach(deadline: Date | null): number | null {
  if (!deadline) return null

  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  return Math.max(0, Math.round(diffHours * 10) / 10) // Arrondi à 1 décimale
}

/**
 * Obtenir le statut du SLA avec code couleur
 */
export function getSLAStatus(deadline: Date | null, completedAt: Date | null): {
  status: 'ok' | 'warning' | 'breach' | 'completed'
  color: string
  label: string
} {
  if (!deadline) {
    return { status: 'ok', color: 'gray', label: 'Non défini' }
  }

  if (completedAt) {
    const breached = isSLABreached(deadline, completedAt)
    return breached
      ? { status: 'breach', color: 'red', label: 'Violation' }
      : { status: 'completed', color: 'green', label: 'Respecté' }
  }

  const hoursRemaining = getTimeUntilSLABreach(deadline)

  if (hoursRemaining === null || hoursRemaining <= 0) {
    return { status: 'breach', color: 'red', label: 'En violation' }
  }

  if (hoursRemaining <= 2) {
    return { status: 'warning', color: 'orange', label: `${hoursRemaining}h restantes` }
  }

  return { status: 'ok', color: 'green', label: `${hoursRemaining}h restantes` }
}
