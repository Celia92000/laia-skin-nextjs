import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les paramètres de l'organisation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification super admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer l'organisation et sa configuration
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        legalName: true,
        ownerEmail: true,
        billingEmail: true,
        billingAddress: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer la configuration complète
    const config = await prisma.organizationConfig.findUnique({
      where: { organizationId: id }
    })

    // Récupérer les autres paramètres
    const locations = await prisma.location.findMany({
      where: { organizationId: id },
      orderBy: { isMainLocation: 'desc' }
    })

    const paymentSettings = await prisma.paymentSettings.findUnique({
      where: { organizationId: id }
    })

    const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
      where: { organizationId: id }
    })

    const bookingSettings = await prisma.bookingSettings.findUnique({
      where: { organizationId: id }
    })

    return NextResponse.json({
      organization,
      config: config || {},
      locations: locations || [],
      paymentSettings: paymentSettings || {},
      loyaltyProgram: loyaltyProgram || {},
      bookingSettings: bookingSettings || {}
    })

  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres de l'organisation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification super admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { config, paymentSettings, loyaltyProgram, bookingSettings } = await request.json()

    // Mettre à jour la configuration de l'organisation
    const updatedConfig = await prisma.organizationConfig.upsert({
      where: { organizationId: id },
      create: {
        organizationId: id,
        // Informations de base
        siteName: config.siteName,
        siteTagline: config.siteTagline,
        siteDescription: config.siteDescription,

        // Contact
        email: config.email,
        phone: config.phone,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country || 'France',

        // Réseaux sociaux
        instagram: config.instagram,
        facebook: config.facebook,
        tiktok: config.tiktok,
        whatsapp: config.whatsapp,
        linkedin: config.linkedin,
        youtube: config.youtube,

        // Apparence
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,

        // Informations légales
        siret: config.siret,
        legalName: config.legalName,
        siren: config.siren,
        tvaNumber: config.tvaNumber,
        apeCode: config.apeCode,
        rcs: config.rcs,
        capital: config.capital,
        legalForm: config.legalForm,

        // Assurance
        insuranceCompany: config.insuranceCompany,
        insuranceContract: config.insuranceContract,
        insuranceAddress: config.insuranceAddress,

        // Banque
        bankName: config.bankName,
        bankIban: config.bankIban,
        bankBic: config.bankBic,

        // Hero section
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        heroImage: config.heroImage,

        // À propos
        aboutText: config.aboutText,
        aboutIntro: config.aboutIntro,
        aboutParcours: config.aboutParcours,

        // Fondateur
        founderName: config.founderName,
        founderTitle: config.founderTitle,
        founderQuote: config.founderQuote,
        founderImage: config.founderImage,

        // Horaires
        businessHours: config.businessHours,

        // Géolocalisation
        latitude: config.latitude,
        longitude: config.longitude,
        googleMapsUrl: config.googleMapsUrl,

        // Typographie
        fontFamily: config.fontFamily,
        headingFont: config.headingFont,
        baseFontSize: config.baseFontSize,
        headingSize: config.headingSize,

        // CGV et mentions légales
        termsAndConditions: config.termsAndConditions,
        privacyPolicy: config.privacyPolicy,
        legalNotice: config.legalNotice,

        // Emails
        emailSignature: config.emailSignature,
        welcomeEmailText: config.welcomeEmailText,

        // Représentant légal
        legalRepName: config.legalRepName,
        legalRepTitle: config.legalRepTitle,

        // Analytics
        googleAnalyticsId: config.googleAnalyticsId,
        facebookPixelId: config.facebookPixelId,
        metaVerificationCode: config.metaVerificationCode,
        googleVerificationCode: config.googleVerificationCode,

        // SEO
        defaultMetaTitle: config.defaultMetaTitle,
        defaultMetaDescription: config.defaultMetaDescription,
        defaultMetaKeywords: config.defaultMetaKeywords,
      },
      update: {
        // Informations de base
        siteName: config.siteName,
        siteTagline: config.siteTagline,
        siteDescription: config.siteDescription,

        // Contact
        email: config.email,
        phone: config.phone,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country || 'France',

        // Réseaux sociaux
        instagram: config.instagram,
        facebook: config.facebook,
        tiktok: config.tiktok,
        whatsapp: config.whatsapp,
        linkedin: config.linkedin,
        youtube: config.youtube,

        // Apparence
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,

        // Informations légales
        siret: config.siret,
        legalName: config.legalName,
        siren: config.siren,
        tvaNumber: config.tvaNumber,
        apeCode: config.apeCode,
        rcs: config.rcs,
        capital: config.capital,
        legalForm: config.legalForm,

        // Assurance
        insuranceCompany: config.insuranceCompany,
        insuranceContract: config.insuranceContract,
        insuranceAddress: config.insuranceAddress,

        // Banque
        bankName: config.bankName,
        bankIban: config.bankIban,
        bankBic: config.bankBic,

        // Hero section
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        heroImage: config.heroImage,

        // À propos
        aboutText: config.aboutText,
        aboutIntro: config.aboutIntro,
        aboutParcours: config.aboutParcours,

        // Fondateur
        founderName: config.founderName,
        founderTitle: config.founderTitle,
        founderQuote: config.founderQuote,
        founderImage: config.founderImage,

        // Horaires
        businessHours: config.businessHours,

        // Géolocalisation
        latitude: config.latitude,
        longitude: config.longitude,
        googleMapsUrl: config.googleMapsUrl,

        // Typographie
        fontFamily: config.fontFamily,
        headingFont: config.headingFont,
        baseFontSize: config.baseFontSize,
        headingSize: config.headingSize,

        // CGV et mentions légales
        termsAndConditions: config.termsAndConditions,
        privacyPolicy: config.privacyPolicy,
        legalNotice: config.legalNotice,

        // Emails
        emailSignature: config.emailSignature,
        welcomeEmailText: config.welcomeEmailText,

        // Représentant légal
        legalRepName: config.legalRepName,
        legalRepTitle: config.legalRepTitle,

        // Analytics
        googleAnalyticsId: config.googleAnalyticsId,
        facebookPixelId: config.facebookPixelId,
        metaVerificationCode: config.metaVerificationCode,
        googleVerificationCode: config.googleVerificationCode,

        // SEO
        defaultMetaTitle: config.defaultMetaTitle,
        defaultMetaDescription: config.defaultMetaDescription,
        defaultMetaKeywords: config.defaultMetaKeywords,
      }
    })

    // Mettre à jour les paramètres de paiement
    if (paymentSettings) {
      await prisma.paymentSettings.upsert({
        where: { organizationId: id },
        create: {
          organizationId: id,
          onlinePaymentEnabled: paymentSettings.onlinePaymentEnabled ?? true,
          onSitePaymentEnabled: paymentSettings.onSitePaymentEnabled ?? true,
          stripeAccountId: paymentSettings.stripeAccountId,
          stripeLiveMode: paymentSettings.stripeLiveMode ?? false,
        },
        update: {
          onlinePaymentEnabled: paymentSettings.onlinePaymentEnabled,
          onSitePaymentEnabled: paymentSettings.onSitePaymentEnabled,
          stripeAccountId: paymentSettings.stripeAccountId,
          stripeLiveMode: paymentSettings.stripeLiveMode,
        }
      })
    }

    // Mettre à jour le programme de fidélité
    if (loyaltyProgram) {
      await prisma.loyaltyProgram.upsert({
        where: { organizationId: id },
        create: {
          organizationId: id,
          enabled: loyaltyProgram.enabled ?? false,
          pointsPerEuro: loyaltyProgram.pointsPerEuro ?? 1,
          pointValue: loyaltyProgram.pointValue ?? 0.01,
          minPointsForRedemption: loyaltyProgram.minPointsForRedemption ?? 100,
        },
        update: {
          enabled: loyaltyProgram.enabled,
          pointsPerEuro: loyaltyProgram.pointsPerEuro,
          pointValue: loyaltyProgram.pointValue,
          minPointsForRedemption: loyaltyProgram.minPointsForRedemption,
        }
      })
    }

    // Mettre à jour les paramètres de réservation
    if (bookingSettings) {
      await prisma.bookingSettings.upsert({
        where: { organizationId: id },
        create: {
          organizationId: id,
          minBookingDelay: bookingSettings.minBookingDelay ?? 24,
          maxBookingDelay: bookingSettings.maxBookingDelay ?? 90,
          slotDuration: bookingSettings.slotDuration ?? 30,
          autoConfirm: bookingSettings.autoConfirm ?? true,
          requireDeposit: bookingSettings.requireDeposit ?? false,
          depositPercentage: bookingSettings.depositPercentage ?? 30,
          cancellationDeadline: bookingSettings.cancellationDeadline ?? 24,
        },
        update: {
          minBookingDelay: bookingSettings.minBookingDelay,
          maxBookingDelay: bookingSettings.maxBookingDelay,
          slotDuration: bookingSettings.slotDuration,
          autoConfirm: bookingSettings.autoConfirm,
          requireDeposit: bookingSettings.requireDeposit,
          depositPercentage: bookingSettings.depositPercentage,
          cancellationDeadline: bookingSettings.cancellationDeadline,
        }
      })
    }

    return NextResponse.json({
      message: 'Paramètres mis à jour avec succès',
      config: updatedConfig
    })

  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
