import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createConnectedCheckoutSession } from '@/lib/stripe-connect-helper'

/**
 * Créer une session de paiement Stripe Connect pour une réservation
 * POST /api/reservations/[id]/pay
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        service: {
          select: {
            name: true,
            price: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            stripeConnectedAccountId: true,
            stripeChargesEnabled: true
          }
        },
        client: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Vérifier que la réservation n'est pas déjà payée
    if (reservation.paid) {
      return NextResponse.json({ error: 'Réservation déjà payée' }, { status: 400 })
    }

    // Vérifier que l'organisation a Stripe Connect configuré
    if (!reservation.organization.stripeConnectedAccountId || !reservation.organization.stripeChargesEnabled) {
      return NextResponse.json(
        { error: 'Paiement en ligne non disponible pour cet institut' },
        { status: 400 }
      )
    }

    const amount = reservation.service?.price || reservation.totalPrice || 0

    if (amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    // Créer la session Stripe Checkout
    const session = await createConnectedCheckoutSession({
      organizationId: reservation.organizationId,
      amount: amount,
      description: `${reservation.service?.name || 'Réservation'} - ${reservation.organization.name}`,
      metadata: {
        reservationId: reservation.id,
        serviceId: reservation.serviceId || '',
        clientId: reservation.clientId
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${reservation.organization.slug}/reservations/${reservation.id}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${reservation.organization.slug}/reservations/${reservation.id}`,
      customerEmail: reservation.client.email
    })

    // Enregistrer la session ID dans la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripeSessionId: session.sessionId
      }
    })

    console.log(`💳 Session paiement créée pour réservation ${reservationId}`)

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
      amount: session.amountTotal,
      applicationFee: session.applicationFee
    })

  } catch (error) {
    console.error('Erreur création session paiement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
