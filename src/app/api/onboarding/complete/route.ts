import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

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

      selectedPlan,

      // Migration de données
      needsDataMigration,
      currentSoftware
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

    // Vérifier si le slug existe déjà et auto-incrémenter si nécessaire
    let finalSlug = slug
    let finalSubdomain = subdomain
    let counter = 1

    while (true) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          OR: [
            { slug: finalSlug },
            { subdomain: finalSubdomain }
          ]
        }
      })

      if (!existingOrg) {
        break // Slug disponible
      }

      // Incrémenter le slug
      counter++
      finalSlug = `${slug}-${counter}`
      finalSubdomain = `${subdomain}-${counter}`

      log.info(`⚠️ Slug existant, tentative avec: ${finalSlug}`)
    }

    if (counter > 1) {
      log.info(`✅ Slug unique trouvé: ${finalSlug}`)
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
        slug: finalSlug,
        siret,
        legalName
      }
    })

    // Créer une Stripe Checkout Session avec SEPA + Carte bancaire
    // IMPORTANT : Toutes les données d'onboarding sont stockées dans metadata
    // 💳 SEPA : Abonnements mensuels automatiques
    // 💳 Carte : Paiements uniques (migrations de données, services ponctuels)
    // 🔒 3D Secure automatique pour les cartes (DSP2/SCA)
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      payment_method_types: ['sepa_debit', 'card'], // SEPA + Carte bancaire avec 3DS
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
      subscription_data: {
        trial_period_days: 30, // 30 jours gratuits
        metadata: {
          type: 'onboarding',
          slug: finalSlug,
          plan: selectedPlan
        }
      },
      billing_address_collection: 'auto', // Utiliser l'adresse du customer
      customer_update: {
        address: 'auto', // Permettre la mise à jour de l'adresse
        name: 'auto'
      },
      metadata: {
        type: 'onboarding',
        // Stocker les données essentielles séparément (limite: 500 chars/champ)
        // Le webhook va récupérer toutes les infos depuis les champs individuels
        slug: finalSlug,
        subdomain: finalSubdomain,
        plan: selectedPlan,
        institutName,
        ownerFirstName,
        ownerLastName,
        ownerEmail,
        ownerPhone: ownerPhone || '',
        legalName,
        siret,
        billingEmail: billingEmail || ownerEmail,
        websiteTemplateId: data.websiteTemplateId || 'modern',
        needsDataMigration: needsDataMigration ? 'true' : 'false',
        currentSoftware: currentSoftware || ''
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?step=payment&canceled=true`,
      allow_promotion_codes: true,
      locale: 'fr' // Interface en français
    })

    log.info(`✅ Checkout session créée: ${checkoutSession.id}`)
    log.info(`📦 Customer ID: ${customer.id}`)
    log.info(`🏢 Organisation sera créée après paiement: ${institutName}`)

    // Retourner l'URL de la session Stripe
    return NextResponse.json({
      url: checkoutSession.url
    })

  } catch (error: any) {
    log.error('❌ Erreur création checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
