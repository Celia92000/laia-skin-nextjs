import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { log } from '@/lib/logger';
import { sendSMSPurchaseConfirmation } from '@/lib/email-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
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

      // Envoyer email de confirmation
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, ownerEmail: true }
      });

      if (organization) {
        const packages: Record<string, string> = {
          'sms_100': 'Starter - 100 SMS',
          'sms_500': 'Essentiel - 500 SMS',
          'sms_1000': 'Pro - 1000 SMS',
          'sms_3000': 'Premium - 3000 SMS'
        };

        await sendSMSPurchaseConfirmation({
          organizationName: organization.name,
          ownerEmail: organization.ownerEmail,
          credits,
          amount: (session.amount_total || 0) / 100,
          packageName: packages[packageId] || `${credits} SMS`
        });
      }
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
