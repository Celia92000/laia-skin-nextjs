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

    // Récupérer l'organisation ET sa config (l'onboarding remplit Organization, la config remplit OrganizationConfig)
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

    // Compter les produits boutique (Stock est global, pas lié à l'organisation)
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

    // Calculer les stats pour le wizard
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
      hasLoyaltyProgram: false, // À implémenter plus tard

      // PHASE 3
      hasTeamMembers: teamMembersCount > 1,
      hasBookings: bookingsCount > 0,
      hasCRMConfigured: true, // CRM est toujours disponible
      hasEmailConfigured: !!(config?.email && config?.email !== 'contact@mon-institut.fr'),
      hasBlogPost: blogPostsCount > 0,
      hasShopProducts: productsCount > 0,
      hasWhatsAppConfigured: !!config?.whatsapp,
      hasSocialMediaConfigured: !!(config?.instagram || config?.facebook),
      hasMultipleLocations: locationsCount > 1,
      hasNotificationsConfigured: false, // À implémenter plus tard
      hasSMSCredits: (org.smsCredits || 0) > 0
    }

    // Calculer le taux de complétion pour chaque section (ancien système)
    const sections = {
      services: {
        label: 'Services additionnels',
        fields: [
          { name: 'service1', value: servicesCount >= 1 ? 'ok' : null },
          { name: 'service2', value: servicesCount >= 2 ? 'ok' : null },
          { name: 'service3', value: servicesCount >= 3 ? 'ok' : null }
        ]
      },
      appearance: {
        label: 'Couleur accent (facultatif)',
        fields: [
          { name: 'accentColor', value: config?.accentColor }
        ]
      },
      seo: {
        label: 'SEO avancé (facultatif)',
        fields: [
          { name: 'defaultMetaTitle', value: config?.defaultMetaTitle },
          { name: 'defaultMetaDescription', value: config?.defaultMetaDescription },
          { name: 'defaultMetaKeywords', value: config?.defaultMetaKeywords }
        ]
      }
    }

    // Calculer le pourcentage pour chaque section
    const completionData: Record<string, any> = {}
    let totalFields = 0
    let completedFields = 0

    Object.entries(sections).forEach(([key, section]) => {
      const sectionTotal = section.fields.length
      const sectionCompleted = section.fields.filter(field => {
        const value = field.value
        if (value === null || value === undefined || value === '') return false
        if (typeof value === 'string' && value.trim() === '') return false
        if (typeof value === 'object' && Object.keys(value).length === 0) return false
        return true
      }).length

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

    return NextResponse.json({
      globalPercentage,
      totalFields,
      completedFields,
      sections: completionData,
      wizardStats, // Nouveau: stats pour le wizard intelligent
      plan: org.plan, // Plan de l'organisation
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
