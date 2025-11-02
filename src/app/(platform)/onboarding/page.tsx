'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateSIRET, validateIBAN, validateBIC, validateEmail, validatePhoneNumber, formatSIRET, formatIBAN } from '@/lib/validation'
import { getPlanPrice, getPlanName } from '@/lib/features-simple'
import { websiteTemplates } from '@/lib/website-templates'

// Étapes du tunnel
type Step = 'questionnaire' | 'welcome' | 'personal-info' | 'business-info' | 'service' | 'website-template' | 'website-colors' | 'hours' | 'billing' | 'payment' | 'complete'

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

  const [currentStep, setCurrentStep] = useState<Step>(skipQuestionnaire ? 'personal-info' : 'questionnaire')
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({
    teamSize: '',
    locations: '',
    servicesCount: '',
    needsSocial: false,
    needsBlog: false,
    needsNewsletter: false,
    needsAPI: false,
    needsEmailMarketing: false,
    needsWhatsApp: false,
    needsAutomation: false,
    needsCRM: false,
    needsLoyalty: false,
    needsShop: false,
    needsStock: false,
    needsSMS: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<OnboardingData>({
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

  const steps: { id: Step; title: string; description: string; icon: string }[] = [
    { id: 'questionnaire', title: 'Vos Besoins', description: 'Trouvons l\'offre idéale', icon: '📋' },
    { id: 'welcome', title: 'Bienvenue', description: 'Commençons votre aventure', icon: '👋' },
    { id: 'personal-info', title: 'Vos Informations', description: 'Qui êtes-vous ?', icon: '👤' },
    { id: 'business-info', title: 'Votre Institut', description: 'Informations de base', icon: '🏢' },
    { id: 'service', title: 'Premier Service', description: 'Créez votre première prestation', icon: '💆' },
    { id: 'website-template', title: 'Design de Site', description: 'Choisissez votre layout', icon: '🎨' },
    { id: 'website-colors', title: 'Couleurs', description: 'Personnalisez les couleurs', icon: '🎨' },
    { id: 'hours', title: 'Horaires', description: 'Vos heures d\'ouverture', icon: '🕐' },
    { id: 'billing', title: 'Facturation', description: 'Informations légales', icon: '📋' },
    { id: 'payment', title: 'Paiement', description: 'Activez votre abonnement', icon: '💳' },
    { id: 'complete', title: 'Terminé', description: 'Tout est prêt !', icon: '🎉' }
  ]

  // Fonction pour calculer le plan recommandé
  const getRecommendedPlan = (): OnboardingData['selectedPlan'] => {
    const teamSize = parseInt(questionnaireAnswers.teamSize) || 0
    const locations = parseInt(questionnaireAnswers.locations) || 0
    const servicesCount = parseInt(questionnaireAnswers.servicesCount) || 0

    // PREMIUM : Blog + Newsletter + API + Automation Marketing complète + CRM commercial
    if (questionnaireAnswers.needsBlog && questionnaireAnswers.needsNewsletter) {
      return 'PREMIUM'
    }
    if (questionnaireAnswers.needsAPI || questionnaireAnswers.needsAutomation) {
      return 'PREMIUM'
    }
    // CRM commercial + Automation = PREMIUM
    if (questionnaireAnswers.needsCRM && questionnaireAnswers.needsAutomation) {
      return 'PREMIUM'
    }
    // Beaucoup de prestations + marketing automation = PREMIUM
    if (servicesCount > 30 && (questionnaireAnswers.needsEmailMarketing || questionnaireAnswers.needsWhatsApp)) {
      return 'PREMIUM'
    }

    // TEAM : Multi-emplacements ou stock avancé ou SMS ou réseaux sociaux
    if (locations > 1 || questionnaireAnswers.needsSocial) {
      return 'TEAM'
    }
    // Stock avancé = TEAM
    if (questionnaireAnswers.needsStock) {
      return 'TEAM'
    }
    // SMS automatiques = TEAM
    if (questionnaireAnswers.needsSMS) {
      return 'TEAM'
    }
    // Beaucoup de prestations = TEAM
    if (servicesCount > 15) {
      return 'TEAM'
    }

    // DUO : Plusieurs employés ou marketing (email + WhatsApp + CRM + Blog + Boutique) ou fidélité
    if (teamSize > 1 && teamSize <= 3) {
      return 'DUO'
    }
    // Email Marketing, WhatsApp, CRM, Blog ou Boutique = DUO
    if (questionnaireAnswers.needsEmailMarketing || questionnaireAnswers.needsWhatsApp ||
        questionnaireAnswers.needsCRM || questionnaireAnswers.needsBlog ||
        questionnaireAnswers.needsShop) {
      return 'DUO'
    }
    // Programme fidélité = DUO minimum
    if (questionnaireAnswers.needsLoyalty) {
      return 'DUO'
    }

    // SOLO : Par défaut
    return 'SOLO'
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
    SOLO: { name: 'Solo', price: 49, icon: '👤' },
    DUO: { name: 'Duo', price: 89, icon: '👥' },
    TEAM: { name: 'Team', price: 149, icon: '👨‍👩‍👧' },
    PREMIUM: { name: 'Premium', price: 249, icon: '⭐' }
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

              {/* Question 3 : Fonctionnalités souhaitées */}
              <div className="p-6 border-2 border-purple-100 rounded-xl bg-gradient-to-br from-purple-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  3. Quelles fonctionnalités vous intéressent ?
                </label>
                <p className="text-sm text-gray-600 mb-4">Sélectionnez toutes les options qui vous intéressent</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsSocial}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsSocial: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📱 Publication réseaux sociaux automatique</div>
                      <div className="text-sm text-gray-600">Planifiez et publiez sur Instagram, Facebook, etc.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsBlog}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsBlog: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📝 Blog professionnel</div>
                      <div className="text-sm text-gray-600">Partagez des conseils et attirez plus de clients</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsNewsletter}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsNewsletter: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📧 Newsletter automatisée</div>
                      <div className="text-sm text-gray-600">Envoyez des emails marketing à vos clients</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsAPI}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsAPI: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🔌 API Access (export comptable)</div>
                      <div className="text-sm text-gray-600">Connectez votre logiciel comptable</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 4 : Marketing & Communication */}
              <div className="p-6 border-2 border-pink-100 rounded-xl bg-gradient-to-br from-pink-50 to-white">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  4. Fonctionnalités Marketing & Communication 🚀
                </label>
                <p className="text-sm text-gray-600 mb-4">Automatisez votre marketing et fidélisez vos clients</p>
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
                        📧 Campagnes Email Marketing
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-bold">Recommandé</span>
                      </div>
                      <div className="text-sm text-gray-600">Créez et envoyez des campagnes email personnalisées à vos clients</div>
                      <div className="text-xs text-pink-600 mt-1">💡 Emails de bienvenue, promotions, rappels RDV...</div>
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
                        📱 Messages WhatsApp automatiques
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Populaire</span>
                      </div>
                      <div className="text-sm text-gray-600">Envoyez des confirmations et rappels par WhatsApp</div>
                      <div className="text-xs text-green-600 mt-1">💡 Taux d'ouverture 98% vs 20% pour les emails</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition bg-gradient-to-r from-white to-purple-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsAutomation}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsAutomation: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        ⚡ Automation Marketing
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">Premium</span>
                      </div>
                      <div className="text-sm text-gray-600">Scénarios automatisés pour fidéliser vos clients</div>
                      <div className="text-xs text-purple-600 mt-1">💡 Anniversaires, clients inactifs, programmes de fidélité...</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition bg-gradient-to-r from-white to-blue-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsCRM}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsCRM: e.target.checked })}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        📊 CRM Commercial
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Business</span>
                      </div>
                      <div className="text-sm text-gray-600">Gérez votre pipeline commercial et vos prospects</div>
                      <div className="text-xs text-blue-600 mt-1">💡 Suivi des leads, opportunités, conversion...</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-50 transition bg-gradient-to-r from-white to-yellow-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsLoyalty}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsLoyalty: e.target.checked })}
                      className="mt-1 w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        🎁 Programme Fidélité
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">Essentiel</span>
                      </div>
                      <div className="text-sm text-gray-600">Récompensez vos clients fidèles automatiquement</div>
                      <div className="text-xs text-yellow-600 mt-1">💡 Points, récompenses, offres exclusives...</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition bg-gradient-to-r from-white to-indigo-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsShop}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsShop: e.target.checked })}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        🛍️ Boutique en ligne
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">E-commerce</span>
                      </div>
                      <div className="text-sm text-gray-600">Vendez vos produits et formations en ligne</div>
                      <div className="text-xs text-indigo-600 mt-1">💡 Cosmétiques, soins à domicile, formations...</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-teal-200 rounded-lg cursor-pointer hover:bg-teal-50 transition bg-gradient-to-r from-white to-teal-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsStock}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsStock: e.target.checked })}
                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        📦 Gestion stock avancée
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-bold">Inventaire</span>
                      </div>
                      <div className="text-sm text-gray-600">Suivez votre inventaire avec alertes automatiques</div>
                      <div className="text-xs text-teal-600 mt-1">💡 Alertes rupture, fournisseurs, commandes...</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition bg-gradient-to-r from-white to-orange-50">
                    <input
                      type="checkbox"
                      checked={questionnaireAnswers.needsSMS}
                      onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, needsSMS: e.target.checked })}
                      className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        📲 SMS automatiques
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">Pro</span>
                      </div>
                      <div className="text-sm text-gray-600">Envoyez des SMS pour vos campagnes marketing</div>
                      <div className="text-xs text-orange-600 mt-1">💡 Promotions, rappels urgents, alertes...</div>
                    </div>
                  </label>
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
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-6">✨</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Parfait ! Voici notre recommandation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Basé sur vos réponses, voici le plan idéal pour vous
            </p>

            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
              <div className="inline-block px-4 py-1 bg-yellow-400 text-purple-900 rounded-full text-sm font-bold mb-4">
                ⭐ RECOMMANDÉ POUR VOUS
              </div>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-6xl">{planDetails[data.selectedPlan].icon}</span>
                <div className="text-left">
                  <div className="text-4xl font-bold">
                    {planDetails[data.selectedPlan].name}
                  </div>
                  <div className="text-2xl font-semibold opacity-90">
                    {planDetails[data.selectedPlan].price}€/mois
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span>🎁</span>
                    <span className="font-semibold">1er mois offert</span>
                  </div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <span>✅</span>
                    <span className="font-semibold">30 jours pour tester</span>
                  </div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <span>📌</span>
                    <span className="font-semibold">Engagement 1 an</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">💡 Pourquoi ce plan ?</h3>
              <div className="space-y-2 text-left max-w-md mx-auto text-sm text-blue-800">
                {data.selectedPlan === 'SOLO' && (
                  <>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Parfait pour les indépendants qui démarrent</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Site web + réservations + paiements inclus</span>
                    </div>
                  </>
                )}
                {data.selectedPlan === 'DUO' && (
                  <>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Idéal pour les petites équipes (2-3 personnes)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Programme fidélité et cartes cadeaux inclus</span>
                    </div>
                  </>
                )}
                {data.selectedPlan === 'TEAM' && (
                  <>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Pour les équipes avec plusieurs emplacements</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Réseaux sociaux complet et multi-emplacements inclus</span>
                    </div>
                  </>
                )}
                {data.selectedPlan === 'PREMIUM' && (
                  <>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Solution complète pour instituts exigeants</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Blog, newsletter et API inclus</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
              <p>✨ Vous pourrez toujours changer de plan plus tard selon vos besoins</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {steps.slice(1, -1).map((step, idx) => (
                <div key={step.id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{step.title}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Commencer la configuration →
            </button>
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
                Choisissez le design de votre site
              </h2>
              <p className="text-gray-600">
                {data.selectedPlan === 'TEAM' && 'Votre plan TEAM inclut 5 templates modernes'}
                {data.selectedPlan === 'PREMIUM' && 'Votre plan PREMIUM inclut 5 templates exclusifs'}
              </p>
            </div>

            {/* Grille de templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {websiteTemplates
                .filter(template => {
                  // Filtrer selon le plan
                  if (data.selectedPlan === 'TEAM') {
                    return template.minTier === 'TEAM';
                  } else if (data.selectedPlan === 'PREMIUM') {
                    return template.minTier === 'PREMIUM'; // Uniquement les templates PREMIUM
                  }
                  return false;
                })
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setData({ ...data, websiteTemplateId: template.id })}
                    className={`group relative bg-white rounded-xl border-2 transition-all overflow-hidden text-left ${
                      data.websiteTemplateId === template.id
                        ? 'border-purple-500 shadow-xl scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Preview du layout */}
                    <div className="h-32 relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
                      {/* Icône représentant le layout */}
                      <div className="text-5xl opacity-60">
                        {template.componentName === 'classic' && '📋'}
                        {template.componentName === 'modern' && '🎨'}
                        {template.componentName === 'minimal' && '✨'}
                        {template.componentName === 'elegant' && '💎'}
                        {template.componentName === 'bold' && '⚡'}
                        {template.componentName === 'zen' && '🧘'}
                        {template.componentName === 'luxury' && '👑'}
                        {template.componentName === 'creative' && '🎭'}
                        {template.componentName === 'corporate' && '💼'}
                        {template.componentName === 'artistic' && '🎪'}
                      </div>

                      {data.websiteTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1.5 shadow-lg">
                          <span className="text-white text-xl">✓</span>
                        </div>
                      )}
                      {template.minTier === 'PREMIUM' && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-pink-600 text-white text-xs font-bold rounded-full">
                            PREMIUM
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                      {/* Caractéristiques du layout */}
                      <div className="space-y-1.5">
                        {template.layoutFeatures.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="text-purple-500 flex-shrink-0 mt-0.5">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
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
