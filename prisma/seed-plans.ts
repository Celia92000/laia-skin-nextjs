/**
 * Seed pour les formules d'abonnement LAIA Connect
 * npx tsx prisma/seed-plans.ts
 */

import { PrismaClient, OrgPlan } from '@prisma/client'

const prisma = new PrismaClient()

const PLANS_DATA = [
  {
    planKey: 'SOLO' as OrgPlan,
    name: 'Solo',
    displayName: 'Formule Solo',
    description: 'Parfait pour un institut indépendant avec 1 emplacement',
    priceMonthly: 49,
    priceYearly: null,
    maxLocations: 1,
    maxUsers: 1,
    maxStorage: 5,
    features: JSON.stringify([
      'featureGiftCards',
      'featureLeads',
      'featureLoyalty',
      'featureEmailing',
      'featureWhatsApp',
      'featureAccounting',
      'featureInvoices',
      'featureReviews',
      'featureStripe',
      'featureCustomDesign'
    ]),
    highlights: JSON.stringify([
      'Réservations en ligne illimitées',
      'Planning intelligent',
      'Cartes cadeaux',
      'Programme de fidélité basique',
      'Paiements en ligne (Stripe)',
      'Site web personnalisable',
      'Support email standard'
    ]),
    isPopular: false,
    isRecommended: false,
    displayOrder: 1,
    isActive: true
  },
  {
    planKey: 'DUO' as OrgPlan,
    name: 'Duo',
    displayName: 'Formule Duo',
    description: 'Pour un institut en croissance avec une petite équipe (3 utilisateurs)',
    priceMonthly: 69,
    priceYearly: null,
    maxLocations: 1,
    maxUsers: 3,
    maxStorage: 10,
    features: JSON.stringify([
      'featureBlog',
      'featureGiftCards',
      'featureCRM',
      'featureLeads',
      'featureLoyalty',
      'featureLoyaltyAdvanced',
      'featureReferral',
      'featureEmailing',
      'featureEmailAutomation',
      'featureWhatsApp',
      'featureMultiUser',
      'featureRoles',
      'featureAccounting',
      'featureInvoices',
      'featureExports',
      'featureReviews',
      'featureReviewsAdvanced',
      'featureStripe',
      'featurePaymentTracking',
      'featureCustomDesign',
      'featureSEO',
      'featureOnboarding'
    ]),
    highlights: JSON.stringify([
      'Tout de SOLO +',
      'CRM complet (leads, prospects, clients)',
      'Blog / Actualités pour le SEO',
      'Fidélité avancée (paliers VIP, points)',
      'Programme de parrainage',
      'Emails automation',
      '3 utilisateurs avec rôles',
      'Photos avant/après clients',
      'Export données (CSV)',
      'Outils SEO',
      'Onboarding guidé personnalisé'
    ]),
    isPopular: true,
    isRecommended: false,
    displayOrder: 2,
    isActive: true
  },
  {
    planKey: 'TEAM' as OrgPlan,
    name: 'Team',
    displayName: 'Formule Team',
    description: 'Pour les instituts établis avec plusieurs emplacements (3 max)',
    priceMonthly: 119,
    priceYearly: null,
    maxLocations: 3,
    maxUsers: 10,
    maxStorage: 25,
    features: JSON.stringify([
      'featureBlog',
      'featureProducts',
      'featureOrders',
      'featureGiftCards',
      'featureCRM',
      'featureLeads',
      'featureClientSegmentation',
      'featureLoyalty',
      'featureLoyaltyAdvanced',
      'featureReferral',
      'featureEmailing',
      'featureEmailAutomation',
      'featureWhatsApp',
      'featureWhatsAppAutomation',
      'featureSMS',
      'featureSocialMedia',
      'featureSocialSchedule',
      'featureInstagram',
      'featureFacebook',
      'featureMultiLocation',
      'featureMultiUser',
      'featureRoles',
      'featureAccounting',
      'featureInvoices',
      'featureExports',
      'featureReports',
      'featureReviews',
      'featureReviewsAdvanced',
      'featureGoogleReviews',
      'featureStripe',
      'featurePaymentTracking',
      'featureRefunds',
      'featureCustomDomain',
      'featureCustomDesign',
      'featureCustomEmails',
      'featureSEO',
      'featurePrioritySupport',
      'featureOnboarding'
    ]),
    highlights: JSON.stringify([
      'Tout de DUO +',
      'Boutique produits en ligne',
      'Segmentation clients avancée',
      'WhatsApp & SMS automation',
      'Publications Instagram & Facebook',
      'Sync avis Google Reviews',
      '3 emplacements',
      '10 utilisateurs',
      'Rapports statistiques avancés',
      'Domaine personnalisé inclus',
      'Gestion des remboursements',
      'Support prioritaire (réponse <4h)'
    ]),
    isPopular: false,
    isRecommended: true,
    displayOrder: 3,
    isActive: true
  },
  {
    planKey: 'PREMIUM' as OrgPlan,
    name: 'Premium',
    displayName: 'Formule Premium',
    description: 'Pour les chaînes et franchises, tout illimité',
    priceMonthly: 179,
    priceYearly: null,
    maxLocations: 999,
    maxUsers: 999,
    maxStorage: 100,
    features: JSON.stringify([
      'featureBlog',
      'featureProducts',
      'featureFormations',
      'featureOrders',
      'featureGiftCards',
      'featureCRM',
      'featureLeads',
      'featureClientSegmentation',
      'featureLoyalty',
      'featureLoyaltyAdvanced',
      'featureReferral',
      'featureEmailing',
      'featureEmailAutomation',
      'featureWhatsApp',
      'featureWhatsAppAutomation',
      'featureSMS',
      'featureSocialMedia',
      'featureSocialSchedule',
      'featureInstagram',
      'featureFacebook',
      'featureTikTok',
      'featureStock',
      'featureStockAlerts',
      'featureMultiLocation',
      'featureMultiUser',
      'featureRoles',
      'featureAccounting',
      'featureInvoices',
      'featureExports',
      'featureReports',
      'featureReviews',
      'featureReviewsAdvanced',
      'featureGoogleReviews',
      'featureStripe',
      'featurePaymentTracking',
      'featureRefunds',
      'featureCustomDomain',
      'featureCustomDesign',
      'featureCustomEmails',
      'featureSEO',
      'featurePrioritySupport',
      'featureOnboarding',
      'featureDedicatedAccount'
    ]),
    highlights: JSON.stringify([
      'Tout de TEAM +',
      'Vente de formations en ligne',
      'TikTok intégration',
      'Gestion de stock complète',
      'Alertes stock bas automatiques',
      'Emplacements illimités',
      'Utilisateurs illimités',
      '100 GB de stockage',
      'Account manager dédié',
      'Formation équipe incluse',
      'API personnalisée disponible'
    ]),
    isPopular: false,
    isRecommended: false,
    displayOrder: 4,
    isActive: true
  }
]

async function seedPlans() {
  console.log('🌱 Seeding subscription plans...')

  for (const planData of PLANS_DATA) {
    console.log(`📝 Creating plan: ${planData.name}`)

    await prisma.subscriptionPlan.upsert({
      where: { planKey: planData.planKey },
      create: planData,
      update: planData
    })

    console.log(`✅ ${planData.name} created/updated`)
  }

  console.log('✨ Subscription plans seeded successfully!')
}

seedPlans()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
