/**
 * Script de test pour simuler un webhook Stripe checkout.session.completed
 * Usage: node test-webhook-stripe.js
 */

// Données de test pour l'onboarding
const testOnboardingData = {
  // Informations personnelles
  ownerFirstName: 'Marie',
  ownerLastName: 'Dupont',
  ownerEmail: 'marie.dupont.test@example.com',
  ownerPhone: '+33612345678',

  // Informations institut
  institutName: 'Test Institut Beauté',
  slug: 'test-institut-beaute',
  subdomain: 'test-institut-beaute',
  customDomain: null,
  useCustomDomain: false,
  city: 'Paris',
  address: '123 Rue de Rivoli',
  postalCode: '75001',
  primaryColor: '#FF6B9D',
  secondaryColor: '#4A90E2',

  // Premier service
  serviceName: 'Soin du visage',
  servicePrice: 80,
  serviceDuration: 60,
  serviceDescription: 'Soin complet du visage avec gommage et masque',

  // Template de site web
  websiteTemplateId: 'modern',
  siteTagline: 'Institut de Beauté & Bien-être',
  heroTitle: 'Une peau respectée,',
  heroSubtitle: 'une beauté révélée',
  aboutText: 'Notre institut vous accueille dans un cadre chaleureux',
  founderName: 'Marie Dupont',
  founderTitle: 'Fondatrice & Experte en soins esthétiques',
  founderQuote: 'La beauté est dans les détails',

  // Réseaux sociaux
  facebook: 'https://facebook.com/test',
  instagram: 'https://instagram.com/test',
  whatsapp: '+33612345678',

  // Horaires
  businessHours: {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '', close: '', closed: true }
  },

  // Informations légales
  legalName: 'Test Institut Beauté SARL',
  siret: '12345678901234',
  tvaNumber: 'FR12345678901',
  billingEmail: 'comptabilite@test-institut.fr',
  billingAddress: '123 Rue de Rivoli',
  billingPostalCode: '75001',
  billingCity: 'Paris',
  billingCountry: 'FR',

  // Mandat SEPA
  sepaIban: 'FR7612345678901234567890123',
  sepaBic: 'BNPAFRPPXXX',
  sepaAccountHolder: 'Marie Dupont',
  sepaMandate: true,

  selectedPlan: 'SOLO'
}

// Simuler un événement Stripe checkout.session.completed
const checkoutSessionEvent = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  api_version: '2025-09-30.clover',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Date.now(),
      object: 'checkout.session',
      customer: 'cus_test_' + Date.now(),
      subscription: 'sub_test_' + Date.now(),
      payment_status: 'paid',
      status: 'complete',
      metadata: {
        type: 'onboarding',
        onboardingData: JSON.stringify(testOnboardingData)
      }
    }
  }
}

// Fonction pour envoyer le webhook
async function testWebhook() {
  console.log('🧪 TEST WEBHOOK STRIPE - Onboarding')
  console.log('=' .repeat(60))
  console.log('')
  console.log('📋 Données de test:')
  console.log('  - Institut:', testOnboardingData.institutName)
  console.log('  - Slug:', testOnboardingData.slug)
  console.log('  - Plan:', testOnboardingData.selectedPlan)
  console.log('  - Email:', testOnboardingData.ownerEmail)
  console.log('')

  try {
    const response = await fetch('http://localhost:3001/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: En mode test, on skip la signature Stripe
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(checkoutSessionEvent)
    })

    const result = await response.json()

    console.log('📤 Réponse du webhook:')
    console.log('  Status:', response.status)
    console.log('  Body:', JSON.stringify(result, null, 2))
    console.log('')

    if (response.ok) {
      console.log('✅ Webhook traité avec succès !')
      console.log('')
      console.log('🔍 Vérifications à faire:')
      console.log('  1. Vérifier dans la BDD (Prisma Studio) que l\'organisation a été créée')
      console.log('  2. Vérifier que l\'utilisateur admin a été créé')
      console.log('  3. Vérifier les emails envoyés (logs)')
      console.log('')
      console.log('🌐 Prisma Studio: http://localhost:5556')
    } else {
      console.log('❌ Erreur lors du traitement du webhook')
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Lancer le test
testWebhook()
