/**
 * Helpers pour les paiements - logique métier pure
 * Facilement testable sans mocks
 */

/**
 * Convertit un montant en euros vers centimes pour Stripe
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

/**
 * Convertit centimes Stripe vers euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100
}

/**
 * Calcule le prix d'un plan LAIA
 */
export function getPlanPrice(plan: string): number {
  const planPrices: Record<string, number> = {
    SOLO: 49,
    DUO: 69,
    TEAM: 119,
    PREMIUM: 179,
  }

  return planPrices[plan] || 0
}

/**
 * Vérifie si un plan est valide
 */
export function isValidPlan(plan: string): boolean {
  const validPlans = ['SOLO', 'DUO', 'TEAM', 'PREMIUM']
  return validPlans.includes(plan)
}

/**
 * Calcule la date de prochaine facturation (dans 1 mois)
 */
export function getNextBillingDate(currentDate: Date = new Date()): Date {
  const nextDate = new Date(currentDate)
  nextDate.setMonth(nextDate.getMonth() + 1)
  return nextDate
}

/**
 * Vérifie si une organisation doit être facturée aujourd'hui
 */
export function shouldChargeToday(nextBillingDate: Date | null): boolean {
  if (!nextBillingDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const billingDate = new Date(nextBillingDate)
  billingDate.setHours(0, 0, 0, 0)

  return billingDate <= today
}

/**
 * Formate un montant en euros pour affichage
 */
export function formatAmount(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Calcule le montant avec TVA (20%)
 */
export function calculateWithTVA(amountHT: number, tvaRate: number = 0.2): number {
  return Math.round((amountHT * (1 + tvaRate)) * 100) / 100
}

/**
 * Valide un numéro IBAN (format basique)
 */
export function isValidIBAN(iban: string): boolean {
  // Enlever les espaces
  const cleanIban = iban.replace(/\s/g, '')

  // IBAN commence par 2 lettres pays + 2 chiffres clé + max 30 caractères
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/

  return ibanRegex.test(cleanIban)
}

/**
 * Calcule le total d'une commande (montant + frais de service)
 */
export function calculateOrderTotal(amount: number, serviceFeePercent: number = 0): number {
  const serviceFee = amount * serviceFeePercent
  return Math.round((amount + serviceFee) * 100) / 100
}
