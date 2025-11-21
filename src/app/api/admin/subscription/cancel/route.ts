import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur a les droits pour résilier (ORG_ADMIN uniquement)
    const allowedRoles = ['ORG_ADMIN', 'SUPER_ADMIN']
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({
        error: 'Vous n\'avez pas les droits pour résilier l\'abonnement. Seuls les propriétaires peuvent effectuer cette action.'
      }, { status: 403 })
    }

    // Récupérer l'organisation actuelle
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: {
        id: true,
        name: true,
        status: true,
        subscriptionId: true,
        currentPeriodEnd: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Vérifier si l'organisation a un abonnement Stripe actif
    if (!organization.subscriptionId) {
      return NextResponse.json({
        error: 'Aucun abonnement actif trouvé'
      }, { status: 400 })
    }

    // Vérifier si l'abonnement n'est pas déjà annulé
    if (organization.status === 'CANCELLED') {
      return NextResponse.json({
        error: 'L\'abonnement est déjà programmé pour résiliation'
      }, { status: 400 })
    }

    // Résilier l'abonnement Stripe à la fin de la période en cours
    await stripe.subscriptions.update(organization.subscriptionId, {
      cancel_at_period_end: true
    })

    // Mettre à jour le statut de l'organisation
    await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({
      success: true,
      message: 'Votre abonnement sera résilié à la fin de la période en cours.',
      currentPeriodEnd: organization.currentPeriodEnd
    })
  } catch (error: any) {
    console.error('Erreur résiliation:', error)
    return NextResponse.json({
      error: error.message || 'Erreur serveur lors de la résiliation'
    }, { status: 500 })
  }
}
