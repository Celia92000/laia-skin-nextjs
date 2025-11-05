import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

/**
 * API Onboarding - Création de la session Stripe Checkout
 *
 * IMPORTANT : Cette API ne crée PAS l'organisation.
 * L'organisation sera créée par le webhook Stripe après validation du paiement.
 *
 * Flow :
 * 1. Client soumet le formulaire
 * 2. Cette API crée une Checkout Session Stripe avec les données en metadata
 * 3. Client redirigé vers Stripe pour paiement SEPA
 * 4. Stripe webhook reçoit checkout.session.completed
 * 5. Webhook crée l'organisation + user + emails
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const {
      // Informations personnelles
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone,

      // Informations institut
      institutName,
      slug,
      subdomain,

      // Informations légales
      legalName,
      siret,
      billingEmail,
      billingAddress,
      billingPostalCode,
      billingCity,
      billingCountry,

      // Mandat SEPA
      sepaIban,
      sepaBic,
      sepaAccountHolder,
      sepaMandate,

      selectedPlan
    } = data

    // Validation des champs obligatoires
    if (!institutName || !slug || !selectedPlan || !ownerFirstName || !ownerLastName || !ownerEmail) {
      return NextResponse.json(
        { error: 'Données obligatoires manquantes' },
        { status: 400 }
      )
    }

    if (!legalName || !siret) {
      return NextResponse.json(
        { error: 'Informations légales obligatoires manquantes (raison sociale et SIRET)' },
        { status: 400 }
      )
    }

    if (!sepaIban || !sepaBic || !sepaAccountHolder || !sepaMandate) {
      return NextResponse.json(
        { error: 'Informations de mandat SEPA obligatoires manquantes' },
        { status: 400 }
      )
    }

    // Vérifier si le slug existe déjà (évite les doublons avant paiement)
    const existingOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug },
          { subdomain }
        ]
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Ce nom est déjà utilisé. Veuillez en choisir un autre.' },
        { status: 400 }
      )
    }

    // Prix par plan
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179
    }

    const amount = planPrices[selectedPlan] || 49

    // Créer un client Stripe avec les informations SEPA
    const customer = await stripe.customers.create({
      email: ownerEmail,
      name: `${ownerFirstName} ${ownerLastName}`,
      phone: ownerPhone,
      address: {
        line1: billingAddress,
        postal_code: billingPostalCode,
        city: billingCity,
        country: billingCountry || 'FR'
      },
      metadata: {
        slug,
        siret,
        legalName
      }
    })

    // Créer une Stripe Checkout Session avec prélèvement SEPA uniquement
    // IMPORTANT : Toutes les données d'onboarding sont stockées dans metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      payment_method_types: ['sepa_debit'], // SEPA uniquement
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `LAIA Connect - Plan ${selectedPlan}`,
              description: `Abonnement mensuel avec 30 jours d'essai gratuit`,
            },
            recurring: {
              interval: 'month'
            },
            unit_amount: amount * 100 // Montant en centimes
          },
          quantity: 1
        }
      ],
      payment_method_options: {
        sepa_debit: {
          setup_future_usage: 'off_session' // Autoriser prélèvements futurs
        }
      },
      subscription_data: {
        trial_period_days: 30, // 30 jours gratuits
        metadata: {
          type: 'onboarding',
          slug,
          plan: selectedPlan
        }
      },
      metadata: {
        type: 'onboarding',
        // Stocker TOUTES les données d'onboarding en JSON
        onboardingData: JSON.stringify(data)
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?step=payment&canceled=true`,
      allow_promotion_codes: true
    })

    console.log(`✅ Checkout session créée: ${checkoutSession.id}`)
    console.log(`📦 Customer ID: ${customer.id}`)
    console.log(`🏢 Organisation sera créée après paiement: ${institutName}`)

    // Retourner l'URL de la session Stripe
    return NextResponse.json({
      url: checkoutSession.url
    })

  } catch (error: any) {
    console.error('❌ Erreur création checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
