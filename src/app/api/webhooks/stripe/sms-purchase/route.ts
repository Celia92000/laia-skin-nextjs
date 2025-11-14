import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_SMS!

/**
 * Webhook Stripe pour confirmer l'achat de crédits SMS
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      log.error('❌ Erreur validation signature Stripe:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Traiter l'événement
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Vérifier que c'est bien un achat de crédits SMS
      if (session.metadata?.type !== 'sms_credits') {
        log.info('ℹ️ Session non-SMS ignorée:', session.id)
        return NextResponse.json({ received: true })
      }

      const organizationId = session.metadata.organizationId
      const credits = parseInt(session.metadata.credits || '0')
      const packageId = session.metadata.packageId

      log.info('💳 Paiement SMS réussi:', {
        organizationId,
        credits,
        packageId,
        sessionId: session.id
      })

      // Ajouter les crédits à l'organisation
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          smsCredits: {
            increment: credits
          },
          smsTotalPurchased: {
            increment: credits
          },
          smsLastPurchaseDate: new Date()
        }
      })

      log.info(`✅ ${credits} crédits SMS ajoutés à l'organisation ${organizationId}`)

      // TODO: Envoyer un email de confirmation
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    log.error('❌ Erreur webhook Stripe SMS:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
