import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const organizationId = session.user.organizationId

    // Récupérer l'organisation ET sa config
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        config: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    const config = organization.config
    const org = organization

    // Compter le nombre de services
    const servicesCount = await prisma.service.count({
      where: { organizationId }
    })

    // Compter les packages
    const packagesCount = await prisma.service.count({
      where: {
        organizationId,
        isPackage: true
      }
    })

    // Compter les réservations
    const bookingsCount = await prisma.reservation.count({
      where: { organizationId }
    })

    // Compter les membres de l'équipe
    const teamMembersCount = await prisma.user.count({
      where: { organizationId }
    })

    // Compter les produits boutique
    const productsCount = await prisma.stock.count({
      where: { active: true }
    })

    // Compter les articles de blog
    const blogPostsCount = await prisma.blogPost.count({
      where: { organizationId }
    })

    // Compter les emplacements
    const locationsCount = await prisma.location.count({
      where: { organizationId }
    })

    // Helper pour vérifier si un champ est rempli
    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined || value === '') return false
      if (typeof value === 'string' && value.trim() === '') return false
      if (typeof value === 'object' && Object.keys(value).length === 0) return false
      if (value === '{}' || value === '[]') return false
      return true
    }

    // Calculer le taux de complétion pour TOUTES les sections du wizard (15 sections)
    const sections = {
      general: {
        label: 'Informations générales',
        fields: [
          { name: 'siteName', value: config?.siteName },
          { name: 'siteTagline', value: config?.siteTagline },
          { name: 'siteDescription', value: config?.siteDescription }
        ]
      },
      company: {
        label: 'Informations légales entreprise',
        fields: [
          { name: 'legalName', value: config?.legalName },
          { name: 'siret', value: config?.siret },
          { name: 'siren', value: config?.siren },
          { name: 'tvaNumber', value: config?.tvaNumber },
          { name: 'apeCode', value: config?.apeCode },
          { name: 'rcs', value: config?.rcs },
          { name: 'capital', value: config?.capital },
          { name: 'legalForm', value: config?.legalForm },
          { name: 'legalRepName', value: config?.legalRepName },
          { name: 'legalRepTitle', value: config?.legalRepTitle },
          { name: 'insuranceCompany', value: config?.insuranceCompany },
          { name: 'insuranceContract', value: config?.insuranceContract },
          { name: 'insuranceAddress', value: config?.insuranceAddress }
        ]
      },
      location: {
        label: 'Localisation',
        fields: [
          { name: 'address', value: config?.address },
          { name: 'city', value: config?.city },
          { name: 'postalCode', value: config?.postalCode },
          { name: 'country', value: config?.country },
          { name: 'latitude', value: config?.latitude },
          { name: 'longitude', value: config?.longitude },
          { name: 'googleMapsUrl', value: config?.googleMapsUrl }
        ]
      },
      contact: {
        label: 'Informations de contact',
        fields: [
          { name: 'email', value: config?.email },
          { name: 'phone', value: config?.phone },
          { name: 'whatsapp', value: config?.whatsapp }
        ]
      },
      hours: {
        label: 'Horaires d\'ouverture',
        fields: [
          { name: 'businessHours', value: config?.businessHours }
        ]
      },
      social: {
        label: 'Réseaux sociaux',
        fields: [
          { name: 'facebook', value: config?.facebook },
          { name: 'instagram', value: config?.instagram },
          { name: 'tiktok', value: config?.tiktok },
          { name: 'linkedin', value: config?.linkedin },
          { name: 'youtube', value: config?.youtube }
        ]
      },
      appearance: {
        label: 'Apparence et couleurs',
        fields: [
          { name: 'primaryColor', value: config?.primaryColor },
          { name: 'secondaryColor', value: config?.secondaryColor },
          { name: 'accentColor', value: config?.accentColor },
          { name: 'logoUrl', value: config?.logoUrl },
          { name: 'faviconUrl', value: config?.faviconUrl },
          { name: 'fontFamily', value: config?.fontFamily },
          { name: 'headingFont', value: config?.headingFont }
        ]
      },
      template: {
        label: 'Template web',
        fields: [
          { name: 'websiteTemplateId', value: org?.websiteTemplateId }
        ]
      },
      content: {
        label: 'Contenu page d\'accueil',
        fields: [
          { name: 'heroTitle', value: config?.heroTitle },
          { name: 'heroSubtitle', value: config?.heroSubtitle },
          { name: 'heroImage', value: config?.heroImage },
          { name: 'aboutText', value: config?.aboutText }
        ]
      },
      founder: {
        label: 'Fondateur / Fondatrice',
        fields: [
          { name: 'founderName', value: config?.founderName },
          { name: 'founderTitle', value: config?.founderTitle },
          { name: 'founderQuote', value: config?.founderQuote },
          { name: 'founderImage', value: config?.founderImage },
          { name: 'aboutIntro', value: config?.aboutIntro },
          { name: 'aboutParcours', value: config?.aboutParcours }
        ]
      },
      testimonials: {
        label: 'Témoignages & Formations',
        fields: [
          { name: 'testimonials', value: config?.testimonials },
          { name: 'formations', value: config?.formations }
        ]
      },
      seo: {
        label: 'SEO & Tracking',
        fields: [
          { name: 'baseUrl', value: config?.baseUrl },
          { name: 'defaultMetaTitle', value: config?.defaultMetaTitle },
          { name: 'defaultMetaDescription', value: config?.defaultMetaDescription },
          { name: 'defaultMetaKeywords', value: config?.defaultMetaKeywords },
          { name: 'googleAnalyticsId', value: config?.googleAnalyticsId },
          { name: 'facebookPixelId', value: config?.facebookPixelId },
          { name: 'googleVerificationCode', value: config?.googleVerificationCode },
          { name: 'metaVerificationCode', value: config?.metaVerificationCode }
        ]
      },
      google: {
        label: 'Google My Business',
        fields: [
          { name: 'googlePlaceId', value: config?.googlePlaceId },
          { name: 'autoSyncGoogleReviews', value: config?.autoSyncGoogleReviews }
        ]
      },
      finances: {
        label: 'Informations bancaires',
        fields: [
          { name: 'bankName', value: config?.bankName },
          { name: 'bankIban', value: config?.bankIban },
          { name: 'bankBic', value: config?.bankBic }
        ]
      },
      legal: {
        label: 'Mentions légales et CGV',
        fields: [
          { name: 'termsAndConditions', value: config?.termsAndConditions },
          { name: 'privacyPolicy', value: config?.privacyPolicy },
          { name: 'legalNotice', value: config?.legalNotice }
        ]
      },
      services: {
        label: 'Services et prestations',
        fields: [
          { name: 'service1', value: servicesCount >= 1 ? 'ok' : null },
          { name: 'service2', value: servicesCount >= 2 ? 'ok' : null },
          { name: 'service3', value: servicesCount >= 3 ? 'ok' : null }
        ]
      }
    }

    // Calculer le pourcentage pour chaque section
    const completionData: Record<string, any> = {}
    let totalFields = 0
    let completedFields = 0

    Object.entries(sections).forEach(([key, section]) => {
      const sectionTotal = section.fields.length
      const sectionCompleted = section.fields.filter(field => isFilled(field.value)).length

      const percentage = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0

      completionData[key] = {
        label: section.label,
        completed: sectionCompleted,
        total: sectionTotal,
        percentage,
        isCompleted: percentage === 100
      }

      totalFields += sectionTotal
      completedFields += sectionCompleted
    })

    // Pourcentage global
    const globalPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0

    // Stats pour le wizard intelligent (ancien système, gardé pour compatibilité)
    const wizardStats = {
      // PHASE 1
      hasTemplate: !!org?.websiteTemplateId,
      hasCustomColors: !!(config?.primaryColor && config?.secondaryColor),
      hasLogo: !!config?.logoUrl,
      hasServices: servicesCount > 0,
      hasBusinessHours: !!(config?.businessHours && config?.businessHours !== '{}'),

      // PHASE 2
      hasMultipleServices: servicesCount >= 3,
      hasPhotos: !!config?.heroImage,
      hasDescription: !!(config?.aboutText && config?.aboutText.length > 50),
      hasSocialMedia: !!(config?.instagram || config?.facebook || config?.tiktok),
      hasPackages: packagesCount > 0,
      hasStripeConfigured: !!org.stripeConnectedAccountId,
      hasLoyaltyProgram: false,

      // PHASE 3
      hasTeamMembers: teamMembersCount > 1,
      hasBookings: bookingsCount > 0,
      hasCRMConfigured: true,
      hasEmailConfigured: !!(config?.email && config?.email !== 'contact@mon-institut.fr'),
      hasBlogPost: blogPostsCount > 0,
      hasShopProducts: productsCount > 0,
      hasWhatsAppConfigured: !!config?.whatsapp,
      hasSocialMediaConfigured: !!(config?.instagram || config?.facebook),
      hasMultipleLocations: locationsCount > 1,
      hasNotificationsConfigured: false,
      hasSMSCredits: (org.smsCredits || 0) > 0
    }

    return NextResponse.json({
      globalPercentage,
      totalFields,
      completedFields,
      sections: completionData,
      wizardStats,
      plan: org.plan,
      features: {
        featureCRM: org.featureCRM,
        featureEmailing: org.featureEmailing,
        featureBlog: org.featureBlog,
        featureShop: org.featureShop,
        featureWhatsApp: org.featureWhatsApp,
        featureSocialMedia: org.featureSocialMedia,
        featureSMS: org.featureSMS
      }
    })

  } catch (error) {
    console.error('Erreur calcul complétion config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
