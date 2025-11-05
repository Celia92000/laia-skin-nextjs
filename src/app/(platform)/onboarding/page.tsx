'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateSIRET, validateIBAN, validateBIC, validateEmail, validatePhoneNumber, formatSIRET, formatIBAN } from '@/lib/validation'
import { getPlanPrice, getPlanName } from '@/lib/features-simple'
import { websiteTemplates } from '@/lib/website-templates'

// Étapes du tunnel
type Step = 'questionnaire' | 'welcome' | 'personal-info' | 'business-info' | 'website-template' | 'billing' | 'payment' | 'complete'

interface OnboardingData {
  // Étape 1 - Informations personnelles
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  ownerPhone: string

  // Étape 2 - Informations institut
  institutName: string
  slug: string
  subdomain: string
  customDomain?: string
  useCustomDomain: boolean
  city: string
  address: string
  postalCode: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string

  // Étape 3 - Premier service
  serviceName: string
  servicePrice: number
  serviceDuration: number
  serviceDescription: string

  // Étape 3.5 - Template de site web
  websiteTemplateId?: string

  // Étape 3.7 - Contenu du site
  siteTagline: string
  siteEmail: string
  sitePhone: string
  heroTitle: string
  heroSubtitle: string
  aboutText: string
  founderName: string
  founderTitle: string
  founderQuote: string
  facebook?: string
  instagram?: string
  whatsapp?: string

  // Étape 4 - Horaires
  businessHours: {
    [key: string]: { isOpen: boolean; start: string; end: string }
  }

  // Étape 5 - Informations légales et facturation
  legalName: string
  siret: string
  tvaNumber?: string
  billingEmail: string
  billingAddress: string
  billingPostalCode: string
  billingCity: string
  billingCountry: string

  // Étape 6 - Mandat SEPA
  sepaIban: string
  sepaBic: string
  sepaAccountHolder: string
  sepaMandate: boolean

  // Plan choisi
  selectedPlan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
}

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan') as OnboardingData['selectedPlan'] || 'SOLO'
  const skipQuestionnaire = searchParams.get('skip') === 'true'
  const shouldReset = searchParams.get('reset') === 'true'

  // ✅ Réinitialiser l'onboarding si ?reset=true
  useEffect(() => {
    if (shouldReset && typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('onboarding_step')
      localStorage.removeItem('onboarding_answers')
      // Rediriger sans le paramètre reset
      router.replace('/onboarding')
    }
  }, [shouldReset, router])

  // ✅ Initialiser currentStep avec localStorage ou valeur par défaut
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (typeof window !== 'undefined' && !shouldReset) {
      const savedStep = localStorage.getItem('onboarding_step')
      if (savedStep && !skipQuestionnaire) {
        return savedStep as Step
      }
    }
    return skipQuestionnaire ? 'personal-info' : 'questionnaire'
  })

  // ✅ Initialiser questionnaireAnswers avec localStorage ou valeur par défaut
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('onboarding_answers')
      if (savedAnswers) {
        try {
          return JSON.parse(savedAnswers)
        } catch (error) {
          console.error('Erreur restauration questionnaire:', error)
        }
      }
    }
    return {
    // Q1-Q3 : Basiques
    teamSize: '',
    locations: '',
    servicesCount: '',

    // Q4 : Fonctionnalités essentielles
    needsLoyalty: false,
    needsReminders: false,
    needsPaymentTerminal: false,
    needsAdvancedStats: false,

    // Q5 : Marketing & Communication
    needsEmailMarketing: false,
    needsWhatsApp: false,
    needsSMS: false,
    needsSocial: false,
    needsBlog: false,
    needsAutomation: false,

    // Q6 : Vente & E-commerce
    needsShop: false,
    needsInStoreProducts: false,
    needsStock: false,
    needsFormations: false,
    needsGiftCards: false,

    // Q7 : Outils Pro & Intégrations
    needsCRM: false,
    needsAPI: false,
    needsMultiUser: false,
    needsMultiLocation: false,
    needsMobileApp: false,

    // Q8 : Migration des données
    needsDataMigration: false,
    currentSoftware: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [previewPage, setPreviewPage] = useState<'home' | 'services' | 'booking' | 'about' | 'contact' | 'blog' | 'shop'>('home')

  // ✅ Initialiser data avec localStorage ou valeur par défaut
  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('onboarding_data')
      if (savedData) {
        try {
          return JSON.parse(savedData)
        } catch (error) {
          console.error('Erreur restauration data:', error)
        }
      }
    }
    return {
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    institutName: '',
    slug: '',
    subdomain: '',
    customDomain: '',
    useCustomDomain: false,
    city: '',
    address: '',
    postalCode: '',
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    serviceName: '',
    servicePrice: 0,
    serviceDuration: 60,
    serviceDescription: '',
    siteTagline: 'Institut de Beauté & Bien-être',
    siteEmail: '',
    sitePhone: '',
    heroTitle: 'Une peau respectée,',
    heroSubtitle: 'une beauté révélée',
    aboutText: '',
    founderName: '',
    founderTitle: 'Fondatrice & Experte en soins esthétiques',
    founderQuote: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    businessHours: {
      lundi: { isOpen: true, start: '09:00', end: '18:00' },
      mardi: { isOpen: true, start: '09:00', end: '18:00' },
      mercredi: { isOpen: true, start: '09:00', end: '18:00' },
      jeudi: { isOpen: true, start: '09:00', end: '18:00' },
      vendredi: { isOpen: true, start: '09:00', end: '18:00' },
      samedi: { isOpen: false, start: '09:00', end: '18:00' },
      dimanche: { isOpen: false, start: '09:00', end: '18:00' }
    },
    legalName: '',
    siret: '',
    tvaNumber: '',
    billingEmail: '',
    billingAddress: '',
    billingPostalCode: '',
    billingCity: '',
    billingCountry: 'France',
    sepaIban: '',
    sepaBic: '',
    sepaAccountHolder: '',
    sepaMandate: false,
    selectedPlan: planFromUrl
    }
  })

  // Pré-remplir le formulaire avec les données du lead (si présentes dans l'URL)
  useEffect(() => {
    const ownerFirstName = searchParams.get('ownerFirstName')
    const ownerLastName = searchParams.get('ownerLastName')
    const ownerEmail = searchParams.get('ownerEmail')
    const ownerPhone = searchParams.get('ownerPhone')
    const institutName = searchParams.get('institutName')
    const city = searchParams.get('city')
    const address = searchParams.get('address')
    const postalCode = searchParams.get('postalCode')

    if (ownerFirstName || ownerEmail || institutName) {
      setData(prev => ({
        ...prev,
        ownerFirstName: ownerFirstName || prev.ownerFirstName,
        ownerLastName: ownerLastName || prev.ownerLastName,
        ownerEmail: ownerEmail || prev.ownerEmail,
        ownerPhone: ownerPhone || prev.ownerPhone,
        institutName: institutName || prev.institutName,
        city: city || prev.city,
        address: address || prev.address,
        postalCode: postalCode || prev.postalCode,
        billingEmail: ownerEmail || prev.billingEmail,
        billingAddress: address || prev.billingAddress,
        billingPostalCode: postalCode || prev.billingPostalCode,
        billingCity: city || prev.billingCity
      }))
    }
  }, [searchParams])

  // ✅ Sauvegarder automatiquement les données à chaque modification
  useEffect(() => {
    if (typeof window !== 'undefined' && currentStep !== 'complete') {
      localStorage.setItem('onboarding_data', JSON.stringify(data))
      localStorage.setItem('onboarding_step', currentStep)
      localStorage.setItem('onboarding_answers', JSON.stringify(questionnaireAnswers))
    }
  }, [data, currentStep, questionnaireAnswers])

  // ✅ Nettoyer le localStorage une fois l'onboarding terminé
  useEffect(() => {
    if (currentStep === 'complete') {
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('onboarding_step')
      localStorage.removeItem('onboarding_answers')
    }
  }, [currentStep])

  const steps: { id: Step; title: string; description: string; icon: string }[] = [
    { id: 'questionnaire', title: 'Vos Besoins', description: 'Trouvons l\'offre idéale', icon: '📋' },
    { id: 'welcome', title: 'Bienvenue', description: 'Commençons votre aventure', icon: '👋' },
    { id: 'personal-info', title: 'Vos Informations', description: 'Qui êtes-vous ?', icon: '👤' },
    { id: 'business-info', title: 'Votre Institut', description: 'Informations de base', icon: '🏢' },
    { id: 'website-template', title: 'Design & Couleurs', description: 'Personnalisez votre site', icon: '🎨' },
    { id: 'billing', title: 'Facturation', description: 'Informations légales', icon: '📋' },
    { id: 'payment', title: 'Paiement', description: 'Activez votre abonnement', icon: '💳' },
    { id: 'complete', title: 'Terminé', description: 'Tout est prêt !', icon: '🎉' }
  ]

  // Fonction pour calculer le plan recommandé (selon nouvelle structure 2025)
  const getRecommendedPlan = (): OnboardingData['selectedPlan'] => {
    // Récupérer les valeurs textuelles du questionnaire
    const teamSize = questionnaireAnswers.teamSize
    const locations = questionnaireAnswers.locations
    const servicesCount = questionnaireAnswers.servicesCount

    // ===== PREMIUM (179€/mois) : Stock avancé + API + Scale =====
    // API & intégrations = PREMIUM
    if (questionnaireAnswers.needsAPI) {
      return 'PREMIUM'
    }
    // Gestion de stock avancée = PREMIUM
    if (questionnaireAnswers.needsStock) {
      return 'PREMIUM'
    }
    // Beaucoup d'emplacements = PREMIUM (4+)
    if (locations === '4+' || questionnaireAnswers.needsMultiLocation) {
      return 'PREMIUM'
    }
    // Très grande équipe = PREMIUM (10+)
    if (teamSize === '10+') {
      return 'PREMIUM'
    }
    // Multi-sites (2-3) avec automatisation = PREMIUM
    if ((locations === '2' || locations === '3') && questionnaireAnswers.needsAutomation) {
      return 'PREMIUM'
    }

    // ===== TEAM (119€/mois) : E-commerce + Communication multicanal ⭐ LE PLUS RENTABLE =====
    // Blog professionnel = TEAM
    if (questionnaireAnswers.needsBlog) {
      return 'TEAM'
    }
    // Boutique en ligne = TEAM
    if (questionnaireAnswers.needsShop) {
      return 'TEAM'
    }
    // WhatsApp Business = TEAM
    if (questionnaireAnswers.needsWhatsApp) {
      return 'TEAM'
    }
    // SMS Marketing = TEAM
    if (questionnaireAnswers.needsSMS) {
      return 'TEAM'
    }
    // Réseaux sociaux = TEAM
    if (questionnaireAnswers.needsSocial) {
      return 'TEAM'
    }
    // Formations en ligne = TEAM (via boutique)
    if (questionnaireAnswers.needsFormations) {
      return 'TEAM'
    }
    // Multi-emplacements (2-3) = TEAM
    if (locations === '2' || locations === '3') {
      return 'TEAM'
    }
    // Grande équipe (4-10 utilisateurs) = TEAM
    if (teamSize === '4-10') {
      return 'TEAM'
    }
    // Beaucoup de prestations (institut établi) = TEAM (16-30 ou 30+)
    if (servicesCount === '16-30' || servicesCount === '30+') {
      return 'TEAM'
    }
    // Vente produits physiques en ligne = TEAM (via boutique)
    if (questionnaireAnswers.needsInStoreProducts && questionnaireAnswers.needsShop) {
      return 'TEAM'
    }

    // ===== DUO (69€/mois) : CRM Commercial + Email Marketing =====
    // CRM Commercial = DUO
    if (questionnaireAnswers.needsCRM) {
      return 'DUO'
    }
    // Email Marketing = DUO
    if (questionnaireAnswers.needsEmailMarketing) {
      return 'DUO'
    }
    // Automation marketing de base = DUO
    if (questionnaireAnswers.needsAutomation) {
      return 'DUO'
    }
    // Petite équipe (2-3 utilisateurs) = DUO
    if (teamSize === '2-3') {
      return 'DUO'
    }
    // Plusieurs prestations mais pas énormément = DUO (6-15)
    if (servicesCount === '6-15') {
      return 'DUO'
    }

    // ===== SOLO (49€/mois) : Base uniquement =====
    // Par défaut pour praticiens solo avec besoins basiques
    // Tous les essentiels sont DÉJÀ inclus dans SOLO :
    // - Site web + Réservations 24/7
    // - Gestion clients + Planning
    // - Programme fidélité VIP complet
    // - Cartes cadeaux
    // - Avis clients (collecte + photos + Google Reviews)
    // - Comptabilité complète
    // - Paiement en ligne
    return 'SOLO'
  }

  // Helper pour générer les couleurs dérivées basées sur la couleur choisie
  const getBrandColors = (baseColor: string) => {
    return {
      primary: baseColor,
      primaryLight: `${baseColor}20`, // 20% opacity
      primaryDark: `${baseColor}DD`,  // Darker version
    }
  }

  // Flux simplifié si skip=true
  const simplifiedFlow: Step[] = ['personal-info', 'business-info', 'billing', 'payment', 'complete']
  const activeFlow = skipQuestionnaire ? simplifiedFlow : steps.map(s => s.id)

  const currentStepIndex = activeFlow.findIndex(s => s === currentStep)
  const progress = ((currentStepIndex + 1) / activeFlow.length) * 100

  // Auto-générer slug depuis le nom
  useEffect(() => {
    if (data.institutName) {
      const slug = data.institutName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setData(prev => ({ ...prev, slug, subdomain: slug }))
    }
  }, [data.institutName])

  const handleNext = () => {
    // Parcours simplifié si skip=true : personal-info → business-info → billing → payment → complete
    const simplifiedFlow: Step[] = ['personal-info', 'business-info', 'billing', 'payment', 'complete']
    const fullFlow: Step[] = steps.map(s => s.id)

    const flow = skipQuestionnaire ? simplifiedFlow : fullFlow
    const stepIndex = flow.findIndex(s => s === currentStep)

    if (stepIndex < flow.length - 1) {
      setCurrentStep(flow[stepIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    // Parcours simplifié si skip=true
    const simplifiedFlow: Step[] = ['personal-info', 'business-info', 'billing', 'payment', 'complete']
    const fullFlow: Step[] = steps.map(s => s.id)

    const flow = skipQuestionnaire ? simplifiedFlow : fullFlow
    const stepIndex = flow.findIndex(s => s === currentStep)

    if (stepIndex > 0) {
      setCurrentStep(flow[stepIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      // Créer l'organisation avec toutes les données
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }

      const result = await response.json()

      // Rediriger vers Stripe Checkout pour le paiement
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        setCurrentStep('complete')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const planDetails = {
    SOLO: { name: 'Solo', price: 39, icon: '👤' },
    DUO: { name: 'Duo', price: 69, icon: '👥' },
    TEAM: { name: 'Team', price: 119, icon: '👨‍👩‍👧' },
    PREMIUM: { name: 'Premium', price: 179, icon: '⭐' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header avec progression */}
      <div className="bg-white border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/platform" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <span className="text-xl">🌸</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                LAIA Connect
              </span>
            </Link>
            <div className="text-sm text-gray-600">
              Étape {currentStepIndex + 1} sur {steps.length}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Étape Questionnaire */}
        {currentStep === 'questionnaire' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Trouvons l'offre parfaite pour vous
              </h2>
              <p className="text-gray-600">
                Répondez à quelques questions pour que nous puissions vous recommander le plan le plus adapté
              </p>
            </div>

            <div className="space-y-6">
              {/* Question 1 : Taille de l'équipe */}
              <div className="p-6 border-2 border-purple-100 rounded-xl bg-gradient-to-br from-purple-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  1. Combien de personnes travaillent dans votre institut ? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['1', '2-3', '4-10', '10+'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setQuestionnaireAnswers({ ...questionnaireAnswers, teamSize: option })}
                      className={`p-4 border-2 rounded-lg transition font-semibold ${
                        questionnaireAnswers.teamSize === option
                          ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                      }`}
                    >
                      {option === '1' ? 'Solo' : option === '2-3' ? '2-3 personnes' : option === '4-10' ? '4-10 personnes' : 'Plus de 10'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 : Nombre d'emplacements */}
              <div className="p-6 border-2 border-purple-100 rounded-xl bg-gradient-to-br from-purple-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  2. Combien d'emplacements / salons avez-vous ? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['1', '2', '3', '4+'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setQuestionnaireAnswers({ ...questionnaireAnswers, locations: option })}
                      className={`p-4 border-2 rounded-lg transition font-semibold ${
                        questionnaireAnswers.locations === option
                          ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                      }`}
                    >
                      {option === '1' ? 'Un seul' : option === '4+' ? '4 ou plus' : option + ' salons'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2.5 : Nombre de prestations */}
              <div className="p-6 border-2 border-blue-100 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  💆‍♀️ Combien de prestations proposez-vous (ou souhaitez proposer) ? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['1-5', '6-15', '16-30', '30+'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setQuestionnaireAnswers({ ...questionnaireAnswers, servicesCount: option })}
                      className={`p-4 border-2 rounded-lg transition font-semibold ${
                        questionnaireAnswers.servicesCount === option
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  💡 Soins du visage, épilation, massages, manucure, pédicure...
                </p>
              </div>

              {/* Question 4 : Fonctionnalités ESSENTIELLES */}
              <div className="p-6 border-2 border-emerald-100 rounded-xl bg-gradient-to-br from-emerald-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  4. Fonctionnalités Essentielles ✨
                </label>
                <p className="text-sm text-gray-600 mb-1">Les fonctions de base incluses dans tous les plans :</p>
                <div className="bg-gradient-to-r from-emerald-50 to-white p-4 rounded-lg mb-4 border border-emerald-200">
                  <div className="grid grid-cols-2 gap-2 text-sm text-emerald-800">
                    <div>✅ Réservations en ligne</div>
                    <div>✅ Gestion clients & fiches</div>
                    <div>✅ Paiement en ligne</div>
                    <div>✅ Site vitrine personnalisable</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 font-medium">Fonctions optionnelles qui vous intéressent :</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsLoyalty}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsLoyalty: e.target.checked })}
                      className="mt-1 w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🎁 Programme de fidélité</div>
                      <div className="text-sm text-gray-600">Points, récompenses, parrainage automatique</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsReminders}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsReminders: e.target.checked })}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📧 Rappels automatiques</div>
                      <div className="text-sm text-gray-600">Email/SMS 24h avant le rendez-vous</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsPaymentTerminal}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsPaymentTerminal: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💳 Paiement sur place</div>
                      <div className="text-sm text-gray-600">Terminal de paiement intégré</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsAdvancedStats}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsAdvancedStats: e.target.checked })}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📊 Statistiques & Analytics</div>
                      <div className="text-sm text-gray-600">Tableau de bord avancé avec insights</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 5 : Marketing & Communication */}
              <div className="p-6 border-2 border-pink-100 rounded-xl bg-gradient-to-br from-pink-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  5. Marketing & Communication 🚀
                </label>
                <p className="text-sm text-gray-600 mb-4">Attirez et fidélisez vos clients</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-pink-200 rounded-lg cursor-pointer hover:bg-pink-50 transition bg-gradient-to-r from-white to-pink-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsEmailMarketing}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsEmailMarketing: e.target.checked })}
                      className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        📧 Email Marketing
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-bold">Recommandé</span>
                      </div>
                      <div className="text-sm text-gray-600">Campagnes et newsletters personnalisées</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition bg-gradient-to-r from-white to-green-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsWhatsApp}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsWhatsApp: e.target.checked })}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        📱 WhatsApp Business
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Populaire</span>
                      </div>
                      <div className="text-sm text-gray-600">Confirmations et rappels WhatsApp</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsSMS}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsSMS: e.target.checked })}
                      className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💬 SMS Marketing</div>
                      <div className="text-sm text-gray-600">Campagnes SMS promotionnelles</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsSocial}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsSocial: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📱 Publications réseaux sociaux</div>
                      <div className="text-sm text-gray-600">Planification Instagram, Facebook auto</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-teal-200 rounded-lg cursor-pointer hover:bg-teal-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsBlog}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsBlog: e.target.checked })}
                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📝 Blog professionnel</div>
                      <div className="text-sm text-gray-600">Attirez des clients via le SEO</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsAutomation}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsAutomation: e.target.checked })}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">⚡ Automation marketing</div>
                      <div className="text-sm text-gray-600">Scénarios automatisés (anniversaires, inactifs...)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 6 : Vente & E-commerce */}
              <div className="p-6 border-2 border-blue-100 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  6. Vente & E-commerce 🛍️
                </label>
                <p className="text-sm text-gray-600 mb-4">Développez votre chiffre d'affaires</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsShop}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsShop: e.target.checked })}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🛍️ Boutique en ligne</div>
                      <div className="text-sm text-gray-600">Vendez produits et formations en ligne</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsInStoreProducts}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsInStoreProducts: e.target.checked })}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💼 Vente de produits sur place</div>
                      <div className="text-sm text-gray-600">Caisse intégrée pour ventes physiques</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-teal-200 rounded-lg cursor-pointer hover:bg-teal-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsStock}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsStock: e.target.checked })}
                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📦 Gestion de stock</div>
                      <div className="text-sm text-gray-600">Suivi inventaire avec alertes rupture</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsFormations}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsFormations: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🎓 Vente de formations</div>
                      <div className="text-sm text-gray-600">Cours et ateliers payants en ligne</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-rose-200 rounded-lg cursor-pointer hover:bg-rose-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsGiftCards}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsGiftCards: e.target.checked })}
                      className="mt-1 w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🎫 Bons cadeaux</div>
                      <div className="text-sm text-gray-600">Vente et gestion des bons cadeaux</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 7 : Outils Pro & Intégrations */}
              <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  7. Outils Pro & Intégrations ⚙️
                </label>
                <p className="text-sm text-gray-600 mb-4">Pour les instituts avancés</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsCRM}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsCRM: e.target.checked })}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📊 CRM Commercial</div>
                      <div className="text-sm text-gray-600">Pipeline et suivi des prospects</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsAPI}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsAPI: e.target.checked })}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🔌 API & Export comptable</div>
                      <div className="text-sm text-gray-600">Connexion logiciel comptable</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsMultiUser}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsMultiUser: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">👥 Multi-utilisateurs avancé</div>
                      <div className="text-sm text-gray-600">Rôles et permissions personnalisés</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsMultiLocation}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsMultiLocation: e.target.checked })}
                      className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📍 Multi-emplacements</div>
                      <div className="text-sm text-gray-600">Gestion de plusieurs salons</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-pink-200 rounded-lg cursor-pointer hover:bg-pink-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsMobileApp}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsMobileApp: e.target.checked })}
                      className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📱 Application mobile</div>
                      <div className="text-sm text-gray-600">App iOS/Android personnalisée</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Q8 : Migration des données */}
              <div className="bg-white rounded-2xl p-8 border-2 border-blue-200">
                <div className="mb-6">
                  <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Question 8</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">🔄 Migration de vos données existantes</h3>
                  <p className="text-gray-600">Utilisez-vous actuellement un autre logiciel de gestion ?</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsDataMigration}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsDataMigration: e.target.checked })}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💾 Oui, j'ai besoin de migrer mes données</div>
                      <div className="text-sm text-gray-600">Clients, rendez-vous, services, historique...</div>
                    </div>
                  </label>

                  {questionnaireAnswers.needsDataMigration && (
                    <div className="ml-8 mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quel logiciel utilisez-vous actuellement ?
                      </label>
                      <input
                        type="text"
                        value={questionnaireAnswers.currentSoftware}
                        onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, currentSoftware: e.target.value })}
                        placeholder="ex: Planity, Treatwell, Planning.io, Excel..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      />
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 text-lg">ℹ️</span>
                          <div className="text-sm text-blue-800">
                            <div className="font-semibold mb-1">Notre équipe vous accompagne</div>
                            <div>Nous vous aiderons à importer vos données de façon sécurisée et structurée. <strong>Prestation de migration : 300€ (paiement unique)</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Link
                href="/platform"
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
              >
                ← Retour
              </Link>
              <button
                onClick={() => {
                  const recommendedPlan = getRecommendedPlan()
                  setData({ ...data, selectedPlan: recommendedPlan })
                  handleNext()
                }}
                disabled={!questionnaireAnswers.teamSize || !questionnaireAnswers.locations || !questionnaireAnswers.servicesCount}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Voir ma recommandation →
              </button>
            </div>
          </div>
        )}

        {/* Étape Welcome */}
        {currentStep === 'welcome' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-6">✨</div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Parfait ! Voici notre recommandation
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Basé sur vos réponses, voici le plan idéal pour vous
              </p>
            </div>

            {/* Plan Header Card */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-2xl">
              <div className="inline-block px-4 py-1 bg-yellow-400 text-purple-900 rounded-full text-sm font-bold mb-4">
                ⭐ RECOMMANDÉ POUR VOUS
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
                <span className="text-5xl md:text-6xl">{planDetails[data.selectedPlan].icon}</span>
                <div className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-bold">
                    {planDetails[data.selectedPlan].name}
                  </div>
                  <div className="text-xl md:text-2xl font-semibold opacity-90">
                    {planDetails[data.selectedPlan].price}€/mois
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span>🎁</span>
                    <span className="font-semibold">1er mois offert</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 bg-white rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <span>✅</span>
                    <span className="font-semibold">30 jours pour tester</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 bg-white rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <span>📌</span>
                    <span className="font-semibold">Engagement 1 an</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Toujours inclus */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-green-200"></div>
                <h3 className="text-xl font-bold text-green-800 px-3">
                  ✅ Toujours inclus (tous les plans)
                </h3>
                <div className="flex-1 h-px bg-green-200"></div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">📊</span>
                    <span><strong>Dashboard</strong> - Tableau de bord et statistiques</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">📅</span>
                    <span><strong>Planning</strong> - Calendrier et disponibilités</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">💆</span>
                    <span><strong>Réservations + Paiements</strong> - Gestion complète</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">✨</span>
                    <span><strong>Services</strong> - Catalogue de prestations</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">👥</span>
                    <span><strong>Clients</strong> - Gestion et historique</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">🎁</span>
                    <span><strong>Fidélité VIP complète</strong> - Paliers + points + parrainage</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">⭐</span>
                    <span><strong>Avis + Photos avant/après</strong> - Collecte et sync Google</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">💰</span>
                    <span><strong>Comptabilité</strong> - Factures + exports + rapports</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">🎨</span>
                    <span><strong>Design + Templates</strong> - Apparence complète</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">🎓</span>
                    <span><strong>Guide de Formation</strong> - Fiches et tutoriels</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-green-900">
                    <span className="text-lg">⚙️</span>
                    <span><strong>Paramètres</strong> - Configuration générale</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Fonctionnalités avancées */}
            {(data.selectedPlan === 'DUO' || data.selectedPlan === 'TEAM' || data.selectedPlan === 'PREMIUM') && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px bg-purple-200"></div>
                  <h3 className="text-xl font-bold text-purple-800 px-3">
                    🚀 Fonctionnalités avancées incluses
                  </h3>
                  <div className="flex-1 h-px bg-purple-200"></div>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* DUO features */}
                    {(data.selectedPlan === 'DUO' || data.selectedPlan === 'TEAM' || data.selectedPlan === 'PREMIUM') && (
                      <>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">🎯</span>
                          <span><strong>CRM complet</strong> - Leads + pipeline + segmentation</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">📧</span>
                          <span><strong>Email Marketing</strong> - Campagnes + automations + analytics</span>
                        </div>
                      </>
                    )}

                    {/* TEAM additional features */}
                    {(data.selectedPlan === 'TEAM' || data.selectedPlan === 'PREMIUM') && (
                      <>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">📝</span>
                          <span><strong>Blog</strong> - Articles + catégories + SEO</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">🛍️</span>
                          <span><strong>Boutique</strong> - Produits + formations + stock léger</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">💬</span>
                          <span><strong>WhatsApp Marketing</strong> - Campagnes + automations</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">📱</span>
                          <span><strong>SMS Marketing</strong> - Campagnes + automations</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-purple-900">
                          <span className="text-lg">📲</span>
                          <span><strong>Réseaux Sociaux</strong> - Instagram + Facebook + TikTok</span>
                        </div>
                      </>
                    )}

                    {/* PREMIUM additional features */}
                    {data.selectedPlan === 'PREMIUM' && (
                      <div className="flex items-start gap-2 text-sm text-purple-900">
                        <span className="text-lg">📦</span>
                        <span><strong>Stock Avancé</strong> - Inventaire + alertes + fournisseurs</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section: Vos limites */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-blue-200"></div>
                <h3 className="text-xl font-bold text-blue-800 px-3">
                  📊 Vos limites
                </h3>
                <div className="flex-1 h-px bg-blue-200"></div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-blue-900">
                    <span className="text-2xl">👤</span>
                    <div>
                      <div className="font-bold">Utilisateurs</div>
                      <div className="text-sm">
                        {data.selectedPlan === 'SOLO' && '1 utilisateur'}
                        {data.selectedPlan === 'DUO' && 'Jusqu\'à 3 utilisateurs'}
                        {data.selectedPlan === 'TEAM' && 'Jusqu\'à 10 utilisateurs'}
                        {data.selectedPlan === 'PREMIUM' && 'Utilisateurs illimités'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-blue-900">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="font-bold">Emplacements</div>
                      <div className="text-sm">
                        {(data.selectedPlan === 'SOLO' || data.selectedPlan === 'DUO') && '1 emplacement'}
                        {data.selectedPlan === 'TEAM' && 'Jusqu\'à 3 emplacements'}
                        {data.selectedPlan === 'PREMIUM' && 'Emplacements illimités'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminder + CTA */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600">
                ✨ Vous pourrez toujours changer de plan plus tard selon vos besoins
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Commencer la configuration →
              </button>
            </div>
          </div>
        )}

        {/* Étape 1 - Informations personnelles */}
        {currentStep === 'personal-info' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👤</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vos informations personnelles
              </h2>
              <p className="text-gray-600">
                Pour créer votre compte administrateur
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={data.ownerFirstName}
                    onChange={(e) => setData({ ...data, ownerFirstName: e.target.value })}
                    placeholder="Marie"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={data.ownerLastName}
                    onChange={(e) => setData({ ...data, ownerLastName: e.target.value })}
                    placeholder="Dupont"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  value={data.ownerEmail}
                  onChange={(e) => setData({ ...data, ownerEmail: e.target.value, billingEmail: data.billingEmail || e.target.value })}
                  placeholder="marie@mon-institut.fr"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce sera votre identifiant de connexion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={data.ownerPhone}
                  onChange={(e) => setData({ ...data, ownerPhone: e.target.value })}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!data.ownerFirstName || !data.ownerLastName || !data.ownerEmail || !data.ownerPhone}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 - Informations institut */}
        {currentStep === 'business-info' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏢</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Informations de votre institut
              </h2>
              <p className="text-gray-600">
                Personnalisez l'apparence de votre espace
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom commercial de votre institut *
                </label>
                <input
                  type="text"
                  value={data.institutName}
                  onChange={(e) => setData({ ...data, institutName: e.target.value, legalName: data.legalName || e.target.value })}
                  placeholder="Ex: Beauté Éternelle Paris"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale (si différente) *
                </label>
                <input
                  type="text"
                  value={data.legalName}
                  onChange={(e) => setData({ ...data, legalName: e.target.value })}
                  placeholder="Ex: Beauté Éternelle SARL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nom légal de votre entreprise (pour la facturation)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro SIRET * (obligatoire)
                </label>
                <input
                  type="text"
                  value={data.siret}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '')
                    setData({ ...data, siret: value })
                    // Valider en temps réel
                    if (value.length === 14) {
                      if (!validateSIRET(value)) {
                        setValidationErrors({ ...validationErrors, siret: 'SIRET invalide (vérification Luhn échouée)' })
                      } else {
                        const newErrors = { ...validationErrors }
                        delete newErrors.siret
                        setValidationErrors(newErrors)
                      }
                    } else if (value.length > 0) {
                      setValidationErrors({ ...validationErrors, siret: 'Le SIRET doit contenir exactement 14 chiffres' })
                    } else {
                      const newErrors = { ...validationErrors }
                      delete newErrors.siret
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="123 456 789 00012"
                  maxLength={14}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.siret ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.siret ? (
                  <p className="text-xs text-red-600 mt-1">❌ {validationErrors.siret}</p>
                ) : data.siret.length === 14 && validateSIRET(data.siret) ? (
                  <p className="text-xs text-green-600 mt-1">✅ SIRET valide</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    14 chiffres - Nécessaire pour la facturation légale
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de TVA intracommunautaire (optionnel)
                </label>
                <input
                  type="text"
                  value={data.tvaNumber}
                  onChange={(e) => setData({ ...data, tvaNumber: e.target.value })}
                  placeholder="FR 12 123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si vous êtes assujetti à la TVA
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse du siège social *
                  </label>
                  <input
                    type="text"
                    value={data.address}
                    onChange={(e) => setData({ ...data, address: e.target.value, billingAddress: data.billingAddress || e.target.value })}
                    placeholder="123 Avenue de la Beauté"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={data.postalCode}
                    onChange={(e) => setData({ ...data, postalCode: e.target.value, billingPostalCode: data.billingPostalCode || e.target.value })}
                    placeholder="75001"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => setData({ ...data, city: e.target.value, billingCity: data.billingCity || e.target.value })}
                  placeholder="Paris"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="useCustomDomain"
                    checked={data.useCustomDomain}
                    onChange={(e) => setData({ ...data, useCustomDomain: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <label htmlFor="useCustomDomain" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900">J'ai déjà mon propre nom de domaine</div>
                    <div className="text-sm text-gray-600">Ex: mon-institut-beaute.fr</div>
                  </label>
                </div>

                {data.useCustomDomain ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre nom de domaine
                    </label>
                    <input
                      type="text"
                      value={data.customDomain}
                      onChange={(e) => setData({ ...data, customDomain: e.target.value })}
                      placeholder="mon-institut-beaute.fr"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ℹ️ Vous devrez configurer les DNS après la création (nous vous guiderons)
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (URL)
                      </label>
                      <input
                        type="text"
                        value={data.slug}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Généré automatiquement
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-domaine gratuit
                      </label>
                      <input
                        type="text"
                        value={data.subdomain}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {data.subdomain}.laia-connect.fr
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={data.primaryColor}
                      onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                      className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.primaryColor}
                      onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="#d4b5a0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="#2c3e50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  💡 <strong>Astuce :</strong> Vous pourrez ajouter votre logo et personnaliser davantage votre espace depuis le tableau de bord.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!data.institutName}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 - Premier service */}
        {currentStep === 'service' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">💆</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Créez votre premier service
              </h2>
              <p className="text-gray-600">
                Vous pourrez en ajouter d'autres plus tard
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du service *
                </label>
                <input
                  type="text"
                  value={data.serviceName}
                  onChange={(e) => setData({ ...data, serviceName: e.target.value })}
                  placeholder="Ex: Soin du visage hydratant"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={data.servicePrice || ''}
                    onChange={(e) => setData({ ...data, servicePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="Ex: 75"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes) *
                  </label>
                  <select
                    value={data.serviceDuration}
                    onChange={(e) => setData({ ...data, serviceDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2h</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={data.serviceDescription}
                  onChange={(e) => setData({ ...data, serviceDescription: e.target.value })}
                  placeholder="Décrivez les bienfaits de ce soin..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  💡 <strong>Conseil :</strong> Une bonne description aide vos clients à comprendre les bénéfices du soin et augmente vos réservations.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!data.serviceName || !data.servicePrice}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 3.5 - Choix du template de site web */}
        {currentStep === 'website-template' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎨</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Design & Couleurs de votre site
              </h2>
              <p className="text-gray-600">
                {(data.selectedPlan === 'SOLO' || data.selectedPlan === 'DUO') && 'Votre plan inclut 9 templates standards'}
                {data.selectedPlan === 'TEAM' && 'Votre plan TEAM inclut 9 templates standards'}
                {data.selectedPlan === 'PREMIUM' && 'Votre plan PREMIUM inclut 12 templates (9 standards + 3 premium exclusifs)'}
              </p>
            </div>

            {/* Sélection des couleurs */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Choisissez vos couleurs</h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Couleur principale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Couleur Principale
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={data.primaryColor}
                      onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <input
                        type="text"
                        value={data.primaryColor}
                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">Cette couleur sera utilisée pour vos boutons, liens et accents</p>
                    </div>
                  </div>
                </div>

                {/* Couleur secondaire */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Couleur Secondaire
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <input
                        type="text"
                        value={data.secondaryColor}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">Utilisée pour les titres et éléments importants</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grille de templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {websiteTemplates
                .filter(template => {
                  // Filtrer selon le plan
                  if (data.selectedPlan === 'PREMIUM') {
                    // PREMIUM a accès à TOUS les templates
                    return true;
                  } else if (data.selectedPlan === 'TEAM') {
                    // TEAM a accès aux templates STANDARD et TEAM
                    return template.minTier === 'STANDARD' || template.minTier === 'TEAM';
                  } else {
                    // SOLO et DUO ont accès uniquement aux templates STANDARD
                    return template.minTier === 'STANDARD';
                  }
                })
                .map((template) => (
                  <div
                    key={template.id}
                    className={`group relative bg-white rounded-xl border-2 transition-all overflow-hidden ${
                      data.websiteTemplateId === template.id
                        ? 'border-purple-500 shadow-xl'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Preview du layout - Mockup visuel */}
                    <div className="h-48 relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 overflow-hidden">
                      {/* Mockup de la structure du template */}
                      <div className="w-full h-full bg-white rounded-md shadow-sm p-2 space-y-1.5">
                        {/* Header / Navigation */}
                        <div className={`h-4 rounded flex items-center gap-1 px-2 ${
                          template.id.includes('modern') || template.id.includes('fresh')
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : template.id.includes('luxe') || template.id.includes('elegance')
                            ? 'bg-gradient-to-r from-gray-800 to-gray-700'
                            : template.id.includes('medical') || template.id.includes('professional')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500'
                            : template.id.includes('zen')
                            ? 'bg-gradient-to-r from-green-500 to-teal-500'
                            : 'bg-gradient-to-r from-gray-700 to-gray-600'
                        }`}>
                          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                        </div>

                        {/* Hero Section */}
                        <div className={`h-12 rounded flex items-center justify-center ${
                          template.id.includes('modern') || template.id.includes('fresh')
                            ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                            : template.id.includes('luxe') || template.id.includes('elegance')
                            ? 'bg-gradient-to-br from-gray-100 to-gray-200'
                            : template.id.includes('medical') || template.id.includes('professional')
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                            : template.id.includes('zen')
                            ? 'bg-gradient-to-br from-green-50 to-teal-50'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200'
                        }`}>
                          <div className="space-y-1 w-full px-3">
                            <div className="h-1.5 bg-gray-400/40 rounded w-2/3 mx-auto"></div>
                            <div className="h-1 bg-gray-400/30 rounded w-1/2 mx-auto"></div>
                          </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-3 gap-1.5 h-14">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-100 rounded p-1.5 space-y-1">
                              <div className="h-6 bg-gray-200 rounded"></div>
                              <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>

                      {/* Badge sélectionné */}
                      {data.websiteTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1.5 shadow-lg">
                          <span className="text-white text-xl">✓</span>
                        </div>
                      )}

                      {/* Badge PREMIUM */}
                      {template.minTier === 'PREMIUM' && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                            PREMIUM
                          </span>
                        </div>
                      )}

                      {/* Icône du template en arrière-plan */}
                      <div className="absolute bottom-2 right-2 text-4xl opacity-20">
                        {template.id === 'classic' && '📋'}
                        {template.id === 'modern' && '🎨'}
                        {template.id === 'minimal' && '✨'}
                        {template.id === 'professional' && '💼'}
                        {template.id === 'boutique' && '💕'}
                        {template.id === 'fresh' && '⚡'}
                        {template.id === 'luxe' && '👑'}
                        {template.id === 'elegance' && '💎'}
                        {template.id === 'zen' && '🧘'}
                        {template.id === 'medical' && '🏥'}
                        {template.id === 'spa-luxe' && '🌺'}
                        {template.id === 'laser-tech' && '⚡'}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                      {/* Pages incluses selon le plan */}
                      <div className="mb-3 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-xs font-semibold text-purple-900 mb-1.5">📄 Pages de votre site :</p>
                        <div className="space-y-0.5 text-xs text-purple-800">
                          {/* Pages de base (tous les plans) */}
                          <div>✓ Accueil • Services • Réserver</div>
                          <div>✓ À propos • Contact • Avis clients</div>
                          <div>✓ Programme fidélité • Cartes cadeaux</div>

                          {/* Pages DUO+ */}
                          {(data.selectedPlan === 'DUO' || data.selectedPlan === 'TEAM' || data.selectedPlan === 'PREMIUM') && (
                            <div className="text-blue-700 font-medium">✓ CRM • Leads • Email Marketing</div>
                          )}

                          {/* Pages TEAM+ */}
                          {(data.selectedPlan === 'TEAM' || data.selectedPlan === 'PREMIUM') && (
                            <>
                              <div className="text-green-700 font-medium">✓ Blog • Boutique en ligne</div>
                              <div className="text-green-700 font-medium">✓ WhatsApp • SMS • Réseaux sociaux</div>
                            </>
                          )}

                          {/* Pages PREMIUM */}
                          {data.selectedPlan === 'PREMIUM' && (
                            <div className="text-indigo-700 font-medium">✓ Gestion stock • API & Intégrations</div>
                          )}
                        </div>
                      </div>

                      {/* Caractéristiques du design */}
                      <div className="space-y-1.5 mb-3">
                        <p className="text-xs font-semibold text-gray-700">🎨 Style du design :</p>
                        {template.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="text-purple-500 flex-shrink-0 mt-0.5">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPreviewTemplate(template.id)
                            setPreviewPage('home')
                          }}
                          className="flex-1 py-2.5 px-4 border-2 border-purple-500 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all text-sm"
                        >
                          👁️ Prévisualiser
                        </button>
                        <button
                          onClick={() => setData({ ...data, websiteTemplateId: template.id })}
                          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                            data.websiteTemplateId === template.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {data.websiteTemplateId === template.id ? '✓ Choisi' : 'Choisir'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Boutons navigation */}
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!data.websiteTemplateId}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  data.websiteTemplateId
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ==================== MODALE DE PRÉVISUALISATION TEMPLATE (style Shopify) ==================== */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header de la modale */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {websiteTemplates.find(t => t.id === previewTemplate)?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {websiteTemplates.find(t => t.id === previewTemplate)?.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Color Pickers - Primaire et Secondaire */}
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
                    <label htmlFor="preview-primary-color" className="text-sm font-semibold text-gray-700">
                      Couleur 1 :
                    </label>
                    <input
                      type="color"
                      id="preview-primary-color"
                      value={data.primaryColor}
                      onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                      className="w-12 h-10 border-2 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-mono">{data.primaryColor}</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
                    <label htmlFor="preview-secondary-color" className="text-sm font-semibold text-gray-700">
                      Couleur 2 :
                    </label>
                    <input
                      type="color"
                      id="preview-secondary-color"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="w-12 h-10 border-2 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-mono">{data.secondaryColor}</span>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-3 hover:bg-white/80 rounded-xl transition-all"
                  >
                    <span className="text-3xl text-gray-600">✕</span>
                  </button>
                </div>
              </div>

              {/* Navigation entre les pages */}
              <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50 overflow-x-auto">
                <button
                  onClick={() => setPreviewPage('home')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    previewPage === 'home'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏠 Accueil
                </button>
                <button
                  onClick={() => setPreviewPage('services')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    previewPage === 'services'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💆‍♀️ Services
                </button>
                <button
                  onClick={() => setPreviewPage('booking')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    previewPage === 'booking'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📅 Réservation
                </button>
                <button
                  onClick={() => setPreviewPage('about')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    previewPage === 'about'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ℹ️ À propos
                </button>
                <button
                  onClick={() => setPreviewPage('contact')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    previewPage === 'contact'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📞 Contact
                </button>

                {/* Pages TEAM+ */}
                {(data.selectedPlan === 'TEAM' || data.selectedPlan === 'PREMIUM') && (
                  <>
                    <button
                      onClick={() => setPreviewPage('blog')}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                        previewPage === 'blog'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📝 Blog
                    </button>
                    <button
                      onClick={() => setPreviewPage('shop')}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                        previewPage === 'shop'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🛒 Boutique
                    </button>
                  </>
                )}
              </div>

              {/* Contenu de la prévisualisation - Mockup détaillé */}
              <div className="flex-1 p-6 bg-gray-100 overflow-auto">
                <div className="bg-white rounded-xl shadow-2xl h-full overflow-auto border-4 border-gray-300">
                  {/* Simuler un navigateur */}
                  <div className="bg-gray-800 p-3 flex items-center gap-2 sticky top-0 z-10">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300">
                      https://votresite.laia.fr/{previewPage}
                    </div>
                  </div>

                  {/* Mockup détaillé de la page selon le template */}
                  <div className={`p-8 min-h-[800px] ${
                    previewTemplate === 'luxe' || previewTemplate === 'elegance' || previewTemplate === 'spa-luxe'
                      ? 'bg-gradient-to-br from-gray-900 to-black'
                      : previewTemplate === 'minimal'
                      ? 'bg-white'
                      : previewTemplate === 'zen'
                      ? 'bg-gradient-to-br from-green-50 to-teal-50'
                      : previewTemplate === 'laia-skin'
                      ? 'bg-gradient-to-br from-[#f5f0eb] to-[#ede6df]'
                      : 'bg-gradient-to-br from-gray-50 to-white'
                  }`}>

                    {/* ========== CLASSIC TEMPLATE ========== */}
                    {previewTemplate === 'classic' && (
                      <>
                        <div className="bg-white mb-8 py-4 px-8 flex items-center justify-between border-b-4" style={{ borderColor: data.primaryColor }}>
                          <div className="text-3xl font-serif font-bold" style={{ color: data.secondaryColor }}>
                            {data.institutName || 'Votre Institut'}
                          </div>
                          <nav className="flex gap-8 text-sm uppercase tracking-wide font-semibold" style={{ color: data.secondaryColor }}>
                            <div className="hover:opacity-70 cursor-pointer">Accueil</div>
                            <div className="hover:opacity-70 cursor-pointer">Services</div>
                            <div className="hover:opacity-70 cursor-pointer">À propos</div>
                            <div className="hover:opacity-70 cursor-pointer">Contact</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== MODERN TEMPLATE ========== */}
                    {previewTemplate === 'modern' && (
                      <>
                        <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})` }}></div>
                        <div className="flex items-center justify-between mb-12 py-6">
                          <div className="text-4xl font-black bg-clip-text text-transparent" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {(data.institutName || 'BEAUTY').toUpperCase()}
                          </div>
                          <nav className="flex gap-6 text-sm font-medium" style={{ color: data.secondaryColor }}>
                            <div className="cursor-pointer transition-opacity hover:opacity-70">Accueil</div>
                            <div className="cursor-pointer transition-opacity hover:opacity-70">Services</div>
                            <div className="cursor-pointer transition-opacity hover:opacity-70">Réserver</div>
                            <div className="cursor-pointer transition-opacity hover:opacity-70">Contact</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== MINIMAL TEMPLATE ========== */}
                    {previewTemplate === 'minimal' && (
                      <>
                        <div className="text-center py-12 mb-16">
                          <div className="text-sm uppercase tracking-[0.3em] mb-8" style={{ color: data.secondaryColor }}>
                            Institut de beauté • {data.city || 'Paris'}
                          </div>
                          <div className="text-6xl font-thin mb-8" style={{ color: data.primaryColor }}>
                            {data.institutName || 'Votre Institut'}
                          </div>
                          <nav className="flex gap-12 justify-center text-xs uppercase tracking-widest" style={{ color: data.secondaryColor }}>
                            <div className="hover:opacity-70 cursor-pointer">Accueil</div>
                            <div className="hover:opacity-70 cursor-pointer">Services</div>
                            <div className="hover:opacity-70 cursor-pointer">Contact</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== PROFESSIONAL TEMPLATE ========== */}
                    {previewTemplate === 'professional' && (
                      <>
                        <div className="text-white py-3 px-8 rounded-lg mb-8 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})` }}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-lg" style={{ color: data.primaryColor }}>
                              {(data.institutName || 'Institut')[0]}
                            </div>
                            <div className="font-bold text-xl">
                              {(data.institutName || 'VOTRE INSTITUT').toUpperCase()}
                            </div>
                          </div>
                          <nav className="flex gap-6 text-sm">
                            <div className="hover:underline cursor-pointer">Accueil</div>
                            <div className="hover:underline cursor-pointer">Services</div>
                            <div className="hover:underline cursor-pointer">Équipe</div>
                            <div className="hover:underline cursor-pointer">Contact</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== LUXE TEMPLATE ========== */}
                    {previewTemplate === 'luxe' && (
                      <>
                        <div className="pb-8 mb-12" style={{ borderBottom: `1px solid ${data.primaryColor}` }}>
                          <div className="text-center">
                            <div className="text-5xl font-serif mb-2" style={{ color: data.primaryColor }}>
                              ✦ {data.institutName || 'Luxe Institut'} ✦
                            </div>
                            <div className="text-sm uppercase tracking-[0.5em]" style={{ color: data.secondaryColor }}>
                              {data.city || 'Paris'}
                            </div>
                          </div>
                          <nav className="flex gap-12 justify-center text-sm uppercase tracking-widest mt-8" style={{ color: data.primaryColor }}>
                            <div className="hover:opacity-70 cursor-pointer">Accueil</div>
                            <div className="hover:opacity-70 cursor-pointer">Soins</div>
                            <div className="hover:opacity-70 cursor-pointer">Spa</div>
                            <div className="hover:opacity-70 cursor-pointer">Contact</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== ZEN TEMPLATE ========== */}
                    {previewTemplate === 'zen' && (
                      <>
                        <div className="text-center mb-16">
                          <div className="text-6xl mb-4">🌿</div>
                          <div className="text-4xl font-light mb-6" style={{ color: data.primaryColor }}>
                            {data.institutName || 'Zen & Bien-être'}
                          </div>
                          <nav className="flex gap-8 justify-center text-sm font-light" style={{ color: data.secondaryColor }}>
                            <div className="hover:opacity-70 cursor-pointer">Accueil</div>
                            <div className="hover:opacity-70 cursor-pointer">Soins</div>
                            <div className="hover:opacity-70 cursor-pointer">Massages</div>
                            <div className="hover:opacity-70 cursor-pointer">Contact</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== MEDICAL TEMPLATE (PREMIUM) ========== */}
                    {previewTemplate === 'medical' && (
                      <>
                        <div className="bg-white shadow-lg py-5 px-8 mb-8 flex items-center justify-between" style={{ borderLeft: `4px solid ${data.primaryColor}` }}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}, ${data.secondaryColor})` }}>
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-bold text-xl" style={{ color: data.secondaryColor }}>
                                {data.institutName || 'Medical Institut'}
                              </div>
                              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: data.primaryColor }}>
                                Esthétique Médicale Certifiée
                              </div>
                            </div>
                          </div>
                          <nav className="flex gap-8 text-sm font-medium text-gray-700">
                            <div className="cursor-pointer transition hover:opacity-70">Accueil</div>
                            <div className="cursor-pointer transition hover:opacity-70">Traitements</div>
                            <div className="cursor-pointer transition hover:opacity-70">Équipe Médicale</div>
                            <div className="px-4 py-2 text-white rounded-lg cursor-pointer transition hover:opacity-90" style={{ backgroundColor: data.primaryColor }}>
                              Consultation
                            </div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== SPA LUXE TEMPLATE (PREMIUM) ========== */}
                    {previewTemplate === 'spa-luxe' && (
                      <>
                        <div className="pb-8 mb-12" style={{ borderBottom: `1px solid ${data.primaryColor}40` }}>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-serif" style={{ color: data.primaryColor }}>
                              🌺 {data.institutName || 'Spa Luxe'}
                            </div>
                            <nav className="flex gap-8 text-sm uppercase tracking-widest" style={{ color: data.secondaryColor }}>
                              <div className="hover:opacity-70 cursor-pointer">Accueil</div>
                              <div className="hover:opacity-70 cursor-pointer">Rituels</div>
                              <div className="hover:opacity-70 cursor-pointer">Parcours</div>
                              <div className="hover:opacity-70 cursor-pointer">Réserver</div>
                            </nav>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ========== LASER TECH TEMPLATE (PREMIUM) ========== */}
                    {previewTemplate === 'laser-tech' && (
                      <>
                        <div className="flex items-center justify-between mb-12 py-6 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-lg" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})` }}>
                              {(data.institutName || 'LT')[0]}
                            </div>
                            <div className="text-2xl font-black bg-clip-text text-transparent" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              {(data.institutName || 'LASER TECH').toUpperCase()}
                            </div>
                          </div>
                          <nav className="flex gap-6 text-sm font-medium" style={{ color: data.secondaryColor }}>
                            <div className="cursor-pointer hover:opacity-70">Accueil</div>
                            <div className="cursor-pointer hover:opacity-70">Technologie</div>
                            <div className="cursor-pointer hover:opacity-70">Traitements</div>
                            <div className="cursor-pointer hover:opacity-70">Consultation</div>
                          </nav>
                        </div>
                      </>
                    )}

                    {/* ========== LAIA SKIN TEMPLATE (PREMIUM) ========== */}
                    {previewTemplate === 'laia-skin' && (
                      <>
                        <div className="shadow-md mb-12 py-6 px-8 rounded-2xl" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD, ${data.primaryColor})` }}>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-serif" style={{ color: data.secondaryColor }}>
                              {data.institutName || 'Laia Skin Institut'}
                            </div>
                            <nav className="flex gap-8 text-sm font-medium" style={{ color: data.secondaryColor }}>
                              <div className="hover:opacity-70 cursor-pointer transition">Accueil</div>
                              <div className="hover:opacity-70 cursor-pointer transition">Soins</div>
                              <div className="hover:opacity-70 cursor-pointer transition">À propos</div>
                              <div className="hover:opacity-70 cursor-pointer transition">Contact</div>
                            </nav>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Headers pour autres templates */}
                    {!['classic', 'modern', 'minimal', 'professional', 'luxe', 'zen', 'medical', 'spa-luxe', 'laser-tech', 'laia-skin'].includes(previewTemplate || '') && (
                      <div className="h-20 rounded-lg shadow-lg mb-8 flex items-center justify-between px-8" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})` }}>
                        <div className="text-2xl font-bold text-white">
                          {(data.institutName || 'VOTRE INSTITUT').toUpperCase()}
                        </div>
                        <div className="flex gap-6 text-white text-sm font-medium">
                          <div className="hover:opacity-70 cursor-pointer">Accueil</div>
                          <div className="hover:opacity-70 cursor-pointer">Services</div>
                          <div className="hover:opacity-70 cursor-pointer">Réserver</div>
                          <div className="hover:opacity-70 cursor-pointer">Contact</div>
                        </div>
                      </div>
                    )}

                    {/* Contenu selon la page */}
                    {previewPage === 'home' && (
                      <>
                        {/* ========== CLASSIC LAYOUT ========== */}
                        {previewTemplate === 'classic' && (
                          <div className="max-w-6xl mx-auto space-y-20">
                            {/* Hero Section - Traditional & Elegant */}
                            <div className="text-center p-16 bg-gray-50 shadow-2xl border-4" style={{ borderColor: data.primaryColor }}>
                              <h1 className="text-6xl font-serif font-bold text-gray-900 mb-6">Institut de Beauté d'Excellence</h1>
                              <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Tradition et savoir-faire depuis 1995. L'excellence au service de votre bien-être.
                              </p>
                              <button
                                className="px-12 py-4 text-white uppercase tracking-wide font-bold shadow-xl hover:shadow-2xl transition-all"
                                style={{ backgroundColor: data.primaryColor }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              >
                                Prendre Rendez-vous
                              </button>
                            </div>

                            {/* Values Section with elegant borders */}
                            <div className="grid grid-cols-3 gap-8 text-center">
                              {[
                                { icon: '💆‍♀️', title: 'Soins Experts', desc: '20 ans d\'expérience' },
                                { icon: '🌟', title: 'Qualité Premium', desc: 'Produits haut de gamme' },
                                { icon: '📍', title: 'Paris Centre', desc: 'Accès facile' }
                              ].map((item, i) => (
                                <div
                                  key={i}
                                  className="border-2 p-8 bg-white hover:shadow-xl transition-all group"
                                  style={{ borderColor: '#e5e7eb' }}
                                  onMouseEnter={(e) => e.currentTarget.style.borderColor = data.primaryColor}
                                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                >
                                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                  <h3 className="text-xl font-serif font-bold mb-2 text-gray-900">{item.title}</h3>
                                  <p className="text-gray-600">{item.desc}</p>
                                </div>
                              ))}
                            </div>

                            {/* Featured Services Showcase - Classic Style */}
                            <div className="space-y-8 border-t-2 border-b-2 py-16" style={{ borderColor: data.primaryColor }}>
                              <div className="text-center mb-12">
                                <div className="text-sm uppercase tracking-widest text-gray-600 mb-3">Nos Prestations</div>
                                <h2 className="text-4xl font-serif font-bold text-gray-900">Services d'Excellence</h2>
                              </div>
                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Soin du Visage Classique', duration: '75 min', price: '85€', category: 'Visage' },
                                  { name: 'Massage Traditionnel', duration: '90 min', price: '110€', category: 'Corps' },
                                  { name: 'Manucure Française', duration: '45 min', price: '55€', category: 'Mains' }
                                ].map((service, i) => (
                                  <div
                                    key={i}
                                    className="bg-white border-2 transition-all group shadow-lg hover:shadow-2xl"
                                    style={{ borderColor: '#e5e7eb' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = data.primaryColor}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                  >
                                    <div className="relative overflow-hidden">
                                      <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-500"></div>
                                      <div
                                        className="absolute top-4 left-4 px-4 py-2 text-white text-xs uppercase tracking-wide font-bold"
                                        style={{ backgroundColor: data.primaryColor }}
                                      >
                                        {service.category}
                                      </div>
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/50">
                                        <div className="text-center text-white">
                                          <div className="text-6xl mb-3">✨</div>
                                          <div className="text-sm uppercase tracking-wide">Voir détails</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-8 text-center border-t-2" style={{ borderColor: data.primaryColor }}>
                                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{service.name}</h3>
                                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                                        <span>⏱</span>
                                        <span>{service.duration}</span>
                                      </div>
                                      <div className="text-3xl font-serif font-bold text-gray-900 mb-6">{service.price}</div>
                                      <button
                                        className="w-full py-3 text-white uppercase tracking-wide text-sm font-bold transition-all"
                                        style={{ backgroundColor: data.primaryColor }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                      >
                                        Réserver
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Section - Classic Typography */}
                            <div className="bg-gray-900 text-white py-16 px-12 -mx-8 shadow-2xl">
                              <div className="grid grid-cols-4 gap-12 text-center">
                                {[
                                  { number: '29', label: 'Années d\'expérience', suffix: 'ans' },
                                  { number: '5000', label: 'Clientes satisfaites', suffix: '+' },
                                  { number: '45', label: 'Soins proposés', suffix: '' },
                                  { number: '98', label: 'Satisfaction client', suffix: '%' }
                                ].map((stat, i) => (
                                  <div key={i} className="border-l-2 border-white/30 first:border-l-0 pl-8 first:pl-0">
                                    <div className="text-5xl font-serif font-bold mb-2">
                                      {stat.number}<span className="text-3xl">{stat.suffix}</span>
                                    </div>
                                    <div className="text-sm uppercase tracking-widest text-gray-400">{stat.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Photo Gallery Section - Traditional Layout */}
                            <div className="space-y-8">
                              <div className="text-center">
                                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Nos Espaces Raffinés</h2>
                                <p className="text-lg text-gray-700">Un cadre élégant pour votre détente</p>
                              </div>
                              <div className="grid grid-cols-4 gap-6">
                                {['Cabine Prestige', 'Salon VIP', 'Espace Détente', 'Réception'].map((space, i) => (
                                  <div key={i} className="group relative overflow-hidden border-4 shadow-lg hover:shadow-2xl transition-all" style={{ borderColor: data.primaryColor }}>
                                    <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                    <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/80 transition-colors flex items-center justify-center">
                                      <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="text-6xl mb-3">📸</div>
                                        <div className="font-serif font-bold text-xl mb-1">{space}</div>
                                        <div className="text-sm uppercase tracking-wide">Ajoutez votre photo</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Testimonials Section - Classic Style */}
                            <div className="space-y-10 border-t-2 pt-16" style={{ borderColor: data.primaryColor }}>
                              <h2 className="text-4xl font-serif font-bold text-center text-gray-900">Témoignages de nos Clientes</h2>
                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Marie L.', location: 'Paris 8ème', text: 'Un institut d\'exception où l\'élégance rencontre le professionnalisme. Les soins sont d\'une qualité remarquable.' },
                                  { name: 'Sophie D.', location: 'Paris 16ème', text: 'Depuis 10 ans que je fréquente cet institut, je n\'ai jamais été déçue. Un savoir-faire incomparable.' },
                                  { name: 'Catherine B.', location: 'Neuilly', text: 'L\'excellence à la française. Un lieu où chaque détail compte, du décor aux prestations.' }
                                ].map((testimonial, i) => (
                                  <div key={i} className="bg-white border-2 border-gray-300 p-8 shadow-lg relative">
                                    <div className="absolute -top-6 -left-4 text-8xl font-serif text-gray-300 leading-none">"</div>
                                    <div className="relative z-10">
                                      <div className="flex items-center mb-6">
                                        <div className="w-16 h-16 rounded-full border-2 bg-gradient-to-br from-gray-200 to-gray-300 mr-4" style={{ borderColor: data.primaryColor }}></div>
                                        <div>
                                          <div className="font-serif font-bold text-gray-900">{testimonial.name}</div>
                                          <div className="text-sm text-gray-600">{testimonial.location}</div>
                                          <div className="text-yellow-600 text-sm mt-1">★★★★★</div>
                                        </div>
                                      </div>
                                      <p className="text-gray-700 leading-relaxed italic">{testimonial.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Team Showcase - Traditional */}
                            <div className="bg-gray-50 border-4 p-12 shadow-2xl" style={{ borderColor: data.primaryColor }}>
                              <div className="text-center mb-12">
                                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Notre Équipe d'Expertes</h2>
                                <p className="text-lg text-gray-700">Des professionnelles passionnées à votre service</p>
                              </div>
                              <div className="grid grid-cols-4 gap-8">
                                {[
                                  { name: 'Marie Laurent', role: 'Directrice & Fondatrice', exp: '25 ans' },
                                  { name: 'Sophie Martin', role: 'Esthéticienne Senior', exp: '15 ans' },
                                  { name: 'Julie Dubois', role: 'Spécialiste Soins', exp: '12 ans' },
                                  { name: 'Emma Petit', role: 'Esthéticienne', exp: '8 ans' }
                                ].map((member, i) => (
                                  <div key={i} className="text-center group">
                                    <div className="w-40 h-40 mx-auto mb-4 border-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform shadow-xl" style={{ borderColor: data.primaryColor }}></div>
                                    <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{member.exp} d'expérience</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Final CTA - Classic Style */}
                            <div className="text-center border-4 p-16 shadow-2xl" style={{ borderColor: data.primaryColor, background: `linear-gradient(to bottom right, ${data.primaryColor}, ${data.primaryColor}DD)` }}>
                              <h2 className="text-5xl font-serif font-bold text-white mb-6">Vivez l'Excellence</h2>
                              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                                Offrez-vous un moment d'exception dans un cadre raffiné
                              </p>
                              <button className="px-16 py-5 bg-white uppercase tracking-widest font-bold hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all text-lg" style={{ color: data.primaryColor }}>
                                Prendre Rendez-vous
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ========== MODERN LAYOUT ========== */}
                        {previewTemplate === 'modern' && (
                          <div className="space-y-24">
                            {/* Hero Section - Larger & More Impressive */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}10, ${data.primaryColor}15)` }}></div>
                              <div className="relative grid grid-cols-2 gap-16 items-center p-16">
                                <div className="space-y-8">
                                  <div
                                    className="inline-block px-4 py-2 rounded-full text-white text-xs uppercase tracking-wider font-bold shadow-lg"
                                    style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}
                                  >
                                    ✨ Nouveau concept
                                  </div>
                                  <h1 className="text-8xl font-black text-gray-900 leading-tight">
                                    Beauté<br/>
                                    <span className="bg-clip-text text-transparent" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Réinventée</span>
                                  </h1>
                                  <p className="text-2xl text-gray-700 leading-relaxed">
                                    L'expérience ultime du bien-être. Technologie de pointe, expertise reconnue, résultats exceptionnels.
                                  </p>
                                  <div className="flex gap-4">
                                    <button
                                      className="px-12 py-5 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
                                      style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}
                                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                      Réserver maintenant →
                                    </button>
                                    <button
                                      className="px-12 py-5 border-2 text-gray-900 font-bold rounded-full transition-all"
                                      style={{ borderColor: '#e5e7eb' }}
                                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = data.primaryColor; e.currentTarget.style.color = data.primaryColor; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#111827'; }}
                                    >
                                      Découvrir
                                    </button>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}, ${data.primaryColor}DD)` }}></div>
                                  <div className="relative h-[500px] rounded-3xl shadow-2xl flex items-center justify-center group hover:scale-105 transition-transform duration-500" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}40, ${data.primaryColor}30)` }}>
                                    <div className="text-center">
                                      <div className="text-8xl mb-4 opacity-40">🎥</div>
                                      <p className="font-bold text-lg" style={{ color: data.primaryColor }}>Votre vidéo hero</p>
                                      <p className="text-sm mt-2 opacity-80" style={{ color: data.primaryColor }}>Format 16:9 recommandé</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Values Section - Bold & Modern */}
                            <div className="text-center py-8">
                              <h2 className="text-5xl font-black text-gray-900 mb-4">Pourquoi nous choisir ?</h2>
                              <p className="text-xl text-gray-600 mb-16">Une approche révolutionnaire du bien-être</p>
                              <div className="grid grid-cols-4 gap-8">
                                {[
                                  { emoji: '⚡', label: 'Innovation', desc: 'Technologies dernière génération' },
                                  { emoji: '💎', label: 'Qualité', desc: 'Standards d\'excellence' },
                                  { emoji: '🎯', label: 'Résultats', desc: 'Transformations visibles' },
                                  { emoji: '❤️', label: 'Passion', desc: 'Équipe dévouée' }
                                ].map((item, i) => (
                                  <div key={i} className="group text-center">
                                    <div className="relative mb-6">
                                      <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}, ${data.primaryColor}DD)` }}></div>
                                      <div className="relative rounded-2xl p-8 group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}20, ${data.primaryColor}15)` }}>
                                        <div className="text-7xl">{item.emoji}</div>
                                      </div>
                                    </div>
                                    <div className="text-2xl font-black text-gray-900 mb-2">{item.label}</div>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Featured Services - Modern Grid with Large Images */}
                            <div className="space-y-12">
                              <div className="text-center">
                                <div
                                  className="inline-block px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold mb-4"
                                  style={{ backgroundColor: `${data.primaryColor}20`, color: data.primaryColor }}
                                >
                                  Nos Soins Signature
                                </div>
                                <h2 className="text-5xl font-black text-gray-900 mb-4">Services Premium</h2>
                                <p className="text-xl text-gray-600">Des expériences inoubliables</p>
                              </div>
                              <div className="grid grid-cols-3 gap-10">
                                {[
                                  { name: 'HydraGlow Facial', duration: '60 min', price: '95€', category: 'Visage' },
                                  { name: 'Deep Tissue Massage', duration: '90 min', price: '120€', category: 'Corps' },
                                  { name: 'Laser Hair Removal', duration: '45 min', price: '150€', category: 'Épilation' }
                                ].map((service, i) => (
                                  <div key={i} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                                    <div className="relative overflow-hidden">
                                      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform duration-700" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}15, ${data.primaryColor}25)` }}></div>
                                      <div
                                        className="absolute top-6 right-6 px-5 py-2 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-lg"
                                        style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}
                                      >
                                        {service.category}
                                      </div>
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                        <button className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-transform">
                                          Explorer
                                        </button>
                                      </div>
                                    </div>
                                    <div className="p-8">
                                      <h3 className="text-2xl font-black text-gray-900 mb-3">{service.name}</h3>
                                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                                        <span className="flex items-center gap-1">
                                          <span className="text-lg">⏱️</span>
                                          {service.duration}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-4xl font-black bg-clip-text text-transparent" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                          {service.price}
                                        </div>
                                        <button
                                          className="px-6 py-3 text-white rounded-full font-bold hover:shadow-lg transition-all"
                                          style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}
                                        >
                                          Réserver
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Photo Gallery - Asymmetric Grid */}
                            <div className="-mx-8 px-8 py-20 rounded-3xl" style={{ background: `linear-gradient(to bottom right, #f9fafb, ${data.primaryColor}10)` }}>
                              <div className="text-center mb-16">
                                <h2 className="text-5xl font-black text-gray-900 mb-4">Nos Espaces Design</h2>
                                <p className="text-xl text-gray-600">Un environnement pensé pour votre confort</p>
                              </div>
                              <div className="grid grid-cols-6 gap-6">
                                {[
                                  { name: 'Cabine VIP', cols: 'col-span-4', rows: 'row-span-2', height: 'h-[600px]' },
                                  { name: 'Espace Zen', cols: 'col-span-2', rows: 'row-span-1', height: 'h-72' },
                                  { name: 'Salle Tech', cols: 'col-span-2', rows: 'row-span-1', height: 'h-72' },
                                  { name: 'Réception', cols: 'col-span-3', rows: 'row-span-1', height: 'h-72' },
                                  { name: 'Lounge', cols: 'col-span-3', rows: 'row-span-1', height: 'h-72' }
                                ].map((space, i) => (
                                  <div key={i} className={`${space.cols} ${space.rows} group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all`}>
                                    <div className={`w-full ${space.height}`} style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}30, ${data.primaryColor}20)` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-10">
                                      <div className="text-center text-white">
                                        <div className="text-6xl mb-3">📸</div>
                                        <div className="text-2xl font-bold mb-1">{space.name}</div>
                                        <div className="text-sm">Ajoutez votre photo</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Video Section */}
                            <div className="grid grid-cols-2 gap-12 items-center">
                              <div className="relative h-96 rounded-3xl shadow-2xl flex items-center justify-center group" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}60, ${data.primaryColor}40)` }}>
                                <div className="text-center">
                                  <div className="text-8xl mb-4 text-white/60">▶️</div>
                                  <p className="text-white font-bold text-xl">Découvrez notre univers</p>
                                  <p className="text-white/80 text-sm mt-2">Vidéo de présentation</p>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <h2 className="text-4xl font-black text-gray-900">Une Expérience Unique</h2>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                  Plongez dans un univers où technologie et bien-être se rencontrent. Notre institut redéfinit les standards de l'esthétique moderne.
                                </p>
                                <ul className="space-y-4">
                                  {['Équipements dernière génération', 'Protocoles innovants certifiés', 'Équipe d\'experts passionnés'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}>✓</div>
                                      <span className="text-gray-900 font-medium">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Testimonials - Modern Cards */}
                            <div className="space-y-12">
                              <h2 className="text-5xl font-black text-center text-gray-900">Avis Clients</h2>
                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Laura M.', rating: 5, text: 'Incroyable ! Un institut moderne qui tient toutes ses promesses. Les résultats sont au rendez-vous.' },
                                  { name: 'Emma D.', rating: 5, text: 'L\'équipe est exceptionnelle et les équipements sont vraiment à la pointe. Je recommande à 100%.' },
                                  { name: 'Sarah L.', rating: 5, text: 'Une expérience hors du commun. Le cadre est magnifique et les soins d\'une qualité irréprochable.' }
                                ].map((review, i) => (
                                  <div key={i} className="bg-white rounded-3xl shadow-xl p-8 relative hover:shadow-2xl transition-all">
                                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}>
                                      "
                                    </div>
                                    <div className="flex items-center mb-6">
                                      <div className="w-16 h-16 rounded-full mr-4 shadow-lg" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}50, ${data.primaryColor}40)` }}></div>
                                      <div>
                                        <div className="font-black text-gray-900">{review.name}</div>
                                        <div className="text-yellow-500 text-lg">{'★'.repeat(review.rating)}</div>
                                      </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{review.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Section - Modern */}
                            <div className="relative overflow-hidden rounded-3xl">
                              <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}></div>
                              <div className="relative py-20 px-12">
                                <div className="grid grid-cols-4 gap-12 text-center text-white">
                                  {[
                                    { number: '2500', label: 'Clients satisfaits', suffix: '+' },
                                    { number: '15', label: 'Experts certifiés', suffix: '' },
                                    { number: '99', label: 'Satisfaction', suffix: '%' },
                                    { number: '8', label: 'Années d\'innovation', suffix: 'ans' }
                                  ].map((stat, i) => (
                                    <div key={i}>
                                      <div className="text-6xl font-black mb-3">
                                        {stat.number}<span className="text-4xl">{stat.suffix}</span>
                                      </div>
                                      <div className="text-white/90 font-medium">{stat.label}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Instagram Feed Simulation */}
                            <div className="space-y-8">
                              <div className="text-center">
                                <h2 className="text-4xl font-black text-gray-900 mb-3">Suivez-nous sur Instagram</h2>
                                <p className="text-lg text-gray-600">@votreinstitu t</p>
                              </div>
                              <div className="grid grid-cols-6 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                  <div key={i} className="aspect-square rounded-xl hover:scale-105 transition-transform shadow-lg" style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}40, ${data.primaryColor}30)` }}></div>
                                ))}
                              </div>
                            </div>

                            {/* Final CTA - Bold & Modern */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, #111827, ${data.primaryColor}80)` }}></div>
                              <div className="relative text-center py-20 px-12">
                                <h2 className="text-6xl font-black text-white mb-6">Prête à transformer votre beauté ?</h2>
                                <p className="text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
                                  Réservez dès maintenant votre première expérience et découvrez la différence
                                </p>
                                <button
                                  className="px-16 py-6 text-white text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
                                  style={{ background: `linear-gradient(to right, ${data.primaryColor}, ${data.primaryColor}DD)` }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  Réserver maintenant →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========== MINIMAL LAYOUT ========== */}
                        {previewTemplate === 'minimal' && (
                          <div className="max-w-5xl mx-auto space-y-40 py-16">
                            {/* Hero - Ultra Minimal */}
                            <div className="text-center py-24">
                              <div className="text-xs uppercase tracking-[0.5em] text-gray-400 mb-12">Institut de beauté</div>
                              <h1 className="text-9xl font-thin text-gray-900 mb-16 leading-none">Simplicité</h1>
                              <p className="text-3xl text-gray-400 font-thin leading-loose max-w-3xl mx-auto">
                                L'essentiel du bien-être.<br/>Rien de superflu, tout ce qui compte.
                              </p>
                            </div>

                            {/* Philosophy Section */}
                            <div className="text-center space-y-20">
                              <h2 className="text-5xl font-thin text-gray-900">Notre philosophie</h2>
                              <div className="grid grid-cols-3 gap-20">
                                {[
                                  { word: 'Épuré', desc: 'Design minimaliste et apaisant' },
                                  { word: 'Authentique', desc: 'Produits naturels sélectionnés' },
                                  { word: 'Essentiel', desc: 'L\'essentiel pour votre bien-être' }
                                ].map((item, i) => (
                                  <div key={i} className="py-16 border-t border-gray-200 hover:border-gray-900 transition-all group">
                                    <div className="text-4xl font-thin text-gray-900 mb-6 group-hover:scale-105 transition-transform">{item.word}</div>
                                    <p className="text-sm text-gray-500 font-light">{item.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Services - Minimal Cards */}
                            <div className="space-y-16">
                              <h2 className="text-5xl font-thin text-center text-gray-900 mb-20">Nos Soins</h2>
                              <div className="space-y-12">
                                {[
                                  { name: 'Soin du Visage', duration: '60 min', price: '75€' },
                                  { name: 'Massage Holistique', duration: '90 min', price: '95€' },
                                  { name: 'Rituel Bien-être', duration: '120 min', price: '140€' }
                                ].map((service, i) => (
                                  <div key={i} className="group border-t border-gray-200 py-12 transition-all" style={{ borderTopColor: data.primaryColor + '20' }}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h3 className="text-3xl font-thin mb-3" style={{ color: data.secondaryColor }}>{service.name}</h3>
                                        <p className="text-sm text-gray-500 font-light">{service.duration}</p>
                                      </div>
                                      <div className="text-4xl font-thin mr-12" style={{ color: data.primaryColor }}>{service.price}</div>
                                      <button className="px-8 py-3 border text-sm uppercase tracking-widest font-light transition-all hover:text-white" style={{ borderColor: data.primaryColor, color: data.secondaryColor, backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = data.primaryColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        Réserver
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Photo Gallery - Minimal Grid */}
                            <div className="space-y-16">
                              <h2 className="text-5xl font-thin text-center text-gray-900">Nos Espaces</h2>
                              <div className="grid grid-cols-2 gap-12">
                                {['Cabine de soin', 'Espace détente', 'Salle de massage', 'Réception'].map((space, i) => (
                                  <div key={i} className="group relative overflow-hidden aspect-[4/3]">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                                    <div className="absolute inset-0 border border-gray-300 group-hover:border-gray-900 transition-all"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90">
                                      <div className="text-center">
                                        <div className="text-6xl mb-4 text-gray-300">📸</div>
                                        <div className="text-sm uppercase tracking-widest text-gray-900 font-light">{space}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Testimonials - Minimal Style */}
                            <div className="space-y-16">
                              <h2 className="text-5xl font-thin text-center text-gray-900">Témoignages</h2>
                              <div className="space-y-12">
                                {[
                                  { text: 'Un havre de paix au cœur de la ville. L\'approche minimaliste est apaisante et les soins sont d\'une qualité exceptionnelle.', author: 'Claire M.' },
                                  { text: 'Enfin un institut qui va à l\'essentiel. Pas de superflu, juste de l\'excellence. Je recommande vivement.', author: 'Anne S.' }
                                ].map((testimonial, i) => (
                                  <div key={i} className="border-l-2 border-gray-300 pl-12 py-8">
                                    <p className="text-2xl font-thin text-gray-700 mb-6 leading-relaxed italic">
                                      "{testimonial.text}"
                                    </p>
                                    <div className="text-sm uppercase tracking-widest text-gray-500 font-light">— {testimonial.author}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats - Minimal Numbers */}
                            <div className="grid grid-cols-4 gap-16 text-center py-16 border-t border-b border-gray-200">
                              {[
                                { number: '10', label: 'Années', suffix: '' },
                                { number: '1200', label: 'Clientes', suffix: '+' },
                                { number: '8', label: 'Soins', suffix: '' },
                                { number: '100', label: 'Naturel', suffix: '%' }
                              ].map((stat, i) => (
                                <div key={i}>
                                  <div className="text-6xl font-thin text-gray-900 mb-4">
                                    {stat.number}<span className="text-4xl text-gray-400">{stat.suffix}</span>
                                  </div>
                                  <div className="text-xs uppercase tracking-widest text-gray-500 font-light">{stat.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* Final CTA - Minimal */}
                            <div className="text-center py-24 border-t border-gray-200">
                              <h2 className="text-6xl font-thin text-gray-900 mb-12">Prenez rendez-vous</h2>
                              <button className="px-16 py-5 border-2 border-gray-900 text-gray-900 text-sm uppercase tracking-widest font-light hover:bg-gray-900 hover:text-white transition-all">
                                Réserver
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ========== LUXE LAYOUT ========== */}
                        {previewTemplate === 'luxe' && (
                          <div className="max-w-6xl mx-auto space-y-16">
                            <div className="text-center py-16 border-t border-b border-yellow-600">
                              <h1 className="text-6xl font-serif text-yellow-500 mb-6">L'Art du Raffinement</h1>
                              <p className="text-xl text-yellow-600 font-light mb-8">Expérience exclusive sur-mesure</p>
                              <button className="px-12 py-4 border-2 border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black transition uppercase tracking-widest">
                                Réservation Privée
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                              {['Rituel Visage Prestige', 'Massage Signature Luxe'].map((s, i) => (
                                <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 border border-yellow-600">
                                  <div className="w-full h-64 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 mb-6"></div>
                                  <h3 className="text-2xl font-serif text-yellow-500 mb-3">{s}</h3>
                                  <p className="text-yellow-600/70 text-sm mb-6">120 minutes d'exception</p>
                                  <div className="text-3xl font-serif text-yellow-500">180€</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ========== ZEN LAYOUT ========== */}
                        {previewTemplate === 'zen' && (
                          <div className="max-w-5xl mx-auto space-y-16">
                            <div className="text-center py-16">
                              <div className="text-8xl mb-8">☯️</div>
                              <h1 className="text-5xl font-light text-green-900 mb-6">Harmonie & Équilibre</h1>
                              <p className="text-lg text-green-700">Reconnectez-vous avec vous-même</p>
                            </div>
                            <div className="space-y-8">
                              {['Massage Ayurvédique', 'Réflexologie Plantaire', 'Yoga Facial'].map((s, i) => (
                                <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 flex items-center gap-8">
                                  <div className="w-32 h-32 bg-gradient-to-br from-green-200 to-teal-200 rounded-full flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <h3 className="text-2xl font-light text-green-900 mb-2">{s}</h3>
                                    <p className="text-green-700">60 minutes de détente profonde</p>
                                  </div>
                                  <div className="text-3xl font-light text-green-900">70€</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ========== MEDICAL LAYOUT (PREMIUM) ========== */}
                        {previewTemplate === 'medical' && (
                          <div className="max-w-7xl mx-auto space-y-20">
                            {/* Hero Section - Medical Professional */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-cyan-800"></div>
                              <div className="relative z-10 grid grid-cols-2 gap-12 items-center p-16">
                                <div>
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-semibold mb-6">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Certifié FDA • Protocoles Médicaux
                                  </div>
                                  <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                                    Esthétique<br/>
                                    <span className="text-cyan-200">Médicale Avancée</span>
                                  </h1>
                                  <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
                                    Traitements cliniques de pointe pour des résultats visibles et durables. Expertise médicale reconnue.
                                  </p>
                                  <div className="flex gap-4">
                                    <button className="px-10 py-4 bg-white text-cyan-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:bg-cyan-50 transition-all">
                                      Consultation Gratuite
                                    </button>
                                    <button className="px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                      Nos Certifications
                                    </button>
                                  </div>
                                </div>
                                <div className="relative h-[500px]">
                                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-7xl mb-4 text-white/40">📹</div>
                                      <p className="text-white/80 font-semibold text-lg">Ajoutez votre vidéo de présentation</p>
                                      <p className="text-white/60 text-sm mt-2">Présentez votre équipe médicale et vos installations</p>
                                    </div>
                                  </div>
                                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400/30 rounded-full blur-3xl"></div>
                                  <div className="absolute -top-6 -left-6 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
                                </div>
                              </div>
                            </div>

                            {/* Certifications & Trust Badges */}
                            <div className="bg-gradient-to-br from-gray-50 to-cyan-50 rounded-3xl p-12 shadow-lg">
                              <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">Certifications & Garanties</h2>
                                <p className="text-lg text-gray-600">Votre sécurité est notre priorité absolue</p>
                              </div>
                              <div className="grid grid-cols-4 gap-8">
                                {[
                                  { icon: '🏥', title: 'FDA Approuvé', desc: 'Technologies certifiées' },
                                  { icon: '👨‍⚕️', title: 'Médecins Certifiés', desc: 'Équipe médicale qualifiée' },
                                  { icon: '🔬', title: 'Protocoles Cliniques', desc: 'Méthodes scientifiques' },
                                  { icon: '⭐', title: '98% Satisfaction', desc: 'Résultats prouvés' }
                                ].map((item, i) => (
                                  <div key={i} className="text-center bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all group">
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Featured Treatments Showcase */}
                            <div className="space-y-12">
                              <div className="text-center">
                                <div className="text-sm uppercase tracking-widest text-cyan-600 font-bold mb-3">Nos Traitements</div>
                                <h2 className="text-5xl font-bold text-gray-900 mb-4">Protocoles Médicaux Avancés</h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">Technologies de dernière génération pour des résultats cliniquement prouvés</p>
                              </div>

                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Rajeunissement Médical', tech: 'Laser Fraxel CO2', duration: '60 min', price: '350€', category: 'Anti-âge' },
                                  { name: 'Injections Anti-rides', tech: 'Toxine Botulique A', duration: '30 min', price: '280€', category: 'Injections' },
                                  { name: 'Peeling Médical TCA', tech: 'Acide Trichloracétique', duration: '45 min', price: '220€', category: 'Visage' }
                                ].map((treatment, i) => (
                                  <div key={i} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100">
                                    <div className="relative">
                                      <div className="w-full h-80 bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 flex items-center justify-center group-hover:from-cyan-100 group-hover:to-blue-100 transition-all">
                                        <div className="text-center">
                                          <div className="text-8xl mb-4 text-cyan-600/30">🔬</div>
                                          <p className="text-cyan-700 font-semibold">Photo du traitement</p>
                                          <p className="text-sm text-cyan-600/70 mt-1">Avant/Après disponible</p>
                                        </div>
                                      </div>
                                      <div className="absolute top-4 right-4 px-4 py-2 bg-cyan-600 text-white text-xs uppercase tracking-wider font-bold rounded-full shadow-lg">
                                        {treatment.category}
                                      </div>
                                    </div>
                                    <div className="p-8">
                                      <div className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-2">{treatment.tech}</div>
                                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{treatment.name}</h3>
                                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                                        <div className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>{treatment.duration}</span>
                                        </div>
                                        <span className="text-gray-400">•</span>
                                        <div className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>Certifié FDA</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <div className="text-4xl font-bold text-cyan-600">{treatment.price}</div>
                                        <button className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg">
                                          Consulter
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Before/After Section */}
                            <div className="bg-gradient-to-br from-gray-900 to-cyan-900 rounded-3xl p-16 shadow-2xl">
                              <div className="text-center mb-12">
                                <h2 className="text-5xl font-bold text-white mb-4">Résultats Cliniques Prouvés</h2>
                                <p className="text-xl text-cyan-200">Découvrez les transformations de nos patients</p>
                              </div>
                              <div className="grid grid-cols-2 gap-8">
                                {['Traitement Anti-âge', 'Rajeunissement Laser'].map((title, i) => (
                                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                                    <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      {['Avant', 'Après'].map((label, j) => (
                                        <div key={j}>
                                          <div className="text-sm uppercase tracking-wider text-cyan-300 font-semibold mb-3">{label}</div>
                                          <div className="w-full h-64 bg-white/10 rounded-xl flex items-center justify-center border-2 border-white/20">
                                            <div className="text-center">
                                              <div className="text-5xl mb-2 text-white/30">📸</div>
                                              <p className="text-white/60 text-sm">Photo {label.toLowerCase()}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Section - Medical Focus */}
                            <div className="grid grid-cols-4 gap-8">
                              {[
                                { number: '15+', label: 'Années d\'expérience médicale', icon: '🏥' },
                                { number: '12000+', label: 'Traitements réalisés', icon: '✅' },
                                { number: '98%', label: 'Taux de satisfaction', icon: '⭐' },
                                { number: '6', label: 'Médecins certifiés', icon: '👨‍⚕️' }
                              ].map((stat, i) => (
                                <div key={i} className="text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
                                  <div className="text-5xl mb-4">{stat.icon}</div>
                                  <div className="text-5xl font-bold text-cyan-600 mb-2">{stat.number}</div>
                                  <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* Photo Gallery - Medical Facilities */}
                            <div className="space-y-8">
                              <div className="text-center">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Installations Médicales</h2>
                                <p className="text-lg text-gray-600">Équipements de pointe dans un environnement sécurisé et confortable</p>
                              </div>
                              <div className="grid grid-cols-3 gap-6">
                                {['Salle de Consultation', 'Bloc Opératoire', 'Salle de Récupération', 'Équipements Laser', 'Zone Stérile', 'Accueil Patients'].map((space, i) => (
                                  <div key={i} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
                                    <div className="h-72 bg-gradient-to-br from-cyan-100 via-blue-100 to-cyan-200 flex items-center justify-center border-2 border-cyan-200">
                                      <div className="text-center">
                                        <div className="text-6xl mb-3 text-cyan-600/40">🏥</div>
                                        <p className="text-cyan-800 font-semibold">{space}</p>
                                        <p className="text-sm text-cyan-600/70 mt-1">Photo personnalisable</p>
                                      </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Medical Team Section */}
                            <div className="bg-white rounded-3xl p-12 shadow-xl">
                              <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre Équipe Médicale</h2>
                                <p className="text-lg text-gray-600">Des experts reconnus à votre service</p>
                              </div>
                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Dr. Sophie Martin', title: 'Médecin Esthétique', cert: 'Diplômée Paris VII' },
                                  { name: 'Dr. Marc Durand', title: 'Dermatologue', cert: 'Certifié European Board' },
                                  { name: 'Dr. Claire Leblanc', title: 'Chirurgien Esthétique', cert: 'Expert Laser Médical' }
                                ].map((doctor, i) => (
                                  <div key={i} className="text-center group">
                                    <div className="relative mb-6">
                                      <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                                        <div className="text-center">
                                          <div className="text-6xl mb-2 text-cyan-600/40">👨‍⚕️</div>
                                          <p className="text-xs text-cyan-700">Photo du médecin</p>
                                        </div>
                                      </div>
                                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
                                        Certifié
                                      </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                                    <p className="text-cyan-600 font-semibold mb-2">{doctor.title}</p>
                                    <p className="text-sm text-gray-600">{doctor.cert}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Testimonials Section */}
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-12">
                              <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">Témoignages Patients</h2>
                                <p className="text-lg text-gray-600">L'avis de ceux qui nous font confiance</p>
                              </div>
                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Marie L.', treatment: 'Rajeunissement Laser', rating: 5 },
                                  { name: 'Sophie D.', treatment: 'Injections Anti-rides', rating: 5 },
                                  { name: 'Julie M.', treatment: 'Peeling Médical', rating: 5 }
                                ].map((testimonial, i) => (
                                  <div key={i} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                        {testimonial.name[0]}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-cyan-600">{testimonial.treatment}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 mb-4">
                                      {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xl">★</span>
                                      ))}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed italic">
                                      "Résultats exceptionnels et équipe médicale très professionnelle. Je recommande vivement ce centre."
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Call to Action - Medical */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-800"></div>
                              <div className="relative z-10 text-center py-20 px-12">
                                <h2 className="text-5xl font-bold text-white mb-6">Prêt(e) à Franchir le Pas ?</h2>
                                <p className="text-2xl text-cyan-100 mb-10 max-w-3xl mx-auto">
                                  Bénéficiez d'une consultation gratuite avec nos médecins experts pour définir votre protocole personnalisé
                                </p>
                                <div className="flex gap-6 justify-center">
                                  <button className="px-12 py-5 bg-white text-cyan-700 font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:bg-cyan-50 transition-all text-lg">
                                    Réserver ma Consultation Gratuite
                                  </button>
                                  <button className="px-12 py-5 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all text-lg">
                                    Télécharger notre Brochure
                                  </button>
                                </div>
                                <div className="mt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Sans engagement</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Devis personnalisé</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Conseils d'experts</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========== SPA LUXE LAYOUT (PREMIUM) ========== */}
                        {previewTemplate === 'spa-luxe' && (
                          <div className="max-w-7xl mx-auto space-y-20">
                            {/* Hero Video Section - Ultra Luxury */}
                            <div className="relative h-[750px] overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(219,39,119,0.3),transparent_50%)]"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.3),transparent_50%)]"></div>

                              <div className="relative z-10 flex items-center justify-center h-full px-12">
                                <div className="text-center">
                                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-rose-500/20 backdrop-blur-sm border border-rose-400/30 rounded-full text-rose-300 text-sm font-semibold mb-8">
                                    <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                                    Premium Wellness Experience
                                  </div>

                                  <h1 className="text-8xl font-serif text-white mb-8 leading-tight">
                                    L'Art du<br/>
                                    <span className="bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                      Bien-Être Absolu
                                    </span>
                                  </h1>

                                  <p className="text-2xl text-rose-200/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                                    Évadez-vous dans un sanctuaire de luxe où chaque instant est une célébration de vos sens
                                  </p>

                                  <div className="p-10 bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl inline-block">
                                    <div className="text-rose-200 mb-6 text-lg">
                                      <div className="text-7xl mb-4">📹</div>
                                      Ajoutez votre vidéo d'ambiance spa
                                    </div>
                                    <div className="flex gap-4 justify-center">
                                      <button className="px-12 py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold rounded-full text-lg shadow-2xl hover:shadow-rose-500/50 hover:scale-105 transition-all">
                                        Réserver une Escapade Privée
                                      </button>
                                      <button className="px-12 py-4 border-2 border-rose-300 text-rose-200 font-semibold rounded-full text-lg hover:bg-rose-300/10 transition-all">
                                        Découvrir nos Rituels
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>

                            {/* Spa Journey Timeline */}
                            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-16 shadow-2xl">
                              <div className="text-center mb-16">
                                <div className="text-sm uppercase tracking-[0.5em] text-rose-300 mb-4 font-semibold">Votre Parcours</div>
                                <h2 className="text-6xl font-serif text-white mb-6">Le Voyage Spa Signature</h2>
                                <p className="text-xl text-rose-200/80 max-w-3xl mx-auto">Un rituel en 4 étapes pour une transformation totale</p>
                              </div>

                              <div className="grid grid-cols-4 gap-8">
                                {[
                                  { step: '01', title: 'Accueil & Tisane', icon: '🍵', desc: 'Détente dans notre salon zen' },
                                  { step: '02', title: 'Hammam & Sauna', icon: '💨', desc: 'Purification du corps et de l\'esprit' },
                                  { step: '03', title: 'Soin Signature', icon: '✨', desc: 'Massage aux pierres chaudes' },
                                  { step: '04', title: 'Repos & Sérénité', icon: '🌙', desc: 'Relaxation en salle privée' }
                                ].map((item, i) => (
                                  <div key={i} className="relative group">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                      <div className="text-rose-400 font-bold text-sm mb-2">Étape {item.step}</div>
                                      <h3 className="text-2xl font-serif text-white mb-3">{item.title}</h3>
                                      <p className="text-rose-200/70 text-sm">{item.desc}</p>
                                    </div>
                                    {i < 3 && (
                                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-rose-500 to-transparent"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Premium Rituals Showcase */}
                            <div className="space-y-12">
                              <div className="text-center">
                                <div className="text-sm uppercase tracking-[0.5em] text-rose-600 mb-4 font-semibold">Nos Rituels</div>
                                <h2 className="text-6xl font-serif text-gray-900 mb-6">Expériences d'Exception</h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">Des protocoles exclusifs conçus pour votre bien-être ultime</p>
                              </div>

                              <div className="grid grid-cols-2 gap-10">
                                {[
                                  { name: 'Rituel Royal aux Pierres Chaudes', duration: '180 min', price: '380€', category: 'Signature' },
                                  { name: 'Voyage Aromathérapie Deluxe', duration: '150 min', price: '320€', category: 'Aromathérapie' },
                                  { name: 'Escapade Thalasso Premium', duration: '210 min', price: '450€', category: 'Thalasso' },
                                  { name: 'Rituel Oriental des Sens', duration: '180 min', price: '380€', category: 'Orient' }
                                ].map((ritual, i) => (
                                  <div key={i} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-purple-900 shadow-2xl hover:shadow-rose-500/20 transition-all">
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-purple-500/10 group-hover:from-rose-500/20 group-hover:to-purple-500/20 transition"></div>

                                    <div className="relative p-10">
                                      <div className="relative w-full h-80 bg-gradient-to-br from-rose-900/30 to-purple-900/30 rounded-2xl mb-8 overflow-hidden group-hover:scale-105 transition-transform border-2 border-white/10">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="text-center">
                                            <div className="text-8xl mb-4 text-white/20">🌺</div>
                                            <p className="text-white/60 font-semibold text-lg">Photo du rituel</p>
                                            <p className="text-white/40 text-sm mt-2">Ambiance & installations</p>
                                          </div>
                                        </div>
                                        <div className="absolute top-4 right-4 px-4 py-2 bg-rose-500/80 backdrop-blur-sm text-white text-xs uppercase tracking-wider font-bold rounded-full">
                                          {ritual.category}
                                        </div>
                                      </div>

                                      <div className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3 font-semibold">{ritual.duration}</div>
                                      <h3 className="text-4xl font-serif text-white mb-4 leading-tight">{ritual.name}</h3>
                                      <p className="text-rose-200/70 mb-8 leading-relaxed text-lg">
                                        Un parcours sensoriel unique combinant techniques ancestrales et innovations wellness pour une expérience transformative
                                      </p>

                                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                        <div className="text-5xl font-serif text-rose-300">{ritual.price}</div>
                                        <button className="px-8 py-3 border-2 border-rose-400 text-rose-300 hover:bg-rose-400 hover:text-white transition-all rounded-full font-semibold">
                                          Découvrir
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Photo Gallery - Spa Facilities */}
                            <div className="bg-gradient-to-br from-rose-900 to-purple-900 rounded-3xl p-16 shadow-2xl">
                              <div className="text-center mb-12">
                                <h2 className="text-5xl font-serif text-white mb-4">Nos Espaces de Sérénité</h2>
                                <p className="text-xl text-rose-200">Découvrez un havre de paix et de raffinement</p>
                              </div>

                              <div className="grid grid-cols-3 gap-6">
                                {[
                                  'Piscine Chauffée', 'Hammam Oriental', 'Sauna Finlandais',
                                  'Salle de Repos', 'Cabine VIP', 'Jardin Zen'
                                ].map((space, i) => (
                                  <div key={i} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                    <div className="h-80 bg-gradient-to-br from-rose-800/30 to-purple-800/30 backdrop-blur-sm border-2 border-white/10 flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="text-7xl mb-4 text-white/30 group-hover:scale-110 transition-transform">🏛️</div>
                                        <p className="text-white/80 font-serif text-xl mb-2">{space}</p>
                                        <p className="text-white/50 text-sm">Photo personnalisable</p>
                                      </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Section - Luxury Focus */}
                            <div className="grid grid-cols-4 gap-8">
                              {[
                                { number: '20+', label: 'Ans d\'excellence', icon: '👑' },
                                { number: '15', label: 'Rituels exclusifs', icon: '✨' },
                                { number: '99%', label: 'Clients enchantés', icon: '💫' },
                                { number: '8', label: 'Thérapeutes experts', icon: '🌟' }
                              ].map((stat, i) => (
                                <div key={i} className="text-center bg-gradient-to-br from-rose-50 to-purple-50 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all">
                                  <div className="text-6xl mb-4">{stat.icon}</div>
                                  <div className="text-6xl font-serif font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                    {stat.number}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* Testimonials - Luxury Style */}
                            <div className="bg-white rounded-3xl p-16 shadow-xl">
                              <div className="text-center mb-16">
                                <h2 className="text-5xl font-serif text-gray-900 mb-4">Témoignages Privilégiés</h2>
                                <p className="text-xl text-gray-600">L'expérience vécue par nos hôtes</p>
                              </div>

                              <div className="grid grid-cols-3 gap-10">
                                {[
                                  { name: 'Isabelle D.', ritual: 'Rituel Royal', location: 'Paris' },
                                  { name: 'Caroline M.', ritual: 'Voyage Aromathérapie', location: 'Lyon' },
                                  { name: 'Amélie L.', ritual: 'Escapade Thalasso', location: 'Bordeaux' }
                                ].map((testimonial, i) => (
                                  <div key={i} className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white text-3xl font-serif shadow-lg">
                                        {testimonial.name[0]}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                                        <p className="text-sm text-rose-600 font-semibold">{testimonial.ritual}</p>
                                        <p className="text-xs text-gray-500">{testimonial.location}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 mb-4">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-2xl">★</span>
                                      ))}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed italic">
                                      "Une expérience absolument divine. Chaque détail est pensé pour notre bien-être. Un moment d'exception que je recommande les yeux fermés."
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Instagram Feed Section */}
                            <div className="text-center">
                              <div className="mb-12">
                                <div className="text-sm uppercase tracking-[0.5em] text-rose-600 mb-4 font-semibold">Suivez-nous</div>
                                <h2 className="text-5xl font-serif text-gray-900 mb-4">@spaluxe_wellness</h2>
                                <p className="text-xl text-gray-600">Plongez dans notre univers sur Instagram</p>
                              </div>

                              <div className="grid grid-cols-6 gap-4">
                                {[...Array(6)].map((_, i) => (
                                  <div key={i} className="aspect-square bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl hover:scale-105 transition-transform shadow-md hover:shadow-xl flex items-center justify-center group cursor-pointer">
                                    <div className="text-center">
                                      <div className="text-5xl mb-2 text-rose-600/30 group-hover:text-rose-600/50 transition">📷</div>
                                      <p className="text-xs text-rose-600/50">Post Instagram</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Call to Action - Ultra Luxury */}
                            <div className="relative h-96 overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-r from-rose-800 via-purple-800 to-indigo-800"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>

                              <div className="relative z-10 flex items-center justify-center h-full px-12">
                                <div className="text-center">
                                  <h2 className="text-6xl font-serif text-white mb-6">Offrez-vous l'Exception</h2>
                                  <p className="text-2xl text-rose-200 mb-12 max-w-3xl mx-auto font-light">
                                    Réservez dès maintenant votre moment de grâce et laissez-nous prendre soin de vous
                                  </p>

                                  <div className="flex gap-6 justify-center">
                                    <button className="px-16 py-5 bg-white text-purple-800 font-bold rounded-full shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all text-lg">
                                      Réserver mon Escapade
                                    </button>
                                    <button className="px-16 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all text-lg">
                                      Carte Cadeau
                                    </button>
                                  </div>

                                  <div className="mt-10 flex items-center justify-center gap-12 text-white/80">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">🎁</span>
                                      <span>Coffrets cadeaux</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">🌟</span>
                                      <span>Privatisation possible</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">💎</span>
                                      <span>Programme VIP</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========== LASER TECH LAYOUT (PREMIUM) ========== */}
                        {previewTemplate === 'laser-tech' && (
                          <div className="max-w-7xl mx-auto space-y-20">
                            {/* Hero Video Section - Futuristic Tech */}
                            <div className="relative h-[700px] overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-purple-900 to-black"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.2),transparent_50%)]"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.2),transparent_50%)]"></div>

                              <div className="relative z-10 flex items-center justify-center h-full px-12">
                                <div className="text-center">
                                  <div className="inline-block px-6 py-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full text-cyan-300 text-sm mb-6 animate-pulse">
                                    <span className="mr-2">✨</span>
                                    Technologie de Pointe 2025
                                  </div>

                                  <h1 className="text-8xl font-black text-white mb-6 leading-tight">
                                    Épilation Laser<br/>
                                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                      Nouvelle Génération
                                    </span>
                                  </h1>

                                  <p className="text-2xl text-cyan-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                                    La technologie laser la plus avancée pour des résultats définitifs et une sécurité maximale
                                  </p>

                                  <div className="mt-8 p-8 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl inline-block">
                                    <div className="text-gray-300 mb-4">
                                      <div className="text-7xl mb-4 text-cyan-400/40">📹</div>
                                      Ajoutez votre vidéo de présentation technologique
                                    </div>
                                    <div className="flex gap-4">
                                      <button className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all text-lg">
                                        Réserver une Consultation Gratuite
                                      </button>
                                      <button className="px-10 py-4 border-2 border-cyan-400 text-cyan-300 rounded-full font-bold hover:bg-cyan-400/10 transition-all text-lg">
                                        Notre Technologie
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>

                            {/* Technology Features */}
                            <div className="grid grid-cols-4 gap-6">
                              {[
                                { icon: '⚡', title: 'Laser Diode 808nm', desc: 'Technologie médicale certifiée FDA' },
                                { icon: '🎯', title: 'Précision Absolue', desc: 'Ciblage folliculaire ultra-précis' },
                                { icon: '❄️', title: 'Système de Refroidissement', desc: 'Confort maximal pendant le traitement' },
                                { icon: '✅', title: 'Résultats Garantis', desc: 'Jusqu\'à 95% de réduction permanente' }
                              ].map((feature, i) => (
                                <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20 transition-all group">
                                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                  <p className="text-sm text-gray-400">{feature.desc}</p>
                                </div>
                              ))}
                            </div>

                            {/* Treatment Zones Interactive Map */}
                            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-16 shadow-2xl">
                              <div className="text-center mb-12">
                                <div className="text-sm uppercase tracking-widest text-cyan-400 mb-4 font-bold">Zones de Traitement</div>
                                <h2 className="text-6xl font-black text-white mb-6">Épilation Laser Complète</h2>
                                <p className="text-xl text-cyan-200">Des traitements adaptés à toutes les zones du corps</p>
                              </div>

                              <div className="grid grid-cols-2 gap-12">
                                {[
                                  { title: 'Corps Femme', zones: ['Aisselles', 'Maillot intégral', 'Jambes complètes', 'Bras', 'Ventre', 'Dos'] },
                                  { title: 'Corps Homme', zones: ['Torse complet', 'Dos & Épaules', 'Barbe précise', 'Nuque', 'Bras', 'Jambes'] }
                                ].map((category, i) => (
                                  <div key={i} className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-10">
                                    <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                      <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></span>
                                      {category.title}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      {category.zones.map((zone, j) => (
                                        <div key={j} className="px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <span className="text-cyan-400">▸</span>
                                            <span className="font-medium">{zone}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Premium Treatments Showcase */}
                            <div className="space-y-12">
                              <div className="text-center">
                                <div className="text-sm uppercase tracking-widest text-cyan-600 font-bold mb-3">Nos Protocoles</div>
                                <h2 className="text-6xl font-black text-gray-900 mb-4">Traitements Laser Avancés</h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">Technologies médicales de dernière génération pour des résultats optimaux</p>
                              </div>

                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Épilation Définitive', tech: 'Laser Diode 808nm', sessions: '6-8 séances', price: '200€', zone: 'Par zone', icon: '⚡' },
                                  { name: 'Rajeunissement Cutané', tech: 'Laser Fraxel CO2', sessions: '3-5 séances', price: '400€', zone: 'Visage complet', icon: '✨' },
                                  { name: 'Détatouage Professionnel', tech: 'Laser Q-Switched', sessions: '5-10 séances', price: '150€', zone: 'Par cm²', icon: '🎯' }
                                ].map((treatment, i) => (
                                  <div key={i} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all overflow-hidden border border-gray-100">
                                    <div className="relative">
                                      <div className="w-full h-80 bg-gradient-to-br from-cyan-50 via-purple-50 to-cyan-100 flex items-center justify-center group-hover:from-cyan-100 group-hover:to-purple-100 transition-all relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.2),transparent_60%)]"></div>
                                        <div className="text-center relative z-10">
                                          <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">{treatment.icon}</div>
                                          <p className="text-cyan-700 font-bold text-lg">Photo du traitement</p>
                                          <p className="text-sm text-cyan-600/70 mt-1">Avant / Après disponibles</p>
                                        </div>
                                      </div>
                                      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs uppercase tracking-wider font-bold rounded-full shadow-lg">
                                        Premium
                                      </div>
                                    </div>

                                    <div className="p-8">
                                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-600 font-bold mb-3">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                        {treatment.tech}
                                      </div>

                                      <h3 className="text-2xl font-black text-gray-900 mb-4">{treatment.name}</h3>

                                      <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>{treatment.sessions}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          </svg>
                                          <span>{treatment.zone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                          </svg>
                                          <span>Certifié FDA</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <div>
                                          <div className="text-sm text-gray-500 mb-1">À partir de</div>
                                          <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                                            {treatment.price}
                                          </div>
                                        </div>
                                        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:shadow-xl hover:shadow-cyan-500/30 transition-all">
                                          Réserver
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Technology Showcase */}
                            <div className="bg-white rounded-3xl p-16 shadow-xl">
                              <div className="text-center mb-16">
                                <h2 className="text-5xl font-black text-gray-900 mb-4">Notre Technologie de Pointe</h2>
                                <p className="text-xl text-gray-600">Des équipements médicaux certifiés pour votre sécurité</p>
                              </div>

                              <div className="grid grid-cols-2 gap-12">
                                {[
                                  { title: 'Laser Diode 808nm', desc: 'Le standard médical pour l\'épilation définitive', specs: ['Longueur d\'onde optimale', 'Système de refroidissement Sapphire', 'Adapté à tous phototypes'] },
                                  { title: 'Fraxel CO2 Fractionné', desc: 'Rajeunissement cutané nouvelle génération', specs: ['Stimulation collagène profonde', 'Récupération rapide', 'Résultats spectaculaires'] }
                                ].map((tech, i) => (
                                  <div key={i} className="group">
                                    <div className="relative h-72 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-2xl mb-6 overflow-hidden flex items-center justify-center border-2 border-cyan-200 group-hover:border-cyan-500 transition-all">
                                      <div className="text-center">
                                        <div className="text-8xl mb-4 text-cyan-600/30">🔬</div>
                                        <p className="text-cyan-800 font-bold text-lg">Photo de l'équipement</p>
                                        <p className="text-sm text-cyan-600/70 mt-1">Technologie médicale</p>
                                      </div>
                                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent"></div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3">{tech.title}</h3>
                                    <p className="text-gray-600 mb-4">{tech.desc}</p>
                                    <ul className="space-y-2">
                                      {tech.specs.map((spec, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                                          <span>{spec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Photo Gallery - Facilities */}
                            <div className="space-y-8">
                              <div className="text-center">
                                <h2 className="text-5xl font-black text-gray-900 mb-4">Nos Installations High-Tech</h2>
                                <p className="text-xl text-gray-600">Un environnement médical moderne et confortable</p>
                              </div>

                              <div className="grid grid-cols-3 gap-6">
                                {[
                                  'Cabine Laser Premium', 'Salle de Consultation', 'Zone de Récupération',
                                  'Équipements Médicaux', 'Espace Accueil', 'Salle de Soins'
                                ].map((space, i) => (
                                  <div key={i} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all">
                                    <div className="h-72 bg-gradient-to-br from-cyan-100 via-purple-100 to-cyan-200 flex items-center justify-center border-2 border-cyan-200 group-hover:border-cyan-500 transition-all">
                                      <div className="text-center">
                                        <div className="text-7xl mb-4 text-cyan-600/40 group-hover:scale-110 transition-transform">🏢</div>
                                        <p className="text-cyan-800 font-bold text-lg">{space}</p>
                                        <p className="text-sm text-cyan-600/70 mt-1">Photo personnalisable</p>
                                      </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Section - Tech Focus */}
                            <div className="grid grid-cols-4 gap-8">
                              {[
                                { number: '25K+', label: 'Séances réalisées', icon: '⚡' },
                                { number: '95%', label: 'Résultats permanents', icon: '✅' },
                                { number: '8', label: 'Lasers médicaux certifiés', icon: '🔬' },
                                { number: '4.9/5', label: 'Note satisfaction client', icon: '⭐' }
                              ].map((stat, i) => (
                                <div key={i} className="text-center bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-10 shadow-md hover:shadow-xl hover:shadow-cyan-500/20 transition-all border border-cyan-200">
                                  <div className="text-6xl mb-4">{stat.icon}</div>
                                  <div className="text-6xl font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                    {stat.number}
                                  </div>
                                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">{stat.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* Testimonials */}
                            <div className="bg-gradient-to-br from-gray-50 to-cyan-50 rounded-3xl p-16">
                              <div className="text-center mb-12">
                                <h2 className="text-5xl font-black text-gray-900 mb-4">Témoignages Clients</h2>
                                <p className="text-xl text-gray-600">Ils ont testé nos traitements laser</p>
                              </div>

                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Laura P.', treatment: 'Épilation Laser', zone: 'Jambes complètes' },
                                  { name: 'Thomas M.', treatment: 'Épilation Laser', zone: 'Torse & Dos' },
                                  { name: 'Sophie K.', treatment: 'Rajeunissement Laser', zone: 'Visage' }
                                ].map((testimonial, i) => (
                                  <div key={i} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:shadow-cyan-500/10 transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        {testimonial.name[0]}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-cyan-600 font-semibold">{testimonial.treatment}</p>
                                        <p className="text-xs text-gray-500">{testimonial.zone}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 mb-4">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xl">★</span>
                                      ))}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed italic">
                                      "Résultats incroyables ! La technologie est vraiment impressionnante et les séances sont très confortables. Je recommande à 100%."
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Call to Action - Tech Style */}
                            <div className="relative h-96 overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-purple-900 to-black"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.3),transparent_60%)]"></div>

                              <div className="relative z-10 flex items-center justify-center h-full px-12">
                                <div className="text-center">
                                  <h2 className="text-6xl font-black text-white mb-6">Prêt(e) pour la Transformation ?</h2>
                                  <p className="text-2xl text-cyan-200 mb-12 max-w-3xl mx-auto">
                                    Réservez votre consultation gratuite et découvrez comment notre technologie laser peut changer votre vie
                                  </p>

                                  <div className="flex gap-6 justify-center">
                                    <button className="px-16 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all text-lg">
                                      Consultation Offerte
                                    </button>
                                    <button className="px-16 py-5 border-2 border-cyan-400 text-cyan-300 font-bold rounded-full hover:bg-cyan-400/10 transition-all text-lg">
                                      Guide des Prix
                                    </button>
                                  </div>

                                  <div className="mt-10 flex items-center justify-center gap-12 text-white/80 text-sm">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span>Sans douleur</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span>Résultats garantis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span>Paiement en plusieurs fois</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========== LAIA SKIN LAYOUT ========== */}
                        {previewTemplate === 'laia-skin' && (
                          <div className="max-w-7xl mx-auto space-y-20">
                            {/* Hero Section - Premium & Elegant */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                              {/* Gradient background */}
                              <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0] via-[#c9a892] to-[#b89f8a]"></div>

                              {/* Content */}
                              <div className="relative z-10 grid grid-cols-2 gap-12 items-center p-16">
                                <div>
                                  <div className="text-sm uppercase tracking-[0.4em] text-[#2c3e50]/70 mb-6 font-medium">Institut de beauté</div>
                                  <h1 className="text-6xl font-serif text-[#2c3e50] mb-8 leading-tight">
                                    Révélez votre<br/>
                                    <span className="text-[#2c3e50]/80">Beauté Naturelle</span>
                                  </h1>
                                  <p className="text-xl text-[#2c3e50]/80 mb-10 leading-relaxed">
                                    Une expérience unique de soin et de bien-être dans un cadre raffiné et apaisant
                                  </p>
                                  <button className="px-10 py-4 bg-[#2c3e50] text-white font-medium rounded-full shadow-lg hover:shadow-2xl hover:bg-[#1a2634] transition-all">
                                    Découvrir nos soins
                                  </button>
                                </div>

                                {/* Image/Video Placeholder */}
                                <div className="relative">
                                  <div className="w-full h-96 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center border-2 border-white/50">
                                    <div className="text-center">
                                      <div className="text-6xl mb-4 text-[#2c3e50]/40">📸</div>
                                      <p className="text-[#2c3e50]/60 font-medium">Ajoutez votre photo ou vidéo</p>
                                      <p className="text-sm text-[#2c3e50]/40 mt-2">Mettez en valeur votre institut</p>
                                    </div>
                                  </div>
                                  {/* Decorative elements */}
                                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#2c3e50]/10 rounded-full blur-2xl"></div>
                                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                                </div>
                              </div>
                            </div>

                            {/* Values Section */}
                            <div className="text-center py-8">
                              <h2 className="text-4xl font-serif text-[#2c3e50] mb-4">Notre Philosophie</h2>
                              <p className="text-lg text-[#2c3e50]/70 mb-16 max-w-2xl mx-auto">Un savoir-faire d'excellence au service de votre bien-être</p>

                              <div className="grid grid-cols-4 gap-8">
                                {[
                                  { icon: '✨', title: 'Excellence', desc: 'Soins premium' },
                                  { icon: '🌿', title: 'Naturel', desc: 'Produits bio' },
                                  { icon: '💆‍♀️', title: 'Expertise', desc: 'Professionnels certifiés' },
                                  { icon: '🎯', title: 'Sur-mesure', desc: 'Protocoles personnalisés' }
                                ].map((item, i) => (
                                  <div key={i} className="group">
                                    <div className="bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a892]/20 rounded-2xl p-8 hover:shadow-xl transition-all hover:scale-105">
                                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                      <h3 className="text-xl font-serif text-[#2c3e50] mb-2">{item.title}</h3>
                                      <p className="text-sm text-[#2c3e50]/60">{item.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Photo Gallery Section with Placeholders */}
                            <div className="bg-gradient-to-br from-white to-[#d4b5a0]/10 rounded-3xl p-12 shadow-lg">
                              <div className="text-center mb-12">
                                <h2 className="text-4xl font-serif text-[#2c3e50] mb-4">Nos Espaces</h2>
                                <p className="text-lg text-[#2c3e50]/70">Découvrez notre univers de beauté et de sérénité</p>
                              </div>

                              <div className="grid grid-cols-3 gap-6">
                                {['Cabine de soin', 'Espace détente', 'Salle de massage'].map((space, i) => (
                                  <div key={i} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all">
                                    <div className="h-64 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a892]/30 flex items-center justify-center border-2 border-[#d4b5a0]/50">
                                      <div className="text-center">
                                        <div className="text-5xl mb-3 text-[#2c3e50]/30">🖼️</div>
                                        <p className="text-[#2c3e50]/60 font-medium text-sm">{space}</p>
                                        <p className="text-xs text-[#2c3e50]/40 mt-1">Photo personnalisable</p>
                                      </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Featured Services Showcase - Expanded */}
                            <div className="space-y-12">
                              <div className="text-center">
                                <div className="text-sm uppercase tracking-[0.4em] text-[#d4b5a0] mb-3 font-medium">Nos Soins</div>
                                <h2 className="text-5xl font-serif text-[#2c3e50] mb-4">Prestations d'Excellence</h2>
                                <p className="text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">Des protocoles de soin personnalisés pour révéler votre beauté naturelle</p>
                              </div>

                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { title: 'Soin Visage Signature', duration: '60 min', price: '85€', category: 'Visage' },
                                  { title: 'Massage Relaxant Premium', duration: '90 min', price: '110€', category: 'Corps' },
                                  { title: 'Soin Anti-Âge Complet', duration: '75 min', price: '120€', category: 'Anti-âge' }
                                ].map((service, i) => (
                                  <div key={i} className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all border border-[#d4b5a0]/20">
                                    {/* Service image placeholder */}
                                    <div className="relative w-full h-80 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a892]/20 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                                      <div className="text-center">
                                        <div className="text-8xl mb-4 text-[#2c3e50]/20">✨</div>
                                        <p className="text-lg text-[#2c3e50]/60 font-medium">Image du soin</p>
                                        <p className="text-sm text-[#2c3e50]/40 mt-2">Photo avant/après</p>
                                      </div>
                                      <div className="absolute top-4 right-4 px-4 py-2 bg-[#d4b5a0] text-[#2c3e50] text-xs uppercase tracking-wider font-bold rounded-full shadow-lg">
                                        {service.category}
                                      </div>
                                    </div>

                                    <div className="p-8">
                                      <h3 className="text-2xl font-serif text-[#2c3e50] mb-3">{service.title}</h3>
                                      <div className="flex items-center gap-2 text-sm text-[#2c3e50]/60 mb-6">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{service.duration}</span>
                                      </div>

                                      <div className="flex items-center justify-between pt-6 border-t border-[#d4b5a0]/30">
                                        <div className="text-4xl font-serif text-[#2c3e50]">{service.price}</div>
                                        <button className="px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a892] text-[#2c3e50] font-medium rounded-full hover:shadow-lg transition-all">
                                          Réserver
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Section */}
                            <div className="bg-gradient-to-br from-[#d4b5a0] via-[#c9a892] to-[#b89f8a] rounded-3xl p-16 shadow-2xl">
                              <div className="grid grid-cols-4 gap-12 text-center">
                                {[
                                  { number: '12+', label: 'Années d\'expertise', icon: '🏆' },
                                  { number: '3500+', label: 'Clientes satisfaites', icon: '💫' },
                                  { number: '25', label: 'Soins proposés', icon: '✨' },
                                  { number: '97%', label: 'Satisfaction client', icon: '⭐' }
                                ].map((stat, i) => (
                                  <div key={i} className="group">
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                    <div className="text-6xl font-serif font-bold text-[#2c3e50] mb-2">{stat.number}</div>
                                    <div className="text-sm uppercase tracking-wider text-[#2c3e50]/80 font-medium">{stat.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Testimonials Section */}
                            <div className="bg-white rounded-3xl p-16 shadow-xl">
                              <div className="text-center mb-12">
                                <h2 className="text-5xl font-serif text-[#2c3e50] mb-4">Témoignages</h2>
                                <p className="text-xl text-[#2c3e50]/70">L'avis de nos clientes</p>
                              </div>

                              <div className="grid grid-cols-3 gap-8">
                                {[
                                  { name: 'Claire M.', service: 'Soin Visage Signature', location: 'Paris 16e' },
                                  { name: 'Sophie L.', service: 'Massage Relaxant', location: 'Paris 8e' },
                                  { name: 'Emma D.', service: 'Soin Anti-Âge', location: 'Neuilly' }
                                ].map((testimonial, i) => (
                                  <div key={i} className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a892]/10 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a892] flex items-center justify-center text-[#2c3e50] text-2xl font-serif font-bold shadow-lg">
                                        {testimonial.name[0]}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-[#2c3e50]">{testimonial.name}</h4>
                                        <p className="text-sm text-[#d4b5a0] font-medium">{testimonial.service}</p>
                                        <p className="text-xs text-[#2c3e50]/50">{testimonial.location}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 mb-4">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-[#d4b5a0] text-xl">★</span>
                                      ))}
                                    </div>
                                    <p className="text-[#2c3e50]/80 leading-relaxed italic">
                                      "Une expérience exceptionnelle. L'ambiance est apaisante et les soins sont d'une qualité remarquable. Je recommande vivement !"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Instagram Feed Section */}
                            <div className="text-center">
                              <div className="mb-12">
                                <div className="text-sm uppercase tracking-[0.4em] text-[#d4b5a0] mb-4 font-medium">Suivez-nous</div>
                                <h2 className="text-5xl font-serif text-[#2c3e50] mb-4">@laiaskin_institut</h2>
                                <p className="text-xl text-[#2c3e50]/70">Découvrez notre univers sur Instagram</p>
                              </div>

                              <div className="grid grid-cols-6 gap-4">
                                {[...Array(6)].map((_, i) => (
                                  <div key={i} className="aspect-square bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a892]/20 rounded-2xl hover:scale-105 transition-transform shadow-md hover:shadow-xl flex items-center justify-center group cursor-pointer border-2 border-[#d4b5a0]/30">
                                    <div className="text-center">
                                      <div className="text-5xl mb-2 text-[#2c3e50]/30 group-hover:text-[#2c3e50]/50 transition">📷</div>
                                      <p className="text-xs text-[#2c3e50]/50">Post Instagram</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Call to Action */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#2c3e50] to-[#1a2634]"></div>
                              <div className="relative z-10 text-center py-20 px-12">
                                <h2 className="text-6xl font-serif text-white mb-6">Prête à Rayonner ?</h2>
                                <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
                                  Offrez-vous un moment de douceur et de bien-être. Nos expertes vous attendent pour révéler votre beauté naturelle.
                                </p>

                                <div className="flex gap-6 justify-center">
                                  <button className="px-14 py-5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a892] text-[#2c3e50] font-semibold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-lg">
                                    Réserver mon Rendez-vous
                                  </button>
                                  <button className="px-14 py-5 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all text-lg">
                                    Découvrir la Carte
                                  </button>
                                </div>

                                <div className="mt-10 flex items-center justify-center gap-12 text-white/80">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">🎁</span>
                                    <span>Cartes cadeaux</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">💆‍♀️</span>
                                    <span>Forfaits soins</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">✨</span>
                                    <span>Produits bio</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Templates restants avec layouts par défaut mais couleurs différentes */}
                        {!['classic', 'modern', 'minimal', 'luxe', 'zen', 'medical', 'spa-luxe', 'laser-tech', 'laia-skin'].includes(previewTemplate || '') && (
                          <div className="space-y-8">
                            <div className={`rounded-xl p-16 text-center shadow-xl ${
                              previewTemplate?.includes('fresh') ? 'bg-gradient-to-br from-orange-100 to-pink-100' :
                              previewTemplate?.includes('elegance') ? 'bg-gray-800 text-white' :
                              previewTemplate?.includes('boutique') ? 'bg-gradient-to-br from-pink-100 to-rose-100' :
                              'bg-gradient-to-br from-gray-100 to-gray-200'
                            }`}>
                              <h1 className={`text-5xl font-bold mb-4 ${previewTemplate?.includes('elegance') ? 'text-white font-serif' : 'text-gray-900'}`}>
                                Bienvenue chez Votre Institut
                              </h1>
                              <p className={`text-xl mb-8 ${previewTemplate?.includes('elegance') ? 'text-gray-300' : 'text-gray-700'}`}>
                                L'excellence du bien-être au service de votre beauté
                              </p>
                              <button className={`px-8 py-4 rounded-lg font-bold shadow-lg ${
                                previewTemplate?.includes('fresh') ? 'bg-orange-500 text-white' :
                                previewTemplate?.includes('elegance') ? 'bg-white text-gray-900' :
                                previewTemplate?.includes('boutique') ? 'bg-pink-500 text-white' :
                                'bg-white text-gray-900'
                              }`}>
                                Réserver maintenant
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                              {['Soin visage', 'Massage', 'Épilation'].map((service, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
                                  <div className={`w-full h-40 rounded-lg mb-4 ${
                                    previewTemplate?.includes('fresh') ? 'bg-gradient-to-br from-orange-200 to-pink-200' :
                                    previewTemplate?.includes('boutique') ? 'bg-gradient-to-br from-pink-200 to-rose-200' :
                                    'bg-gradient-to-br from-gray-200 to-gray-300'
                                  }`}></div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service}</h3>
                                  <p className="text-gray-600 text-sm mb-4">Description du service premium</p>
                                  <div className={`text-2xl font-bold ${
                                    previewTemplate?.includes('fresh') ? 'text-orange-600' :
                                    previewTemplate?.includes('boutique') ? 'text-pink-600' :
                                    'text-purple-600'
                                  }`}>65€</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {previewPage === 'services' && (
                      <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">Nos Services</h2>
                        {['Soins du visage', 'Massages bien-être', 'Épilation', 'Manucure & Pédicure'].map((cat, i) => (
                          <div key={i} className="bg-white rounded-xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{cat}</h3>
                            <div className="grid grid-cols-2 gap-6">
                              {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-semibold text-gray-900">Service {j}</div>
                                    <div className="text-sm text-gray-600">60 min</div>
                                  </div>
                                  <div className="text-xl font-bold text-purple-600">65€</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {previewPage === 'booking' && (
                      <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">Réserver votre rendez-vous</h2>
                        <div className="bg-white rounded-xl shadow-xl p-8 grid grid-cols-2 gap-8">
                          <div>
                            <div className="text-lg font-semibold mb-4">📅 Choisissez une date</div>
                            <div className="bg-gray-100 h-64 rounded-lg"></div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold mb-4">⏰ Créneaux disponibles</div>
                            <div className="space-y-2">
                              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                                <button key={time} className="w-full p-3 bg-purple-100 hover:bg-purple-200 rounded-lg font-medium transition">
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewPage === 'blog' && (
                      <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">Notre Blog</h2>
                        <div className="grid grid-cols-2 gap-6">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                              <div className="w-full h-48 bg-gradient-to-br from-purple-200 to-pink-200"></div>
                              <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Article {i} : Conseils beauté</h3>
                                <p className="text-gray-600 text-sm mb-4">Découvrez nos meilleurs conseils pour une peau éclatante...</p>
                                <button className="text-purple-600 font-semibold hover:underline">Lire la suite →</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewPage === 'shop' && (
                      <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">Boutique en ligne</h2>
                        <div className="grid grid-cols-4 gap-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                              <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                              <div className="p-4">
                                <div className="font-semibold text-gray-900 text-sm mb-1">Produit {i}</div>
                                <div className="text-lg font-bold text-purple-600">{25 + i * 5}€</div>
                                <button className="w-full mt-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition">
                                  Ajouter
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewPage === 'about' && (
                      <div className="max-w-4xl mx-auto space-y-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">À propos de nous</h2>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="bg-white rounded-xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Notre Histoire</h3>
                            <p className="text-gray-600 leading-relaxed">
                              Depuis 2015, notre institut vous accueille dans un cadre chaleureux et élégant.
                              Notre équipe de professionnels passionnés met son expertise à votre service pour
                              vous offrir des moments de détente et de bien-être inoubliables.
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl h-64"></div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6">Notre Équipe</h3>
                          <div className="grid grid-cols-3 gap-6">
                            {['Marie', 'Sophie', 'Julie'].map((name, i) => (
                              <div key={i} className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-3"></div>
                                <div className="font-semibold text-gray-900">{name}</div>
                                <div className="text-sm text-gray-600">Esthéticienne</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {previewPage === 'contact' && (
                      <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">Contactez-nous</h2>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                            <div>
                              <div className="text-lg font-semibold text-gray-900 mb-2">📍 Adresse</div>
                              <div className="text-gray-600">123 Avenue de la Beauté<br />75001 Paris</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 mb-2">📞 Téléphone</div>
                              <div className="text-gray-600">+33 6 00 00 00 00</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 mb-2">📧 Email</div>
                              <div className="text-gray-600">contact@votresite.fr</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 mb-2">⏰ Horaires</div>
                              <div className="text-gray-600">
                                Lundi - Samedi : 9h - 19h<br />
                                Dimanche : Fermé
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
                            <div className="space-y-4">
                              <input type="text" placeholder="Votre nom" className="w-full p-3 border border-gray-300 rounded-lg" />
                              <input type="email" placeholder="Votre email" className="w-full p-3 border border-gray-300 rounded-lg" />
                              <textarea placeholder="Votre message" rows={4} className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                              <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
                                Envoyer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-16 bg-gray-900 rounded-lg p-8 text-white">
                      <div className="grid grid-cols-3 gap-8 text-sm">
                        <div>
                          <div className="font-bold mb-3">Contact</div>
                          <div>📞 +33 6 00 00 00 00</div>
                          <div>📧 contact@votresite.fr</div>
                        </div>
                        <div>
                          <div className="font-bold mb-3">Horaires</div>
                          <div>Lun - Sam : 9h - 19h</div>
                          <div>Dimanche : Fermé</div>
                        </div>
                        <div>
                          <div className="font-bold mb-3">Réseaux sociaux</div>
                          <div>Facebook • Instagram • TikTok</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer avec actions */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setData({ ...data, websiteTemplateId: previewTemplate })
                    setPreviewTemplate(null)
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  ✓ Choisir ce template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3.6 - Choix des couleurs du site */}
        {currentStep === 'website-colors' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎨</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Personnalisez vos couleurs
              </h2>
              <p className="text-gray-600">
                Choisissez les couleurs qui représentent votre institut
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Sélection des couleurs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Couleur Principale
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={data.primaryColor}
                      onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <input
                        type="text"
                        value={data.primaryColor}
                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#000000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Couleur des éléments principaux</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Couleur Secondaire
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <input
                        type="text"
                        value={data.secondaryColor}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#000000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Couleur des accents et dégradés</p>
                    </div>
                  </div>
                </div>

                {/* Palettes prédéfinies */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Palettes suggérées
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setData({ ...data, primaryColor: '#E91E8C', secondaryColor: '#F8BBD0' })}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #E91E8C, #F8BBD0)' }} />
                      <span className="text-sm font-medium">Rose</span>
                    </button>
                    <button
                      onClick={() => setData({ ...data, primaryColor: '#9C27B0', secondaryColor: '#E91E8C' })}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #9C27B0, #E91E8C)' }} />
                      <span className="text-sm font-medium">Violet</span>
                    </button>
                    <button
                      onClick={() => setData({ ...data, primaryColor: '#2C3E50', secondaryColor: '#95A5A6' })}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #2C3E50, #95A5A6)' }} />
                      <span className="text-sm font-medium">Élégant</span>
                    </button>
                    <button
                      onClick={() => setData({ ...data, primaryColor: '#C9B037', secondaryColor: '#F5E6D3' })}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #C9B037, #F5E6D3)' }} />
                      <span className="text-sm font-medium">Or</span>
                    </button>
                    <button
                      onClick={() => setData({ ...data, primaryColor: '#0288D1', secondaryColor: '#4FC3F7' })}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #0288D1, #4FC3F7)' }} />
                      <span className="text-sm font-medium">Bleu</span>
                    </button>
                    <button
                      onClick={() => setData({ ...data, primaryColor: '#4CAF50', secondaryColor: '#8BC34A' })}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }} />
                      <span className="text-sm font-medium">Vert</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Aperçu en temps réel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Aperçu
                </label>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  {/* Hero miniature */}
                  <div
                    className="h-32 p-6 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${data.primaryColor}20, ${data.secondaryColor}20)`
                    }}
                  >
                    <div className="text-center">
                      <h3
                        className="text-2xl font-bold mb-2"
                        style={{ color: data.primaryColor }}
                      >
                        {data.institutName || 'Votre Institut'}
                      </h3>
                    </div>
                  </div>

                  {/* Éléments de l'interface */}
                  <div className="p-6 space-y-4">
                    <button
                      className="w-full py-3 px-6 rounded-lg text-white font-bold"
                      style={{ backgroundColor: data.primaryColor }}
                    >
                      Bouton Principal
                    </button>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 h-12 rounded-lg"
                        style={{ backgroundColor: data.primaryColor + '20' }}
                      />
                      <div
                        className="flex-1 h-12 rounded-lg"
                        style={{ backgroundColor: data.secondaryColor + '20' }}
                      />
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`
                      }}
                    >
                      <p className="text-white text-sm font-semibold">Dégradé des couleurs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons navigation */}
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape - Contenu du Site */}
        {currentStep === 'site-content' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Contenu de votre site web
              </h2>
              <p className="text-gray-600">
                Personnalisez les textes et ajoutez vos réseaux sociaux
              </p>
            </div>

            <div className="space-y-6">
              {/* Baseline/Tagline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baseline de votre institut
                </label>
                <input
                  type="text"
                  value={data.siteTagline}
                  onChange={(e) => setData({ ...data, siteTagline: e.target.value })}
                  placeholder="Ex: Institut de Beauté & Bien-être"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phrase courte qui décrit votre activité
                </p>
              </div>

              {/* Contact du site */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email du site *
                  </label>
                  <input
                    type="email"
                    value={data.siteEmail}
                    onChange={(e) => setData({ ...data, siteEmail: e.target.value })}
                    placeholder="contact@votre-institut.fr"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone du site *
                  </label>
                  <input
                    type="tel"
                    value={data.sitePhone}
                    onChange={(e) => setData({ ...data, sitePhone: e.target.value })}
                    placeholder="+33 1 XX XX XX XX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Hero Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Héro (page d'accueil)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre principal *
                    </label>
                    <input
                      type="text"
                      value={data.heroTitle}
                      onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
                      placeholder="Ex: Une peau respectée,"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre *
                    </label>
                    <input
                      type="text"
                      value={data.heroSubtitle}
                      onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                      placeholder="Ex: une beauté révélée"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* À Propos */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos de vous</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte de présentation
                    </label>
                    <textarea
                      value={data.aboutText}
                      onChange={(e) => setData({ ...data, aboutText: e.target.value })}
                      placeholder="Présentez votre institut, votre expertise, vos valeurs..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre nom (fondateur/fondatrice)
                    </label>
                    <input
                      type="text"
                      value={data.founderName}
                      onChange={(e) => setData({ ...data, founderName: e.target.value })}
                      placeholder="Ex: Marie Dupont"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre titre/fonction
                    </label>
                    <input
                      type="text"
                      value={data.founderTitle}
                      onChange={(e) => setData({ ...data, founderTitle: e.target.value })}
                      placeholder="Ex: Fondatrice & Experte en soins esthétiques"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre citation/philosophie
                    </label>
                    <textarea
                      value={data.founderQuote}
                      onChange={(e) => setData({ ...data, founderQuote: e.target.value })}
                      placeholder="Ex: La vraie beauté réside dans l'harmonie parfaite..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Réseaux Sociaux */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Réseaux sociaux</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook (URL complète)
                    </label>
                    <input
                      type="url"
                      value={data.facebook}
                      onChange={(e) => setData({ ...data, facebook: e.target.value })}
                      placeholder="https://facebook.com/votre-page"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram (URL complète)
                    </label>
                    <input
                      type="url"
                      value={data.instagram}
                      onChange={(e) => setData({ ...data, instagram: e.target.value })}
                      placeholder="https://instagram.com/votre-compte"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp (numéro avec indicatif)
                    </label>
                    <input
                      type="tel"
                      value={data.whatsapp}
                      onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                      placeholder="+33612345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format international sans espaces (ex: +33612345678)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons navigation */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!data.siteEmail || !data.sitePhone || !data.heroTitle || !data.heroSubtitle}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  !data.siteEmail || !data.sitePhone || !data.heroTitle || !data.heroSubtitle
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-xl'
                }`}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 - Horaires */}
        {currentStep === 'hours' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🕐</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vos horaires d'ouverture
              </h2>
              <p className="text-gray-600">
                Définissez vos heures de travail
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(data.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 w-40">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) => setData({
                        ...data,
                        businessHours: {
                          ...data.businessHours,
                          [day]: { ...hours, isOpen: e.target.checked }
                        }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <label className="font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                  </div>

                  {hours.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hours.start}
                        onChange={(e) => setData({
                          ...data,
                          businessHours: {
                            ...data.businessHours,
                            [day]: { ...hours, start: e.target.value }
                          }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-500">à</span>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={(e) => setData({
                          ...data,
                          businessHours: {
                            ...data.businessHours,
                            [day]: { ...hours, end: e.target.value }
                          }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 text-gray-400 italic">
                      Fermé
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-purple-800">
                💡 <strong>Astuce :</strong> Vous pourrez ajuster ces horaires et ajouter des pauses depuis votre tableau de bord.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 5 - Facturation et Mandat SEPA */}
        {currentStep === 'billing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Informations de facturation
              </h2>
              <p className="text-gray-600">
                Pour le prélèvement SEPA de votre abonnement
              </p>
            </div>

            {/* Récapitulatif du prix */}
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                💳 Récapitulatif de votre abonnement
              </h3>
              <div className="space-y-3">
                {/* Badge 1er mois offert */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg text-center">
                  <p className="font-bold text-sm">🎁 Offre de lancement : 1er mois offert !</p>
                  <p className="text-xs mt-1 opacity-90">30 jours pour tester gratuitement</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Formule {getPlanName(data.selectedPlan)}</span>
                  <span className="font-semibold text-gray-900">{getPlanPrice(data.selectedPlan)}€/mois</span>
                </div>

                <div className="flex justify-between items-center text-purple-600">
                  <span className="font-medium">1er mois offert</span>
                  <span className="font-bold">-{getPlanPrice(data.selectedPlan)}€</span>
                </div>

                <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">À payer aujourd'hui</span>
                  <span className="text-2xl font-bold text-purple-600">0€</span>
                </div>

                <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Puis à partir du {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</span>
                  <span className="font-semibold text-gray-900">{getPlanPrice(data.selectedPlan)}€/mois</span>
                </div>

                <div className="bg-white/70 p-3 rounded-lg mt-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>📌 Conditions</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    ✅ Engagement 1 an à partir du 2e mois<br />
                    ✅ Prélèvement SEPA automatique le 1er de chaque mois<br />
                    ✅ Annulation possible pendant les 30 premiers jours
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Email de facturation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de facturation *
                </label>
                <input
                  type="email"
                  value={data.billingEmail}
                  onChange={(e) => setData({ ...data, billingEmail: e.target.value })}
                  placeholder="facturation@mon-institut.fr"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les factures seront envoyées à cette adresse
                </p>
              </div>

              {/* Informations légales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Informations légales</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison sociale *
                    </label>
                    <input
                      type="text"
                      value={data.legalName}
                      onChange={(e) => setData({ ...data, legalName: e.target.value })}
                      placeholder="SARL Mon Institut de Beauté"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nom légal de votre entreprise tel qu'enregistré
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        N° SIRET *
                      </label>
                      <input
                        type="text"
                        value={data.siret}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setData({ ...data, siret: value })
                          // Valider en temps réel
                          if (value.length === 14) {
                            if (!validateSIRET(value)) {
                              setValidationErrors({ ...validationErrors, siret: 'SIRET invalide' })
                            } else {
                              const newErrors = { ...validationErrors }
                              delete newErrors.siret
                              setValidationErrors(newErrors)
                            }
                          }
                        }}
                        placeholder="123 456 789 00012"
                        maxLength={14}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                      />
                      {validationErrors.siret && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.siret}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">14 chiffres</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        N° TVA Intracommunautaire
                      </label>
                      <input
                        type="text"
                        value={data.tvaNumber || ''}
                        onChange={(e) => setData({ ...data, tvaNumber: e.target.value.toUpperCase() })}
                        placeholder="FR12345678901"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optionnel • Commence par FR
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adresse de facturation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Adresse de facturation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={data.billingAddress}
                      onChange={(e) => setData({ ...data, billingAddress: e.target.value })}
                      placeholder="123 Avenue de la Beauté"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        value={data.billingPostalCode}
                        onChange={(e) => setData({ ...data, billingPostalCode: e.target.value })}
                        placeholder="75001"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={data.billingCity}
                        onChange={(e) => setData({ ...data, billingCity: e.target.value })}
                        placeholder="Paris"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandat SEPA */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🏦</span>
                  <span>Mandat de prélèvement SEPA</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN * (Compte bancaire)
                    </label>
                    <input
                      type="text"
                      value={data.sepaIban}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        setData({ ...data, sepaIban: value })
                        // Valider en temps réel
                        if (value.length >= 15) {
                          if (!validateIBAN(value)) {
                            setValidationErrors({ ...validationErrors, iban: 'IBAN invalide' })
                          } else {
                            const newErrors = { ...validationErrors }
                            delete newErrors.iban
                            setValidationErrors(newErrors)
                          }
                        } else if (value.length > 0) {
                          const newErrors = { ...validationErrors }
                          delete newErrors.iban
                          setValidationErrors(newErrors)
                        }
                      }}
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      maxLength={34}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-mono ${
                        validationErrors.iban ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.iban ? (
                      <p className="text-xs text-red-600 mt-1">❌ {validationErrors.iban}</p>
                    ) : data.sepaIban.length >= 15 && validateIBAN(data.sepaIban) ? (
                      <p className="text-xs text-green-600 mt-1">✅ IBAN valide - {formatIBAN(data.sepaIban)}</p>
                    ) : (
                      <p className="text-xs text-gray-600 mt-1">
                        Format : FR76 suivi de 23 chiffres
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BIC / SWIFT *
                    </label>
                    <input
                      type="text"
                      value={data.sepaBic}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        setData({ ...data, sepaBic: value })
                        // Valider en temps réel
                        if (value.length >= 8) {
                          if (!validateBIC(value)) {
                            setValidationErrors({ ...validationErrors, bic: 'BIC/SWIFT invalide' })
                          } else {
                            const newErrors = { ...validationErrors }
                            delete newErrors.bic
                            setValidationErrors(newErrors)
                          }
                        } else if (value.length > 0) {
                          const newErrors = { ...validationErrors }
                          delete newErrors.bic
                          setValidationErrors(newErrors)
                        }
                      }}
                      placeholder="BNPAFRPPXXX"
                      maxLength={11}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-mono ${
                        validationErrors.bic ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.bic ? (
                      <p className="text-xs text-red-600 mt-1">❌ {validationErrors.bic}</p>
                    ) : data.sepaBic.length >= 8 && validateBIC(data.sepaBic) ? (
                      <p className="text-xs text-green-600 mt-1">✅ BIC valide</p>
                    ) : (
                      <p className="text-xs text-gray-600 mt-1">
                        8 ou 11 caractères
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titulaire du compte *
                    </label>
                    <input
                      type="text"
                      value={data.sepaAccountHolder}
                      onChange={(e) => setData({ ...data, sepaAccountHolder: e.target.value })}
                      placeholder="Nom du titulaire du compte"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>

                  {/* Acceptation du mandat */}
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="sepaMandate"
                        checked={data.sepaMandate}
                        onChange={(e) => setData({ ...data, sepaMandate: e.target.checked })}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <label htmlFor="sepaMandate" className="text-sm text-gray-700 cursor-pointer">
                        <strong>J'autorise LAIA Connect</strong> à envoyer des instructions à ma banque pour débiter mon compte,
                        et ma banque à débiter mon compte conformément aux instructions de LAIA Connect.
                        Je bénéficie du droit d'être remboursé par ma banque selon les conditions décrites dans la convention
                        que j'ai passée avec elle. Une demande de remboursement doit être présentée dans les 8 semaines suivant
                        la date de débit de mon compte. *
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important :</strong> Le premier prélèvement aura lieu dans 30 jours (après votre période d'essai gratuite).
                  Vous pouvez annuler à tout moment depuis votre espace admin.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                disabled={
                  !data.billingEmail ||
                  !data.billingAddress ||
                  !data.billingPostalCode ||
                  !data.billingCity ||
                  !data.sepaIban ||
                  !data.sepaBic ||
                  !data.sepaAccountHolder ||
                  !data.sepaMandate ||
                  data.sepaIban.length < 27 ||
                  data.sepaBic.length < 8
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer vers le paiement →
              </button>
            </div>
          </div>
        )}

        {/* Étape 6 - Paiement */}
        {currentStep === 'payment' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">💳</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Activez votre abonnement
              </h2>
              <p className="text-gray-600">
                Profitez de 30 jours gratuits, puis {planDetails[data.selectedPlan].price}€/mois
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-purple-600 font-medium mb-1">Votre plan</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {planDetails[data.selectedPlan].icon} {planDetails[data.selectedPlan].name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Montant mensuel</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {planDetails[data.selectedPlan].price}€
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>30 jours d'essai gratuit</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Annulation à tout moment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Premier prélèvement le {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Paiement sécurisé par Stripe</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Vous serez redirigé vers Stripe (plateforme de paiement sécurisée) pour configurer votre méthode de paiement. Aucun montant ne sera prélevé pendant les 30 premiers jours.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                ← Retour
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Activer mon abonnement</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Étape 5 - Terminé */}
        {currentStep === 'complete' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Félicitations !
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Votre institut <strong>{data.institutName}</strong> est prêt à accueillir vos clients.
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes :</h3>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <span className="text-purple-600">1️⃣</span>
                  <span>Complétez votre profil et ajoutez votre logo</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600">2️⃣</span>
                  <span>Ajoutez plus de services à votre catalogue</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600">3️⃣</span>
                  <span>Invitez vos premiers clients</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600">4️⃣</span>
                  <span>Commencez à recevoir des réservations !</span>
                </div>
              </div>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Accéder à mon tableau de bord
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl inline-block mb-4">
            <span className="text-4xl">🌸</span>
          </div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  )
}
