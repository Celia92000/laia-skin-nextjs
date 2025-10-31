import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

/**
 * Générer un lien vers le dashboard Stripe Express de l'institut
 * POST /api/admin/stripe-connect/dashboard
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'organisation
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            stripeConnectedAccountId: true,
            stripeOnboardingComplete: true
          }
        }
      }
    })

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est bien propriétaire ou admin
    if (!['ORG_OWNER', 'ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const org = user.organization

    if (!org.stripeConnectedAccountId || !org.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: 'Compte Stripe non configuré. Veuillez compléter l\'onboarding d\'abord.' },
        { status: 400 }
      )
    }

    // Générer le lien vers le dashboard Stripe Express
    const loginLink = await stripe.accounts.createLoginLink(org.stripeConnectedAccountId)

    console.log(`🔗 Lien dashboard généré pour ${org.name}`)

    return NextResponse.json({
      url: loginLink.url
    })

  } catch (error) {
    console.error('Erreur génération lien dashboard:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
