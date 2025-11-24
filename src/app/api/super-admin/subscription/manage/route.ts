import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

export async function POST(req: NextRequest) {
  try {
    const { organizationId, action } = await req.json()

    // Valider l'action
    if (!['suspend', 'cancel', 'resume'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez: suspend, cancel ou resume' },
        { status: 400 }
      )
    }

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    if (!organization.subscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe trouvé pour cette organisation' },
        { status: 404 }
      )
    }

    let updatedStatus = organization.status

    // Gérer les différentes actions
    switch (action) {
      case 'suspend':
        // Suspendre l'abonnement (pause_collection)
        await stripe.subscriptions.update(organization.subscriptionId, {
          pause_collection: {
            behavior: 'void' // Les factures seront annulées pendant la pause
          }
        })
        updatedStatus = 'SUSPENDED'
        log.info(`✅ Abonnement ${organization.subscriptionId} suspendu`)
        break

      case 'cancel':
        // Résilier l'abonnement (à la fin de la période en cours)
        await stripe.subscriptions.update(organization.subscriptionId, {
          cancel_at_period_end: true
        })
        updatedStatus = 'CANCELLED'
        log.info(`✅ Abonnement ${organization.subscriptionId} résilié (fin de période)`)
        break

      case 'resume':
        // Reprendre l'abonnement
        const subscription = await stripe.subscriptions.retrieve(organization.subscriptionId)

        // Si l'abonnement est en pause, le reprendre
        if (subscription.pause_collection) {
          await stripe.subscriptions.update(organization.subscriptionId, {
            pause_collection: null
          })
        }

        // Si l'abonnement est marqué pour annulation, annuler cette action
        if (subscription.cancel_at_period_end) {
          await stripe.subscriptions.update(organization.subscriptionId, {
            cancel_at_period_end: false
          })
        }

        updatedStatus = 'ACTIVE'
        log.info(`✅ Abonnement ${organization.subscriptionId} repris`)
        break
    }

    // Mettre à jour le statut dans la base de données
    await prisma.organization.update({
      where: { id: organizationId },
      data: { status: updatedStatus }
    })

    return NextResponse.json({
      success: true,
      message: `Abonnement ${action === 'suspend' ? 'suspendu' : action === 'cancel' ? 'résilié' : 'repris'} avec succès`,
      newStatus: updatedStatus
    })

  } catch (error: any) {
    log.error('Erreur gestion abonnement:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
