import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import Stripe from 'stripe'
import { generateOrganizationTemplate } from '@/lib/template-generator'
import { sendWelcomeEmail, sendOnboardingGuide } from '@/lib/onboarding-emails'
import { createSubscriptionInvoice } from '@/lib/subscription-invoice-generator'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

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
      customDomain,
      useCustomDomain,
      city,
      address,
      postalCode,
      primaryColor,
      secondaryColor,

      // Premier service
      serviceName,
      servicePrice,
      serviceDuration,
      serviceDescription,

      // Horaires
      businessHours,

      // Informations légales et facturation
      legalName,
      siret,
      tvaNumber,
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

    // Validation des informations légales requises
    if (!legalName || !siret) {
      return NextResponse.json(
        { error: 'Informations légales obligatoires manquantes (raison sociale et SIRET)' },
        { status: 400 }
      )
    }

    // Validation du mandat SEPA
    if (!sepaIban || !sepaBic || !sepaAccountHolder || !sepaMandate) {
      return NextResponse.json(
        { error: 'Informations de mandat SEPA obligatoires manquantes' },
        { status: 400 }
      )
    }

    // Vérifier si le slug existe déjà
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

    // Utiliser l'email du propriétaire fourni dans le formulaire
    const adminEmail = ownerEmail
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Générer une référence unique de mandat SEPA (RUM)
    const sepaMandateRef = `LAIA-${slug.toUpperCase()}-${Date.now()}`
    const sepaMandateDate = new Date()

    // Créer l'organisation avec toutes les informations
    const organization = await prisma.organization.create({
      data: {
        name: institutName,
        slug,
        subdomain,
        domain: useCustomDomain && customDomain ? customDomain : null,

        // Informations du propriétaire
        ownerFirstName,
        ownerLastName,
        ownerEmail,
        ownerPhone,

        // Informations légales
        legalName,
        siret,
        tvaNumber: tvaNumber || null,

        // Informations de facturation
        billingEmail: billingEmail || ownerEmail,
        billingAddress: billingAddress || address,
        billingPostalCode: billingPostalCode || postalCode,
        billingCity: billingCity || city,
        billingCountry: billingCountry || 'France',

        // Mandat SEPA
        sepaIban,
        sepaBic,
        sepaAccountHolder,
        sepaMandate: true,
        sepaMandateRef,
        sepaMandateDate,

        // Plan et statut
        plan: selectedPlan,
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours

        // Configuration du site
        config: {
          create: {
            primaryColor,
            secondaryColor,
            siteName: institutName,
            siteDescription: `Institut de beauté ${institutName}`,
            contactEmail: ownerEmail,
            phone: ownerPhone || '',
            address: address || '',
            city: city || '',
            postalCode: postalCode || '',
            country: 'France',
            // Horaires d'ouverture
            businessHours: JSON.stringify(businessHours),
            // Informations légales dans la config aussi
            siret,
            tvaNumber: tvaNumber || null,
            legalName,
            legalRepName: `${ownerFirstName} ${ownerLastName}`,
            legalRepTitle: 'Gérant(e)'
          }
        },
        locations: {
          create: {
            name: institutName,
            isMainLocation: true,
            address: address || '',
            city: city || '',
            postalCode: postalCode || '',
            country: 'France',
            phone: ownerPhone || '',
            email: ownerEmail,
            businessHours: JSON.stringify(businessHours)
          }
        }
      },
      include: {
        locations: true,
        config: true
      }
    })

    // Créer l'utilisateur admin avec le nom du propriétaire
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: `${ownerFirstName} ${ownerLastName}`,
        phone: ownerPhone || null,
        password: hashedPassword,
        role: 'ORG_OWNER',
        organizationId: organization.id
      }
    })

    // Créer le premier service si fourni
    if (serviceName && servicePrice) {
      await prisma.service.create({
        data: {
          name: serviceName,
          slug: serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: serviceDescription || '',
          shortDescription: serviceDescription || '',
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration?.toString() || '60'),
          featured: true,
          active: true,
          organizationId: organization.id
        }
      })
    }

    // Prix par plan
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 89,
      TEAM: 149,
      PREMIUM: 249
    }

    const amount = planPrices[selectedPlan] || 49

    // Créer une Stripe Checkout Session avec prélèvement SEPA
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: adminEmail,
      payment_method_types: ['sepa_debit', 'card'], // Accepter SEPA et carte
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
          organizationId: organization.id,
          plan: selectedPlan,
          ownerName: `${ownerFirstName} ${ownerLastName}`,
          siret,
          sepaMandateRef
        }
      },
      metadata: {
        organizationId: organization.id,
        plan: selectedPlan,
        type: 'subscription',
        ownerName: `${ownerFirstName} ${ownerLastName}`,
        siret,
        sepaMandateRef
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?step=6&canceled=true`,
      allow_promotion_codes: true
    })

    // Enregistrer la session Stripe pour tracking
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        stripeCustomerId: checkoutSession.customer as string || null,
        stripeSubscriptionId: checkoutSession.subscription as string || null
      }
    })

    // Générer le template LAIA SKIN INSTITUT pour la nouvelle organisation
    try {
      await generateOrganizationTemplate({
        organizationId: organization.id,
        organizationName: institutName,
        plan: selectedPlan,
        ownerFirstName,
        ownerLastName,
        primaryColor,
        secondaryColor,
        initialService: serviceName ? {
          name: serviceName,
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration?.toString() || '60'),
          description: serviceDescription || ''
        } : undefined
      })
      console.log('✅ Template LAIA généré avec succès')
    } catch (templateError) {
      console.error('⚠️ Erreur lors de la génération du template:', templateError)
      // On continue même si le template échoue, l'organisation existe déjà
    }

    // Enregistrer le mot de passe temporaire dans l'organisation (pour le super admin)
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        initialPassword: tempPassword, // Mot de passe en clair (temporaire, sera changé par le client)
        onboardingCompletedAt: new Date()
      }
    })

    // Générer la facture d'activation
    let invoicePdfBuffer: Buffer | undefined
    let invoiceNumber: string | undefined

    try {
      const invoiceResult = await createSubscriptionInvoice(organization.id, true) // true = première facture
      invoicePdfBuffer = invoiceResult.pdfBuffer
      invoiceNumber = invoiceResult.invoiceNumber
      console.log(`✅ Facture ${invoiceNumber} générée`)
    } catch (invoiceError) {
      console.error('⚠️ Erreur génération facture (non bloquant):', invoiceError)
    }

    // Envoyer l'email de bienvenue avec les identifiants et la facture
    try {
      const adminUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
        : `https://${subdomain}.laia-connect.fr/admin`

      await sendWelcomeEmail({
        organizationName: institutName,
        ownerFirstName,
        ownerLastName,
        ownerEmail: adminEmail,
        tempPassword,
        plan: selectedPlan,
        subdomain,
        customDomain: useCustomDomain ? customDomain : undefined,
        adminUrl,
        monthlyAmount: amount,
        trialEndsAt: organization.trialEndsAt!,
        sepaMandateRef
      }, invoicePdfBuffer, invoiceNumber)

      // Envoyer le guide de démarrage 2 minutes après
      setTimeout(async () => {
        try {
          await sendOnboardingGuide({
            organizationName: institutName,
            ownerFirstName,
            ownerLastName,
            ownerEmail: adminEmail,
            tempPassword,
            plan: selectedPlan,
            subdomain,
            customDomain: useCustomDomain ? customDomain : undefined,
            adminUrl,
            monthlyAmount: amount,
            trialEndsAt: organization.trialEndsAt!,
            sepaMandateRef
          })
        } catch (guideError) {
          console.error('⚠️ Erreur envoi guide (non bloquant):', guideError)
        }
      }, 120000) // 2 minutes

      console.log('✅ Email de bienvenue envoyé avec facture')
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email (non bloquant):', emailError)
      // On ne bloque pas même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      organizationId: organization.id,
      adminEmail,
      tempPassword,
      checkoutUrl: checkoutSession.url,
      sepaMandateRef,
      message: 'Organisation créée avec succès. Vous allez être redirigé vers le paiement.'
    })

  } catch (error: any) {
    console.error('Erreur lors de l\'onboarding:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
