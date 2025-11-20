import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

/**
 * Créer ou récupérer un compte Stripe Connect et générer le lien d'onboarding
 * POST /api/admin/stripe-connect/onboard
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

    // Récupérer l'utilisateur et son organisation
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerEmail: true,
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
    if (!['ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const org = user.organization

    let accountId = org.stripeConnectedAccountId

    // Si pas de compte Stripe Connect, en créer un
    if (!accountId) {
      log.info(`🔗 Création compte Stripe Connect pour ${org.name}`)

      const account = await stripe.accounts.create({
        type: 'standard', // Standard = l'institut gère tout lui-même
        email: org.ownerEmail,
        business_type: 'company',
        metadata: {
          organizationId: org.id,
          organizationName: org.name
        }
      })

      accountId = account.id

      // Enregistrer l'ID du compte
      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeConnectedAccountId: accountId }
      })

      log.info(`✅ Compte Stripe Connect créé: ${accountId}`)
    }

    // Générer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/parametres/paiements?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/parametres/paiements?success=true`,
      type: 'account_onboarding'
    })

    log.info(`📝 Lien d'onboarding généré pour ${org.name}`)

    return NextResponse.json({
      url: accountLink.url,
      accountId: accountId
    })

  } catch (error) {
    log.error('Erreur création onboarding Stripe Connect:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

/**
 * Vérifier le statut du compte Stripe Connect
 * GET /api/admin/stripe-connect/onboard
 */
export async function GET(request: Request) {
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
            stripeConnectedAccountId: true,
            stripeOnboardingComplete: true,
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true
          }
        }
      }
    })

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })
    }

    const org = user.organization

    if (!org.stripeConnectedAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false
      })
    }

    // Récupérer les infos du compte Stripe
    const account = await stripe.accounts.retrieve(org.stripeConnectedAccountId)

    const onboardingComplete = account.details_submitted || false
    const chargesEnabled = account.charges_enabled || false
    const payoutsEnabled = account.payouts_enabled || false

    // Mettre à jour la BDD si le statut a changé
    if (
      org.stripeOnboardingComplete !== onboardingComplete ||
      org.stripeChargesEnabled !== chargesEnabled ||
      org.stripePayoutsEnabled !== payoutsEnabled
    ) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          stripeOnboardingComplete: onboardingComplete,
          stripeChargesEnabled: chargesEnabled,
          stripePayoutsEnabled: payoutsEnabled
        }
      })
    }

    return NextResponse.json({
      connected: true,
      accountId: org.stripeConnectedAccountId,
      onboardingComplete,
      chargesEnabled,
      payoutsEnabled,
      requiresAction: !onboardingComplete || !chargesEnabled
    })

  } catch (error) {
    log.error('Erreur récupération statut Stripe Connect:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
