'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateSIRET, validateSIRENorSIRET, validateEmail, validatePhoneNumber, formatSIRET } from '@/lib/validation'
import { getPlanPrice, getPlanName } from '@/lib/features-simple'
import { websiteTemplates, getTemplatesForPlan } from '@/lib/website-templates'
import TemplateClassic from '@/components/templates/TemplateClassic'
import TemplateModern from '@/components/templates/TemplateModern'
import TemplateMinimal from '@/components/templates/TemplateMinimal'
import TemplateProfessional from '@/components/templates/TemplateProfessional'
import TemplateBoutique from '@/components/templates/TemplateBoutique'
import TemplateFresh from '@/components/templates/TemplateFresh'
import TemplateLuxe from '@/components/templates/TemplateLuxe'
import TemplateElegance from '@/components/templates/TemplateElegance'
import TemplateZen from '@/components/templates/TemplateZen'
import TemplateMedical from '@/components/templates/TemplateMedical'
import TemplateSpaLuxe from '@/components/templates/TemplateSpaLuxe'
import TemplateLaserTech from '@/components/templates/TemplateLaserTech'

// Étapes du tunnel (paiement géré par Stripe Checkout)
type Step = 'questionnaire' | 'welcome' | 'personal-info' | 'business-info' | 'website-template' | 'billing' | 'complete'

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
  email: string
  phone: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  ctaPrimary: string
  ctaSecondary: string
  servicesTitle: string
  servicesDescription: string
  ctaFinalTitle: string
  ctaFinalDescription: string
  aboutText: string
  founderName: string
  founderTitle: string
  founderQuote: string
  facebook?: string
  instagram?: string
  whatsapp?: string
  businessHoursText: string

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

  // Plan choisi
  selectedPlan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
}

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan') as OnboardingData['selectedPlan'] || 'SOLO'
  const skipQuestionnaire = searchParams.get('skip') === 'true'
  const shouldReset = searchParams.get('reset') === 'true'
  const stepFromUrl = searchParams.get('step') as Step | null

  // ✅ Détecter le montage côté client pour éviter l'hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    // Si un step est fourni dans l'URL, l'utiliser
    if (stepFromUrl) {
      return stepFromUrl
    }
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
  const [isMounted, setIsMounted] = useState(false)

  // ✅ Initialiser data avec localStorage ou valeur par défaut
  const [data, setData] = useState<OnboardingData>(() => {
    // Si on accède directement à l'étape complete, remplir avec des données de test
    if (stepFromUrl === 'complete') {
      return {
        ownerFirstName: 'Célia',
        ownerLastName: 'Test',
        ownerEmail: 'contact@laiaconnect.fr',
        ownerPhone: '0612345678',
        institutName: 'Institut Test',
        slug: 'institut-test',
        subdomain: 'institut-test',
        customDomain: '',
        useCustomDomain: false,
        city: 'Paris',
        address: '123 Rue de la Beauté',
        postalCode: '75001',
        primaryColor: '#d4b5a0',
        secondaryColor: '#2c3e50',
        serviceName: 'Soin du visage complet',
        servicePrice: 89,
        serviceDuration: 60,
        serviceDescription: 'Soin visage complet avec nettoyage et massage',
        websiteTemplateId: 'modern',
        siteTagline: 'Institut de Beauté & Bien-être',
        email: 'contact@laiaconnect.fr',
        phone: '0612345678',
        heroTitle: 'Une peau respectée,',
        heroSubtitle: 'une beauté révélée',
        heroDescription: 'Découvrez l\'art du bien-être dans un écrin de raffinement',
        ctaPrimary: 'Réserver',
        ctaSecondary: 'Nous contacter',
        servicesTitle: 'Nos Soins',
        servicesDescription: 'Des prestations sur mesure pour sublimer votre beauté',
        ctaFinalTitle: 'Prendre Rendez-vous',
        ctaFinalDescription: 'Réservez dès maintenant votre moment de détente',
        aboutText: 'Notre institut vous offre une expérience unique de bien-être et de beauté.',
        founderName: 'Célia',
        founderTitle: 'Fondatrice & Experte en soins esthétiques',
        founderQuote: 'La beauté commence par prendre soin de soi',
        facebook: '',
        instagram: '',
        whatsapp: '',
        businessHoursText: 'Lun-Sam 9h-19h',
        businessHours: {
          lundi: { isOpen: true, start: '09:00', end: '18:00' },
          mardi: { isOpen: true, start: '09:00', end: '18:00' },
          mercredi: { isOpen: true, start: '09:00', end: '18:00' },
          jeudi: { isOpen: true, start: '09:00', end: '18:00' },
          vendredi: { isOpen: true, start: '09:00', end: '18:00' },
          samedi: { isOpen: false, start: '09:00', end: '18:00' },
          dimanche: { isOpen: false, start: '09:00', end: '18:00' }
        },
        legalName: 'Institut Test SARL',
        siret: '12345678901234',
        tvaNumber: 'FR12345678901',
        billingEmail: 'contact@laiaconnect.fr',
        billingAddress: '123 Rue de la Beauté',
        billingPostalCode: '75001',
        billingCity: 'Paris',
        billingCountry: 'France',
        selectedPlan: planFromUrl
      }
    }

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
    email: '',
    phone: '',
    heroTitle: 'Institut de Beauté',
    heroSubtitle: '',
    heroDescription: 'L\'art du bien-être',
    ctaPrimary: 'Réserver',
    ctaSecondary: 'Contact',
    servicesTitle: 'Nos Soins',
    servicesDescription: 'Prestations sur mesure',
    ctaFinalTitle: 'Prendre Rendez-vous',
    ctaFinalDescription: 'Réservez votre consultation',
    aboutText: '',
    founderName: '',
    founderTitle: 'Fondatrice & Experte en soins esthétiques',
    founderQuote: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    businessHoursText: 'Lun-Sam 9h-19h',
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
  const simplifiedFlow: Step[] = ['personal-info', 'business-info', 'billing', 'complete']
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

  // ✅ Fonction helper pour vérifier si le formulaire billing est valide
  const isBillingFormValid = (): boolean => {
    if (!data.legalName || !data.siret || !data.billingEmail ||
        !data.billingAddress || !data.billingCity || !data.billingPostalCode) {
      return false
    }

    // Vérifier la longueur et validité du SIREN ou SIRET
    if (data.siret.length !== 9 && data.siret.length !== 14) return false
    if (!validateSIRENorSIRET(data.siret)) return false

    // Vérifier qu'il n'y a pas d'erreurs de validation
    if (validationErrors.siret) {
      return false
    }

    return true
  }

  // ✅ Fonction pour obtenir les champs manquants de business-info
  const getMissingBusinessInfoFields = (): string[] => {
    const missing: string[] = []

    if (!data.institutName) missing.push('Nom commercial de votre institut')
    if (!data.legalName) missing.push('Raison sociale')
    if (!data.siret) {
      missing.push('SIREN ou SIRET')
    } else if (data.siret.length !== 9 && data.siret.length !== 14) {
      missing.push('SIREN ou SIRET valide (9 ou 14 chiffres)')
    }
    if (!data.address) missing.push('Adresse')
    if (!data.city) missing.push('Ville')
    if (!data.postalCode) missing.push('Code postal')

    return missing
  }

  // ✅ Fonction pour obtenir les champs manquants de billing
  const getMissingBillingFields = (): string[] => {
    const missing: string[] = []

    if (!data.legalName) missing.push('Raison sociale')
    if (!data.siret) {
      missing.push('SIREN ou SIRET')
    } else if (data.siret.length !== 9 && data.siret.length !== 14) {
      missing.push('SIREN ou SIRET valide (9 ou 14 chiffres)')
    }
    if (!data.billingEmail) missing.push('Email de facturation')
    if (!data.billingAddress) missing.push('Adresse de facturation')
    if (!data.billingCity) missing.push('Ville')
    if (!data.billingPostalCode) missing.push('Code postal')

    return missing
  }

  const handleNext = () => {
    // ✅ Valider les champs obligatoires avant de continuer
    if (currentStep === 'business-info') {
      if (!data.institutName || !data.address || !data.city) {
        alert('❌ Veuillez remplir tous les champs obligatoires (nom commercial, adresse, ville)')
        return
      }
    }

    if (currentStep === 'billing') {
      // Vérifier les erreurs de validation
      if (validationErrors.siret) {
        alert('❌ Veuillez corriger les erreurs de validation avant de continuer')
        return
      }

      // Vérifier les champs obligatoires
      if (!data.legalName || !data.siret || !data.billingAddress || !data.billingCity) {
        alert('❌ Veuillez remplir tous les champs obligatoires (raison sociale, SIREN ou SIRET, adresse de facturation, ville)')
        return
      }

      // Vérifier que le SIREN ou SIRET est valide
      if ((data.siret.length !== 9 && data.siret.length !== 14) || !validateSIRENorSIRET(data.siret)) {
        alert('❌ Le numéro SIREN ou SIRET est invalide. Il doit contenir exactement 9 chiffres (SIREN) ou 14 chiffres (SIRET) valides.')
        return
      }

      // Après validation billing, rediriger directement vers Stripe (pas d'étape payment)
      handleComplete()
      return
    }

    // Parcours simplifié si skip=true : personal-info → business-info → billing → complete
    const simplifiedFlow: Step[] = ['personal-info', 'business-info', 'billing', 'complete']
    const fullFlow: Step[] = steps.map(s => s.id)

    const flow = skipQuestionnaire ? simplifiedFlow : fullFlow
    const stepIndex = flow.findIndex(s => s === currentStep)

    if (stepIndex < flow.length - 1) {
      setCurrentStep(flow[stepIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    // Parcours simplifié si skip=true (sans étape payment)
    const simplifiedFlow: Step[] = ['personal-info', 'business-info', 'billing', 'complete']
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
      // Créer l'organisation avec toutes les données (incluant migration)
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          needsDataMigration: questionnaireAnswers.needsDataMigration,
          currentSoftware: questionnaireAnswers.currentSoftware
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }

      const result = await response.json()

      // Rediriger vers Stripe Checkout pour le paiement
      if (result.url) {
        window.location.href = result.url
      } else {
        throw new Error('URL de paiement manquante')
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
            {isMounted && (
              <div className="text-sm text-gray-600">
                Étape {currentStepIndex + 1} sur {steps.length}
              </div>
            )}
          </div>

          {/* Barre de progression */}
          {isMounted && (
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {!isMounted ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : (
          <>
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

            {/* Message d'aide pour les champs manquants (business-info) */}
            {getMissingBusinessInfoFields().length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-2">
                      Pour continuer, veuillez compléter :
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                      {getMissingBusinessInfoFields().map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                  Numéro SIREN ou SIRET * (obligatoire)
                </label>
                <input
                  type="text"
                  value={data.siret}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '')
                    setData({ ...data, siret: value })
                    // Valider en temps réel
                    if (value.length === 9 || value.length === 14) {
                      const newErrors = { ...validationErrors }
                      delete newErrors.siret
                      setValidationErrors(newErrors)
                    } else if (value.length > 0) {
                      setValidationErrors({ ...validationErrors, siret: 'Le SIREN doit contenir 9 chiffres ou le SIRET 14 chiffres' })
                    } else {
                      const newErrors = { ...validationErrors }
                      delete newErrors.siret
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="123456789 (SIREN) ou 12345678900012 (SIRET)"
                  maxLength={14}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.siret ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.siret ? (
                  <p className="text-xs text-red-600 mt-1">❌ {validationErrors.siret}</p>
                ) : (data.siret.length === 9 || data.siret.length === 14) && validateSIRENorSIRET(data.siret) ? (
                  <p className="text-xs text-green-600 mt-1">✅ {data.siret.length === 9 ? 'SIREN' : 'SIRET'} valide</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    9 chiffres (SIREN) ou 14 chiffres (SIRET) - Nécessaire pour la facturation légale
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
                disabled={!data.institutName || !data.address || !data.city}
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

            {/* Personnalisation des textes */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Personnalisez vos textes</h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Hero - Titre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Titre principal
                  </label>
                  <input
                    type="text"
                    value={data.heroTitle}
                    onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
                    placeholder="Institut de Beauté"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Hero - Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={data.heroDescription}
                    onChange={(e) => setData({ ...data, heroDescription: e.target.value })}
                    placeholder="L'art du bien-être"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Bouton principal */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bouton principal
                  </label>
                  <input
                    type="text"
                    value={data.ctaPrimary}
                    onChange={(e) => setData({ ...data, ctaPrimary: e.target.value })}
                    placeholder="Réserver"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Bouton secondaire */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bouton secondaire
                  </label>
                  <input
                    type="text"
                    value={data.ctaSecondary}
                    onChange={(e) => setData({ ...data, ctaSecondary: e.target.value })}
                    placeholder="Contact"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Titre section services */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Titre section services
                  </label>
                  <input
                    type="text"
                    value={data.servicesTitle}
                    onChange={(e) => setData({ ...data, servicesTitle: e.target.value })}
                    placeholder="Nos Soins"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Description section services */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description services
                  </label>
                  <input
                    type="text"
                    value={data.servicesDescription}
                    onChange={(e) => setData({ ...data, servicesDescription: e.target.value })}
                    placeholder="Prestations sur mesure"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Horaires */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horaires
                  </label>
                  <input
                    type="text"
                    value={data.businessHoursText}
                    onChange={(e) => setData({ ...data, businessHoursText: e.target.value })}
                    placeholder="Lun-Sam 9h-19h"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Téléphone (déjà existant mais on l'ajoute ici pour cohérence) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="01 23 45 67 89"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Templates Classiques */}
            {/* Templates disponibles selon le plan choisi */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <h3 className="text-lg font-semibold text-gray-700 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  ✨ Templates disponibles - Plan {data.selectedPlan}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {getTemplatesForPlan(data.selectedPlan)
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
                    <div className="h-80 relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
                      {/* Mockup de la structure du template */}
                      <div className="w-full h-full bg-white rounded-md shadow-sm p-4 space-y-3">
                        {/* Header / Navigation */}
                        <div className={`h-8 rounded flex items-center gap-2 px-3 ${
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
                          <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                        </div>

                        {/* Hero Section */}
                        <div className={`h-32 rounded flex items-center justify-center ${
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
                          <div className="space-y-2 w-full px-4">
                            <div className="h-3 bg-gray-400/40 rounded w-2/3 mx-auto"></div>
                            <div className="h-2 bg-gray-400/30 rounded w-1/2 mx-auto"></div>
                          </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-3 gap-3 h-24">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-100 rounded p-2 space-y-2">
                              <div className="h-10 bg-gray-200 rounded"></div>
                              <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="h-6 bg-gray-200 rounded"></div>
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
            </div>

            {/* Templates Premium - Uniquement pour TEAM et PREMIUM */}
            {/* Templates premium (non accessibles au plan actuel) */}
            {websiteTemplates.filter(t => !getTemplatesForPlan(data.selectedPlan).includes(t)).length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border-2 border-amber-300">
                    👑 Templates Premium (upgrade requis)
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {websiteTemplates
                    .filter(template => !getTemplatesForPlan(data.selectedPlan).includes(template))
                    .map((template) => (
                    <div
                      key={template.id}
                      className={`group relative bg-gradient-to-br from-white via-amber-50/30 to-white rounded-xl border-2 transition-all overflow-hidden ${
                        data.websiteTemplateId === template.id
                          ? 'border-amber-500 shadow-2xl shadow-amber-200/50'
                          : 'border-amber-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-100/50'
                      }`}
                    >
                      {/* Badge plan requis */}
                      <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <span>👑</span>
                        <span>Plan {template.minTier} requis</span>
                      </div>

                      {/* Contenu du template (copier le même contenu que les templates classiques) */}
                      <div className="h-80 relative bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-4 overflow-hidden">
                        <div className="w-full h-full bg-white rounded-md shadow-sm p-4 space-y-3">
                          <div className={`h-8 rounded flex items-center gap-2 px-3 ${
                            template.id.includes('modern') || template.id.includes('fresh')
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100'
                              : template.id.includes('minimal') || template.id.includes('zen')
                              ? 'bg-gray-100'
                              : 'bg-gradient-to-r from-amber-100 to-orange-100'
                          }`}>
                            <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                            <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                            <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                          </div>

                          <div className="h-32 rounded bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <div className="text-sm text-gray-400 font-semibold tracking-wider">{template.name.toUpperCase()}</div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 h-24">
                            <div className="bg-gray-100 rounded p-2 space-y-2">
                              <div className="h-10 bg-gray-200 rounded"></div>
                              <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="bg-gray-100 rounded p-2 space-y-2">
                              <div className="h-10 bg-gray-200 rounded"></div>
                              <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="bg-gray-100 rounded p-2 space-y-2">
                              <div className="h-10 bg-gray-200 rounded"></div>
                              <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>

                          <div className="h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-800 mb-1">{template.name}</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">{template.description}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewTemplate(template.id)}
                            className="flex-1 py-2.5 px-4 border-2 border-amber-200 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-all text-sm"
                          >
                            👁️ Prévisualiser
                          </button>
                          <button
                            onClick={() => setData({ ...data, websiteTemplateId: template.id })}
                            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                              data.websiteTemplateId === template.id
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {data.websiteTemplateId === template.id ? '✓ Choisi' : 'Choisir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
            {/* Barre de contrôle minimale fixée en haut */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/90 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm font-medium">
                  {websiteTemplates.find(t => t.id === previewTemplate)?.name}
                </span>
                {/* Color Pickers compacts */}
                <input
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                  className="w-8 h-8 border border-white/20 rounded cursor-pointer bg-transparent"
                  title="Couleur principale"
                />
                <input
                  type="color"
                  value={data.secondaryColor}
                  onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                  className="w-8 h-8 border border-white/20 rounded cursor-pointer bg-transparent"
                  title="Couleur secondaire"
                />
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-white/70 hover:text-white text-2xl px-3"
              >
                ✕
              </button>
            </div>

            {/* Preview plein écran */}
            <div className="flex-1 overflow-auto bg-white">
                    {(() => {
                      // Services: utilise les données du formulaire ou des exemples par défaut
                      const userServices = data.serviceName ? [
                        {
                          id: '1',
                          name: data.serviceName,
                          price: data.servicePrice || 0,
                          duration: data.serviceDuration || 0,
                          description: data.serviceDescription || ''
                        }
                      ] : [
                        { id: '1', name: 'Soin Visage', price: 85, duration: 60, description: 'Rituel complet adapté' },
                        { id: '2', name: 'Massage Relaxant', price: 70, duration: 50, description: 'Détente profonde' },
                        { id: '3', name: 'Épilation', price: 35, duration: 30, description: 'Précision et douceur' },
                        { id: '4', name: 'Manucure', price: 40, duration: 45, description: 'Soin des mains' },
                        { id: '5', name: 'Pédicure', price: 50, duration: 50, description: 'Beauté des pieds' },
                        { id: '6', name: 'Maquillage', price: 55, duration: 40, description: 'Mise en beauté' }
                      ]

                      // Team: ajoute le fondateur s'il existe
                      const teamMembers = data.founderName ? [{
                        id: '1',
                        name: data.founderName,
                        role: data.founderTitle || 'Fondateur',
                        imageUrl: undefined
                      }] : undefined

                      // Props communes à tous les templates
                      const templateProps = {
                        organization: {
                          name: data.institutName || 'Institut de Beauté',
                          description: data.heroDescription || data.siteTagline || 'L\'art du bien-être',
                          primaryColor: data.primaryColor,
                          secondaryColor: data.secondaryColor
                        },
                        services: userServices,
                        team: teamMembers,
                        content: {
                          hero: {
                            title: data.heroTitle || data.institutName || 'Institut de Beauté',
                            subtitle: data.heroSubtitle || '',
                            description: data.heroDescription || data.siteTagline || 'L\'art du bien-être',
                            ctaPrimary: data.ctaPrimary || 'Réserver',
                            ctaSecondary: data.ctaSecondary || 'Contact'
                          },
                          services: {
                            title: data.servicesTitle || 'Nos Soins',
                            description: data.servicesDescription || 'Prestations sur mesure'
                          },
                          pricing: {
                            title: data.servicesTitle || 'Tarifs',
                            note: data.servicesDescription || 'Protocoles personnalisés'
                          },
                          about: data.aboutText ? {
                            title: 'À Propos',
                            description: data.aboutText
                          } : undefined,
                          founder: data.founderName ? {
                            name: data.founderName,
                            title: data.founderTitle || 'Fondateur',
                            quote: data.founderQuote || ''
                          } : undefined,
                          cta: {
                            title: data.ctaFinalTitle || 'Prendre Rendez-vous',
                            description: data.ctaFinalDescription || 'Réservez votre consultation',
                            button: data.ctaPrimary || 'Réserver'
                          },
                          footer: {
                            tagline: data.siteTagline || '',
                            contact: {
                              phone: data.phone || '01 23 45 67 89',
                              email: data.email || '',
                              address: data.address && data.city ? `${data.address}, ${data.postalCode} ${data.city}` : (data.city || 'Paris')
                            },
                            hours: data.businessHoursText || 'Lun-Sam 9h-19h',
                            social: {
                              facebook: data.facebook || '',
                              instagram: data.instagram || '',
                              whatsapp: data.whatsapp || ''
                            }
                          }
                        }
                      }

                      // Render le bon composant selon le template
                      switch(previewTemplate) {
                        case 'classic': return <TemplateClassic {...templateProps} />
                        case 'modern': return <TemplateModern {...templateProps} />
                        case 'minimal': return <TemplateMinimal {...templateProps} />
                        case 'professional': return <TemplateProfessional {...templateProps} />
                        case 'boutique': return <TemplateBoutique {...templateProps} />
                        case 'fresh': return <TemplateFresh {...templateProps} />
                        case 'luxe': return <TemplateLuxe {...templateProps} />
                        case 'elegance': return <TemplateElegance {...templateProps} />
                        case 'zen': return <TemplateZen {...templateProps} />
                        case 'medical':
                          return <TemplateMedical {...templateProps} content={templateProps.content} />
                        case 'spa-luxe':
                          return <TemplateSpaLuxe {...templateProps} content={templateProps.content} />
                        case 'laser-tech':
                          return <TemplateLaserTech {...templateProps} content={templateProps.content} />
                        default:
                          return <TemplateClassic {...templateProps} />
                      }
                    })()}
            </div>

            {/* Barre d'action fixée en bas */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/90 border-t border-white/10">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-6 py-3 border-2 border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={() => {
                  setData({ ...data, websiteTemplateId: previewTemplate })
                  setPreviewTemplate(null)
                }}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                ✓ Choisir ce template
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
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
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
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
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
                disabled={!data.email || !data.phone || !data.heroTitle || !data.heroSubtitle}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  !data.email || !data.phone || !data.heroTitle || !data.heroSubtitle
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

        {/* Étape 5 - Facturation */}
        {currentStep === 'billing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Informations de facturation
              </h2>
              <p className="text-gray-600">
                Pour la facturation de votre abonnement
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
                    ✅ Paiement automatique le 1er de chaque mois<br />
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

            {/* Message d'aide pour les champs manquants */}
            {!isBillingFormValid() && getMissingBillingFields().length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-2">
                      Pour continuer vers le paiement, veuillez compléter :
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                      {getMissingBillingFields().map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                        N° SIREN ou SIRET *
                      </label>
                      <input
                        type="text"
                        value={data.siret}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setData({ ...data, siret: value })
                          // Valider en temps réel
                          if (value.length === 9 || value.length === 14) {
                            const newErrors = { ...validationErrors }
                            delete newErrors.siret
                            setValidationErrors(newErrors)
                          } else if (value.length > 0) {
                            setValidationErrors({ ...validationErrors, siret: 'Le SIREN doit contenir 9 chiffres ou le SIRET 14 chiffres' })
                          } else {
                            const newErrors = { ...validationErrors }
                            delete newErrors.siret
                            setValidationErrors(newErrors)
                          }
                        }}
                        placeholder="123456789 ou 12345678900012"
                        maxLength={14}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                      />
                      {validationErrors.siret && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.siret}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">9 (SIREN) ou 14 chiffres (SIRET)</p>
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💳 <strong>Paiement sécurisé :</strong> Vous serez redirigé vers Stripe Checkout pour configurer votre moyen de paiement de manière sécurisée.
                  Le premier prélèvement aura lieu dans 30 jours (après votre période d'essai gratuite).
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
                disabled={!isBillingFormValid()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer vers le paiement →
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
          </>
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
