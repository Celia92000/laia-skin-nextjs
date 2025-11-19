'use client'

import { useState, useEffect } from 'react'
import {
  X, ChevronRight, ChevronLeft, Check, Clock, Palette, Phone,
  Building, MapPin, Globe, Facebook, Instagram, Layout,
  FileText, User, Search, CreditCard, Shield, Star, BookOpen
} from 'lucide-react'

type WizardStep =
  | 'general'
  | 'company'
  | 'location'
  | 'contact'
  | 'hours'
  | 'social'
  | 'appearance'
  | 'template'
  | 'content'
  | 'founder'
  | 'testimonials'
  | 'seo'
  | 'google'
  | 'finances'
  | 'legal'
  | 'complete'

interface SiteConfig {
  // Général
  siteName: string
  siteTagline?: string
  siteDescription?: string

  // Contact
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string

  // Entreprise
  legalName?: string
  siret?: string
  siren?: string
  tvaNumber?: string
  apeCode?: string
  rcs?: string
  capital?: string
  legalForm?: string
  insuranceCompany?: string
  insuranceContract?: string
  insuranceAddress?: string
  legalRepName?: string
  legalRepTitle?: string

  // Réseaux sociaux
  facebook?: string
  instagram?: string
  tiktok?: string
  whatsapp?: string
  linkedin?: string
  youtube?: string

  // Apparence
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  headingFont?: string
  baseFontSize?: string
  headingSize?: string
  logoUrl?: string
  faviconUrl?: string

  // Template
  websiteTemplateId?: string

  // Horaires
  businessHours?: string

  // Contenu
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  aboutText?: string

  // À propos
  founderName?: string
  founderTitle?: string
  founderQuote?: string
  founderImage?: string
  aboutIntro?: string
  aboutParcours?: string
  testimonials?: string
  formations?: string

  // Localisation
  latitude?: string
  longitude?: string
  googleMapsUrl?: string

  // SEO
  baseUrl?: string
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  defaultMetaKeywords?: string
  googleAnalyticsId?: string
  facebookPixelId?: string
  metaVerificationCode?: string
  googleVerificationCode?: string

  // Google Business
  googlePlaceId?: string
  autoSyncGoogleReviews?: boolean

  // Finances
  bankName?: string
  bankIban?: string
  bankBic?: string

  // Légal
  termsAndConditions?: string
  privacyPolicy?: string
  legalNotice?: string
}

export default function QuickSetupWizard() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<WizardStep>('general')
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<SiteConfig>({
    siteName: '',
    siteTagline: '',
    siteDescription: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    legalName: '',
    siret: '',
    siren: '',
    tvaNumber: '',
    apeCode: '',
    rcs: '',
    capital: '',
    legalForm: '',
    insuranceCompany: '',
    insuranceContract: '',
    insuranceAddress: '',
    legalRepName: '',
    legalRepTitle: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    linkedin: '',
    youtube: '',
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    accentColor: '#20b2aa',
    fontFamily: 'Inter',
    headingFont: 'Playfair Display',
    baseFontSize: '16px',
    headingSize: '2.5rem',
    logoUrl: '',
    faviconUrl: '',
    websiteTemplateId: '',
    businessHours: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    aboutText: '',
    founderName: '',
    founderTitle: '',
    founderQuote: '',
    founderImage: '',
    aboutIntro: '',
    aboutParcours: '',
    testimonials: '',
    formations: '',
    latitude: '',
    longitude: '',
    googleMapsUrl: '',
    baseUrl: '',
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultMetaKeywords: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    metaVerificationCode: '',
    googleVerificationCode: '',
    googlePlaceId: '',
    autoSyncGoogleReviews: false,
    bankName: '',
    bankIban: '',
    bankBic: '',
    termsAndConditions: '',
    privacyPolicy: '',
    legalNotice: ''
  })

  useEffect(() => {
    const wizardCompleted = localStorage.getItem('laia-quick-setup-completed')
    const welcomeSeen = localStorage.getItem('laia-welcome-seen')
    const tourCompleted = localStorage.getItem('laia-guided-tour-completed')

    if (welcomeSeen === 'true' && tourCompleted === 'true' && !wizardCompleted) {
      setTimeout(() => setIsOpen(true), 2000)
    }
  }, [])

  const steps = [
    { id: 'general', title: 'Général', icon: Globe },
    { id: 'company', title: 'Entreprise', icon: Building },
    { id: 'location', title: 'Localisation', icon: MapPin },
    { id: 'contact', title: 'Contact', icon: Phone },
    { id: 'hours', title: 'Horaires', icon: Clock },
    { id: 'social', title: 'Réseaux', icon: Facebook },
    { id: 'appearance', title: 'Apparence', icon: Palette },
    { id: 'template', title: 'Template', icon: Layout },
    { id: 'content', title: 'Contenu', icon: FileText },
    { id: 'founder', title: 'Fondateur', icon: User },
    { id: 'testimonials', title: 'Témoignages', icon: Star },
    { id: 'seo', title: 'SEO', icon: Search },
    { id: 'google', title: 'Google', icon: Star },
    { id: 'finances', title: 'Finances', icon: CreditCard },
    { id: 'legal', title: 'Légal', icon: Shield },
    { id: 'complete', title: 'Terminé', icon: Check }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const stepOrder: WizardStep[] = [
      'general', 'company', 'location', 'contact', 'hours', 'social',
      'appearance', 'template', 'content', 'founder', 'testimonials',
      'seo', 'google', 'finances', 'legal', 'complete'
    ]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 2) {
      setCurrentStep(stepOrder[currentIndex + 1])
    } else if (currentIndex === stepOrder.length - 2) {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    const stepOrder: WizardStep[] = [
      'general', 'company', 'location', 'contact', 'hours', 'social',
      'appearance', 'template', 'content', 'founder', 'testimonials',
      'seo', 'google', 'finances', 'legal', 'complete'
    ]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleSkip = () => {
    localStorage.setItem('laia-quick-setup-completed', 'true')
    setIsOpen(false)
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Sauvegarder en base de données via l'API
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        localStorage.setItem('laia-quick-setup-data', JSON.stringify(data))
        localStorage.setItem('laia-quick-setup-completed', 'true')
        setCurrentStep('complete')
      } else {
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="h-2 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration complète du site</h2>
            <p className="text-sm text-gray-600 mt-1">
              Étape {currentStepIndex + 1} sur {steps.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Passer"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          {/* GENERAL */}
          {currentStep === 'general' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations générales</h3>
                <p className="text-gray-600">Les informations de base de votre site</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du site *</label>
                  <input
                    type="text"
                    value={data.siteName}
                    onChange={(e) => setData(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Ex: LAIA SKIN INSTITUT"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                  <input
                    type="text"
                    value={data.siteTagline || ''}
                    onChange={(e) => setData(prev => ({ ...prev, siteTagline: e.target.value }))}
                    placeholder="Ex: Institut de Beauté & Bien-être"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description du site</label>
                  <textarea
                    value={data.siteDescription || ''}
                    onChange={(e) => setData(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={4}
                    placeholder="Décrivez votre institut en quelques phrases..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMPANY */}
          {currentStep === 'company' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations légales de l'entreprise</h3>
                <p className="text-gray-600">Données officielles pour factures et documents</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Raison sociale *</label>
                    <input
                      type="text"
                      value={data.legalName || ''}
                      onChange={(e) => setData(prev => ({ ...prev, legalName: e.target.value }))}
                      placeholder="LAIA SKIN SARL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forme juridique</label>
                    <select
                      value={data.legalForm || ''}
                      onChange={(e) => setData(prev => ({ ...prev, legalForm: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="SARL">SARL</option>
                      <option value="EURL">EURL</option>
                      <option value="SAS">SAS</option>
                      <option value="SASU">SASU</option>
                      <option value="EI">Entreprise Individuelle</option>
                      <option value="MICRO">Micro-entreprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SIRET (14 chiffres)</label>
                    <input
                      type="text"
                      value={data.siret || ''}
                      onChange={(e) => setData(prev => ({ ...prev, siret: e.target.value }))}
                      placeholder="123 456 789 00012"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SIREN (9 chiffres)</label>
                    <input
                      type="text"
                      value={data.siren || ''}
                      onChange={(e) => setData(prev => ({ ...prev, siren: e.target.value }))}
                      placeholder="123 456 789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">N° TVA intracommunautaire</label>
                    <input
                      type="text"
                      value={data.tvaNumber || ''}
                      onChange={(e) => setData(prev => ({ ...prev, tvaNumber: e.target.value }))}
                      placeholder="FR 12 123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code APE/NAF</label>
                    <input
                      type="text"
                      value={data.apeCode || ''}
                      onChange={(e) => setData(prev => ({ ...prev, apeCode: e.target.value }))}
                      placeholder="9602B"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">RCS</label>
                    <input
                      type="text"
                      value={data.rcs || ''}
                      onChange={(e) => setData(prev => ({ ...prev, rcs: e.target.value }))}
                      placeholder="Paris 123 456 789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capital social</label>
                    <input
                      type="text"
                      value={data.capital || ''}
                      onChange={(e) => setData(prev => ({ ...prev, capital: e.target.value }))}
                      placeholder="10 000 €"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Représentant légal</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                      <input
                        type="text"
                        value={data.legalRepName || ''}
                        onChange={(e) => setData(prev => ({ ...prev, legalRepName: e.target.value }))}
                        placeholder="Laïa Martin"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                      <input
                        type="text"
                        value={data.legalRepTitle || ''}
                        onChange={(e) => setData(prev => ({ ...prev, legalRepTitle: e.target.value }))}
                        placeholder="Gérante"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Assurance professionnelle</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compagnie</label>
                      <input
                        type="text"
                        value={data.insuranceCompany || ''}
                        onChange={(e) => setData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                        placeholder="AXA France"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">N° contrat</label>
                      <input
                        type="text"
                        value={data.insuranceContract || ''}
                        onChange={(e) => setData(prev => ({ ...prev, insuranceContract: e.target.value }))}
                        placeholder="1234567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse assurance</label>
                      <input
                        type="text"
                        value={data.insuranceAddress || ''}
                        onChange={(e) => setData(prev => ({ ...prev, insuranceAddress: e.target.value }))}
                        placeholder="10 rue de la Paix, 75001 Paris"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOCATION */}
          {currentStep === 'location' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Localisation</h3>
                <p className="text-gray-600">Adresse et coordonnées géographiques</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                  <input
                    type="text"
                    value={data.address || ''}
                    onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Rue de la Beauté"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                    <input
                      type="text"
                      value={data.city || ''}
                      onChange={(e) => setData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Paris"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code postal *</label>
                    <input
                      type="text"
                      value={data.postalCode || ''}
                      onChange={(e) => setData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="75001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
                    <input
                      type="text"
                      value={data.country || ''}
                      onChange={(e) => setData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="France"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Coordonnées GPS (optionnel)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                      <input
                        type="text"
                        value={data.latitude || ''}
                        onChange={(e) => setData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="48.8566"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                      <input
                        type="text"
                        value={data.longitude || ''}
                        onChange={(e) => setData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="2.3522"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Google Maps</label>
                  <input
                    type="url"
                    value={data.googleMapsUrl || ''}
                    onChange={(e) => setData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    placeholder="https://maps.google.com/?q=votre+adresse"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONTACT */}
          {currentStep === 'contact' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations de contact</h3>
                <p className="text-gray-600">Comment vos clients peuvent vous joindre</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+33 6 XX XX XX XX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp (optionnel)</label>
                  <input
                    type="tel"
                    value={data.whatsapp || ''}
                    onChange={(e) => setData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+33612345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HOURS */}
          {currentStep === 'hours' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Horaires d'ouverture</h3>
                <p className="text-gray-600">Vos disponibilités pour les réservations</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horaires (Format JSON)</label>
                  <p className="text-xs text-gray-500 mb-2">Exemple: {`{"lundi": "9h-18h", "mardi": "9h-18h", ...}`}</p>
                  <textarea
                    value={data.businessHours || ''}
                    onChange={(e) => setData(prev => ({ ...prev, businessHours: e.target.value }))}
                    rows={10}
                    placeholder={`{\n  "lundi": "9h-18h",\n  "mardi": "9h-18h",\n  "mercredi": "9h-18h",\n  "jeudi": "9h-18h",\n  "vendredi": "9h-18h",\n  "samedi": "10h-17h",\n  "dimanche": "Fermé"\n}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {currentStep === 'social' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-3">
                  <Instagram className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Réseaux sociaux</h3>
                <p className="text-gray-600">Vos profils sur les réseaux sociaux</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook (URL complète)</label>
                  <input
                    type="url"
                    value={data.facebook || ''}
                    onChange={(e) => setData(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/votre-page"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram (URL complète)</label>
                  <input
                    type="url"
                    value={data.instagram || ''}
                    onChange={(e) => setData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/votre-compte"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok (URL complète)</label>
                  <input
                    type="url"
                    value={data.tiktok || ''}
                    onChange={(e) => setData(prev => ({ ...prev, tiktok: e.target.value }))}
                    placeholder="https://tiktok.com/@votre-compte"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn (URL complète)</label>
                  <input
                    type="url"
                    value={data.linkedin || ''}
                    onChange={(e) => setData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/votre-profil"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube (URL complète)</label>
                  <input
                    type="url"
                    value={data.youtube || ''}
                    onChange={(e) => setData(prev => ({ ...prev, youtube: e.target.value }))}
                    placeholder="https://youtube.com/@votre-chaine"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {currentStep === 'appearance' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-3">
                  <Palette className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Apparence et couleurs</h3>
                <p className="text-gray-600">Personnalisez le design de votre site</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={data.primaryColor || '#d4b5a0'}
                        onChange={(e) => setData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-12 w-16 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={data.primaryColor || '#d4b5a0'}
                        onChange={(e) => setData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur secondaire</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={data.secondaryColor || '#2c3e50'}
                        onChange={(e) => setData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="h-12 w-16 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={data.secondaryColor || '#2c3e50'}
                        onChange={(e) => setData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur d'accent</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={data.accentColor || '#20b2aa'}
                        onChange={(e) => setData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="h-12 w-16 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={data.accentColor || '#20b2aa'}
                        onChange={(e) => setData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo (URL)</label>
                  <input
                    type="url"
                    value={data.logoUrl || ''}
                    onChange={(e) => setData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://exemple.com/logo.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favicon (URL)</label>
                  <input
                    type="url"
                    value={data.faviconUrl || ''}
                    onChange={(e) => setData(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://exemple.com/favicon.ico"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Police principale</label>
                    <select
                      value={data.fontFamily || 'Inter'}
                      onChange={(e) => setData(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Police des titres</label>
                    <select
                      value={data.headingFont || 'Playfair Display'}
                      onChange={(e) => setData(prev => ({ ...prev, headingFont: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE */}
          {currentStep === 'template' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                  <Layout className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Choix du template</h3>
                <p className="text-gray-600">Sélectionnez le design de votre site</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID du template</label>
                  <input
                    type="text"
                    value={data.websiteTemplateId || ''}
                    onChange={(e) => setData(prev => ({ ...prev, websiteTemplateId: e.target.value }))}
                    placeholder="modern-spa, classic-beauty, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Consultez l'onglet Template dans Configuration pour voir les templates disponibles</p>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {currentStep === 'content' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                  <FileText className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contenu de la page d'accueil</h3>
                <p className="text-gray-600">Textes et images de votre site</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal (Hero)</label>
                  <input
                    type="text"
                    value={data.heroTitle || ''}
                    onChange={(e) => setData(prev => ({ ...prev, heroTitle: e.target.value }))}
                    placeholder="Bienvenue chez LAIA SKIN INSTITUT"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre (Hero)</label>
                  <input
                    type="text"
                    value={data.heroSubtitle || ''}
                    onChange={(e) => setData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Votre beauté naturelle sublimée"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Hero (URL)</label>
                  <input
                    type="url"
                    value={data.heroImage || ''}
                    onChange={(e) => setData(prev => ({ ...prev, heroImage: e.target.value }))}
                    placeholder="https://exemple.com/hero.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texte "À propos"</label>
                  <textarea
                    value={data.aboutText || ''}
                    onChange={(e) => setData(prev => ({ ...prev, aboutText: e.target.value }))}
                    rows={6}
                    placeholder="Présentez votre institut..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FOUNDER */}
          {currentStep === 'founder' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-3">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fondateur / Fondatrice</h3>
                <p className="text-gray-600">Présentez le créateur de l'institut</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={data.founderName || ''}
                      onChange={(e) => setData(prev => ({ ...prev, founderName: e.target.value }))}
                      placeholder="Laïa Martin"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre / Fonction</label>
                    <input
                      type="text"
                      value={data.founderTitle || ''}
                      onChange={(e) => setData(prev => ({ ...prev, founderTitle: e.target.value }))}
                      placeholder="Fondatrice et Esthéticienne"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo du fondateur (URL)</label>
                  <input
                    type="url"
                    value={data.founderImage || ''}
                    onChange={(e) => setData(prev => ({ ...prev, founderImage: e.target.value }))}
                    placeholder="https://exemple.com/photo-fondateur.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Citation / Message</label>
                  <textarea
                    value={data.founderQuote || ''}
                    onChange={(e) => setData(prev => ({ ...prev, founderQuote: e.target.value }))}
                    rows={3}
                    placeholder="Ma passion est de révéler la beauté naturelle de chaque femme..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                  <textarea
                    value={data.aboutIntro || ''}
                    onChange={(e) => setData(prev => ({ ...prev, aboutIntro: e.target.value }))}
                    rows={4}
                    placeholder="Présentation générale de votre institut..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parcours / Histoire</label>
                  <textarea
                    value={data.aboutParcours || ''}
                    onChange={(e) => setData(prev => ({ ...prev, aboutParcours: e.target.value }))}
                    rows={6}
                    placeholder="Racontez votre parcours, votre histoire..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TESTIMONIALS */}
          {currentStep === 'testimonials' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-3">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Témoignages & Formations</h3>
                <p className="text-gray-600">Avis clients et certifications</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Témoignages (Format JSON)</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Format: <code className="bg-gray-100 px-1 rounded">{`[{"name":"Nom","initials":"ND","text":"Témoignage...","rating":5}]`}</code>
                  </p>
                  <textarea
                    value={data.testimonials || ''}
                    onChange={(e) => setData(prev => ({ ...prev, testimonials: e.target.value }))}
                    rows={8}
                    placeholder='[{"name": "Sophie D.", "initials": "SD", "text": "Après 3 séances, ma peau est transformée !", "rating": 5}]'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formations & Certifications (Format JSON)</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Exemple: {`[{"title":"CAP Esthétique","year":"2018","school":"École de beauté"}]`}
                  </p>
                  <textarea
                    value={data.formations || ''}
                    onChange={(e) => setData(prev => ({ ...prev, formations: e.target.value }))}
                    rows={6}
                    placeholder='[{"title": "CAP Esthétique", "year": "2018", "school": "École de beauté"}]'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          {currentStep === 'seo' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">SEO & Tracking</h3>
                <p className="text-gray-600">Référencement et analytics</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de base du site</label>
                  <input
                    type="url"
                    value={data.baseUrl || ''}
                    onChange={(e) => setData(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://www.laia-skin.fr"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre SEO par défaut</label>
                  <input
                    type="text"
                    value={data.defaultMetaTitle || ''}
                    onChange={(e) => setData(prev => ({ ...prev, defaultMetaTitle: e.target.value }))}
                    placeholder="LAIA SKIN INSTITUT - Institut de beauté à Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description SEO par défaut</label>
                  <textarea
                    value={data.defaultMetaDescription || ''}
                    onChange={(e) => setData(prev => ({ ...prev, defaultMetaDescription: e.target.value }))}
                    rows={3}
                    placeholder="Découvrez notre institut de beauté spécialisé en soins du visage, épilation..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mots-clés SEO (séparés par virgules)</label>
                  <input
                    type="text"
                    value={data.defaultMetaKeywords || ''}
                    onChange={(e) => setData(prev => ({ ...prev, defaultMetaKeywords: e.target.value }))}
                    placeholder="institut beauté, soins visage, épilation, paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                    <input
                      type="text"
                      value={data.googleAnalyticsId || ''}
                      onChange={(e) => setData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={data.facebookPixelId || ''}
                      onChange={(e) => setData(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                      placeholder="123456789012345"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Verification Code</label>
                    <input
                      type="text"
                      value={data.googleVerificationCode || ''}
                      onChange={(e) => setData(prev => ({ ...prev, googleVerificationCode: e.target.value }))}
                      placeholder="code de vérification"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Verification Code</label>
                    <input
                      type="text"
                      value={data.metaVerificationCode || ''}
                      onChange={(e) => setData(prev => ({ ...prev, metaVerificationCode: e.target.value }))}
                      placeholder="code de vérification"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GOOGLE */}
          {currentStep === 'google' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Google My Business</h3>
                <p className="text-gray-600">Synchronisation des avis Google</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Place ID</label>
                  <input
                    type="text"
                    value={data.googlePlaceId || ''}
                    onChange={(e) => setData(prev => ({ ...prev, googlePlaceId: e.target.value }))}
                    placeholder="ChIJxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={data.autoSyncGoogleReviews || false}
                    onChange={(e) => setData(prev => ({ ...prev, autoSyncGoogleReviews: e.target.checked }))}
                    className="mt-1"
                    id="autoSync"
                  />
                  <div className="flex-1">
                    <label htmlFor="autoSync" className="text-sm font-medium text-blue-900 cursor-pointer">
                      Activer la synchronisation automatique quotidienne
                    </label>
                    <p className="text-xs text-blue-700 mt-1">
                      Les avis Google seront synchronisés automatiquement chaque jour
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINANCES */}
          {currentStep === 'finances' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations bancaires</h3>
                <p className="text-gray-600">Coordonnées pour virements et factures</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la banque</label>
                  <input
                    type="text"
                    value={data.bankName || ''}
                    onChange={(e) => setData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="BNP Paribas"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                  <input
                    type="text"
                    value={data.bankIban || ''}
                    onChange={(e) => setData(prev => ({ ...prev, bankIban: e.target.value }))}
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BIC / SWIFT</label>
                  <input
                    type="text"
                    value={data.bankBic || ''}
                    onChange={(e) => setData(prev => ({ ...prev, bankBic: e.target.value }))}
                    placeholder="BNPAFRPPXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Sécurité :</strong> Ces données seront utilisées sur vos factures. Ne les partagez jamais publiquement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LEGAL */}
          {currentStep === 'legal' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                  <Shield className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mentions légales et CGV</h3>
                <p className="text-gray-600">Documents légaux obligatoires</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conditions Générales de Vente (CGV)</label>
                  <textarea
                    value={data.termsAndConditions || ''}
                    onChange={(e) => setData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    rows={8}
                    placeholder="Article 1 - Objet&#10;&#10;Les présentes conditions générales de vente..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Politique de confidentialité</label>
                  <textarea
                    value={data.privacyPolicy || ''}
                    onChange={(e) => setData(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                    rows={6}
                    placeholder="Votre politique de confidentialité..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mentions légales</label>
                  <textarea
                    value={data.legalNotice || ''}
                    onChange={(e) => setData(prev => ({ ...prev, legalNotice: e.target.value }))}
                    rows={6}
                    placeholder="Vos mentions légales..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMPLETE */}
          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                🎉 Configuration complète !
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Toutes les informations ont été sauvegardées avec succès.
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">✅ Votre site est maintenant configuré</h4>
                <p className="text-sm text-gray-700">
                  Toutes les données ont été enregistrées et s'appliquent immédiatement sur votre site vitrine.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Commencer à utiliser LAIA 🚀
              </button>
            </div>
          )}
        </div>

        {currentStep !== 'complete' && (
          <div className="sticky bottom-0 bg-gray-50 px-8 py-4 border-t flex items-center justify-between z-10">
            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Passer cette étape
            </button>
            <div className="flex items-center gap-3">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  'Enregistrement...'
                ) : currentStepIndex === steps.length - 2 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Terminer la configuration
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
