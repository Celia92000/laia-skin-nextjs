import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-service'
import { prisma } from '@/lib/prisma'
import { generateAndSaveInvoice } from '@/lib/invoice-service'
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/payment-emails'
import { getResend } from '@/lib/resend'
import { getSiteConfig } from '@/lib/config-service'
import { generateOrganizationTemplate } from '@/lib/template-generator'
import { sendWelcomeEmail, sendSuperAdminNotification } from '@/lib/onboarding-emails'
import { createSubscriptionInvoice } from '@/lib/subscription-invoice-generator'
import { createOnboardingContract } from '@/lib/contract-generator'
import bcrypt from 'bcryptjs'
import Stripe from 'stripe'

/**
 * Webhook Stripe pour gérer les événements de paiement
 *
 * Configure ce webhook dans ton dashboard Stripe :
 * URL : https://votre-domaine.com/api/webhooks/stripe
 * Événements à écouter :
 * - checkout.session.completed
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

    // Mode test : skip signature si signature = "test_signature"
    if (signature === 'test_signature' && process.env.NODE_ENV === 'development') {
      console.log('⚠️ MODE TEST : Skip vérification signature Stripe')
      event = JSON.parse(body)
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('❌ Signature webhook invalide:', err)
        return NextResponse.json(
          { error: 'Signature invalide' },
          { status: 400 }
        )
      }
    }

    console.log(`📨 Webhook reçu: ${event.type}`)

    // Gérer les différents événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

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

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      // Stripe Connect - Événements des comptes connectés (instituts)
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await handleConnectedAccountUpdated(account)
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
 * Gère la complétion d'une session de checkout (onboarding, cartes cadeaux, réservations)
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata

    if (!metadata) {
      console.warn('⚠️ Pas de metadata dans la session')
      return
    }

    // Gérer l'onboarding SaaS (création d'organisation)
    if (metadata.type === 'onboarding' && metadata.onboardingData) {
      await handleOnboardingCompleted(session, metadata.onboardingData)
      return
    }

    // Gérer les paiements Connect (institut)
    if (metadata.organizationId) {
      await handleConnectedCheckoutCompleted(session)
      return
    }

    // Gérer l'achat de carte cadeau
    if (metadata.type === 'gift_card' && metadata.giftCardId) {
      await handleGiftCardPaymentSuccess(metadata.giftCardId, session)
      return
    }

    // Gérer les réservations
    if (metadata.type === 'reservation' && metadata.reservationId) {
      await handleReservationPaymentSuccess(metadata.reservationId, session)
      return
    }

    console.log(`⚠️ Type de checkout non géré: ${metadata.type}`)
  } catch (error) {
    console.error('Erreur handleCheckoutCompleted:', error)
  }
}

/**
 * Gère le paiement réussi d'une carte cadeau
 */
async function handleGiftCardPaymentSuccess(giftCardId: string, session: Stripe.Checkout.Session) {
  try {
    // Récupérer la carte cadeau
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId },
      include: {
        purchaser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!giftCard) {
      console.warn(`⚠️ Carte cadeau ${giftCardId} introuvable`)
      return
    }

    // Mettre à jour le statut de paiement
    await prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        paymentStatus: 'paid',
        notes: `Stripe Session ID: ${session.id}\nPayment Intent: ${session.payment_intent}`
      }
    })

    console.log(`✅ Paiement réussi pour la carte cadeau ${giftCard.code}`)

    // Envoyer l'email avec la carte cadeau
    if (giftCard.purchaser?.email) {
      await sendGiftCardEmail(giftCard)
    }
  } catch (error) {
    console.error('Erreur handleGiftCardPaymentSuccess:', error)
  }
}

/**
 * Gère le paiement réussi d'une réservation
 */
async function handleReservationPaymentSuccess(reservationId: string, session: Stripe.Checkout.Session) {
  try {
    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    })

    if (!reservation) {
      console.warn(`⚠️ Réservation ${reservationId} introuvable`)
      return
    }

    // Mettre à jour le statut de paiement
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'paid'
      }
    })

    console.log(`✅ Paiement réussi pour la réservation ${reservationId}`)
  } catch (error) {
    console.error('Erreur handleReservationPaymentSuccess:', error)
  }
}

/**
 * Envoie l'email avec la carte cadeau au client
 */
async function sendGiftCardEmail(giftCard: any) {
  try {
    const config = await getSiteConfig()
    const siteName = config.siteName || 'Mon Institut'
    const email = config.email || 'contact@institut.fr'
    const primaryColor = config.primaryColor || '#d4b5a0'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Votre Carte Cadeau ${siteName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, ${primaryColor}, #c9a084); padding: 40px; text-align: center;">
                                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">${siteName} INSTITUT</h1>
                                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Beauté & Bien-être</p>
                              </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px;">
                                  <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">
                                      ${giftCard.purchaser ? `Bonjour ${giftCard.purchaser.name} 🎁` : 'Bonjour 🎁'}
                                  </h2>

                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                      Merci pour votre achat ! Voici votre carte cadeau ${siteName} INSTITUT${giftCard.purchasedFor ? ` pour <strong>${giftCard.purchasedFor}</strong>` : ''}.
                                  </p>

                                  ${giftCard.message ? `
                                  <div style="margin: 30px 0; padding: 20px; background-color: #fdf5f0; border-left: 4px solid #d4b5a0; border-radius: 4px;">
                                      <p style="color: #c9a084; font-size: 12px; font-weight: 600; margin: 0 0 8px 0;">Votre message personnalisé</p>
                                      <p style="color: #866b5d; font-size: 14px; font-style: italic; margin: 0;">
                                          "${giftCard.message}"
                                      </p>
                                  </div>
                                  ` : ''}

                                  <!-- Carte Cadeau Visuelle -->
                                  <div style="margin: 30px 0; padding: 40px; background: linear-gradient(135deg, #f8f6f0, #fdfbf7, #f5f0e8); border-radius: 16px; border: 4px solid #d4b5a0; text-align: center;">
                                      <div style="margin-bottom: 20px;">
                                          <span style="font-size: 48px;">🎁</span>
                                      </div>

                                      <h3 style="color: #c9a084; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Carte Cadeau</h3>

                                      <div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 2px solid rgba(212, 181, 160, 0.3);">
                                          <p style="color: #c9a084; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Valeur</p>
                                          <p style="color: ${primaryColor}; font-size: 48px; font-weight: bold; margin: 0;">${giftCard.amount}€</p>
                                      </div>

                                      <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid rgba(212, 181, 160, 0.3);">
                                          <p style="color: #c9a084; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Votre code</p>
                                          <p style="color: #2c3e50; font-size: 28px; font-weight: bold; font-family: monospace; margin: 0; letter-spacing: 2px;">
                                              ${giftCard.code}
                                          </p>
                                      </div>

                                      <p style="color: #2c3e50; font-size: 14px; margin: 20px 0 0 0; opacity: 0.7;">
                                          Valable jusqu'au ${new Date(giftCard.expiryDate || new Date(Date.now() + 365*24*60*60*1000)).toLocaleDateString('fr-FR')}
                                      </p>
                                  </div>

                                  <!-- Instructions -->
                                  <div style="margin: 30px 0; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
                                      <p style="color: #333; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                                          💡 Comment utiliser cette carte cadeau ?
                                      </p>
                                      <ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                          <li>Rendez-vous sur notre site pour réserver un soin</li>
                                          <li>Lors de la réservation, entrez le code de la carte cadeau</li>
                                          <li>Le montant sera automatiquement déduit de votre réservation</li>
                                      </ol>
                                  </div>

                                  <p style="color: #999; font-size: 13px; text-align: center; margin: 30px 0 0 0;">
                                      💝 Cette carte cadeau est utilisable sur tous nos soins et produits
                                  </p>
                              </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                                  <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">
                                      ${siteName} INSTITUT<br>
                                      Votre institut de beauté et bien-être
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `

    const fromEmail = process.env.EMAIL_FROM
      ? `${siteName} <${process.env.EMAIL_FROM}>`
      : (process.env.VERIFIED_EMAIL_DOMAIN
        ? `${siteName} <contact@${process.env.VERIFIED_EMAIL_DOMAIN}>`
        : `${siteName} <${email}>`)

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: [giftCard.purchaser.email],
      subject: `🎁 Votre carte cadeau ${siteName} - ${giftCard.amount}€`,
      html: htmlContent
    })

    if (error) {
      console.error('Erreur Resend:', error)
      throw new Error('Erreur envoi email')
    }

    console.log(`📧 Email carte cadeau envoyé à ${giftCard.purchaser.email}`)
    return data
  } catch (error) {
    console.error('Erreur sendGiftCardEmail:', error)
    throw error
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
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179,
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
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179,
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

    // Synchroniser les changements d'abonnement (plan, statut, etc.)
    const planMapping: { [key: string]: string } = {
      'price_solo': 'SOLO',
      'price_duo': 'DUO',
      'price_team': 'TEAM',
      'price_premium': 'PREMIUM'
    }

    const priceId = subscription.items.data[0]?.price.id
    const newPlan = planMapping[priceId] || org.plan

    await prisma.organization.update({
      where: { id: org.id },
      data: {
        plan: newPlan,
        status: subscription.status === 'active' ? 'ACTIVE' :
                subscription.status === 'trialing' ? 'TRIAL' :
                subscription.status === 'canceled' ? 'CANCELLED' : org.status,
        stripeSubscriptionId: subscription.id,
      }
    })

    console.log(`✅ Organisation ${org.name} mise à jour: Plan ${newPlan}, Statut ${subscription.status}`)
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

    // Envoyer email de confirmation d'annulation
    const resend = getResend()
    if (resend && org.ownerEmail) {
      try {
        await resend.emails.send({
          from: 'LAIA Platform <noreply@laiaskin.com>',
          to: org.ownerEmail,
          subject: `Confirmation d'annulation de votre abonnement LAIA`,
          html: generateCancellationEmail(org.name, org.plan)
        })
        console.log(`📧 Email d'annulation envoyé à ${org.ownerEmail}`)
      } catch (emailError) {
        console.error('Erreur envoi email annulation:', emailError)
      }
    }
  } catch (error) {
    console.error('Erreur suppression abonnement:', error)
  }
}

/**
 * Génère l'email de confirmation d'annulation
 */
function generateCancellationEmail(orgName: string, plan: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Annulation confirmée</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #2d3748;">Bonjour ${orgName},</p>

        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
          Nous vous confirmons l'annulation de votre abonnement LAIA <strong>${plan}</strong>.
        </p>

        <div style="background: #f7fafc; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #667eea;">
          <p style="margin: 0; font-size: 14px; color: #2d3748;">
            <strong>Que se passe-t-il maintenant ?</strong>
          </p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #4a5568;">
            <li>Votre accès à LAIA restera actif jusqu'à la fin de la période déjà payée</li>
            <li>Aucun nouveau prélèvement ne sera effectué</li>
            <li>Vos données seront conservées pendant 30 jours</li>
            <li>Vous pouvez réactiver votre compte à tout moment</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">
          Nous sommes désolés de vous voir partir. Si vous avez des questions ou souhaitez nous faire part de vos retours,
          n'hésitez pas à nous contacter à <a href="mailto:support@laiaskin.com" style="color: #667eea;">support@laiaskin.com</a>
        </p>

        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          Cordialement,<br>
          L'équipe LAIA
        </p>
      </div>
    </body>
    </html>
  `
}

/**
 * Gère le paiement réussi d'une facture mensuelle
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  try {
    const org = await prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!org) {
      console.warn(`⚠️ Organisation introuvable pour customer ${customerId}`)
      return
    }

    console.log(`💰 Paiement de facture réussi pour ${org.name} - ${invoice.amount_paid / 100}€`)

    // Créer ou mettre à jour la facture dans la base de données
    const existingInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id }
    })

    if (existingInvoice) {
      // Mettre à jour la facture existante
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          status: 'PAID',
          paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
        }
      })
    } else {
      // Créer une nouvelle facture
      await generateAndSaveInvoice(org.id, invoice)
    }

    // S'assurer que l'organisation est active
    if (org.status !== 'ACTIVE') {
      await prisma.organization.update({
        where: { id: org.id },
        data: { status: 'ACTIVE' }
      })
      console.log(`✅ Organisation ${org.name} réactivée`)
    }

    // Envoyer email de confirmation de paiement
    const resend = getResend()
    if (resend && org.ownerEmail) {
      try {
        await resend.emails.send({
          from: 'LAIA Platform <noreply@laiaskin.com>',
          to: org.ownerEmail,
          subject: `✅ Paiement confirmé - Facture ${invoice.number}`,
          html: generatePaymentSuccessEmail(org.name, invoice.number || 'N/A', invoice.amount_paid / 100, org.plan)
        })
        console.log(`📧 Email de confirmation envoyé à ${org.ownerEmail}`)
      } catch (emailError) {
        console.error('Erreur envoi email confirmation:', emailError)
      }
    }

  } catch (error) {
    console.error('Erreur handleInvoicePaymentSucceeded:', error)
  }
}

/**
 * Gère l'échec d'un paiement de facture
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  try {
    const org = await prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!org) {
      console.warn(`⚠️ Organisation introuvable pour customer ${customerId}`)
      return
    }

    console.log(`❌ Échec de paiement pour ${org.name} - ${invoice.amount_due / 100}€`)

    // Mettre à jour ou créer la facture avec statut FAILED
    const existingInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id }
    })

    if (existingInvoice) {
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { status: 'FAILED' }
      })
    } else {
      await generateAndSaveInvoice(org.id, invoice, 'FAILED')
    }

    // Envoyer email d'alerte de paiement échoué
    const resend = getResend()
    if (resend && org.ownerEmail) {
      try {
        // Extraire le message d'erreur depuis last_payment_error
        const failureMessage = (invoice as any).last_payment_error?.message

        await resend.emails.send({
          from: 'LAIA Platform <noreply@laiaskin.com>',
          to: org.ownerEmail,
          subject: `❌ Échec de paiement - Facture ${invoice.number}`,
          html: generatePaymentFailedEmail(org.name, invoice.number || 'N/A', invoice.amount_due / 100, failureMessage)
        })
        console.log(`📧 Email d'alerte envoyé à ${org.ownerEmail}`)
      } catch (emailError) {
        console.error('Erreur envoi email échec:', emailError)
      }
    }

  } catch (error) {
    console.error('Erreur handleInvoicePaymentFailed:', error)
  }
}

/**
 * Génère l'email de confirmation de paiement
 */
function generatePaymentSuccessEmail(orgName: string, invoiceNumber: string, amount: number, plan: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Paiement confirmé</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #2d3748;">Bonjour ${orgName},</p>

        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
          Nous vous confirmons la réception de votre paiement pour votre abonnement LAIA <strong>${plan}</strong>.
        </p>

        <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #2f855a;">Facture payée</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2d3748;">${invoiceNumber}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #2f855a;">Montant réglé</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #48bb78;">${amount.toFixed(2)} €</p>
        </div>

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">
          Merci pour votre confiance ! Votre abonnement est actif et renouvelé pour un mois supplémentaire.
        </p>

        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          Cordialement,<br>
          L'équipe LAIA
        </p>
      </div>
    </body>
    </html>
  `
}

/**
 * Génère l'email d'échec de paiement
 */
function generatePaymentFailedEmail(orgName: string, invoiceNumber: string, amount: number, failureMessage?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">❌ Échec de paiement</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #2d3748;">Bonjour ${orgName},</p>

        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
          Nous n'avons pas pu prélever le paiement de votre abonnement LAIA.
        </p>

        <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #c53030;">Facture impayée</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2d3748;">${invoiceNumber}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #c53030;">Montant dû</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #f56565;">${amount.toFixed(2)} €</p>
          ${failureMessage ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #742a2a;">Raison: ${failureMessage}</p>` : ''}
        </div>

        <div style="background: #fffaf0; border: 1px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #7c2d12; font-weight: bold;">⚠️ Action requise</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #7c2d12;">
            Veuillez mettre à jour votre moyen de paiement ou régler manuellement cette facture pour éviter toute interruption de service.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://laia-connect.vercel.app/admin/settings" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold;">
            Mettre à jour mon moyen de paiement
          </a>
        </div>

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">
          Pour toute question, contactez-nous à <a href="mailto:facturation@laiaskin.com" style="color: #667eea;">facturation@laiaskin.com</a>
        </p>

        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          L'équipe LAIA
        </p>
      </div>
    </body>
    </html>
  `
}

/**
 * Gérer la mise à jour d'un compte Stripe Connect (institut)
 */
async function handleConnectedAccountUpdated(account: Stripe.Account) {
  try {
    console.log(`🔄 Mise à jour compte Connect: ${account.id}`)

    // Trouver l'organisation correspondante
    const org = await prisma.organization.findFirst({
      where: { stripeConnectedAccountId: account.id }
    })

    if (!org) {
      console.warn(`⚠️ Organisation introuvable pour compte Connect ${account.id}`)
      return
    }

    // Mettre à jour les statuts
    const onboardingComplete = account.details_submitted || false
    const chargesEnabled = account.charges_enabled || false
    const payoutsEnabled = account.payouts_enabled || false

    await prisma.organization.update({
      where: { id: org.id },
      data: {
        stripeOnboardingComplete: onboardingComplete,
        stripeChargesEnabled: chargesEnabled,
        stripePayoutsEnabled: payoutsEnabled
      }
    })

    console.log(`✅ Statut Connect mis à jour pour ${org.name}`)
    console.log(`   - Onboarding: ${onboardingComplete}`)
    console.log(`   - Charges: ${chargesEnabled}`)
    console.log(`   - Payouts: ${payoutsEnabled}`)

    // Logger l'événement
    await prisma.activityLog.create({
      data: {
        userId: 'system',
        action: 'STRIPE_CONNECT_UPDATED',
        entityType: 'ORGANIZATION',
        entityId: org.id,
        description: `Compte Stripe Connect mis à jour pour ${org.name}`,
        metadata: {
          accountId: account.id,
          onboardingComplete,
          chargesEnabled,
          payoutsEnabled
        }
      }
    })

  } catch (error) {
    console.error('Erreur handleConnectedAccountUpdated:', error)
  }
}

/**
 * Gérer un paiement Connect réussi (réservation, carte cadeau, etc.)
 */
async function handleConnectedCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`💳 Paiement Connect réussi: ${session.id}`)

    const metadata = session.metadata
    if (!metadata) return

    const organizationId = metadata.organizationId
    const reservationId = metadata.reservationId
    const giftCardId = metadata.giftCardId

    // Marquer la réservation comme payée
    if (reservationId) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          paid: true,
          paymentMethod: 'card',
          stripePaymentIntentId: session.payment_intent as string
        }
      })

      console.log(`✅ Réservation ${reservationId} marquée comme payée`)

      // Logger
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'RESERVATION_PAID',
          entityType: 'RESERVATION',
          entityId: reservationId,
          description: `Paiement réservation réussi via Stripe Connect`,
          metadata: {
            amount: session.amount_total ? session.amount_total / 100 : 0,
            sessionId: session.id,
            paymentIntentId: session.payment_intent
          }
        }
      })
    }

    // Marquer la carte cadeau comme payée
    if (giftCardId) {
      await prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          status: 'ACTIVE',
          stripePaymentIntentId: session.payment_intent as string
        }
      })

      console.log(`✅ Carte cadeau ${giftCardId} activée`)

      // Logger
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GIFT_CARD_PAID',
          entityType: 'GIFT_CARD',
          entityId: giftCardId,
          description: `Carte cadeau payée et activée via Stripe Connect`,
          metadata: {
            amount: session.amount_total ? session.amount_total / 100 : 0,
            sessionId: session.id,
            paymentIntentId: session.payment_intent
          }
        }
      })
    }

  } catch (error) {
    console.error('Erreur handleConnectedCheckoutCompleted:', error)
  }
}

/**
 * Gère la création d'organisation après validation du paiement (onboarding)
 */
async function handleOnboardingCompleted(session: Stripe.Checkout.Session, onboardingDataJson: string) {
  try {
    console.log('🚀 Début création organisation depuis webhook')

    // Parser les données d'onboarding
    const data = JSON.parse(onboardingDataJson)

    const {
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone,
      institutName,
      slug,
      subdomain,
      customDomain,
      useCustomDomain,
      city,
      address,
      postalCode,
      primaryColor,
      secondaryColor,
      serviceName,
      servicePrice,
      serviceDuration,
      serviceDescription,
      websiteTemplateId,
      siteTagline,
      heroTitle,
      heroSubtitle,
      aboutText,
      founderName,
      founderTitle,
      founderQuote,
      facebook,
      instagram,
      whatsapp,
      businessHours,
      legalName,
      siret,
      tvaNumber,
      billingEmail,
      billingAddress,
      billingPostalCode,
      billingCity,
      billingCountry,
      sepaIban,
      sepaBic,
      sepaAccountHolder,
      sepaMandate,
      selectedPlan
    } = data

    const adminEmail = ownerEmail
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const sepaMandateRef = `LAIA-${slug.toUpperCase()}-${Date.now()}`
    const sepaMandateDate = new Date()

    // Créer l'organisation
    const organization = await prisma.organization.create({
      data: {
        name: institutName,
        slug,
        subdomain,
        domain: useCustomDomain && customDomain ? customDomain : null,
        websiteTemplateId: websiteTemplateId || 'modern',
        ownerFirstName,
        ownerLastName,
        ownerEmail,
        ownerPhone,
        legalName,
        siret,
        tvaNumber: tvaNumber || null,
        billingEmail,
        billingAddress,
        billingPostalCode,
        billingCity,
        billingCountry: billingCountry || 'France',
        sepaIban,
        sepaBic,
        sepaAccountHolder,
        sepaMandate,
        sepaMandateRef,
        sepaMandateDate,
        plan: selectedPlan,
        status: 'ACTIVE',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: session.customer as string,
        subscriptionId: session.subscription as string,
        config: {
          create: {
            primaryColor,
            secondaryColor,
            siteName: institutName,
            siteDescription: `Institut de beauté ${institutName}`,
            siteTagline: siteTagline || 'Institut de Beauté & Bien-être',
            heroTitle: heroTitle || 'Une peau respectée,',
            heroSubtitle: heroSubtitle || 'une beauté révélée',
            aboutText: aboutText || '',
            founderName: founderName || `${ownerFirstName} ${ownerLastName}`,
            founderTitle: founderTitle || 'Fondatrice & Experte en soins esthétiques',
            founderQuote: founderQuote || '',
            facebook: facebook || null,
            instagram: instagram || null,
            whatsapp: whatsapp || null,
            contactEmail: ownerEmail,
            phone: ownerPhone || '',
            address: address || '',
            city: city || '',
            postalCode: postalCode || '',
            country: 'France',
            businessHours: JSON.stringify(businessHours),
            siret,
            tvaNumber: tvaNumber || null,
            legalRepName: `${ownerFirstName} ${ownerLastName}`,
            legalRepTitle: 'Gérant(e)'
          }
        },
        locations: {
          create: {
            name: institutName,
            slug: 'principal',
            isMainLocation: true,
            address: address || '',
            city: city || '',
            postalCode: postalCode || '',
            country: 'France',
            phone: ownerPhone || '',
            email: ownerEmail,
            businessHours: JSON.stringify(businessHours)
          }
        }
      },
      include: {
        locations: true,
        config: true
      }
    })

    console.log(`✅ Organisation créée: ${organization.id}`)

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: `${ownerFirstName} ${ownerLastName}`,
        phone: ownerPhone || null,
        password: hashedPassword,
        role: 'ORG_OWNER',
        organizationId: organization.id
      }
    })

    console.log(`✅ Utilisateur admin créé: ${adminUser.id}`)

    // Créer le premier service si fourni
    if (serviceName && servicePrice) {
      await prisma.service.create({
        data: {
          name: serviceName,
          description: serviceDescription || '',
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration?.toString() || '60'),
          organizationId: organization.id,
          locationId: organization.locations[0].id,
          isActive: true
        }
      })
      console.log(`✅ Service créé: ${serviceName}`)
    }

    // Générer le template
    try {
      await generateOrganizationTemplate({
        organizationId: organization.id,
        organizationName: institutName,
        plan: selectedPlan,
        ownerFirstName,
        ownerLastName,
        primaryColor,
        secondaryColor,
        initialService: serviceName ? {
          name: serviceName,
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration?.toString() || '60'),
          description: serviceDescription || ''
        } : undefined
      })
      console.log('✅ Template LAIA généré')
    } catch (error) {
      console.error('⚠️ Erreur template:', error)
    }

    // Générer facture et contrat
    let invoicePdfBuffer: Buffer | undefined
    let contractPdfBuffer: Buffer | undefined

    try {
      const invoiceResult = await createSubscriptionInvoice(organization.id, true)
      invoicePdfBuffer = invoiceResult.pdfBuffer
      console.log(`✅ Facture générée`)
    } catch (error) {
      console.error('⚠️ Erreur facture:', error)
    }

    try {
      contractPdfBuffer = await createOnboardingContract(organization.id)
      console.log(`✅ Contrat généré`)
    } catch (error) {
      console.error('⚠️ Erreur contrat:', error)
    }

    // Envoyer emails
    try {
      await sendWelcomeEmail({
        recipientEmail: ownerEmail,
        recipientName: `${ownerFirstName} ${ownerLastName}`,
        organizationName: institutName,
        tempPassword,
        plan: selectedPlan,
        invoicePdfBuffer,
        contractPdfBuffer
      })
      console.log('✅ Email de bienvenue envoyé')
    } catch (error) {
      console.error('⚠️ Erreur email bienvenue:', error)
    }

    try {
      await sendSuperAdminNotification({
        organizationName: institutName,
        ownerName: `${ownerFirstName} ${ownerLastName}`,
        ownerEmail,
        plan: selectedPlan,
        organizationId: organization.id
      })
      console.log('✅ Email super-admin envoyé')
    } catch (error) {
      console.error('⚠️ Erreur email super-admin:', error)
    }

    console.log('🎉 Onboarding terminé avec succès!')

  } catch (error) {
    console.error('❌ Erreur handleOnboardingCompleted:', error)
    throw error
  }
}

