/**
 * 💰 SYSTÈME DE FACTURATION LAIA CONNECT
 * Génération automatique des factures pour les forfaits et add-ons
 */

import { OrgPlan } from '@prisma/client'
import { getPlanPrice } from './features-simple'
import { getAddonById, calculateRecurringAddons, parseOrganizationAddons, type AddonOption } from './addons'

/**
 * Interface d'une ligne de facture
 */
export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: 'plan' | 'addon_recurring' | 'addon_onetime' | 'prorata' | 'credit'
}

/**
 * Interface des métadonnées de facture
 */
export interface InvoiceMetadata {
  plan: OrgPlan
  planPrice: number
  addons: string[] // IDs des add-ons actifs
  addonsTotal: number
  lineItems: InvoiceLineItem[]
  billingPeriod: {
    start: string // ISO date
    end: string // ISO date
  }
  changeType?: 'upgrade' | 'downgrade' | 'addon_added' | 'addon_removed'
  previousPlan?: OrgPlan
  previousAddons?: string[]
  prorata?: {
    creditAmount?: number // Crédit du plan précédent
    chargeAmount?: number // Facturation nouveau plan au prorata
  }
}

/**
 * Calculer le montant total d'une facture
 */
export function calculateInvoiceTotal(
  plan: OrgPlan,
  addonsJson: string | null
): number {
  const planPrice = getPlanPrice(plan)

  if (!addonsJson) {
    return planPrice
  }

  const addons = parseOrganizationAddons(addonsJson)
  const addonsTotal = calculateRecurringAddons(addons.recurring)

  return planPrice + addonsTotal
}

/**
 * Générer les lignes de facture détaillées
 */
export function generateInvoiceLineItems(
  plan: OrgPlan,
  addonsJson: string | null,
  billingPeriodStart: Date,
  billingPeriodEnd: Date
): InvoiceLineItem[] {
  const lineItems: InvoiceLineItem[] = []

  // Ligne du forfait de base
  const planPrice = getPlanPrice(plan)
  lineItems.push({
    id: `plan-${plan}`,
    description: `Forfait ${plan} - ${formatDateRange(billingPeriodStart, billingPeriodEnd)}`,
    quantity: 1,
    unitPrice: planPrice,
    total: planPrice,
    type: 'plan'
  })

  // Lignes des add-ons récurrents
  if (addonsJson) {
    const addons = parseOrganizationAddons(addonsJson)

    // Protection contre recurring undefined
    if (addons && addons.recurring && Array.isArray(addons.recurring)) {
      addons.recurring.forEach(addonId => {
        const addon = getAddonById(addonId)
        if (addon) {
          lineItems.push({
            id: `addon-${addonId}`,
            description: `${addon.name} - ${formatDateRange(billingPeriodStart, billingPeriodEnd)}`,
            quantity: 1,
            unitPrice: addon.price,
            total: addon.price,
            type: 'addon_recurring'
          })
        }
      })
    }
  }

  return lineItems
}

/**
 * Calculer le prorata lors d'un changement de forfait
 * Retourne le montant à facturer/créditer
 */
export function calculateProrata(
  oldPlan: OrgPlan,
  newPlan: OrgPlan,
  oldAddonsJson: string | null,
  newAddonsJson: string | null,
  changeDate: Date,
  billingPeriodEnd: Date
): {
  creditAmount: number
  chargeAmount: number
  netAmount: number
} {
  const daysRemaining = Math.ceil((billingPeriodEnd.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysInMonth = 30 // Simplification pour la facturation

  // Calculer le crédit de l'ancien forfait
  const oldTotal = calculateInvoiceTotal(oldPlan, oldAddonsJson)
  const creditAmount = (oldTotal / daysInMonth) * daysRemaining

  // Calculer le montant du nouveau forfait
  const newTotal = calculateInvoiceTotal(newPlan, newAddonsJson)
  const chargeAmount = (newTotal / daysInMonth) * daysRemaining

  const netAmount = chargeAmount - creditAmount

  return {
    creditAmount: Math.max(0, creditAmount),
    chargeAmount: Math.max(0, chargeAmount),
    netAmount
  }
}

/**
 * Générer la facture complète avec métadonnées
 */
export function generateInvoiceMetadata(
  plan: OrgPlan,
  addonsJson: string | null,
  billingPeriodStart: Date,
  billingPeriodEnd: Date,
  changeType?: 'upgrade' | 'downgrade' | 'addon_added' | 'addon_removed',
  previousPlan?: OrgPlan,
  previousAddonsJson?: string | null
): InvoiceMetadata {
  const lineItems = generateInvoiceLineItems(plan, addonsJson, billingPeriodStart, billingPeriodEnd)
  const planPrice = getPlanPrice(plan)

  const addons = addonsJson ? parseOrganizationAddons(addonsJson) : { recurring: [], oneTime: [], history: [] }
  const addonsTotal = calculateRecurringAddons(addons.recurring)

  const metadata: InvoiceMetadata = {
    plan,
    planPrice,
    addons: addons.recurring,
    addonsTotal,
    lineItems,
    billingPeriod: {
      start: billingPeriodStart.toISOString(),
      end: billingPeriodEnd.toISOString()
    }
  }

  // Si changement de forfait, calculer le prorata
  if (changeType && previousPlan) {
    const prorata = calculateProrata(
      previousPlan,
      plan,
      previousAddonsJson || null,
      addonsJson,
      new Date(),
      billingPeriodEnd
    )

    metadata.changeType = changeType
    metadata.previousPlan = previousPlan
    metadata.previousAddons = previousAddonsJson
      ? parseOrganizationAddons(previousAddonsJson).recurring
      : []
    metadata.prorata = {
      creditAmount: prorata.creditAmount,
      chargeAmount: prorata.chargeAmount
    }

    // Ajouter les lignes de prorata
    if (prorata.creditAmount > 0) {
      lineItems.push({
        id: 'credit-prorata',
        description: `Crédit prorata - Ancien forfait ${previousPlan}`,
        quantity: 1,
        unitPrice: -prorata.creditAmount,
        total: -prorata.creditAmount,
        type: 'credit'
      })
    }

    if (prorata.chargeAmount > 0) {
      lineItems.push({
        id: 'charge-prorata',
        description: `Facturation prorata - Nouveau forfait ${plan}`,
        quantity: 1,
        unitPrice: prorata.chargeAmount,
        total: prorata.chargeAmount,
        type: 'prorata'
      })
    }
  }

  return metadata
}

/**
 * Générer le numéro de facture unique
 */
export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0')

  return `LAIA-${year}${month}-${random}`
}

/**
 * Formater une plage de dates pour la facture
 */
function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const endStr = end.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

/**
 * Calculer la prochaine date de facturation
 */
export function getNextBillingDate(): Date {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth
}

/**
 * Calculer la période de facturation actuelle
 */
export function getCurrentBillingPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start, end }
}
