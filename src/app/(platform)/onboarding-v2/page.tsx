'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateSIRENorSIRET, validateEmail, validatePhoneNumber } from '@/lib/validation'
import { getPlanPrice, getPlanName } from '@/lib/features-simple'

// Étapes simplifiées : uniquement ce qui est nécessaire AVANT paiement
type Step = 'personal' | 'institute' | 'legal' | 'plan' | 'preview'

interface OnboardingData {
  // Étape 1 - Personnel
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  ownerPhone: string

  // Étape 2 - Institut
  institutName: string
  city: string
  slug: string
  useCustomDomain: boolean
  customDomain?: string

  // Étape 3 - Légal (pour contrat)
  legalName: string
  siret: string
  tvaNumber?: string
  billingAddress: string
  billingPostalCode: string
  billingCity: string
  billingCountry: string

  // Étape 4 - Plan
  selectedPlan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
}

export default function OnboardingV2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan') as OnboardingData['selectedPlan'] || 'DUO'

  const [currentStep, setCurrentStep] = useState<Step>('personal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    institutName: '',
    city: '',
    slug: '',
    useCustomDomain: false,
    customDomain: '',
    legalName: '',
    siret: '',
    tvaNumber: '',
    billingAddress: '',
    billingPostalCode: '',
    billingCity: '',
    billingCountry: 'France',
    selectedPlan: planFromUrl
  })

  // Auto-save dans localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_v2_data', JSON.stringify(data))
    localStorage.setItem('onboarding_v2_step', currentStep)
  }, [data, currentStep])

  // Restore depuis localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_v2_data')
    const savedStep = localStorage.getItem('onboarding_v2_step')
    if (savedData) {
      try {
        setData(JSON.parse(savedData))
      } catch (e) {
        console.error('Error restoring data:', e)
      }
    }
    if (savedStep) {
      setCurrentStep(savedStep as Step)
    }
  }, [])

  // Auto-générer le slug depuis le nom de l'institut
  useEffect(() => {
    if (data.institutName && !slugManuallyEdited) {
      const slug = data.institutName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setData(prev => ({ ...prev, slug }))
    }
  }, [data.institutName, slugManuallyEdited])

  // Auto-remplir le domaine personnalisé quand on coche la case
  useEffect(() => {
    if (data.useCustomDomain && !data.customDomain && data.slug) {
      setData(prev => ({ ...prev, customDomain: `${data.slug}.fr` }))
    }
  }, [data.useCustomDomain])

  const steps: { id: Step; title: string; description: string; icon: string }[] = [
    { id: 'personal', title: 'Vos Informations', description: 'Commençons par vous connaître', icon: '👤' },
    { id: 'institute', title: 'Votre Institut', description: 'Parlez-nous de votre activité', icon: '🏢' },
    { id: 'legal', title: 'Informations Légales', description: 'Pour votre contrat d\'abonnement', icon: '📋' },
    { id: 'plan', title: 'Choisissez Votre Offre', description: 'Trouvons la formule idéale', icon: '💎' },
    { id: 'preview', title: 'Récapitulatif', description: 'Vérifiez vos informations', icon: '✅' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {}

    if (currentStep === 'personal') {
      if (!data.ownerFirstName.trim()) errors.ownerFirstName = 'Prénom requis'
      if (!data.ownerLastName.trim()) errors.ownerLastName = 'Nom requis'
      if (!validateEmail(data.ownerEmail)) errors.ownerEmail = 'Email invalide'
      if (!validatePhoneNumber(data.ownerPhone)) errors.ownerPhone = 'Téléphone invalide (format: 06XXXXXXXX)'
    }

    if (currentStep === 'institute') {
      if (!data.institutName.trim()) errors.institutName = 'Nom de l\'institut requis'
      if (!data.city.trim()) errors.city = 'Ville requise'
      if (!data.slug.trim()) errors.slug = 'Slug requis'
    }

    if (currentStep === 'legal') {
      if (!data.legalName.trim()) errors.legalName = 'Raison sociale requise'
      if (!validateSIRENorSIRET(data.siret)) errors.siret = 'SIREN (9 chiffres) ou SIRET (14 chiffres) invalide'
      if (!data.billingAddress.trim()) errors.billingAddress = 'Adresse requise'
      if (!data.billingPostalCode.trim()) errors.billingPostalCode = 'Code postal requis'
      if (!data.billingCity.trim()) errors.billingCity = 'Ville requise'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) {
      return
    }

    const stepOrder: Step[] = ['personal', 'institute', 'legal', 'plan', 'preview']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    const stepOrder: Step[] = ['personal', 'institute', 'legal', 'plan', 'preview']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/onboarding/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...data,
          // Données minimales pour créer l'organisation
          // Le reste sera complété dans l'admin après paiement
          address: data.billingAddress,
          postalCode: data.billingPostalCode,
          primaryColor: '#d4b5a0',
          secondaryColor: '#2c3e50',
          websiteTemplateId: 'modern', // Template par défaut
          subdomain: data.slug
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du paiement')
      }

      const { url } = await response.json()

      // Redirection vers Stripe Checkout
      window.location.href = url
    } catch (err: any) {
      console.error('Erreur checkout:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      id: 'SOLO' as const,
      name: 'Solo',
      price: 49,
      description: 'Pour démarrer',
      features: [
        '🌐 Site web professionnel',
        '📅 Réservations en ligne 24/7',
        '👥 Gestion clients complète',
        '🎁 Programme fidélité',
        '💳 Paiement en ligne (Stripe)',
        '⭐ Avis clients + Google Reviews',
        '💰 Comptabilité & factures',
        '📊 Statistiques temps réel',
        '👤 1 utilisateur',
        '📍 1 emplacement'
      ],
      color: 'from-gray-400 to-gray-600',
      popular: false
    },
    {
      id: 'DUO' as const,
      name: 'Duo',
      price: 69,
      description: 'Pour développer',
      features: [
        '✨ Tout Solo +',
        '🎯 CRM Commercial complet',
        '📧 Email Marketing illimité',
        '🤖 Automations marketing',
        '📈 Reporting commercial',
        '👥 3 utilisateurs',
        '📍 1 emplacement'
      ],
      color: 'from-blue-500 to-blue-600',
      popular: false
    },
    {
      id: 'TEAM' as const,
      name: 'Team',
      price: 119,
      description: '⭐ Le plus rentable',
      features: [
        '✨ Tout Duo +',
        '📝 Blog professionnel SEO',
        '🛍️ Boutique en ligne',
        '📱 WhatsApp Business',
        '📲 SMS Marketing',
        '📱 Réseaux sociaux (IG + FB)',
        '📦 Gestion stock',
        '👥 10 utilisateurs',
        '📍 3 emplacements'
      ],
      color: 'from-purple-500 to-purple-600',
      popular: true
    },
    {
      id: 'PREMIUM' as const,
      name: 'Premium',
      price: 179,
      description: 'L\'expérience complète',
      features: [
        '✨ Tout Team +',
        '📦 Stock avancé multi-sites',
        '🔔 Alertes stock automatiques',
        '🔌 API complète',
        '📊 Export comptable auto',
        '👥 Utilisateurs illimités',
        '📍 Emplacements illimités',
        '⚡ Support prioritaire 24/7'
      ],
      color: 'from-indigo-500 to-pink-600',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/platform" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg">
                <span className="text-xl">🌸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  LAIA Connect
                </h1>
                <p className="text-xs text-purple-600 font-medium">Configuration rapide</p>
              </div>
            </Link>
            <Link
              href="/connexion"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Déjà client ? Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Étape {currentStepIndex + 1} sur {steps.length}</span>
              <span className="text-purple-600 font-bold">{Math.round(progress)}% complété</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  index <= currentStepIndex
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-2 font-medium text-center hidden md:block ${
                  index <= currentStepIndex ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Étape 1: Personnel */}
          {currentStep === 'personal' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  👋 Ravi de vous rencontrer !
                </h2>
                <p className="text-lg text-gray-600">
                  Commençons par faire connaissance
                </p>
              </div>

              {/* Réassurance */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-semibold">3 minutes seulement !</p>
                    <p className="text-green-700 text-sm">Vos informations sont sécurisées et ne seront jamais partagées.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.ownerFirstName}
                    onChange={(e) => setData({ ...data, ownerFirstName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.ownerFirstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {validationErrors.ownerFirstName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.ownerFirstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.ownerLastName}
                    onChange={(e) => setData({ ...data, ownerLastName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.ownerLastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {validationErrors.ownerLastName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.ownerLastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email professionnel <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={data.ownerEmail}
                  onChange={(e) => setData({ ...data, ownerEmail: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.ownerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
                {validationErrors.ownerEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.ownerEmail}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">Nous vous enverrons vos identifiants de connexion</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={data.ownerPhone}
                  onChange={(e) => setData({ ...data, ownerPhone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.ownerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="06 12 34 56 78"
                />
                {validationErrors.ownerPhone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.ownerPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Étape 2: Institut */}
          {currentStep === 'institute' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  🏢 Parlez-nous de votre institut
                </h2>
                <p className="text-lg text-gray-600">
                  Ces informations apparaîtront sur votre site
                </p>
              </div>

              {/* Réassurance */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-800 font-semibold">Vous pourrez tout personnaliser plus tard</p>
                    <p className="text-blue-700 text-sm">Logo, couleurs, photos... tout se configure facilement dans votre espace admin.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de votre institut <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.institutName}
                  onChange={(e) => setData({ ...data, institutName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.institutName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Belle Peau Institut"
                />
                {validationErrors.institutName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.institutName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => setData({ ...data, city: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Paris"
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de votre site <span className="text-red-500">*</span>
                </label>

                {/* Toggle domaine personnalisé */}
                <div className="mb-4 flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    id="useCustomDomain"
                    checked={data.useCustomDomain}
                    onChange={(e) => setData({ ...data, useCustomDomain: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="useCustomDomain" className="cursor-pointer flex-1">
                    <span className="font-semibold text-gray-900">J'ai déjà un nom de domaine</span>
                    <p className="text-sm text-gray-600">Ex: mon-institut.fr</p>
                  </label>
                </div>

                {data.useCustomDomain ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-500">https://</span>
                      <input
                        type="text"
                        value={data.customDomain}
                        onChange={(e) => setData({ ...data, customDomain: e.target.value.toLowerCase() })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="mon-institut.fr"
                        autoComplete="off"
                      />
                    </div>

                    {/* Message simple et honnête */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-xl mt-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full p-2 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-purple-900 mb-2">Configuration de votre domaine</h4>
                          <p className="text-purple-800 text-sm mb-3">
                            Nous nous occupons de tout ! Après votre inscription, vous recevrez par email :
                          </p>
                          <ul className="space-y-2 text-sm text-purple-800">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500 font-bold">✓</span>
                              <span>Les instructions DNS précises pour votre registraire (OVH, Gandi, etc.)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500 font-bold">✓</span>
                              <span>Un guide pas-à-pas avec captures d'écran</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500 font-bold">✓</span>
                              <span>L'assistance de notre support technique si besoin</span>
                            </li>
                          </ul>
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <p className="text-purple-700 text-xs">
                              <strong>⏱️ Délai de propagation :</strong> 24-48h maximum après configuration DNS
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sous-domaine LAIA Connect quand même créé */}
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🚀</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900 mb-2">En attendant, démarrez immédiatement !</h4>
                          <p className="text-green-800 text-sm mb-3">
                            Votre site sera accessible instantanément sur :
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">https://</span>
                            <input
                              type="text"
                              value={data.slug}
                              onChange={(e) => {
                                setSlugManuallyEdited(true)
                                setData({ ...data, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
                              }}
                              className="flex-1 px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                              placeholder="mon-institut"
                              autoComplete="off"
                            />
                            <span className="text-gray-500 text-sm">.laia-connect.fr</span>
                          </div>
                          <p className="text-green-700 text-xs mt-2">
                            ✅ SSL inclus • Reste actif même après configuration de votre domaine personnalisé
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">https://</span>
                      <input
                        type="text"
                        value={data.slug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true)
                          setData({ ...data, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
                        }}
                        className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          validationErrors.slug ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="mon-institut"
                        autoComplete="off"
                      />
                      <span className="text-gray-500">.laia-connect.fr</span>
                    </div>
                    {validationErrors.slug && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.slug}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      🌐 Votre site sera accessible à : <strong>https://{data.slug || 'mon-institut'}.laia-connect.fr</strong>
                    </p>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg mt-3">
                      <p className="text-green-700 text-sm">
                        ✅ <strong>Gratuit et instantané</strong> - Votre site sera en ligne immédiatement avec SSL inclus.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 3: Légal */}
          {currentStep === 'legal' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  📋 Informations légales
                </h2>
                <p className="text-lg text-gray-600">
                  Nécessaires pour votre contrat d'abonnement
                </p>
              </div>

              {/* Réassurance */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0121 12c0 .761-.069 1.506-.202 2.223a5.995 5.995 0 00-3.798-3.798A11.955 11.955 0 0012 9c-1.657 0-3.23.337-4.618.984A5.995 5.995 0 003.798 13.202 11.955 11.955 0 013 12c0-6.627 5.373-12 12-12s12 5.373 12 12z" />
                  </svg>
                  <div>
                    <p className="text-purple-800 font-semibold">🔒 100% sécurisé et conforme RGPD</p>
                    <p className="text-purple-700 text-sm">Vos documents (contrat + facture) seront générés automatiquement et envoyés par email.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.legalName}
                  onChange={(e) => setData({ ...data, legalName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.legalName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Belle Peau Institut SARL"
                />
                {validationErrors.legalName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.legalName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIREN ou SIRET <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.siret}
                    onChange={(e) => setData({ ...data, siret: e.target.value.replace(/\s/g, '') })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.siret ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9 ou 14 chiffres"
                    maxLength={14}
                  />
                  {validationErrors.siret ? (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.siret}</p>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">Auto-entrepreneurs : SIREN (9 chiffres) • Sociétés : SIRET (14 chiffres)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° TVA intracommunautaire
                  </label>
                  <input
                    type="text"
                    value={data.tvaNumber}
                    onChange={(e) => setData({ ...data, tvaNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="FR12345678901 (optionnel)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de facturation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.billingAddress}
                  onChange={(e) => setData({ ...data, billingAddress: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.billingAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Rue de la Beauté"
                />
                {validationErrors.billingAddress && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.billingAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.billingPostalCode}
                    onChange={(e) => setData({ ...data, billingPostalCode: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="75001"
                  />
                  {validationErrors.billingPostalCode && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.billingPostalCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.billingCity}
                    onChange={(e) => setData({ ...data, billingCity: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.billingCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Paris"
                  />
                  {validationErrors.billingCity && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.billingCity}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Plan */}
          {currentStep === 'plan' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  💎 Choisissez votre formule
                </h2>
                <p className="text-lg text-gray-600">
                  30 jours d'essai gratuit · Sans engagement
                </p>
              </div>

              {/* Réassurance */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 p-6 rounded-2xl mb-8">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎁</div>
                  <p className="text-2xl font-bold text-green-800 mb-2">1er mois OFFERT !</p>
                  <p className="text-green-700">
                    Testez toutes les fonctionnalités gratuitement pendant 30 jours.<br/>
                    <strong>Coordonnées bancaires requises • 1er prélèvement après 30 jours</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setData({ ...data, selectedPlan: plan.id })}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all hover:shadow-xl ${
                      data.selectedPlan === plan.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-purple-300'
                    } ${plan.popular ? 'ring-4 ring-purple-200' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                          ⭐ LE PLUS POPULAIRE
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      <div className="text-5xl font-bold text-purple-600 mb-2">{plan.price}€</div>
                      <p className="text-gray-500 text-sm">/ mois HT</p>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="text-center">
                      {data.selectedPlan === plan.id ? (
                        <div className="bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Sélectionné
                        </div>
                      ) : (
                        <div className="border-2 border-purple-200 text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50">
                          Choisir {plan.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-8">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Bon à savoir :</strong> Vous pourrez changer de formule à tout moment depuis votre espace admin.
                </p>
              </div>
            </div>
          )}

          {/* Étape 5: Récapitulatif */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  ✅ Vérifiez vos informations
                </h2>
                <p className="text-lg text-gray-600">
                  Dernière étape avant le paiement sécurisé
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="bg-white border-2 border-purple-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">📋 Récapitulatif de votre inscription</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Propriétaire</p>
                    <p className="text-lg font-bold text-gray-900">{data.ownerFirstName} {data.ownerLastName}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Email</p>
                    <p className="text-lg font-bold text-gray-900">{data.ownerEmail}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Institut</p>
                    <p className="text-lg font-bold text-gray-900">{data.institutName}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Ville</p>
                    <p className="text-lg font-bold text-gray-900">{data.city}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-green-600 font-semibold mb-1">URL du site</p>
                    <p className="text-lg font-bold text-green-900 break-all">
                      {data.useCustomDomain && data.customDomain
                        ? `https://${data.customDomain}`
                        : `https://${data.slug}.laia-connect.fr`}
                    </p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-xl">
                    <p className="text-sm text-pink-600 font-semibold mb-1">Formule choisie</p>
                    <p className="text-lg font-bold text-gray-900">
                      {plans.find(p => p.id === data.selectedPlan)?.name} · {plans.find(p => p.id === data.selectedPlan)?.price}€/mois
                    </p>
                  </div>
                </div>
              </div>

              {/* Réassurance finale */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                  🎉 Ce qui va se passer ensuite
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-md text-center">
                    <div className="text-4xl mb-3">1️⃣</div>
                    <h4 className="font-bold mb-2">Paiement sécurisé</h4>
                    <p className="text-sm text-gray-600">Via Stripe (aucun frais pendant 30 jours)</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md text-center">
                    <div className="text-4xl mb-3">2️⃣</div>
                    <h4 className="font-bold mb-2">Email avec identifiants</h4>
                    <p className="text-sm text-gray-600">Contrat + Facture en pièces jointes</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md text-center">
                    <div className="text-4xl mb-3">3️⃣</div>
                    <h4 className="font-bold mb-2">Configuration finale</h4>
                    <p className="text-sm text-gray-600">Logo, couleurs, services dans l'admin</p>
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">📋 Récapitulatif</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Propriétaire</p>
                    <p className="font-semibold">{data.ownerFirstName} {data.ownerLastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{data.ownerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Institut</p>
                    <p className="font-semibold">{data.institutName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ville</p>
                    <p className="font-semibold">{data.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">URL du site</p>
                    <p className="font-semibold text-purple-600">
                      {data.useCustomDomain && data.customDomain
                        ? `https://${data.customDomain}`
                        : `https://${data.slug}.laia-connect.fr`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Formule choisie</p>
                    <p className="font-semibold">
                      {plans.find(p => p.id === data.selectedPlan)?.name} · {plans.find(p => p.id === data.selectedPlan)?.price}€/mois
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
            )}

            <div className="flex-1" />

            {currentStep !== 'preview' ? (
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Continuer
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Redirection...
                  </>
                ) : (
                  <>
                    🎉 Valider & Payer
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust indicators au bas */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              </svg>
              <span>Support 7j/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
