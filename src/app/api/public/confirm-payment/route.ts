import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmationEmail } from '@/lib/email-service'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

/**
 * POST /api/public/confirm-payment
 * Confirmer le paiement et marquer le lead comme PAID
 */
export async function POST(request: Request) {
  try {
    const { sessionId, leadId } = await request.json()

    if (!sessionId || !leadId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Vérifier la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      )
    }

    // Mettre à jour le lead
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'QUALIFIED', // Lead qualifié après paiement
        probability: 80, // Haute probabilité
        score: 90, // Score élevé
        notes: `Paiement confirmé - Session Stripe: ${sessionId}\nMontant: ${session.amount_total ? session.amount_total / 100 : 0}€`,
        lastContactDate: new Date()
      }
    })

    // Envoyer email de confirmation
    const planName = session.metadata?.planId || 'SOLO'
    const amount = session.amount_total ? session.amount_total / 100 : 0

    try {
      await sendPaymentConfirmationEmail({
        email: lead.contactEmail,
        contactName: lead.contactName,
        institutName: lead.institutName,
        planName: planName,
        amount: amount
      })
    } catch (emailError) {
      log.error('Erreur envoi email confirmation:', emailError)
      // Ne pas bloquer si l'email échoue
    }

    return NextResponse.json({
      success: true,
      lead
    })

  } catch (error: any) {
    log.error('Erreur confirmation paiement:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la confirmation' },
      { status: 500 }
    )
  }
}
