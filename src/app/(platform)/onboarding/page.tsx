'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateSIRET, validateIBAN, validateBIC, validateEmail, validatePhoneNumber, formatSIRET, formatIBAN } from '@/lib/validation'

// Étapes du tunnel
type Step = 'welcome' | 'personal-info' | 'business-info' | 'service' | 'hours' | 'billing' | 'payment' | 'complete'

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

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan') as OnboardingData['selectedPlan'] || 'SOLO'

  const [currentStep, setCurrentStep] = useState<Step>('welcome')
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

  const steps: { id: Step; title: string; description: string; icon: string }[] = [
    { id: 'welcome', title: 'Bienvenue', description: 'Commençons votre aventure', icon: '👋' },
    { id: 'personal-info', title: 'Vos Informations', description: 'Qui êtes-vous ?', icon: '👤' },
    { id: 'business-info', title: 'Votre Institut', description: 'Informations de base', icon: '🏢' },
    { id: 'service', title: 'Premier Service', description: 'Créez votre première prestation', icon: '💆' },
    { id: 'hours', title: 'Horaires', description: 'Vos heures d\'ouverture', icon: '🕐' },
    { id: 'billing', title: 'Facturation', description: 'Informations légales', icon: '📋' },
    { id: 'payment', title: 'Paiement', description: 'Activez votre abonnement', icon: '💳' },
    { id: 'complete', title: 'Terminé', description: 'Tout est prêt !', icon: '🎉' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

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
    const stepIndex = steps.findIndex(s => s.id === currentStep)
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id)
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
        {/* Étape Welcome */}
        {currentStep === 'welcome' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue sur LAIA Connect !
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Nous allons configurer votre institut en quelques minutes seulement.
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Votre plan sélectionné :</h3>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">{planDetails[data.selectedPlan].icon}</span>
                <div className="text-left">
                  <div className="text-2xl font-bold text-purple-600">
                    {planDetails[data.selectedPlan].name}
                  </div>
                  <div className="text-lg text-gray-600">
                    {planDetails[data.selectedPlan].price}€/mois
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                ✅ 30 jours gratuits • Annulation à tout moment
              </p>
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
