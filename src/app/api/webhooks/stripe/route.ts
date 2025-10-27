import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-service'
import { prisma } from '@/lib/prisma'
import { generateAndSaveInvoice } from '@/lib/invoice-service'
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/payment-emails'
import Stripe from 'stripe'

/**
 * Webhook Stripe pour gérer les événements de paiement
 *
 * Configure ce webhook dans ton dashboard Stripe :
 * URL : https://votre-domaine.com/api/webhooks/stripe
 * Événements à écouter :
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET non configuré')
      return NextResponse.json(
        { error: 'Configuration manquante' },
        { status: 500 }
      )
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Signature webhook invalide:', err)
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      )
    }

    console.log(`📨 Webhook reçu: ${event.type}`)

    // Gérer les différents événements
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        console.log(`⚠️ Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Gère le succès d'un paiement
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const organizationId = paymentIntent.metadata.organizationId

  if (!organizationId) {
    console.warn('⚠️ organizationId manquant dans les metadata')
    return
  }

  try {
    // Récupérer l'organisation
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      console.warn(`⚠️ Organisation ${organizationId} introuvable`)
      return
    }

    // Mettre à jour l'organisation
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'ACTIVE',
        lastPaymentDate: new Date(),
      },
    })

    console.log(`✅ Paiement réussi pour l'organisation ${organizationId}`)

    // Calculer la prochaine date de facturation
    const nextBillingDate = new Date(org.nextBillingDate || new Date())
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    // Générer la facture PDF
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 89,
      TEAM: 149,
      PREMIUM: 249,
    }
    const amount = planPrices[org.plan] || 0

    try {
      const invoice = await generateAndSaveInvoice(
        org.id,
        amount,
        org.plan,
        paymentIntent.id
      )

      console.log(`📄 Facture générée: ${invoice.invoiceNumber}`)

      // Envoyer l'email de confirmation avec la facture
      await sendPaymentSuccessEmail({
        to: org.billingEmail || org.ownerEmail,
        organizationName: org.name,
        amount,
        plan: org.plan,
        nextBillingDate,
        invoiceUrl: invoice.pdfUrl,
      })

      console.log(`📧 Email de confirmation envoyé`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email/facture (non bloquant):', emailError)
    }
  } catch (error) {
    console.error('Erreur mise à jour après paiement:', error)
  }
}

/**
 * Gère l'échec d'un paiement
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const organizationId = paymentIntent.metadata.organizationId

  if (!organizationId) {
    console.warn('⚠️ organizationId manquant dans les metadata')
    return
  }

  try {
    // Récupérer l'organisation
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      console.warn(`⚠️ Organisation ${organizationId} introuvable`)
      return
    }

    // Suspendre l'organisation
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'SUSPENDED',
      },
    })

    console.log(`❌ Paiement échoué pour l'organisation ${organizationId}`)

    // Calculer le montant
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 89,
      TEAM: 149,
      PREMIUM: 249,
    }
    const amount = planPrices[org.plan] || 0

    // Envoyer email d'échec
    try {
      await sendPaymentFailedEmail({
        to: org.billingEmail || org.ownerEmail,
        organizationName: org.name,
        amount,
        plan: org.plan,
        reason: paymentIntent.last_payment_error?.message,
      })

      console.log(`📧 Email d'échec envoyé`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email échec (non bloquant):', emailError)
    }

    // TODO: Créer notification super admin
  } catch (error) {
    console.error('Erreur mise à jour après échec paiement:', error)
  }
}

/**
 * Gère la mise à jour d'un abonnement
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  try {
    const org = await prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!org) {
      console.warn(`⚠️ Organisation introuvable pour customer ${customerId}`)
      return
    }

    console.log(`🔄 Abonnement mis à jour pour ${org.name}`)

    // TODO: Synchroniser les changements d'abonnement
  } catch (error) {
    console.error('Erreur mise à jour abonnement:', error)
  }
}

/**
 * Gère la suppression d'un abonnement
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  try {
    const org = await prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!org) {
      console.warn(`⚠️ Organisation introuvable pour customer ${customerId}`)
      return
    }

    // Annuler l'organisation
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        status: 'CANCELLED',
      },
    })

    console.log(`🗑️ Abonnement annulé pour ${org.name}`)

    // TODO: Envoyer email de confirmation d'annulation
  } catch (error) {
    console.error('Erreur suppression abonnement:', error)
  }
}
