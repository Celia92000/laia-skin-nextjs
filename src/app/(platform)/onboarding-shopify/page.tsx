'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { validateEmail, validatePhoneNumber } from '@/lib/validation'

// Force dynamic rendering for pages with search params
export const dynamic = 'force-dynamic'

// Étapes complètes de l'onboarding
type Step = 'account' | 'about' | 'questions' | 'plan' | 'template' | 'customization' | 'legal' | 'payment'

interface OnboardingData {
  // Étape 1 - Compte
  email: string
  password: string

  // Étape 2 - À propos
  firstName: string
  lastName: string
  phone: string
  institutName: string
  city: string

  // Étape 3 - Questions (pour recommandation)
  teamSize?: string
  locationCount?: string
  neededFeatures?: string

  // Étape 4 - Plan recommandé
  selectedPlan?: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'

  // Étape 5 - Template
  websiteTemplateId?: string

  // Étape 6 - Personnalisation
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  logoUrl?: string
  siteName?: string
  siteDescription?: string

  // Étape 7 - Informations légales
  legalName?: string
  siret?: string
  billingEmail?: string
  billingAddress?: string
  billingPostalCode?: string
  billingCity?: string
  billingCountry?: string
}

function OnboardingShopifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shouldReset = searchParams.get('reset') === 'true'
  const fromGoogle = searchParams.get('google') === 'true'

  // Récupérer la session Google si connecté
  const { data: session, status } = useSession()

  const [currentStep, setCurrentStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<OnboardingData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    institutName: '',
    city: '',
    teamSize: '',
    locationCount: '',
    neededFeatures: '',
    selectedPlan: undefined,
    websiteTemplateId: undefined,
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    accentColor: '#e74c3c',
    logoUrl: '',
    siteName: '',
    siteDescription: '',
    legalName: '',
    siret: '',
    billingEmail: '',
    billingAddress: '',
    billingPostalCode: '',
    billingCity: '',
    billingCountry: 'FR'
  })

  // Auto-save dans localStorage
  useEffect(() => {
    if (!shouldReset) {
      localStorage.setItem('onboarding_shopify_data', JSON.stringify(data))
      localStorage.setItem('onboarding_shopify_step', currentStep)
    }
  }, [data, currentStep, shouldReset])

  // Restore depuis localStorage
  useEffect(() => {
    if (shouldReset) {
      localStorage.removeItem('onboarding_shopify_data')
      localStorage.removeItem('onboarding_shopify_step')
      setCurrentStep('account')
      return
    }

    const savedData = localStorage.getItem('onboarding_shopify_data')
    const savedStep = localStorage.getItem('onboarding_shopify_step')

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
  }, [shouldReset])

  // Gérer le retour de Google OAuth
  useEffect(() => {
    if (fromGoogle && session?.user && status === 'authenticated') {
      console.log('✅ Connexion Google détectée:', session.user)

      // Pré-remplir les données avec les infos Google
      const nameParts = session.user.name?.split(' ') || []
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setData(prevData => ({
        ...prevData,
        email: session.user.email || prevData.email,
        firstName: firstName,
        lastName: lastName,
        password: '' // Pas de password pour OAuth
      }))

      // Passer directement à l'étape 2 (about)
      setCurrentStep('about')

      // Nettoyer le query param google=true
      router.replace('/onboarding-shopify')
    }
  }, [fromGoogle, session, status, router])

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {}

    if (currentStep === 'account') {
      if (!validateEmail(data.email)) errors.email = 'Email invalide'
      // Mot de passe requis seulement si pas connecté via Google
      if (!session && data.password.length < 8) errors.password = 'Minimum 8 caractères'
    }

    if (currentStep === 'about') {
      if (!data.firstName.trim()) errors.firstName = 'Prénom requis'
      if (!data.lastName.trim()) errors.lastName = 'Nom requis'
      if (!validatePhoneNumber(data.phone)) errors.phone = 'Téléphone invalide (ex: 0612345678)'
      if (!data.institutName.trim()) errors.institutName = 'Nom de l\'institut requis'
      if (!data.city.trim()) errors.city = 'Ville requise'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Recommander un plan basé sur les réponses
  const recommendPlan = (): 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM' => {
    const { teamSize, locationCount, neededFeatures } = data

    // RÈGLES BASÉES SUR LES VRAIES LIMITES DES FORMULES
    // SOLO: 1 utilisateur, 1 emplacement, fonctionnalités essentielles
    // DUO: 3 utilisateurs, 1 emplacement, + CRM + Email + Blog
    // TEAM: 10 utilisateurs, 3 emplacements, + Boutique + WhatsApp + Réseaux sociaux
    // PREMIUM: illimité, illimité, toutes fonctionnalités avancées

    // 1. EMPLACEMENTS (critère bloquant prioritaire)
    if (locationCount === '4+') {
      return 'PREMIUM' // Seul plan avec emplacements illimités
    }

    if (locationCount === '2-3') {
      // TEAM minimum (seul plan avec 3 emplacements)
      if (teamSize === '11+' || neededFeatures === 'advanced') {
        return 'PREMIUM'
      }
      return 'TEAM'
    }

    // 2. UN SEUL EMPLACEMENT : combiner utilisateurs + fonctionnalités
    if (locationCount === '1') {
      // Si 11+ utilisateurs ou fonctionnalités avancées → PREMIUM
      if (teamSize === '11+' || neededFeatures === 'advanced') {
        return 'PREMIUM'
      }

      // Si besoin boutique/WhatsApp/réseaux ou 4-10 utilisateurs → TEAM
      if (teamSize === '4-10' || neededFeatures === 'shop') {
        return 'TEAM'
      }

      // Si besoin CRM/Email/Blog ou 2-3 utilisateurs → DUO
      if (teamSize === '2-3' || neededFeatures === 'crm') {
        return 'DUO'
      }

      // 1 seul utilisateur + fonctionnalités essentielles → SOLO
      if (teamSize === '1' && neededFeatures === 'basic') {
        return 'SOLO'
      }

      // Si juste 1 utilisateur mais veut des fonctionnalités → adapter
      if (teamSize === '1') {
        if (neededFeatures === 'crm') return 'DUO'
        if (neededFeatures === 'shop') return 'TEAM'
        return 'SOLO' // Par défaut
      }
    }

    // Fallback : SOLO par défaut
    return 'SOLO'
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      setLoading(true)

      // Sauvegarder les données du formulaire dans localStorage avant de rediriger
      localStorage.setItem('onboarding-shopify', JSON.stringify(data))

      // Rediriger vers Google OAuth avec NextAuth
      // L'utilisateur sera créé automatiquement dans la DB via PrismaAdapter
      // Après connexion, on redirigera vers l'onboarding étape 2
      await signIn('google', {
        callbackUrl: '/onboarding-shopify?step=about&google=true',
        redirect: true
      })
    } catch (err) {
      console.error('Erreur Google Sign-In:', err)
      setError('Erreur lors de la connexion avec Google. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (currentStep === 'account') {
      setCurrentStep('about')
    } else if (currentStep === 'about') {
      setCurrentStep('questions')
    } else if (currentStep === 'questions') {
      // Calculer le plan recommandé
      const recommended = recommendPlan()
      setData({ ...data, selectedPlan: recommended })
      setCurrentStep('plan')
    } else if (currentStep === 'plan') {
      setCurrentStep('template')
    } else if (currentStep === 'template') {
      setCurrentStep('customization')
    } else if (currentStep === 'customization') {
      setCurrentStep('legal')
    } else if (currentStep === 'legal') {
      setCurrentStep('payment')
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      // Générer slug et subdomain depuis institutName
      const slug = data.institutName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const subdomain = slug

      // Appeler l'API pour créer la session Stripe Checkout
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Informations personnelles
          ownerFirstName: data.firstName,
          ownerLastName: data.lastName,
          ownerEmail: data.email,
          ownerPhone: data.phone,

          // Informations institut
          institutName: data.institutName,
          slug,
          subdomain,

          // Informations légales
          legalName: data.legalName,
          siret: data.siret,
          billingEmail: data.billingEmail || data.email,
          billingAddress: data.billingAddress,
          billingPostalCode: data.billingPostalCode,
          billingCity: data.billingCity,
          billingCountry: data.billingCountry,

          // Plan sélectionné
          selectedPlan: data.selectedPlan,

          // Template et personnalisation
          websiteTemplateId: data.websiteTemplateId,

          // Migration (optionnel)
          needsDataMigration: false,
          currentSoftware: ''
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la session')
      }

      // Nettoyer le localStorage
      localStorage.removeItem('onboarding_shopify_data')
      localStorage.removeItem('onboarding_shopify_step')

      // Rediriger vers Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 'account', title: 'Compte', number: 1 },
    { id: 'about', title: 'À propos', number: 2 },
    { id: 'questions', title: 'Questions', number: 3 },
    { id: 'plan', title: 'Votre plan', number: 4 },
    { id: 'template', title: 'Template', number: 5 },
    { id: 'customization', title: 'Personnalisation', number: 6 },
    { id: 'legal', title: 'Informations légales', number: 7 },
    { id: 'payment', title: 'Paiement', number: 8 }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const getStepDuration = () => {
    if (currentStep === 'account') return '30 secondes'
    if (currentStep === 'about') return '1 minute'
    if (currentStep === 'questions') return '30 secondes'
    if (currentStep === 'plan') return '1 minute'
    return '1 minute'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              LAIA Connect
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Commencez gratuitement
          </h1>
          <p className="text-lg text-gray-600">
            Essai gratuit de 30 jours · Aucune carte bancaire requise
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  currentStepIndex >= idx
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-2 ${
                    currentStepIndex > idx ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-center text-gray-600 font-medium">
            Étape {currentStepIndex + 1} sur {steps.length} · Environ {getStepDuration()}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* ÉTAPE 1 : Créez votre compte */}
          {currentStep === 'account' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Créez votre compte
                </h2>
                <p className="text-gray-600">
                  Commencez votre essai gratuit de 30 jours
                </p>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="vous@exemple.com"
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg transition ${
                      validationErrors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-purple-500'
                    } focus:outline-none`}
                    autoFocus
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Créer un mot de passe *
                  </label>
                  <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    placeholder="Minimum 8 caractères"
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg transition ${
                      validationErrors.password
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-purple-500'
                    } focus:outline-none`}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisez au moins 8 caractères avec des lettres et des chiffres
                  </p>
                </div>

                {/* Google sign-in (optionnel) */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-6 text-center">
                En continuant, vous acceptez les{' '}
                <Link href="/cgv-laia-connect" className="text-purple-600 hover:underline">
                  CGV
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-purple-600 hover:underline">
                  Politique de confidentialité
                </Link>
              </p>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Continuer
              </button>

              {/* Login link */}
              <p className="text-sm text-center text-gray-600 mt-4">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="text-purple-600 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          )}

          {/* ÉTAPE 2 : À propos de vous */}
          {currentStep === 'about' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Parlez-nous de vous
                </h2>
                <p className="text-gray-600">
                  Quelques informations pour personnaliser votre expérience
                </p>
              </div>

              <div className="space-y-4">
                {/* Prénom & Nom */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={data.firstName}
                      onChange={(e) => setData({ ...data, firstName: e.target.value })}
                      placeholder="Célia"
                      className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                        validationErrors.firstName
                          ? 'border-red-300'
                          : 'border-gray-300 focus:border-purple-500'
                      } focus:outline-none`}
                      autoFocus
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={data.lastName}
                      onChange={(e) => setData({ ...data, lastName: e.target.value })}
                      placeholder="Dupont"
                      className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                        validationErrors.lastName
                          ? 'border-red-300'
                          : 'border-gray-300 focus:border-purple-500'
                      } focus:outline-none`}
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                      validationErrors.phone
                        ? 'border-red-300'
                        : 'border-gray-300 focus:border-purple-500'
                    } focus:outline-none`}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                {/* Nom de l'institut */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de votre institut *
                  </label>
                  <input
                    type="text"
                    value={data.institutName}
                    onChange={(e) => setData({ ...data, institutName: e.target.value })}
                    placeholder="Belle Peau Institut"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                      validationErrors.institutName
                        ? 'border-red-300'
                        : 'border-gray-300 focus:border-purple-500'
                    } focus:outline-none`}
                  />
                  {validationErrors.institutName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.institutName}</p>
                  )}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    placeholder="Paris"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                      validationErrors.city
                        ? 'border-red-300'
                        : 'border-gray-300 focus:border-purple-500'
                    } focus:outline-none`}
                  />
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCurrentStep('account')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Questions pour recommandation */}
          {currentStep === 'questions' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Trouvons la formule parfaite
                </h2>
                <p className="text-gray-600">
                  3 questions rapides pour vous recommander le meilleur plan
                </p>
              </div>

              <div className="space-y-6">
                {/* Question 1: Nombre de collaborateurs */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    1. Combien de collaborateurs travailleront sur le logiciel ?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '1', label: 'Juste moi', icon: '👤' },
                      { value: '2-3', label: '2-3 personnes', icon: '👥' },
                      { value: '4-10', label: '4-10 personnes', icon: '👨‍👩‍👧' },
                      { value: '11+', label: '11 ou plus', icon: '👨‍👩‍👧‍👦' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setData({ ...data, teamSize: option.value })}
                        className={`p-5 border-2 rounded-xl font-semibold transition-all ${
                          data.teamSize === option.value
                            ? 'border-purple-600 bg-purple-600 text-white shadow-lg scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:scale-102'
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Nombre d'emplacements */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    2. Combien de points de vente / emplacements avez-vous ?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '1', label: '1 seul', icon: '🏪' },
                      { value: '2-3', label: '2-3 emplacements', icon: '🏬' },
                      { value: '4+', label: '4 ou plus', icon: '🏢' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setData({ ...data, locationCount: option.value })}
                        className={`p-5 border-2 rounded-xl font-semibold transition-all ${
                          data.locationCount === option.value
                            ? 'border-purple-600 bg-purple-600 text-white shadow-lg scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:scale-102'
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Fonctionnalités souhaitées */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    3. Quelles fonctionnalités vous intéressent le plus ?
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'basic', label: 'Essentielles uniquement', subtitle: 'Planning • Réservations • Site vitrine', icon: '✨' },
                      { value: 'crm', label: 'Essentielles + Marketing', subtitle: 'Tout ci-dessus + CRM • Email Marketing • Blog', icon: '📧' },
                      { value: 'shop', label: 'Essentielles + Marketing + Vente', subtitle: 'Tout ci-dessus + Boutique • WhatsApp • Réseaux sociaux', icon: '🛒' },
                      { value: 'advanced', label: 'Toutes les fonctionnalités avancées', subtitle: 'Pack complet avec toutes les options', icon: '🚀' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setData({ ...data, neededFeatures: option.value })}
                        className={`p-4 border-2 rounded-xl font-semibold transition-all text-left ${
                          data.neededFeatures === option.value
                            ? 'border-purple-600 bg-purple-600 text-white shadow-lg scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:scale-102'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl mt-1">{option.icon}</div>
                          <div>
                            <div className="text-sm font-bold">{option.label}</div>
                            <div className="text-xs mt-1 opacity-80">{option.subtitle}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info box */}
              {data.teamSize && data.locationCount && data.neededFeatures && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 text-center">
                    ✨ Parfait ! Nous allons vous recommander le plan idéal pour votre activité
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setCurrentStep('about')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  disabled={!data.teamSize || !data.locationCount || !data.neededFeatures}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voir mon plan recommandé →
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : Plan recommandé */}
          {currentStep === 'plan' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Nous vous recommandons
                </h2>
                <p className="text-gray-600">
                  Basé sur vos réponses, voici la formule idéale pour vous
                </p>
              </div>

              {/* Plan cards */}
              <div className="space-y-4 mb-8">
                {[
                  {
                    id: 'SOLO',
                    name: 'Solo',
                    price: '49€',
                    description: 'Esthéticienne indépendante seule',
                    features: [
                      '1 utilisateur',
                      '1 emplacement',
                      'Site vitrine personnalisable',
                      'Réservations + Paiements',
                      'Planning + Calendrier',
                      'Gestion clients',
                      'Programme fidélité complet',
                      'Comptabilité + Factures'
                    ],
                    color: 'blue'
                  },
                  {
                    id: 'DUO',
                    name: 'Duo',
                    price: '69€',
                    description: 'Petit institut 2-3 personnes',
                    features: [
                      'Tout SOLO +',
                      '3 utilisateurs max',
                      '✨ CRM complet (leads + pipeline)',
                      '✨ Email Marketing (campagnes + automations)',
                      'Gestion multi-praticiens',
                      'Statistiques avancées'
                    ],
                    color: 'purple'
                  },
                  {
                    id: 'TEAM',
                    name: 'Team',
                    price: '119€',
                    description: 'Institut établi - E-commerce complet',
                    features: [
                      'Tout DUO +',
                      '8 utilisateurs max',
                      '3 emplacements max',
                      '✨ Boutique en ligne (produits + formations)',
                      '✨ Blog + SEO',
                      '✨ WhatsApp Marketing',
                      '✨ SMS Marketing',
                      '✨ Réseaux Sociaux (Instagram + Facebook)'
                    ],
                    color: 'pink'
                  },
                  {
                    id: 'PREMIUM',
                    name: 'Premium',
                    price: '179€',
                    description: 'Chaîne/Franchise - Outils avancés',
                    features: [
                      'Tout TEAM +',
                      'Utilisateurs ILLIMITÉS',
                      'Emplacements ILLIMITÉS',
                      '✨ Stock avancé (inventaire + alertes)',
                      'Rapports personnalisés',
                      'Multi-devises',
                      'API + Intégrations',
                      'Support dédié'
                    ],
                    color: 'gradient'
                  }
                ].map((plan) => {
                  const isRecommended = plan.id === data.selectedPlan
                  const borderColor = isRecommended
                    ? 'border-green-500'
                    : data.selectedPlan === plan.id
                      ? 'border-purple-500'
                      : 'border-gray-200'
                  const bgColor = isRecommended ? 'bg-green-50' : 'bg-white'

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setData({ ...data, selectedPlan: plan.id as any })}
                      className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${borderColor} ${bgColor} ${
                        data.selectedPlan === plan.id ? 'shadow-lg scale-102' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                            {isRecommended && (
                              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                ✨ RECOMMANDÉ
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{plan.description}</p>
                          <div className="mb-4">
                            <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-gray-600">/mois</span>
                          </div>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="ml-4">
                          {data.selectedPlan === plan.id ? (
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Trial notice */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      🎁 Essai gratuit de 30 jours
                    </p>
                    <p className="text-sm text-blue-800">
                      Testez toutes les fonctionnalités sans engagement. Aucune carte bancaire requise.
                      Vous pourrez changer de formule à tout moment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('questions')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading || !data.selectedPlan}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    `🚀 Démarrer mon essai gratuit`
                  )}
                </button>
              </div>

              {/* Terms reminder */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                En cliquant sur "Démarrer mon essai", vous acceptez nos{' '}
                <Link href="/cgv-laia-connect" className="text-purple-600 hover:underline">
                  CGV
                </Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-purple-600 hover:underline">
                  Politique de confidentialité
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Trust indicators */}
        <div className="text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Essai 30 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Aucune CB requise</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sans engagement</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Rejoignez plus de 500 instituts qui font confiance à LAIA Connect
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingShopify() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <OnboardingShopifyContent />
    </Suspense>
  )
}
