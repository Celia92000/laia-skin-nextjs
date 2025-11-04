import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { generateAndSaveInvoice } from '@/lib/invoice-service'
import { sendPaymentSuccessEmail } from '@/lib/payment-emails'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant dans .env.local')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
})

export interface CreateCustomerParams {
  organizationId: string
  email: string
  name: string
  iban?: string
  bic?: string
}

export interface CreateSepaSetupParams {
  customerId: string
  returnUrl: string
}

/**
 * Crée un client Stripe pour une organisation
 */
export async function createStripeCustomer({
  organizationId,
  email,
  name,
  iban,
  bic,
}: CreateCustomerParams) {
  try {
    // Créer le client Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organizationId,
      },
    })

    // Si IBAN fourni, créer un mandat SEPA
    if (iban && bic) {
      await attachSepaSource(customer.id, iban, bic, name)
    }

    // Sauvegarder l'ID Stripe dans la base
    await prisma.organization.update({
      where: { id: organizationId },
      data: { stripeCustomerId: customer.id },
    })

    return customer
  } catch (error) {
    console.error('Erreur création client Stripe:', error)
    throw error
  }
}

/**
 * Attache un IBAN SEPA comme source de paiement
 */
async function attachSepaSource(
  customerId: string,
  iban: string,
  bic: string,
  accountHolderName: string
) {
  try {
    // Créer une source SEPA
    const source = await stripe.customers.createSource(customerId, {
      source: {
        type: 'sepa_debit',
        sepa_debit: {
          iban,
        },
        currency: 'eur',
        owner: {
          name: accountHolderName,
        },
      } as any,
    })

    // Définir comme source par défaut
    await stripe.customers.update(customerId, {
      default_source: source.id,
    })

    return source
  } catch (error) {
    console.error('Erreur création source SEPA:', error)
    throw error
  }
}

/**
 * Crée une SetupIntent pour collecter le mandat SEPA
 * (Alternative moderne à createSource)
 */
export async function createSepaSetup({
  customerId,
  returnUrl,
}: CreateSepaSetupParams) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['sepa_debit'],
      return_url: returnUrl,
    })

    return setupIntent
  } catch (error) {
    console.error('Erreur création SetupIntent:', error)
    throw error
  }
}

/**
 * Récupère les moyens de paiement d'un client
 */
export async function getCustomerPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'sepa_debit',
    })

    return paymentMethods.data
  } catch (error) {
    console.error('Erreur récupération moyens de paiement:', error)
    throw error
  }
}

/**
 * Effectue un prélèvement SEPA
 */
export async function chargeSepa(
  customerId: string,
  amount: number,
  description: string,
  organizationId: string
) {
  try {
    // Récupérer le moyen de paiement par défaut
    const paymentMethods = await getCustomerPaymentMethods(customerId)

    if (paymentMethods.length === 0) {
      throw new Error('Aucun moyen de paiement SEPA configuré')
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe attend les montants en centimes
      currency: 'eur',
      customer: customerId,
      payment_method: paymentMethods[0].id,
      confirm: true,
      description,
      metadata: {
        organizationId,
      },
      // SEPA Direct Debit nécessite ces paramètres
      payment_method_types: ['sepa_debit'],
      mandate_data: {
        customer_acceptance: {
          type: 'offline',
        },
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Erreur prélèvement SEPA:', error)
    throw error
  }
}

/**
 * Vérifie et effectue les prélèvements automatiques
 * À appeler chaque jour via un cronjob
 */
export async function processAutomaticCharges() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Récupérer toutes les organisations dont la date de facturation est aujourd'hui
    const organizations = await prisma.organization.findMany({
      where: {
        nextBillingDate: {
          lte: today,
        },
        status: {
          in: ['TRIAL', 'ACTIVE'],
        },
        stripeCustomerId: {
          not: null,
        },
      },
    })

    console.log(`🔍 ${organizations.length} organisations à facturer aujourd'hui`)

    const results = {
      success: [] as string[],
      failed: [] as string[],
    }

    for (const org of organizations) {
      try {
        // Calculer le montant selon le plan
        const planPrices: Record<string, number> = {
          SOLO: 49,
          DUO: 69,
          TEAM: 119,
          PREMIUM: 179,
        }

        const amount = planPrices[org.plan] || 0

        if (amount === 0) {
          console.warn(`⚠️ Plan inconnu pour ${org.name}: ${org.plan}`)
          continue
        }

        // Effectuer le prélèvement
        const charge = await chargeSepa(
          org.stripeCustomerId!,
          amount,
          `Abonnement LAIA ${org.plan} - ${org.name}`,
          org.id
        )

        console.log(`✅ Prélèvement réussi: ${org.name} - ${amount}€`)

        // Mettre à jour l'organisation
        const nextMonth = new Date(org.nextBillingDate!)
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        await prisma.organization.update({
          where: { id: org.id },
          data: {
            status: 'ACTIVE',
            nextBillingDate: nextMonth,
            lastPaymentDate: new Date(),
          },
        })

        results.success.push(org.id)

        // Générer la facture PDF
        try {
          const invoice = await generateAndSaveInvoice(
            org.id,
            amount,
            org.plan,
            charge.id
          )

          console.log(`📄 Facture générée: ${invoice.invoiceNumber}`)

          // Envoyer l'email de confirmation avec la facture
          await sendPaymentSuccessEmail({
            to: org.billingEmail || org.ownerEmail,
            organizationName: org.name,
            amount,
            plan: org.plan,
            nextBillingDate: nextMonth,
            invoiceUrl: invoice.pdfUrl,
          })

          console.log(`📧 Email de confirmation envoyé`)
        } catch (emailError) {
          console.error('⚠️ Erreur envoi email/facture (non bloquant):', emailError)
        }
      } catch (error) {
        console.error(`❌ Échec prélèvement ${org.name}:`, error)

        // Marquer comme échec
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            status: 'SUSPENDED',
          },
        })

        results.failed.push(org.id)

        // TODO: Envoyer email d'échec
      }
    }

    return results
  } catch (error) {
    console.error('Erreur traitement des prélèvements automatiques:', error)
    throw error
  }
}

export { stripe }
