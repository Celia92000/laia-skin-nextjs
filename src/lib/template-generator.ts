import { prisma } from './prisma'
import { getFeaturesForPlan } from './features-simple'
import { getAddonById } from './addons'

/**
 * Service de génération de template LAIA SKIN INSTITUT
 * Génère automatiquement un site complet en fonction du plan et des options choisies
 */

interface TemplateGenerationOptions {
  organizationId: string
  organizationName: string
  plan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  ownerFirstName: string
  ownerLastName: string
  primaryColor?: string
  secondaryColor?: string
  selectedAddons?: string[] // Add-ons achetés
  // Service initial créé pendant l'onboarding
  initialService?: {
    name: string
    price: number
    duration: number
    description: string
  }
}

/**
 * Génère un template complet pour une nouvelle organisation
 */
export async function generateOrganizationTemplate(options: TemplateGenerationOptions) {
  console.log(`🎨 Génération du template pour: ${options.organizationName} (Plan: ${options.plan})`)

  const { organizationId, organizationName, plan, ownerFirstName, ownerLastName } = options

  // Récupérer l'organisation et son emplacement principal
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      locations: { where: { isMainLocation: true } },
      config: true
    }
  })

  if (!organization || !organization.locations[0]) {
    throw new Error('Organisation ou emplacement principal non trouvé')
  }

  const mainLocation = organization.locations[0]

  // Déterminer les features activées selon le plan
  const features = getFeaturesByPlan(plan)

  // 1. Créer les services de base (tous les plans)
  const services = await generateServices(organizationId, mainLocation.id, organizationName, options.initialService)
  console.log(`✅ ${services.length} services créés`)

  // 2. Créer les produits (à partir de TEAM)
  let products = []
  if (features.products) {
    products = await generateProducts(organizationId, organizationName)
    console.log(`✅ ${products.length} produits créés`)
  }

  // 3. Créer les formations (PREMIUM uniquement)
  let formations = []
  if (features.formations) {
    formations = await generateFormations(organizationId, organizationName)
    console.log(`✅ ${formations.length} formations créées`)
  }

  // 4. Créer les articles de blog (à partir de DUO)
  let blogPosts = []
  if (features.blog) {
    blogPosts = await generateBlogPosts(organizationId)
    console.log(`✅ ${blogPosts.length} articles de blog créés`)
  }

  // 5. Créer les catégories de services
  await generateServiceCategories(organizationId)
  console.log(`✅ Catégories de services créées`)

  // 6. Configurer les paramètres de réservation
  await setupBookingSettings(organizationId)
  console.log(`✅ Paramètres de réservation configurés`)

  // 7. Mettre à jour la configuration de l'organisation
  await updateOrganizationTemplate(organizationId, organizationName, ownerFirstName, ownerLastName, options)
  console.log(`✅ Configuration du site mise à jour`)

  // 8. Activer les features selon le plan + add-ons
  // TODO: Réactiver quand les champs featureBlog, featureCRM, etc. seront ajoutés au schéma Organization
  // await activatePlanFeatures(organizationId, plan, options.selectedAddons)
  console.log(`⏭️  Features plan ${plan} (activation désactivée temporairement)`)
  if (options.selectedAddons && options.selectedAddons.length > 0) {
    console.log(`📦 ${options.selectedAddons.length} add-ons sélectionnés:`, options.selectedAddons)
  }

  return {
    services: services.length,
    products: products.length,
    formations: formations.length,
    blogPosts: blogPosts.length,
    features
  }
}

/**
 * Détermine les features activées selon le plan
 */
function getFeaturesByPlan(plan: string) {
  switch (plan) {
    case 'SOLO':
      return {
        services: true,
        blog: false,
        products: false,
        crm: false,
        stock: false,
        formations: false,
        maxServices: 10,
        maxProducts: 0,
        maxBlogPosts: 0
      }
    case 'DUO':
      return {
        services: true,
        blog: true,
        products: false,
        crm: false,
        stock: false,
        formations: false,
        maxServices: 20,
        maxProducts: 0,
        maxBlogPosts: 10
      }
    case 'TEAM':
      return {
        services: true,
        blog: true,
        products: true,
        crm: true,
        stock: false,
        formations: false,
        maxServices: 50,
        maxProducts: 30,
        maxBlogPosts: 30
      }
    case 'PREMIUM':
      return {
        services: true,
        blog: true,
        products: true,
        crm: true,
        stock: true,
        formations: true,
        maxServices: -1, // Illimité
        maxProducts: -1,
        maxBlogPosts: -1
      }
    default:
      return getFeaturesByPlan('SOLO')
  }
}

/**
 * Génère les services de démonstration
 */
async function generateServices(
  orgId: string,
  locationId: string,
  orgName: string,
  initialService?: any
) {
  const servicesData = [
    // Si un service initial a été créé, on le récupère
    ...(initialService ? [] : [{
      name: 'Soin du Visage Signature',
      slug: 'soin-visage-signature',
      description: 'Notre soin phare pour une peau éclatante',
      shortDescription: 'Soin complet du visage',
      price: 75,
      duration: 60,
      featured: true,
      active: true
    }]),
    {
      name: 'Massage Relaxant',
      slug: 'massage-relaxant',
      description: 'Massage complet pour évacuer le stress et les tensions',
      shortDescription: 'Massage relaxant corps entier',
      price: 85,
      duration: 60,
      featured: true,
      active: true
    },
    {
      name: 'Épilation Sourcils',
      slug: 'epilation-sourcils',
      description: 'Épilation précise pour sublimer votre regard',
      shortDescription: 'Épilation et restructuration des sourcils',
      price: 15,
      duration: 15,
      featured: false,
      active: true
    },
    {
      name: 'Manucure Complète',
      slug: 'manucure-complete',
      description: 'Soin complet des mains avec pose de vernis',
      shortDescription: 'Manucure avec vernis',
      price: 35,
      duration: 45,
      featured: false,
      active: true
    },
    {
      name: 'Pédicure Spa',
      slug: 'pedicure-spa',
      description: 'Soin complet des pieds avec bain relaxant',
      shortDescription: 'Pédicure avec massage',
      price: 45,
      duration: 60,
      featured: false,
      active: true
    }
  ]

  const services = []
  for (const serviceData of servicesData) {
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        organizationId: orgId
      }
    })
    services.push(service)
  }

  return services
}

/**
 * Génère les produits de démonstration (TEAM+)
 */
async function generateProducts(orgId: string, orgName: string) {
  const productsData = [
    {
      name: 'Crème Hydratante Visage',
      slug: 'creme-hydratante-visage',
      description: 'Crème hydratante enrichie en acide hyaluronique pour une hydratation 24h. Convient à tous les types de peaux.',
      shortDescription: 'Hydratation intense 24h',
      price: 45,
      category: 'Soins Visage',
      featured: true,
      active: true
    },
    {
      name: 'Sérum Anti-Âge',
      slug: 'serum-anti-age',
      description: 'Sérum concentré aux peptides et antioxydants pour réduire les rides et raffermir la peau.',
      shortDescription: 'Concentré de jeunesse',
      price: 65,
      category: 'Soins Visage',
      featured: true,
      active: true
    },
    {
      name: 'Huile de Massage',
      slug: 'huile-massage',
      description: 'Huile de massage aux huiles essentielles apaisantes pour prolonger le bien-être.',
      shortDescription: 'Huile relaxante',
      price: 30,
      category: 'Bien-être',
      featured: false,
      active: true
    }
  ]

  const products = []
  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        organizationId: orgId
      }
    })
    products.push(product)
  }

  return products
}

/**
 * Génère les formations de démonstration (PREMIUM)
 */
async function generateFormations(orgId: string, orgName: string) {
  const formationsData = [
    {
      name: 'Initiation au Massage Relaxant',
      slug: 'initiation-massage-relaxant',
      description: 'Formation complète pour maîtriser les bases du massage relaxant. Parfait pour les débutants.',
      shortDescription: 'Apprenez les techniques de massage',
      price: 450,
      duration: 2, // 2 jours
      level: 'Débutant',
      active: true,
      featured: true,
      organizationId: orgId
    },
    {
      name: 'Perfectionnement Soins du Visage',
      slug: 'perfectionnement-soins-visage',
      description: 'Techniques avancées pour les professionnels souhaitant se perfectionner dans les soins du visage.',
      shortDescription: 'Techniques avancées',
      price: 350,
      duration: 1, // 1 jour
      level: 'Intermédiaire',
      active: true,
      featured: false,
      organizationId: orgId
    }
  ]

  const formations = []
  for (const formationData of formationsData) {
    const formation = await prisma.formation.create({
      data: formationData
    })
    formations.push(formation)
  }

  return formations
}

/**
 * Génère les articles de blog (DUO+)
 */
async function generateBlogPosts(orgId: string) {
  const blogPostsData = [
    {
      title: '5 Conseils pour une Peau Éclatante',
      slug: '5-conseils-peau-eclatante',
      excerpt: 'Découvrez nos meilleurs conseils pour avoir une peau radieuse au quotidien',
      content: `# 5 Conseils pour une Peau Éclatante

Une peau éclatante est le reflet d'une bonne santé. Voici nos 5 conseils d'expertes :

## 1. Hydratation
Buvez au moins 1,5L d'eau par jour et utilisez une crème hydratante adaptée.

## 2. Nettoyage
Nettoyez votre visage matin et soir avec un produit doux.

## 3. Protection solaire
Appliquez une crème solaire tous les jours, même en hiver.

## 4. Alimentation équilibrée
Privilégiez les fruits et légumes riches en antioxydants.

## 5. Sommeil réparateur
Dormez 7 à 8 heures par nuit pour permettre à votre peau de se régénérer.`,
      category: 'Conseils Beauté',
      author: 'Équipe LAIA',
      readTime: '3 min',
      featured: true,
      published: true,
      organizationId: orgId
    },
    {
      title: 'Les Bienfaits du Massage',
      slug: 'bienfaits-massage',
      excerpt: 'Le massage n\'est pas qu\'un moment de détente, découvrez tous ses bienfaits',
      content: `# Les Bienfaits du Massage

Le massage est bien plus qu'un simple moment de relaxation :

## Réduction du stress
Le massage favorise la production d'endorphines, les hormones du bien-être.

## Soulagement des douleurs
Les techniques de massage aident à détendre les muscles et soulager les tensions.

## Amélioration de la circulation
Le massage stimule la circulation sanguine et lymphatique.

## Meilleur sommeil
Un massage régulier améliore la qualité du sommeil.`,
      category: 'Bien-être',
      author: 'Équipe LAIA',
      readTime: '4 min',
      featured: false,
      published: true,
      organizationId: orgId
    }
  ]

  const blogPosts = []
  for (const blogData of blogPostsData) {
    const post = await prisma.blogPost.create({
      data: blogData
    })
    blogPosts.push(post)
  }

  return blogPosts
}

/**
 * Crée les catégories de services
 */
async function generateServiceCategories(organizationId: string) {
  const categories = [
    { name: 'Soins du Visage', slug: 'soins-visage', icon: 'FaFaceSmile', color: '#e11d48' },
    { name: 'Soins du Corps', slug: 'soins-corps', icon: 'FaSpa', color: '#7c3aed' },
    { name: 'Épilation', slug: 'epilation', icon: 'FaFeather', color: '#0891b2' },
    { name: 'Manucure & Pédicure', slug: 'manucure-pedicure', icon: 'FaHandSparkles', color: '#dc2626' },
    { name: 'Massages', slug: 'massages', icon: 'FaHandHoldingHeart', color: '#16a34a' }
  ]

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        organizationId
      }
    })
  }
}

/**
 * Configure les paramètres de réservation
 */
async function setupBookingSettings(orgId: string) {
  await prisma.bookingSettings.create({
    data: {
      organizationId: orgId,
      minAdvanceBookingHours: 2,
      maxAdvanceBookingDays: 30,
      cancellationDeadlineHours: 24,
      allowStaffSelection: true,
      requireLocationSelection: false,
      allowOnlinePayment: true,
      sendConfirmationEmail: true,
      sendReminder24h: true,
      sendReminder2h: false,
      sendReviewRequest: true
    }
  })
}

/**
 * Met à jour la configuration du site avec le template
 */
async function updateOrganizationTemplate(
  orgId: string,
  orgName: string,
  ownerFirstName: string,
  ownerLastName: string,
  options: TemplateGenerationOptions
) {
  const fullName = `${ownerFirstName} ${ownerLastName}`

  await prisma.organizationConfig.upsert({
    where: { organizationId: orgId },
    update: {
      siteTagline: 'Institut de Beauté & Bien-être',
      siteDescription: `Bienvenue chez ${orgName}, votre institut de beauté dédié à votre bien-être et votre beauté naturelle.`,
      heroTitle: `Bienvenue chez ${orgName}`,
      heroSubtitle: 'Votre beauté, notre passion',
      aboutText: `${orgName} est un institut de beauté moderne qui allie savoir-faire traditionnel et techniques innovantes pour vous offrir des soins d'exception.`,
      founderName: fullName,
      founderTitle: 'Fondateur/Fondatrice',
      founderQuote: 'La beauté commence par prendre soin de soi',
      aboutIntro: `Depuis sa création, ${orgName} s'engage à offrir des soins de qualité dans une atmosphère chaleureuse et relaxante.`,
      aboutParcours: 'Notre équipe de professionnelles qualifiées met son expertise à votre service pour des résultats visibles et durables.',
      primaryColor: options.primaryColor || '#d4b5a0',
      secondaryColor: options.secondaryColor || '#2c3e50',
      accentColor: '#20b2aa',
      fontFamily: 'Inter',
      headingFont: 'Playfair Display',
      legalRepName: fullName,
      legalRepTitle: 'Gérant(e)'
    },
    create: {
      organizationId: orgId,
      siteName: orgName,
      siteTagline: 'Institut de Beauté & Bien-être',
      siteDescription: `Bienvenue chez ${orgName}, votre institut de beauté dédié à votre bien-être et votre beauté naturelle.`,
      heroTitle: `Bienvenue chez ${orgName}`,
      heroSubtitle: 'Votre beauté, notre passion',
      aboutText: `${orgName} est un institut de beauté moderne qui allie savoir-faire traditionnel et techniques innovantes pour vous offrir des soins d'exception.`,
      founderName: fullName,
      founderTitle: 'Fondateur/Fondatrice',
      founderQuote: 'La beauté commence par prendre soin de soi',
      aboutIntro: `Depuis sa création, ${orgName} s'engage à offrir des soins de qualité dans une atmosphère chaleureuse et relaxante.`,
      aboutParcours: 'Notre équipe de professionnelles qualifiées met son expertise à votre service pour des résultats visibles et durables.',
      primaryColor: options.primaryColor || '#d4b5a0',
      secondaryColor: options.secondaryColor || '#2c3e50',
      accentColor: '#20b2aa',
      fontFamily: 'Inter',
      headingFont: 'Playfair Display',
      legalRepName: fullName,
      legalRepTitle: 'Gérant(e)'
    }
  })
}

/**
 * Active les features selon le plan choisi
 */
async function activatePlanFeatures(orgId: string, plan: string, selectedAddons?: string[]) {
  // Récupérer les features de base du plan
  const planFeatures = getFeaturesForPlan(plan as any)

  // Activer les features des add-ons achetés
  const addonFeatures: any = {}

  if (selectedAddons && selectedAddons.length > 0) {
    for (const addonId of selectedAddons) {
      const addon = getAddonById(addonId)
      if (addon && addon.unlocks) {
        // Activer la feature correspondante
        // Par exemple: unlocks: 'featureBlog' => featureBlog: true
        addonFeatures[addon.unlocks] = true
      }
    }
  }

  // Fusionner les features du plan avec celles des add-ons
  const finalFeatures = {
    featureBlog: planFeatures.featureBlog || addonFeatures.featureBlog || false,
    featureCRM: planFeatures.featureCRM || addonFeatures.featureCRM || false,
    featureEmailing: planFeatures.featureEmailing || addonFeatures.featureEmailing || false,
    featureShop: planFeatures.featureShop || addonFeatures.featureShop || false,
    featureWhatsApp: planFeatures.featureWhatsApp || addonFeatures.featureWhatsApp || false,
    featureSMS: planFeatures.featureSMS || addonFeatures.featureSMS || false,
    featureSocialMedia: planFeatures.featureSocialMedia || addonFeatures.featureSocialMedia || false,
    featureStock: planFeatures.featureStock || addonFeatures.featureStock || false,
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: finalFeatures
  })
}
