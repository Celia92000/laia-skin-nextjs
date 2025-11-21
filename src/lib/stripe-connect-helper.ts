/**
 * Helper pour gérer les paiements via Stripe Connect
 * Les paiements vont directement sur le compte de l'institut
 * LAIA Platform peut prendre une commission (application_fee)
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

/**
 * Commission LAIA Platform sur les transactions (en %)
 * Exemple: 2% = 0.02
 */
const PLATFORM_COMMISSION_RATE = 0.02 // 2% de commission

/**
 * Créer une session de paiement Stripe Checkout avec Connect
 * L'argent va directement sur le compte de l'institut
 *
 * @param organizationId - ID de l'organisation qui reçoit le paiement
 * @param amount - Montant en euros
 * @param description - Description du paiement
 * @param metadata - Métadonnées (reservationId, serviceId, etc.)
 * @param successUrl - URL de retour après succès
 * @param cancelUrl - URL de retour après annulation
 */
export async function createConnectedCheckoutSession(params: {
  organizationId: string
  amount: number
  description: string
  metadata?: Record<string, string>
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  // Récupérer l'organisation
  const org = await prisma.organization.findUnique({
    where: { id: params.organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      stripeConnectedAccountId: true,
      stripeChargesEnabled: true
    }
  })

  if (!org) {
    throw new Error('Organisation introuvable')
  }

  if (!org.stripeConnectedAccountId || !org.stripeChargesEnabled) {
    throw new Error('Stripe Connect non configuré pour cette organisation')
  }

  // Calculer la commission LAIA Platform
  const applicationFeeAmount = Math.round(params.amount * 100 * PLATFORM_COMMISSION_RATE)

  // Créer la session Checkout
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: params.description,
              metadata: params.metadata || {}
            },
            unit_amount: Math.round(params.amount * 100) // Convertir en centimes
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        metadata: {
          organizationId: params.organizationId,
          ...params.metadata
        }
      },
      metadata: {
        organizationId: params.organizationId,
        ...params.metadata
      }
    },
    {
      stripeAccount: org.stripeConnectedAccountId // Important: paiement sur le compte connecté
    }
  )

  console.log(`💳 Session Checkout créée pour ${org.name} - ${params.amount}€ (commission: ${(applicationFeeAmount / 100).toFixed(2)}€)`)

  return {
    sessionId: session.id,
    url: session.url,
    amountTotal: params.amount,
    applicationFee: applicationFeeAmount / 100
  }
}

/**
 * Créer un paiement direct (sans redirection) avec Connect
 *
 * @param organizationId - ID de l'organisation qui reçoit le paiement
 * @param amount - Montant en euros
 * @param paymentMethodId - ID de la méthode de paiement Stripe
 * @param description - Description du paiement
 * @param metadata - Métadonnées
 */
export async function createConnectedPaymentIntent(params: {
  organizationId: string
  amount: number
  paymentMethodId: string
  description: string
  metadata?: Record<string, string>
  customerEmail?: string
}) {
  // Récupérer l'organisation
  const org = await prisma.organization.findUnique({
    where: { id: params.organizationId },
    select: {
      id: true,
      name: true,
      stripeConnectedAccountId: true,
      stripeChargesEnabled: true
    }
  })

  if (!org) {
    throw new Error('Organisation introuvable')
  }

  if (!org.stripeConnectedAccountId || !org.stripeChargesEnabled) {
    throw new Error('Stripe Connect non configuré pour cette organisation')
  }

  // Calculer la commission LAIA Platform
  const applicationFeeAmount = Math.round(params.amount * 100 * PLATFORM_COMMISSION_RATE)

  // Créer le PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(params.amount * 100), // Convertir en centimes
      currency: 'eur',
      payment_method: params.paymentMethodId,
      description: params.description,
      receipt_email: params.customerEmail,
      application_fee_amount: applicationFeeAmount,
      metadata: {
        organizationId: params.organizationId,
        ...params.metadata
      },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    },
    {
      stripeAccount: org.stripeConnectedAccountId
    }
  )

  console.log(`💳 PaymentIntent créé pour ${org.name} - ${params.amount}€ (commission: ${(applicationFeeAmount / 100).toFixed(2)}€)`)

  return {
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    amountTotal: params.amount,
    applicationFee: applicationFeeAmount / 100
  }
}

/**
 * Créer un remboursement sur un compte connecté
 *
 * @param organizationId - ID de l'organisation
 * @param paymentIntentId - ID du paiement à rembourser
 * @param amount - Montant à rembourser (optionnel, remboursement total par défaut)
 */
export async function createConnectedRefund(params: {
  organizationId: string
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}) {
  // Récupérer l'organisation
  const org = await prisma.organization.findUnique({
    where: { id: params.organizationId },
    select: {
      id: true,
      name: true,
      stripeConnectedAccountId: true
    }
  })

  if (!org || !org.stripeConnectedAccountId) {
    throw new Error('Organisation ou compte Stripe Connect introuvable')
  }

  // Créer le remboursement
  const refund = await stripe.refunds.create(
    {
      payment_intent: params.paymentIntentId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      reason: params.reason,
      refund_application_fee: true // Rembourser aussi la commission LAIA
    },
    {
      stripeAccount: org.stripeConnectedAccountId
    }
  )

  console.log(`💸 Remboursement créé pour ${org.name} - ${(refund.amount / 100).toFixed(2)}€`)

  return {
    refundId: refund.id,
    amount: refund.amount / 100,
    status: refund.status
  }
}

/**
 * Récupérer les statistiques de paiement d'une organisation
 */
export async function getConnectedAccountStats(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      stripeConnectedAccountId: true
    }
  })

  if (!org || !org.stripeConnectedAccountId) {
    throw new Error('Compte Stripe Connect introuvable')
  }

  // Récupérer le solde
  const balance = await stripe.balance.retrieve({
    stripeAccount: org.stripeConnectedAccountId
  })

  // Récupérer les paiements du mois en cours
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startTimestamp = Math.floor(startOfMonth.getTime() / 1000)

  const charges = await stripe.charges.list(
    {
      created: { gte: startTimestamp },
      limit: 100
    },
    {
      stripeAccount: org.stripeConnectedAccountId
    }
  )

  const totalThisMonth = charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100
  const countThisMonth = charges.data.length

  return {
    balance: {
      available: balance.available[0]?.amount || 0,
      pending: balance.pending[0]?.amount || 0,
      currency: balance.available[0]?.currency || 'eur'
    },
    thisMonth: {
      total: totalThisMonth,
      count: countThisMonth
    }
  }
}
