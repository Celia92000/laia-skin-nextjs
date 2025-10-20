import { prisma } from './prisma'

/**
 * Seed une nouvelle organisation avec des données de démonstration
 * Basé sur le modèle LAIA Skin Institut
 */
export async function seedOrganization(organizationId: string, organizationName: string) {
  console.log(`🌱 Seeding organisation: ${organizationName}`)

  // Récupérer l'emplacement principal
  const mainLocation = await prisma.location.findFirst({
    where: { organizationId, isMainLocation: true }
  })

  if (!mainLocation) {
    throw new Error('Emplacement principal non trouvé')
  }

  // 1. Créer les services de démonstration
  const services = await createDemoServices(organizationId, mainLocation.id, organizationName)
  console.log(`✅ ${services.length} services créés`)

  // 2. Créer les produits de démonstration
  const products = await createDemoProducts(organizationId, organizationName)
  console.log(`✅ ${products.length} produits créés`)

  // 3. Créer les formations de démonstration
  const formations = await createDemoFormations(organizationId, organizationName)
  console.log(`✅ ${formations.length} formations créées`)

  // 4. Créer des articles de blog de démonstration
  const blogPosts = await createDemoBlogPosts(organizationId)
  console.log(`✅ ${blogPosts.length} articles de blog créés`)

  // 5. Mettre à jour la config avec des données complètes
  await updateOrganizationConfig(organizationId, organizationName)
  console.log(`✅ Configuration complétée`)

  return {
    services: services.length,
    products: products.length,
    formations: formations.length,
    blogPosts: blogPosts.length
  }
}

async function createDemoServices(orgId: string, locationId: string, orgName: string) {
  const servicesData = [
    {
      name: 'Soin du Visage Éclat',
      slug: 'soin-visage-eclat',
      description: 'Un soin complet pour révéler l\'éclat naturel de votre peau',
      fullDescription: 'Offrez à votre peau un moment de pure détente avec notre soin du visage éclat. Ce soin combine nettoyage en profondeur, gommage doux, massage relaxant et masque hydratant pour une peau éclatante.',
      price: 75,
      duration: 60,
      category: 'Soins du Visage',
      image: '/images/services/soin-visage.jpg',
      isVisible: true,
      displayOrder: 1
    },
    {
      name: 'Massage Relaxant',
      slug: 'massage-relaxant',
      description: 'Un massage complet du corps pour évacuer le stress',
      fullDescription: 'Laissez-vous emporter par un voyage de relaxation totale. Notre massage relaxant combine différentes techniques pour détendre vos muscles et apaiser votre esprit.',
      price: 90,
      duration: 90,
      category: 'Massages',
      image: '/images/services/massage.jpg',
      isVisible: true,
      displayOrder: 2
    },
    {
      name: 'Épilation Sourcils',
      slug: 'epilation-sourcils',
      description: 'Sublimez votre regard avec une épilation précise',
      fullDescription: 'Nos expertes sculptent vos sourcils pour mettre en valeur votre regard. Épilation à la cire ou à la pince selon vos préférences.',
      price: 15,
      duration: 15,
      category: 'Épilation',
      image: '/images/services/epilation.jpg',
      isVisible: true,
      displayOrder: 3
    },
    {
      name: 'Manucure Complète',
      slug: 'manucure-complete',
      description: 'Des mains parfaitement soignées et sublimées',
      fullDescription: 'Prenez soin de vos mains avec notre manucure complète : limage, soin des cuticules, gommage, massage et pose de vernis.',
      price: 40,
      duration: 45,
      category: 'Esthétique',
      image: '/images/services/manucure.jpg',
      isVisible: true,
      displayOrder: 4
    },
    {
      name: 'Pédicure Spa',
      slug: 'pedicure-spa',
      description: 'Un moment de détente pour des pieds parfaits',
      fullDescription: 'Offrez à vos pieds un soin complet avec bain relaxant, gommage, ponçage, soin des ongles et massage.',
      price: 50,
      duration: 60,
      category: 'Esthétique',
      image: '/images/services/pedicure.jpg',
      isVisible: true,
      displayOrder: 5
    }
  ]

  const services = []
  for (const serviceData of servicesData) {
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        organizationId: orgId,
        locations: {
          create: {
            locationId: locationId,
            isAvailable: true
          }
        }
      }
    })
    services.push(service)
  }

  return services
}

async function createDemoProducts(orgId: string, orgName: string) {
  const productsData = [
    {
      name: 'Crème Hydratante Visage',
      slug: 'creme-hydratante-visage',
      description: 'Hydratation intense 24h pour tous types de peaux',
      fullDescription: 'Notre crème hydratante enrichie en acide hyaluronique et en vitamines nourrit votre peau en profondeur.',
      price: 45,
      stock: 50,
      category: 'Soins Visage',
      image: '/images/products/creme-visage.jpg',
      isVisible: true,
      displayOrder: 1
    },
    {
      name: 'Sérum Anti-Âge',
      slug: 'serum-anti-age',
      description: 'Concentré de jeunesse pour une peau lissée',
      fullDescription: 'Un sérum puissant aux peptides et antioxydants pour réduire les rides et raffermir la peau.',
      price: 65,
      stock: 30,
      category: 'Soins Visage',
      image: '/images/products/serum.jpg',
      isVisible: true,
      displayOrder: 2
    },
    {
      name: 'Huile de Massage Relaxante',
      slug: 'huile-massage-relaxante',
      description: 'Huile aux huiles essentielles apaisantes',
      fullDescription: 'Une huile de massage aux senteurs relaxantes pour prolonger le bien-être à domicile.',
      price: 35,
      stock: 40,
      category: 'Massages',
      image: '/images/products/huile-massage.jpg',
      isVisible: true,
      displayOrder: 3
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

async function createDemoFormations(orgId: string, orgName: string) {
  const formationsData = [
    {
      title: 'Formation Massage Californien',
      slug: 'formation-massage-californien',
      description: 'Apprenez les techniques du massage californien',
      content: 'Formation complète sur 2 jours pour maîtriser les techniques du massage californien, un massage enveloppant et relaxant.',
      price: 450,
      duration: '2 jours',
      level: 'Débutant',
      image: '/images/formations/massage.jpg',
      published: true,
      displayOrder: 1
    },
    {
      title: 'Perfectionnement Soins du Visage',
      slug: 'perfectionnement-soins-visage',
      description: 'Techniques avancées pour les soins du visage',
      content: 'Perfectionnez vos compétences avec des techniques avancées de diagnostic de peau et de protocoles de soins personnalisés.',
      price: 350,
      duration: '1 jour',
      level: 'Intermédiaire',
      image: '/images/formations/soins-visage.jpg',
      published: true,
      displayOrder: 2
    }
  ]

  const formations = []
  for (const formationData of formationsData) {
    const formation = await prisma.formation.create({
      data: {
        ...formationData,
        organizationId: orgId
      }
    })
    formations.push(formation)
  }

  return formations
}

async function createDemoBlogPosts(orgId: string) {
  const blogPostsData = [
    {
      title: '5 Conseils pour une Peau Éclatante',
      slug: '5-conseils-peau-eclatante',
      excerpt: 'Découvrez nos meilleurs conseils pour avoir une peau radieuse au quotidien',
      content: `
# 5 Conseils pour une Peau Éclatante

Une peau éclatante est le reflet d'une bonne santé. Voici nos 5 conseils d'expertes :

## 1. Hydratation

Buvez au moins 1,5L d'eau par jour et utilisez une crème hydratante adaptée à votre type de peau.

## 2. Nettoyage

Nettoyez votre visage matin et soir avec un produit doux pour éliminer les impuretés.

## 3. Protection solaire

Appliquez une crème solaire tous les jours, même en hiver.

## 4. Alimentation équilibrée

Privilégiez les fruits et légumes riches en antioxydants.

## 5. Sommeil réparateur

Dormez 7 à 8 heures par nuit pour permettre à votre peau de se régénérer.
      `,
      category: 'Conseils Beauté',
      featuredImage: '/images/blog/peau-eclatante.jpg',
      published: true,
      displayOrder: 1
    },
    {
      title: 'Les Bienfaits du Massage',
      slug: 'bienfaits-massage',
      excerpt: 'Le massage n\'est pas qu\'un moment de détente, c\'est aussi excellent pour votre santé',
      content: `
# Les Bienfaits du Massage

Le massage est bien plus qu'un simple moment de relaxation. Découvrez tous ses bienfaits :

## Réduction du stress

Le massage favorise la production d'endorphines, les hormones du bien-être.

## Soulagement des douleurs

Les techniques de massage aident à détendre les muscles et soulager les tensions.

## Amélioration de la circulation

Le massage stimule la circulation sanguine et lymphatique.

## Meilleur sommeil

Un massage régulier améliore la qualité du sommeil.
      `,
      category: 'Bien-être',
      featuredImage: '/images/blog/massage.jpg',
      published: true,
      displayOrder: 2
    }
  ]

  const blogPosts = []
  for (const blogData of blogPostsData) {
    const post = await prisma.blogPost.create({
      data: {
        ...blogData,
        organizationId: orgId,
        authorId: null // Sera assigné plus tard à l'admin
      }
    })
    blogPosts.push(post)
  }

  return blogPosts
}

async function updateOrganizationConfig(orgId: string, orgName: string) {
  await prisma.organizationConfig.update({
    where: { organizationId: orgId },
    data: {
      siteTagline: 'Institut de Beauté & Bien-être',
      siteDescription: `Bienvenue chez ${orgName}, votre institut de beauté dédié à votre bien-être et votre beauté naturelle.`,
      heroTitle: `Bienvenue chez ${orgName}`,
      heroSubtitle: 'Votre beauté, notre passion',
      aboutText: `${orgName} est un institut de beauté moderne qui allie savoir-faire traditionnel et techniques innovantes pour vous offrir des soins d'exception.`,
      founderName: 'À personnaliser',
      founderTitle: 'Fondateur/Fondatrice',
      founderQuote: 'La beauté commence par prendre soin de soi',
      aboutIntro: `Depuis sa création, ${orgName} s'engage à offrir des soins de qualité dans une atmosphère chaleureuse et relaxante.`,
      aboutParcours: 'Notre équipe de professionnelles qualifiées met son expertise à votre service pour des résultats visibles et durables.',
      primaryColor: '#d4b5a0',
      secondaryColor: '#2c3e50',
      accentColor: '#20b2aa',
      fontFamily: 'Inter',
      headingFont: 'Playfair Display',
      businessHours: JSON.stringify({
        lundi: '9h00-18h00',
        mardi: '9h00-18h00',
        mercredi: '9h00-18h00',
        jeudi: '9h00-18h00',
        vendredi: '9h00-18h00',
        samedi: '9h00-17h00',
        dimanche: 'Fermé'
      })
    }
  })
}
