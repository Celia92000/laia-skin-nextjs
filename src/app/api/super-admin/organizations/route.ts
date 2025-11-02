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
      DUO: 89,       // 4% du revenu moyen
      TEAM: 149,     // 5% du revenu moyen
      PREMIUM: 249   // <3% du revenu moyen
    }
    const basePlanPrice = planPrices[data.plan as keyof typeof planPrices] || 49

    // Calculer le coût total des add-ons récurrents
    const selectedAddonsArray: string[] = data.selectedAddons || []
    const recurringAddonsTotal = calculateRecurringAddons(selectedAddonsArray)

    // Montant mensuel total = forfait de base + add-ons récurrents
    const monthlyAmount = basePlanPrice + recurringAddonsTotal

    // Date de fin d'essai (30 jours)
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Valider et chiffrer les données SEPA
    let encryptedIban: string | undefined
    let encryptedBic: string | undefined

    if (data.sepaIban && data.sepaBic) {
      // Valider l'IBAN
      if (!validateIban(data.sepaIban)) {
        return NextResponse.json(
          { error: 'IBAN invalide' },
          { status: 400 }
        )
      }

      // Valider le BIC
      if (!validateBic(data.sepaBic)) {
        return NextResponse.json(
          { error: 'BIC invalide' },
          { status: 400 }
        )
      }

      // Chiffrer les données sensibles
      encryptedIban = encrypt(data.sepaIban)
      encryptedBic = encrypt(data.sepaBic)
    }

    // Générer une référence unique de mandat SEPA (RUM)
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

    // Créer l'organisation avec les informations minimales + facturation + SEPA + addons
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

        // Informations SEPA pour prélèvement automatique (CHIFFRÉES)
        sepaIban: encryptedIban,
        sepaBic: encryptedBic,
        sepaAccountHolder: data.sepaAccountHolder,
        sepaMandateRef: sepaMandateRef,
        sepaMandateDate: new Date(), // Date de signature du mandat = aujourd'hui
        sepaMandate: data.sepaMandate, // Boolean: mandat accepté

        // Facturation automatique
        monthlyAmount: monthlyAmount,
        nextBillingDate: trialEndsAt, // Premier prélèvement = fin de l'essai

        maxLocations: data.plan === 'SOLO' ? 1 : data.plan === 'DUO' ? 1 : data.plan === 'TEAM' ? 3 : 999,
        maxUsers: data.plan === 'SOLO' ? 1 : data.plan === 'DUO' ? 3 : data.plan === 'TEAM' ? 10 : 999,
        maxStorage: data.plan === 'SOLO' ? 5 : data.plan === 'DUO' ? 10 : data.plan === 'TEAM' ? 50 : 999,
        trialEndsAt: trialEndsAt,

        // Features activées selon le forfait
        featureBlog: planFeatures.featureBlog,
        featureProducts: planFeatures.featureProducts,
        featureCRM: planFeatures.featureCRM,
        featureStock: planFeatures.featureStock,
        featureFormations: planFeatures.featureFormations,

        // Add-ons sélectionnés
        addons: serializedAddons,
      }
    })

    // Créer la configuration de l'organisation (avec valeurs par défaut + SIRET)
    await prisma.organizationConfig.create({
      data: {
        organizationId: organization.id,
        siteName: data.name,
        siteTagline: `Institut de Beauté à ${data.city}`,
        email: data.billingEmail || data.ownerEmail,
        phone: data.ownerPhone,
        city: data.city,
        siret: data.siret, // SIRET pour facturation
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

    // Créer le client Stripe avec mandat SEPA (utiliser les données NON chiffrées)
    if (data.sepaIban && data.sepaBic) {
      try {
        await createStripeCustomer({
          organizationId: organization.id,
          email: data.billingEmail || data.ownerEmail,
          name: data.legalName || data.name,
          iban: data.sepaIban, // Utiliser les données non chiffrées pour Stripe
          bic: data.sepaBic,   // Stripe chiffre ses propres données
        })
        console.log('✅ Client Stripe créé avec succès')
      } catch (stripeError) {
        console.error('⚠️ Erreur création client Stripe (non bloquant):', stripeError)
        // On ne bloque pas la création même si Stripe échoue
      }
    }

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
