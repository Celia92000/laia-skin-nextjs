/**
 * Tests unitaires pour payment-helpers
 * Teste la logique métier de paiement sans dépendances externes
 */

import {
  eurosToCents,
  centsToEuros,
  getPlanPrice,
  isValidPlan,
  getNextBillingDate,
  shouldChargeToday,
  formatAmount,
  calculateWithTVA,
  isValidIBAN,
  calculateOrderTotal,
} from '../payment-helpers'

describe('payment-helpers', () => {
  describe('eurosToCents', () => {
    it('convertit correctement les euros en centimes', () => {
      expect(eurosToCents(49)).toBe(4900)
      expect(eurosToCents(69)).toBe(6900)
      expect(eurosToCents(119)).toBe(11900)
    })

    it('gère correctement les décimales', () => {
      expect(eurosToCents(49.99)).toBe(4999)
      expect(eurosToCents(10.5)).toBe(1050)
      expect(eurosToCents(0.99)).toBe(99)
    })

    it('arrondit correctement les montants avec beaucoup de décimales', () => {
      expect(eurosToCents(49.999)).toBe(5000) // Arrondi à 50.00€
      expect(eurosToCents(49.994)).toBe(4999) // Arrondi à 49.99€
    })
  })

  describe('centsToEuros', () => {
    it('convertit correctement les centimes en euros', () => {
      expect(centsToEuros(4900)).toBe(49)
      expect(centsToEuros(6900)).toBe(69)
      expect(centsToEuros(11900)).toBe(119)
    })

    it('retourne des décimales pour les centimes non ronds', () => {
      expect(centsToEuros(4999)).toBe(49.99)
      expect(centsToEuros(1050)).toBe(10.5)
    })
  })

  describe('getPlanPrice', () => {
    it('retourne le bon prix pour chaque plan', () => {
      expect(getPlanPrice('SOLO')).toBe(49)
      expect(getPlanPrice('DUO')).toBe(69)
      expect(getPlanPrice('TEAM')).toBe(119)
      expect(getPlanPrice('PREMIUM')).toBe(179)
    })

    it('retourne 0 pour un plan inconnu', () => {
      expect(getPlanPrice('INVALID')).toBe(0)
      expect(getPlanPrice('')).toBe(0)
      expect(getPlanPrice('solo')).toBe(0) // case-sensitive
    })
  })

  describe('isValidPlan', () => {
    it('valide les plans corrects', () => {
      expect(isValidPlan('SOLO')).toBe(true)
      expect(isValidPlan('DUO')).toBe(true)
      expect(isValidPlan('TEAM')).toBe(true)
      expect(isValidPlan('PREMIUM')).toBe(true)
    })

    it('rejette les plans invalides', () => {
      expect(isValidPlan('INVALID')).toBe(false)
      expect(isValidPlan('')).toBe(false)
      expect(isValidPlan('solo')).toBe(false) // case-sensitive
    })
  })

  describe('getNextBillingDate', () => {
    it('ajoute 1 mois à la date actuelle', () => {
      const now = new Date('2024-01-15')
      const next = getNextBillingDate(now)

      expect(next.getFullYear()).toBe(2024)
      expect(next.getMonth()).toBe(1) // Février (0-indexed)
      expect(next.getDate()).toBe(15)
    })

    it('gère correctement les fin de mois', () => {
      const jan31 = new Date('2024-01-31')
      const next = getNextBillingDate(jan31)

      // 31 janvier + 1 mois = 2 mars 2024 (JavaScript déborde sur mars)
      expect(next.getMonth()).toBe(2) // Mars (comportement natif JS)
    })

    it('gère le passage d\'année', () => {
      const dec15 = new Date('2024-12-15')
      const next = getNextBillingDate(dec15)

      expect(next.getFullYear()).toBe(2025)
      expect(next.getMonth()).toBe(0) // Janvier
      expect(next.getDate()).toBe(15)
    })
  })

  describe('shouldChargeToday', () => {
    it('retourne true si la date de facturation est aujourd\'hui', () => {
      const today = new Date()
      expect(shouldChargeToday(today)).toBe(true)
    })

    it('retourne true si la date de facturation est passée', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(shouldChargeToday(yesterday)).toBe(true)
    })

    it('retourne false si la date de facturation est future', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(shouldChargeToday(tomorrow)).toBe(false)
    })

    it('retourne false si la date est null', () => {
      expect(shouldChargeToday(null)).toBe(false)
    })
  })

  describe('formatAmount', () => {
    it('formate correctement les montants en euros', () => {
      // Note: Intl.NumberFormat utilise des espaces insécables (U+00A0)
      expect(formatAmount(49)).toContain('49,00')
      expect(formatAmount(49)).toContain('€')
      expect(formatAmount(49.99)).toContain('49,99')
      expect(formatAmount(1000)).toContain('1')
      expect(formatAmount(1000)).toContain('000,00')
    })

    it('gère les montants négatifs', () => {
      expect(formatAmount(-49)).toContain('-49,00')
      expect(formatAmount(-49)).toContain('€')
    })

    it('gère d\'autres devises', () => {
      const formatted = formatAmount(49, 'USD')
      expect(formatted).toContain('49')
      expect(formatted).toContain('$')
    })
  })

  describe('calculateWithTVA', () => {
    it('calcule le montant TTC avec 20% de TVA', () => {
      expect(calculateWithTVA(100)).toBe(120)
      expect(calculateWithTVA(49)).toBe(58.8)
      expect(calculateWithTVA(69)).toBe(82.8)
    })

    it('accepte un taux de TVA personnalisé', () => {
      expect(calculateWithTVA(100, 0.1)).toBe(110) // 10% TVA
      expect(calculateWithTVA(100, 0.055)).toBe(105.5) // 5.5% TVA
    })

    it('arrondit à 2 décimales', () => {
      expect(calculateWithTVA(10.333)).toBe(12.4) // Arrondi
    })
  })

  describe('isValidIBAN', () => {
    it('valide les IBANs français corrects', () => {
      expect(isValidIBAN('FR7630006000011234567890189')).toBe(true)
      expect(isValidIBAN('FR14 2004 1010 0505 0001 3M02 606')).toBe(true) // Avec espaces
    })

    it('valide les IBANs d\'autres pays', () => {
      expect(isValidIBAN('DE89370400440532013000')).toBe(true) // Allemagne
      expect(isValidIBAN('GB82WEST12345698765432')).toBe(true) // UK
    })

    it('rejette les IBANs invalides', () => {
      expect(isValidIBAN('INVALID')).toBe(false)
      expect(isValidIBAN('1234567890')).toBe(false) // Pas de lettres pays
      expect(isValidIBAN('FR')).toBe(false) // Trop court
    })

    it('rejette les chaînes vides', () => {
      expect(isValidIBAN('')).toBe(false)
    })
  })

  describe('calculateOrderTotal', () => {
    it('retourne le montant sans frais si 0%', () => {
      expect(calculateOrderTotal(100, 0)).toBe(100)
      expect(calculateOrderTotal(49.99, 0)).toBe(49.99)
    })

    it('ajoute les frais de service', () => {
      expect(calculateOrderTotal(100, 0.1)).toBe(110) // 10% frais
      expect(calculateOrderTotal(100, 0.05)).toBe(105) // 5% frais
    })

    it('arrondit à 2 décimales', () => {
      expect(calculateOrderTotal(10.33, 0.15)).toBe(11.88)
    })
  })
})
