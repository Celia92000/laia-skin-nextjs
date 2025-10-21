import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedOrganization } from '@/lib/seed-organization'
import { createStripeCustomer } from '@/lib/stripe-service'
import { encrypt, validateIban, validateBic } from '@/lib/encryption-service'
import bcrypt from 'bcryptjs'
import { getAllOrganizations } from '@/lib/tenant-service'

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
    const user = await prisma.user.findUnique({
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

    return NextResponse.json({
      user,
      organizations,
      stats: {
        totalUsers,
        totalReservations,
        totalServices
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
    const user = await prisma.user.findUnique({
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
    const planPrices = {
      SOLO: 49,
      DUO: 99,
      TEAM: 199,
      PREMIUM: 399
    }
    const monthlyAmount = planPrices[data.plan as keyof typeof planPrices] || 49

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

    // Créer l'organisation avec les informations minimales + facturation + SEPA
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

    // Seed l'organisation avec des données de démonstration
    try {
      const seedResult = await seedOrganization(organization.id, organization.name)
      console.log('✅ Organisation seedée avec succès:', seedResult)
    } catch (seedError) {
      console.error('⚠️ Erreur lors du seed (non bloquant):', seedError)
      // On ne bloque pas la création même si le seed échoue
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
