import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedOrganization } from '@/lib/seed-organization'
import { generateOrganizationTemplate } from '@/lib/template-generator'
import { createStripeCustomer } from '@/lib/stripe-service'
import { encrypt, validateIban, validateBic } from '@/lib/encryption-service'
import bcrypt from 'bcryptjs'
import { getAllOrganizations } from '@/lib/tenant-service'
import { getFeaturesForPlan } from '@/lib/features'
import { serializeOrganizationAddons, getAddonById, calculateRecurringAddons, calculateOneTimeAddons } from '@/lib/addons'
import type { OrganizationAddons, AddonPurchaseHistory } from '@/lib/addons'
import { OrgPlan } from '@prisma/client'
import { generateInvoiceNumber, getCurrentBillingPeriod, getNextBillingDate } from '@/lib/subscription-billing'
import { sendInvoiceEmail } from '@/lib/email-service'
import { sendWelcomeEmail, sendSuperAdminNotification } from '@/lib/onboarding-emails'
import { createOnboardingContract } from '@/lib/contract-generator'
import { createSubscriptionInvoice } from '@/lib/subscription-invoice-generator'

export async function GET() {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer toutes les organisations
    const organizations = await getAllOrganizations()

    // Statistiques globales
    const totalUsers = await prisma.user.count()
    const totalReservations = await prisma.reservation.count()
    const totalServices = await prisma.service.count()

    // Enrichir chaque organisation avec les statistiques utilisateurs
    const organizationsWithUserStats = await Promise.all(
      organizations.map(async (org) => {
        // Récupérer tous les utilisateurs de cette organisation avec leur rôle
        const users = await prisma.user.findMany({
          where: { organizationId: org.id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                reservations: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        // Séparer les clients des membres de l'équipe (staff)
        const clients = users.filter(u => u.role === 'CLIENT')
        const staffMembers = users.filter(u => u.role !== 'CLIENT')

        // Compter les utilisateurs par rôle
        const usersByRole = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Mapper les rôles vers des labels français pour l'équipe
        const roleLabels: Record<string, string> = {
          'ORG_OWNER': 'Propriétaire',
          'ORG_ADMIN': 'Administrateur',
          'LOCATION_MANAGER': 'Responsable d\'établissement',
          'STAFF': 'Praticien(ne)',
          'EMPLOYEE': 'Employé(e)',
          'RECEPTIONIST': 'Réceptionniste',
          'ACCOUNTANT': 'Comptable',
          'SUPER_ADMIN': 'Super Admin LAIA'
        }

        // Statistiques d'activité pour cette organisation
        const [
          totalOrgReservations,
          totalOrgServices,
          activeOrgServices,
          totalOrgProducts
        ] = await Promise.all([
          prisma.reservation.count({
            where: { user: { organizationId: org.id } }
          }),
          prisma.service.count({
            where: { organizationId: org.id }
          }),
          prisma.service.count({
            where: { organizationId: org.id, active: true }
          }),
          prisma.product.count({
            where: { organizationId: org.id }
          })
        ])

        return {
          ...org,
          userStats: {
            total: users.length,
            byRole: usersByRole,
            totalClients: clients.length,
            totalStaff: staffMembers.length
          },
          // 👥 ÉQUIPE DE L'INSTITUT (Staff accounts)
          staffAccounts: staffMembers.map(staff => ({
            id: staff.id,
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
            roleLabel: roleLabels[staff.role] || staff.role,
            createdAt: staff.createdAt,
            lastLogin: staff.lastLoginAt
          })),
          // 👤 CLIENTS DE L'INSTITUT
          topClients: clients
            .sort((a, b) => b._count.reservations - a._count.reservations)
            .slice(0, 5)
            .map(client => ({
              id: client.id,
              name: client.name,
              email: client.email,
              reservationCount: client._count.reservations,
              createdAt: client.createdAt,
              lastLogin: client.lastLoginAt
            })),
          activityStats: {
            reservations: totalOrgReservations,
            services: totalOrgServices,
            activeServices: activeOrgServices,
            products: totalOrgProducts
          }
        }
      })
    )

    // Calculer les statistiques globales des comptes staff
    const globalStaffCount = organizationsWithUserStats.reduce((sum, org) => sum + org.userStats.totalStaff, 0)
    const globalClientCount = organizationsWithUserStats.reduce((sum, org) => sum + org.userStats.totalClients, 0)

    // Compter les rôles staff globalement
    const globalStaffByRole = organizationsWithUserStats.reduce((acc, org) => {
      Object.entries(org.userStats.byRole).forEach(([role, count]) => {
        if (role !== 'CLIENT') {
          acc[role] = (acc[role] || 0) + count
        }
      })
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      user,
      organizations: organizationsWithUserStats,
      stats: {
        totalUsers,
        totalReservations,
        totalServices,
        totalOrganizations: organizations.length,
        activeOrganizations: organizations.filter(o => o.status === 'ACTIVE' || o.status === 'TRIAL').length,
        // 📊 Statistiques des comptes
        totalClients: globalClientCount,
        totalStaff: globalStaffCount,
        staffByRole: globalStaffByRole
      }
    })

  } catch (error) {
    console.error('Erreur récupération organisations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

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

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les données du formulaire
    const data = await request.json()

    // Vérifier que le slug et subdomain sont uniques
    const existingOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: data.slug },
          { subdomain: data.subdomain }
        ]
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Le slug ou subdomain existe déjà' },
        { status: 400 }
      )
    }

    // Calculer le montant mensuel selon le plan
    // Prix adaptés aux revenus des instituts esthétiques
    const planPrices = {
      SOLO: 49,      // 3% du revenu moyen
      DUO: 69,       // 4% du revenu moyen
      TEAM: 119,     // 5% du revenu moyen
      PREMIUM: 179   // <3% du revenu moyen
    }
    const basePlanPrice = planPrices[data.plan as keyof typeof planPrices] || 49

    // Calculer le coût total des add-ons récurrents
    const selectedAddonsArray: string[] = data.selectedAddons || []
    const recurringAddonsTotal = calculateRecurringAddons(selectedAddonsArray)

    // Ajouter le prix custom des déblocages spéciaux (négociation)
    const customAddonPrice = parseFloat(data.customAddonPrice) || 0

    // Montant mensuel total = forfait de base + add-ons récurrents + déblocages custom
    const monthlyAmount = basePlanPrice + recurringAddonsTotal + customAddonPrice

    // Date de fin d'essai (30 jours)
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Les données bancaires sont gérées par Stripe - pas de stockage direct
    const sepaMandateRef = `LAIA-${data.slug.toUpperCase()}-${Date.now()}`

    // Obtenir les features selon le plan choisi
    const planFeatures = getFeaturesForPlan(data.plan as OrgPlan)

    // Traiter les add-ons sélectionnés
    const selectedAddons: string[] = data.selectedAddons || []
    const addonsHistory: AddonPurchaseHistory[] = []
    const recurringAddons: string[] = []
    const oneTimeAddons: string[] = []

    // Trier les addons par type et créer l'historique
    for (const addonId of selectedAddons) {
      const addon = getAddonById(addonId)
      if (addon) {
        if (addon.type === 'recurring') {
          recurringAddons.push(addonId)
        } else {
          oneTimeAddons.push(addonId)
        }

        addonsHistory.push({
          addonId: addon.id,
          purchaseDate: new Date().toISOString(),
          price: addon.price,
          type: addon.type,
          status: addon.type === 'recurring' ? 'active' : 'completed',
        })
      }
    }

    // Créer l'objet addons à stocker
    const organizationAddons: OrganizationAddons = {
      recurring: recurringAddons,
      oneTime: oneTimeAddons,
      history: addonsHistory,
    }

    const serializedAddons = serializeOrganizationAddons(organizationAddons)

    // Créer l'organisation avec les informations minimales + facturation + SEPA + addons + template
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        legalName: data.legalName || data.name, // Raison sociale ou nom commercial
        type: 'SINGLE_LOCATION', // Par défaut un seul emplacement
        subdomain: data.subdomain,
        domain: null, // Sera configuré plus tard si besoin
        plan: data.plan,
        status: 'TRIAL', // Démarrer en période d'essai
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone || null,
        billingEmail: data.billingEmail || data.ownerEmail, // Email de facturation
        billingAddress: data.billingAddress || null, // Adresse de facturation

        // Mandat SEPA géré par Stripe (pas de stockage des données bancaires)
        sepaMandateRef: sepaMandateRef,
        sepaMandateDate: new Date(), // Date de création du mandat

        // Facturation automatique
        monthlyAmount: monthlyAmount,
        nextBillingDate: trialEndsAt, // Premier prélèvement = fin de l'essai

        maxLocations: data.plan === 'SOLO' ? 1 : data.plan === 'DUO' ? 1 : data.plan === 'TEAM' ? 3 : 999,
        maxUsers: data.plan === 'SOLO' ? 1 : data.plan === 'DUO' ? 3 : data.plan === 'TEAM' ? 10 : 999,
        maxStorage: data.plan === 'SOLO' ? 5 : data.plan === 'DUO' ? 10 : data.plan === 'TEAM' ? 50 : 999,
        trialEndsAt: trialEndsAt,

        // Template de site web
        websiteTemplateId: data.websiteTemplateId || 'modern',

        // Features activées selon le forfait + déblocages custom (négociation)
        featureBlog: data.customFeatureBlog || planFeatures.featureBlog,
        featureProducts: data.customFeatureShop || planFeatures.featureProducts,
        featureCRM: data.customFeatureCRM || planFeatures.featureCRM,
        featureStock: data.customFeatureStock || planFeatures.featureStock,
        featureFormations: planFeatures.featureFormations,
        featureEmailing: data.customFeatureEmailing || planFeatures.featureEmailing || false,
        featureWhatsApp: data.customFeatureWhatsApp || planFeatures.featureWhatsApp || false,
        featureSMS: data.customFeatureSMS || planFeatures.featureSMS || false,
        featureSocialMedia: data.customFeatureSocialMedia || planFeatures.featureSocialMedia || false,

        // Add-ons sélectionnés
        addons: serializedAddons,
      }
    })

    // Créer la configuration de l'organisation (avec valeurs par défaut + SIRET + couleurs)
    await prisma.organizationConfig.create({
      data: {
        organizationId: organization.id,
        siteName: data.name,
        siteTagline: `Institut de Beauté à ${data.city}`,
        email: data.billingEmail || data.ownerEmail,
        phone: data.ownerPhone,
        city: data.city,
        siret: data.siret, // SIRET pour facturation
        // Couleurs du template
        primaryColor: data.primaryColor || '#d4b5a0',
        secondaryColor: data.secondaryColor || '#c9a084',
        accentColor: data.accentColor || '#2c3e50',
        // Le reste sera configuré par l'admin
      }
    })

    // Créer l'emplacement principal
    await prisma.location.create({
      data: {
        organizationId: organization.id,
        name: `${data.name} - ${data.city}`,
        slug: 'principal',
        address: `À configurer - ${data.city}`,
        city: data.city,
        postalCode: '00000', // À définir par l'admin
        isMainLocation: true,
        active: true
      }
    })

    // Créer les paramètres de paiement
    await prisma.paymentSettings.create({
      data: {
        organizationId: organization.id,
        primaryProvider: 'STRIPE'
      }
    })

    // Créer les paramètres de réservation
    await prisma.bookingSettings.create({
      data: {
        organizationId: organization.id
      }
    })

    // Créer le programme de fidélité (désactivé par défaut)
    await prisma.loyaltyProgramSettings.create({
      data: {
        organizationId: organization.id,
        isEnabled: false
      }
    })

    // Générer un mot de passe aléatoire ultra-sécurisé
    const generateSecurePassword = () => {
      const length = 16 // Augmenté à 16 caractères
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const lowercase = 'abcdefghijklmnopqrstuvwxyz'
      const numbers = '0123456789'
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const allChars = uppercase + lowercase + numbers + specialChars

      let password = ''

      // Garantir au moins 2 de chaque type pour plus de sécurité
      password += uppercase[Math.floor(Math.random() * uppercase.length)]
      password += uppercase[Math.floor(Math.random() * uppercase.length)]
      password += lowercase[Math.floor(Math.random() * lowercase.length)]
      password += lowercase[Math.floor(Math.random() * lowercase.length)]
      password += numbers[Math.floor(Math.random() * numbers.length)]
      password += numbers[Math.floor(Math.random() * numbers.length)]
      password += specialChars[Math.floor(Math.random() * specialChars.length)]
      password += specialChars[Math.floor(Math.random() * specialChars.length)]

      // Remplir le reste avec des caractères aléatoires
      for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
      }

      // Mélanger de manière plus robuste (Fisher-Yates shuffle)
      const arr = password.split('')
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }

      return arr.join('')
    }

    const generatedPassword = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(generatedPassword, 10)

    // Utiliser l'email du propriétaire comme identifiant de connexion
    const adminUser = await prisma.user.create({
      data: {
        organizationId: organization.id,
        email: data.ownerEmail,
        password: hashedPassword,
        name: data.ownerEmail.split('@')[0],
        role: 'ORG_ADMIN',
        phone: data.ownerPhone
      }
    })

    // Stocker le mot de passe temporaire chiffré dans l'organisation
    try {
      const encryptedTempPassword = encrypt(generatedPassword)
      await prisma.organization.update({
        where: { id: organization.id },
        data: { temporaryPassword: encryptedTempPassword }
      })
    } catch (error) {
      console.error('⚠️ Erreur stockage mot de passe temporaire (non bloquant):', error)
    }

    // Le client Stripe sera créé lors du premier paiement via Checkout SEPA
    console.log('ℹ️ Client Stripe sera créé automatiquement lors du premier paiement')

    // Générer une facture immédiate pour les add-ons ponctuels (Migration Assistée, etc.)
    const oneTimeTotal = calculateOneTimeAddons(selectedAddonsArray)

    if (oneTimeTotal > 0) {
      try {
        const invoiceNumber = generateInvoiceNumber()
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours pour payer

        // Créer les lignes de la facture pour les add-ons ponctuels
        const lineItems = oneTimeAddons.map(addonId => {
          const addon = getAddonById(addonId)
          if (!addon) return null

          return {
            description: addon.name,
            quantity: 1,
            unitPrice: addon.price,
            total: addon.price
          }
        }).filter(Boolean)

        // Créer la facture
        const oneTimeInvoice = await prisma.invoice.create({
          data: {
            organizationId: organization.id,
            invoiceNumber,
            amount: oneTimeTotal,
            plan: data.plan,
            status: 'PENDING',
            issueDate: new Date(),
            dueDate,
            description: 'Services ponctuels (aide au démarrage)',
            metadata: {
              type: 'one-time-addons',
              lineItems: lineItems
            } as any
          }
        })

        console.log(`✅ Facture ${invoiceNumber} générée pour les services ponctuels : ${oneTimeTotal}€`)

        // Envoyer la facture immédiatement par email
        try {
          await sendInvoiceEmail({
            organizationName: data.name,
            ownerEmail: data.billingEmail || data.ownerEmail,
            invoiceNumber,
            amount: oneTimeTotal,
            dueDate,
            plan: data.plan,
            lineItems: lineItems as any,
          })
          console.log(`📧 Facture ${invoiceNumber} envoyée par email à ${data.billingEmail || data.ownerEmail}`)
        } catch (emailError) {
          console.error('⚠️ Erreur envoi email facture (non bloquant):', emailError)
          // Ne pas bloquer la création si l'email échoue
        }
      } catch (invoiceError) {
        console.error('⚠️ Erreur génération facture services ponctuels (non bloquant):', invoiceError)
      }
    }

    // Générer une facture pour le premier mois d'abonnement (après la période d'essai)
    try {
      const subscriptionInvoiceNumber = generateInvoiceNumber()
      const subscriptionDueDate = trialEndsAt // Échéance = fin de période d'essai

      // Créer les lignes de la facture pour l'abonnement
      const subscriptionLineItems = []

      // Ligne pour le plan de base
      subscriptionLineItems.push({
        description: `Abonnement ${data.plan} - Premier mois`,
        quantity: 1,
        unitPrice: basePlanPrice,
        total: basePlanPrice
      })

      // Lignes pour les add-ons récurrents
      for (const addonId of recurringAddons) {
        const addon = getAddonById(addonId)
        if (addon) {
          subscriptionLineItems.push({
            description: `${addon.name} (mensuel)`,
            quantity: 1,
            unitPrice: addon.price,
            total: addon.price
          })
        }
      }

      // Créer la facture d'abonnement
      const subscriptionInvoice = await prisma.invoice.create({
        data: {
          organizationId: organization.id,
          invoiceNumber: subscriptionInvoiceNumber,
          amount: monthlyAmount, // Montant total mensuel (plan + addons récurrents)
          plan: data.plan,
          status: 'PENDING',
          issueDate: new Date(),
          dueDate: subscriptionDueDate,
          description: `Abonnement ${data.plan} - Premier mois après période d'essai`,
          metadata: {
            type: 'subscription',
            period: 'first-month',
            lineItems: subscriptionLineItems
          } as any
        }
      })

      console.log(`✅ Facture ${subscriptionInvoiceNumber} générée pour l'abonnement : ${monthlyAmount}€/mois`)

      // Envoyer la facture par email
      try {
        await sendInvoiceEmail({
          organizationName: data.name,
          ownerEmail: data.billingEmail || data.ownerEmail,
          invoiceNumber: subscriptionInvoiceNumber,
          amount: monthlyAmount,
          dueDate: subscriptionDueDate,
          plan: data.plan,
          lineItems: subscriptionLineItems as any,
        })
        console.log(`📧 Facture d'abonnement ${subscriptionInvoiceNumber} envoyée par email`)
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email facture abonnement (non bloquant):', emailError)
      }
    } catch (invoiceError) {
      console.error('⚠️ Erreur génération facture abonnement (non bloquant):', invoiceError)
    }

    // Générer le template LAIA SKIN INSTITUT pour la nouvelle organisation
    try {
      const templateResult = await generateOrganizationTemplate({
        organizationId: organization.id,
        organizationName: data.name,
        plan: data.plan,
        ownerFirstName: data.ownerFirstName || data.ownerEmail.split('@')[0],
        ownerLastName: data.ownerLastName || '',
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        selectedAddons: data.selectedAddons || [] // Passer les add-ons achetés
      })
      console.log('✅ Template LAIA généré:', templateResult)
      if (data.selectedAddons && data.selectedAddons.length > 0) {
        console.log('✅ Add-ons activés:', data.selectedAddons)
      }
    } catch (templateError) {
      console.error('⚠️ Erreur lors de la génération du template (non bloquant):', templateError)
      // On ne bloque pas la création même si le template échoue
    }

    // Générer facture et contrat
    let invoicePdfBuffer: Buffer | undefined
    let invoiceNumber: string | undefined
    let contractPdfBuffer: Buffer | undefined
    let contractNumber: string | undefined

    const planPricesEmail: Record<string, number> = {
      SOLO: 49,
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179
    }

    try {
      const invoiceResult = await createSubscriptionInvoice(organization.id, true, false)
      invoicePdfBuffer = invoiceResult.pdfBuffer
      invoiceNumber = invoiceResult.invoiceNumber
      console.log(`✅ Facture générée: ${invoiceNumber}`)
    } catch (error) {
      console.error('⚠️ Erreur facture:', error)
    }

    try {
      const contractResult = await createOnboardingContract({
        organizationName: data.name,
        legalName: data.legalName,
        siret: data.siret,
        tvaNumber: data.tvaNumber,
        billingAddress: data.billingAddress,
        billingPostalCode: data.billingPostalCode,
        billingCity: data.billingCity,
        billingCountry: data.billingCountry || 'France',
        ownerFirstName: data.ownerFirstName || data.ownerEmail.split('@')[0],
        ownerLastName: data.ownerLastName || '',
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
        plan: data.plan,
        monthlyAmount: monthlyAmount,
        trialEndsAt: trialEndsAt,
        subscriptionStartDate: new Date(),
        sepaMandateRef: sepaMandateRef,
        sepaMandateDate: new Date()
      })
      contractPdfBuffer = contractResult.pdfBuffer
      contractNumber = contractResult.contractNumber
      console.log(`✅ Contrat généré: ${contractNumber}`)

      // Sauvegarder les infos du contrat dans l'organisation
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          contractNumber: contractResult.contractNumber,
          contractPdfPath: contractResult.pdfPath,
          contractSignedAt: new Date()
        }
      })
      console.log(`✅ Contrat sauvegardé dans l'organisation: ${contractResult.pdfPath}`)
    } catch (error) {
      console.error('⚠️ Erreur contrat:', error)
    }

    // Envoyer email de bienvenue
    try {
      const adminUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
        : `https://${data.subdomain}.laia-connect.fr/admin`

      await sendWelcomeEmail({
        organizationName: data.name,
        ownerFirstName: data.ownerFirstName || data.ownerEmail.split('@')[0],
        ownerLastName: data.ownerLastName || '',
        ownerEmail: data.ownerEmail,
        tempPassword: generatedPassword,
        plan: data.plan,
        subdomain: data.subdomain,
        customDomain: data.customDomain,
        adminUrl,
        monthlyAmount: monthlyAmount,
        trialEndsAt: trialEndsAt,
        sepaMandateRef: sepaMandateRef
      }, invoicePdfBuffer, invoiceNumber, contractPdfBuffer, contractNumber)
      console.log('✅ Email de bienvenue envoyé')
    } catch (error) {
      console.error('⚠️ Erreur email bienvenue:', error)
    }

    // Envoyer notification au super-admin
    try {
      await sendSuperAdminNotification({
        organizationId: organization.id,
        organizationName: data.name,
        ownerFirstName: data.ownerFirstName || data.ownerEmail.split('@')[0],
        ownerLastName: data.ownerLastName || '',
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
        city: data.city,
        plan: data.plan,
        monthlyAmount: monthlyAmount,
        siret: data.siret,
        legalName: data.legalName,
        subdomain: data.subdomain,
        customDomain: data.customDomain,
        trialEndsAt: trialEndsAt,
        createdAt: organization.createdAt
      })
      console.log('✅ Notification super-admin envoyée')
    } catch (error) {
      console.error('⚠️ Erreur notification super-admin:', error)
    }

    return NextResponse.json({
      id: organization.id,
      message: 'Organisation créée avec succès',
      adminEmail: data.ownerEmail, // Email du propriétaire utilisé comme identifiant
      defaultPassword: generatedPassword // Mot de passe ultra-sécurisé (16 caractères)
    })

  } catch (error) {
    console.error('Erreur création organisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
