'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, ChevronRight, ChevronLeft, Sparkles, Palette, FileText,
  Settings, MapPin, Clock, Globe, Mail, Phone, Building,
  CreditCard, MessageCircle, Instagram, Search, Shield, Star,
  Package, Users
} from 'lucide-react';
import { websiteTemplates } from '@/lib/website-templates';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';

type Step =
  | 'welcome'
  | 'general'
  | 'template'
  | 'colors'
  | 'contact'
  | 'location'
  | 'hours'
  | 'team'
  | 'content'
  | 'about'
  | 'social'
  | 'seo'
  | 'legal'
  | 'stripe'
  | 'email'
  | 'services'
  | 'complete';

interface WizardData {
  // Général
  siteName: string;
  siteTagline: string;
  logoUrl: string;

  // Template & Couleurs
  selectedTemplate: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Contact
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;

  // Localisation
  latitude: string;
  longitude: string;

  // Horaires
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };

  // Contenu
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroVideo: string;

  // À propos
  aboutText: string;
  aboutTitle: string;

  // Réseaux sociaux
  facebook: string;
  instagram: string;
  tiktok: string;
  linkedin: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;

  // Légal
  termsOfService: string;
  privacyPolicy: string;
  legalNotices: string;

  // Stripe
  stripeEnabled: boolean;

  // Email
  emailProvider: 'brevo' | 'resend' | '';

  // Validation par étape
  completedSteps: Set<Step>;
}

const defaultHours = {
  lundi: { open: '09:00', close: '18:00', closed: false },
  mardi: { open: '09:00', close: '18:00', closed: false },
  mercredi: { open: '09:00', close: '18:00', closed: false },
  jeudi: { open: '09:00', close: '18:00', closed: false },
  vendredi: { open: '09:00', close: '18:00', closed: false },
  samedi: { open: '10:00', close: '16:00', closed: false },
  dimanche: { open: '', close: '', closed: true },
};

export default function CompleteOnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [data, setData] = useState<WizardData>({
    siteName: '',
    siteTagline: '',
    logoUrl: '',
    selectedTemplate: 'modern',
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    accentColor: '#20b2aa',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    latitude: '',
    longitude: '',
    businessHours: defaultHours,
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    heroVideo: '',
    aboutText: '',
    aboutTitle: 'À propos de nous',
    facebook: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    termsOfService: '',
    privacyPolicy: '',
    legalNotices: '',
    stripeEnabled: false,
    emailProvider: '',
    completedSteps: new Set<Step>(),
  });

  // Charger les données existantes et l'étape sauvegardée au montage
  useEffect(() => {
    const init = async () => {
      await loadExistingConfig();
      // Charger l'étape sauvegardée
      const savedStep = localStorage.getItem('onboarding-current-step');
      if (savedStep) {
        setCurrentStep(savedStep as Step);
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const config = await response.json();
        setData(prev => ({
          ...prev,
          siteName: config.siteName || '',
          siteTagline: config.siteTagline || '',
          logoUrl: config.logoUrl || '',
          selectedTemplate: config.homeTemplate || config.websiteTemplate || 'modern',
          primaryColor: config.primaryColor || '#d4b5a0',
          secondaryColor: config.secondaryColor || '#2c3e50',
          accentColor: config.accentColor || '#20b2aa',
          email: config.email || '',
          phone: config.phone || '',
          address: config.address || '',
          postalCode: config.postalCode || '',
          city: config.city || '',
          latitude: config.latitude || '',
          longitude: config.longitude || '',
          businessHours: config.businessHours ? JSON.parse(config.businessHours) : defaultHours,
          heroTitle: config.heroTitle || '',
          heroSubtitle: config.heroSubtitle || '',
          heroImage: config.heroImage || '',
          heroVideo: config.heroVideo || '',
          aboutText: config.aboutText || '',
          aboutTitle: config.aboutIntro || 'À propos de nous',
          facebook: config.facebook || '',
          instagram: config.instagram || '',
          tiktok: config.tiktok || '',
          linkedin: config.linkedin || '',
          metaTitle: config.defaultMetaTitle || '',
          metaDescription: config.defaultMetaDescription || '',
          keywords: config.defaultMetaKeywords || '',
          termsOfService: config.termsAndConditions || '',
          privacyPolicy: config.privacyPolicy || '',
          legalNotices: config.legalNotice || '',
        }));
      }
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  };

  const saveCurrentStep = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      // Mapper les données du wizard aux champs du schéma
      const configData: any = {};

      // Informations générales
      if (data.siteName) configData.siteName = data.siteName;
      if (data.siteTagline) configData.siteTagline = data.siteTagline;
      if (data.logoUrl) configData.logoUrl = data.logoUrl;

      // Template
      if (data.selectedTemplate) configData.homeTemplate = data.selectedTemplate;

      // Couleurs
      if (data.primaryColor) configData.primaryColor = data.primaryColor;
      if (data.secondaryColor) configData.secondaryColor = data.secondaryColor;
      if (data.accentColor) configData.accentColor = data.accentColor;

      // Contact
      if (data.email) configData.email = data.email;
      if (data.phone) configData.phone = data.phone;
      if (data.address) configData.address = data.address;
      if (data.postalCode) configData.postalCode = data.postalCode;
      if (data.city) configData.city = data.city;

      // Localisation
      if (data.latitude) configData.latitude = data.latitude;
      if (data.longitude) configData.longitude = data.longitude;

      // Horaires (convertir en JSON string si nécessaire)
      if (data.businessHours) {
        configData.businessHours = JSON.stringify(data.businessHours);
      }

      // Contenu de la page d'accueil
      if (data.heroTitle) configData.heroTitle = data.heroTitle;
      if (data.heroSubtitle) configData.heroSubtitle = data.heroSubtitle;
      if (data.heroImage) configData.heroImage = data.heroImage;
      if (data.heroVideo) configData.heroVideo = data.heroVideo;

      // À propos
      if (data.aboutText) configData.aboutText = data.aboutText;
      if (data.aboutTitle) configData.aboutIntro = data.aboutTitle;

      // Réseaux sociaux
      if (data.facebook) configData.facebook = data.facebook;
      if (data.instagram) configData.instagram = data.instagram;
      if (data.tiktok) configData.tiktok = data.tiktok;
      if (data.linkedin) configData.linkedin = data.linkedin;

      // SEO
      if (data.metaTitle) configData.defaultMetaTitle = data.metaTitle;
      if (data.metaDescription) configData.defaultMetaDescription = data.metaDescription;
      if (data.keywords) configData.defaultMetaKeywords = data.keywords;

      // Mentions légales
      if (data.termsOfService) configData.termsAndConditions = data.termsOfService;
      if (data.privacyPolicy) configData.privacyPolicy = data.privacyPolicy;
      if (data.legalNotices) configData.legalNotice = data.legalNotices;

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur sauvegarde:', errorData);
        const errorMsg = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Erreur inconnue';
        alert('Erreur lors de la sauvegarde: ' + errorMsg);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde: ' + error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 'welcome', title: 'Bienvenue', icon: Sparkles, category: 'Démarrage' },
    { id: 'general', title: 'Informations générales', icon: Building, category: 'Base' },
    { id: 'template', title: 'Template', icon: Palette, category: 'Base' },
    { id: 'colors', title: 'Couleurs', icon: Palette, category: 'Base' },
    { id: 'contact', title: 'Contact', icon: Mail, category: 'Base' },
    { id: 'location', title: 'Localisation', icon: MapPin, category: 'Base' },
    { id: 'hours', title: 'Horaires', icon: Clock, category: 'Base' },
    { id: 'team', title: 'Équipe & Accès', icon: Users, category: 'Gestion' },
    { id: 'content', title: 'Page d\'accueil', icon: FileText, category: 'Contenu' },
    { id: 'about', title: 'À propos', icon: FileText, category: 'Contenu' },
    { id: 'social', title: 'Réseaux sociaux', icon: Instagram, category: 'Communications' },
    { id: 'seo', title: 'SEO', icon: Search, category: 'Marketing' },
    { id: 'legal', title: 'Mentions légales', icon: Shield, category: 'Légal' },
    { id: 'stripe', title: 'Paiements', icon: CreditCard, category: 'Finances' },
    { id: 'email', title: 'Email', icon: Mail, category: 'Communications' },
    { id: 'services', title: 'Services', icon: Package, category: 'Contenu' },
    { id: 'complete', title: 'Finalisation', icon: Check, category: 'Fin' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = Math.round((currentStepIndex / (steps.length - 1)) * 100);

  const handleNext = async () => {
    // Marquer l'étape actuelle comme complétée
    setData(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, currentStep])
    }));

    // Sauvegarder avant de passer à l'étape suivante
    const saved = await saveCurrentStep();
    if (!saved) return;

    // Vérifier si le taux de complétion atteint 70% -> auto-compléter
    const autoCompleted = await checkAutoComplete();
    if (autoCompleted) {
      onComplete(); // Fermer le wizard et rediriger vers l'admin
      return;
    }

    // Passer à l'étape suivante
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1].id as Step;
      setCurrentStep(nextStep);
      // Sauvegarder l'étape actuelle dans localStorage
      localStorage.setItem('onboarding-current-step', nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1].id as Step;
      setCurrentStep(prevStep);
      // Sauvegarder l'étape actuelle dans localStorage
      localStorage.setItem('onboarding-current-step', prevStep);
    }
  };

  // Calculer le taux de complétion
  const calculateCompletionRate = () => {
    const fields = [
      data.siteName,
      data.siteTagline,
      data.logoUrl,
      data.selectedTemplate,
      data.primaryColor,
      data.email,
      data.phone,
      data.address,
      data.city,
      data.postalCode,
      data.heroTitle,
      data.heroSubtitle,
      data.aboutText,
    ];

    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Vérifier automatiquement si l'onboarding doit être marqué comme terminé
  const checkAutoComplete = async () => {
    const completionRate = calculateCompletionRate();

    // Si plus de 70% rempli, marquer comme terminé automatiquement
    if (completionRate >= 70) {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/admin/onboarding/complete', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('onboarding-current-step');
        return true;
      } catch (error) {
        console.error('Erreur auto-completion:', error);
      }
    }
    return false;
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await saveCurrentStep();
      const token = localStorage.getItem('token');
      await fetch('/api/admin/onboarding/complete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Supprimer l'étape sauvegardée car l'onboarding est terminé
      localStorage.removeItem('onboarding-current-step');
      onComplete();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    setSaving(true);
    const saved = await saveCurrentStep();
    if (saved) {
      // L'étape est déjà sauvegardée dans localStorage
      router.push('/admin');
    }
    setSaving(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue dans la configuration complète de votre site ! 🎉
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Ce guide va vous accompagner étape par étape pour configurer <strong>tous les aspects</strong> de votre site professionnel.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-4 text-lg">📋 Ce que nous allons configurer ensemble :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm text-blue-800">
                <div>
                  <p className="font-semibold mb-2">🎨 Configuration de base :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Informations générales</li>
                    <li>• Template et couleurs</li>
                    <li>• Coordonnées de contact</li>
                    <li>• Localisation et horaires</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">📝 Contenu du site :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Page d'accueil</li>
                    <li>• À propos</li>
                    <li>• Vos services</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">🌐 Marketing & SEO :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Réseaux sociaux</li>
                    <li>• Référencement SEO</li>
                    <li>• Mentions légales</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">💳 Finances & Communications :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Paiements Stripe</li>
                    <li>• Configuration email</li>
                    <li>• Et plus encore...</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <Clock className="w-5 h-5" />
              <span>Temps estimé : <strong>20-30 minutes</strong></span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 Vous pouvez sauvegarder et reprendre à tout moment
            </p>
          </div>
        );

      case 'general':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations générales de votre institut</h2>
            <p className="text-gray-600 mb-6">
              Ces informations apparaîtront partout sur votre site
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de votre institut *
                </label>
                <input
                  type="text"
                  value={data.siteName}
                  onChange={(e) => setData({ ...data, siteName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Institut Belle & Zen"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan / Phrase d'accroche
                </label>
                <input
                  type="text"
                  value={data.siteTagline}
                  onChange={(e) => setData({ ...data, siteTagline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Votre beauté, notre passion"
                />
              </div>

              <ImageUpload
                value={data.logoUrl}
                onChange={(url) => setData({ ...data, logoUrl: url })}
                folder="logos"
                label="Logo"
                placeholder="https://example.com/logo.png"
                preview={true}
              />
            </div>
          </div>
        );

      case 'template':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre template</h2>
            <p className="text-gray-600 mb-6">
              Sélectionnez le design qui correspond le mieux à votre style
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websiteTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setData({ ...data, selectedTemplate: template.id })}
                  className={`cursor-pointer border-2 rounded-xl p-4 transition hover:shadow-lg ${
                    data.selectedTemplate === template.id
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center relative group overflow-hidden">
                    <span className="text-xl font-bold text-gray-700">{template.name}</span>
                    {data.selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'colors':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Personnalisez vos couleurs</h2>
            <p className="text-gray-600 mb-6">
              Choisissez les couleurs qui représentent votre marque
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur primaire
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={data.primaryColor}
                    onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                    className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.primaryColor}
                    onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="#d4b5a0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={data.secondaryColor}
                    onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                    className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.secondaryColor}
                    onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur d'accent
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={data.accentColor}
                    onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                    className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.accentColor}
                    onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="#20b2aa"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Aperçu</p>
              <div className="flex gap-4">
                <div
                  className="flex-1 h-24 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  Primaire
                </div>
                <div
                  className="flex-1 h-24 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: data.secondaryColor }}
                >
                  Secondaire
                </div>
                <div
                  className="flex-1 h-24 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: data.accentColor }}
                >
                  Accent
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coordonnées de contact</h2>
            <p className="text-gray-600 mb-6">
              Ces informations permettront à vos clients de vous contacter
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="contact@votre-institut.fr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="+33 6 12 34 56 78"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="15 Rue de la Beauté"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={data.postalCode}
                    onChange={(e) => setData({ ...data, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="75001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Paris"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Localisation sur la carte</h2>
            <p className="text-gray-600 mb-6">
              Ajoutez votre position GPS pour apparaître sur Google Maps
            </p>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 mb-2">
                  💡 <strong>Comment obtenir vos coordonnées GPS ?</strong>
                </p>
                <ol className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>1. Allez sur <a href="https://www.google.com/maps" target="_blank" className="underline">Google Maps</a></li>
                  <li>2. Recherchez votre adresse</li>
                  <li>3. Clic droit sur votre emplacement → "Plus d'infos sur cet endroit"</li>
                  <li>4. Les coordonnées apparaissent en haut (ex: 48.8566, 2.3522)</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={data.latitude}
                    onChange={(e) => setData({ ...data, latitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="48.8566"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={data.longitude}
                    onChange={(e) => setData({ ...data, longitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="2.3522"
                  />
                </div>
              </div>

              {data.latitude && data.longitude && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    ✅ Vos coordonnées sont définies ! Votre institut sera visible sur la carte.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'hours':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Horaires d'ouverture</h2>
            <p className="text-gray-600 mb-6">
              Définissez vos horaires d'ouverture pour chaque jour de la semaine
            </p>

            <div className="space-y-4">
              {Object.keys(data.businessHours).map((day) => (
                <div key={day} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="w-32">
                    <span className="font-medium text-gray-900 capitalize">{day}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.businessHours[day].closed}
                        onChange={(e) => {
                          setData({
                            ...data,
                            businessHours: {
                              ...data.businessHours,
                              [day]: {
                                ...data.businessHours[day],
                                closed: e.target.checked
                              }
                            }
                          });
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Fermé</span>
                    </label>

                    {!data.businessHours[day].closed && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={data.businessHours[day].open}
                            onChange={(e) => {
                              setData({
                                ...data,
                                businessHours: {
                                  ...data.businessHours,
                                  [day]: {
                                    ...data.businessHours[day],
                                    open: e.target.value
                                  }
                                }
                              });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-gray-600">à</span>
                          <input
                            type="time"
                            value={data.businessHours[day].close}
                            onChange={(e) => {
                              setData({
                                ...data,
                                businessHours: {
                                  ...data.businessHours,
                                  [day]: {
                                    ...data.businessHours[day],
                                    close: e.target.value
                                  }
                                }
                              });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 Ces horaires seront affichés sur votre site et utilisés pour les réservations en ligne
              </p>
            </div>
          </div>
        );

      case 'team':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion de l'équipe et des accès</h2>
            <p className="text-gray-600 mb-6">
              Ajoutez les membres de votre équipe et gérez leurs accès en fonction de votre abonnement
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Nombre d'accès disponibles selon votre formule :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="font-bold text-lg text-gray-900">SOLO</div>
                  <div className="text-purple-600 font-bold text-2xl my-2">1</div>
                  <div className="text-gray-600">utilisateur</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="font-bold text-lg text-gray-900">DUO</div>
                  <div className="text-purple-600 font-bold text-2xl my-2">2</div>
                  <div className="text-gray-600">utilisateurs</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="font-bold text-lg text-gray-900">TEAM</div>
                  <div className="text-purple-600 font-bold text-2xl my-2">5</div>
                  <div className="text-gray-600">utilisateurs</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-500">
                  <div className="font-bold text-lg text-purple-900">PREMIUM</div>
                  <div className="text-purple-600 font-bold text-2xl my-2">∞</div>
                  <div className="text-gray-600">illimité</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">👥 Rôles disponibles :</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li><strong>Admin :</strong> Accès complet à toutes les fonctionnalités</li>
                <li><strong>Esthéticienne :</strong> Gestion du planning et des réservations</li>
                <li><strong>Réceptionniste :</strong> Accueil et validation des réservations</li>
                <li><strong>Comptable :</strong> Accès aux finances et rapports</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Après ce wizard</strong>, vous pourrez ajouter des membres de votre équipe dans l'onglet <strong>"Utilisateurs & Permissions"</strong> de votre tableau de bord admin.
              </p>
              <p className="text-xs text-blue-800 mt-2">
                Pour l'instant, concentrez-vous sur la configuration de base de votre site. Vous pourrez gérer votre équipe une fois la configuration terminée.
              </p>
            </div>
          </div>
        );

      case 'content':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contenu de la page d'accueil</h2>
            <p className="text-gray-600 mb-6">
              Personnalisez le contenu principal de votre page d'accueil
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre principal (Hero) *
                </label>
                <input
                  type="text"
                  value={data.heroTitle}
                  onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Bienvenue dans votre institut de beauté"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-titre
                </label>
                <textarea
                  value={data.heroSubtitle}
                  onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Découvrez nos soins d'exception pour sublimer votre beauté naturelle"
                />
              </div>

              <ImageUpload
                value={data.heroImage}
                onChange={(url) => setData({ ...data, heroImage: url })}
                folder="hero"
                label="Image principale"
                placeholder="https://example.com/hero-image.jpg"
                preview={true}
              />

              <VideoUpload
                value={data.heroVideo}
                onChange={(url) => setData({ ...data, heroVideo: url })}
                folder="hero"
                label="Vidéo hero (optionnel)"
                placeholder="https://example.com/hero-video.mp4"
                preview={true}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 La vidéo hero sera affichée en arrière-plan sur votre page d'accueil pour créer un effet dynamique et attractif
                </p>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">À propos de votre institut</h2>
            <p className="text-gray-600 mb-6">
              Présentez votre institut, votre histoire et vos valeurs
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={data.aboutTitle}
                  onChange={(e) => setData({ ...data, aboutTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="À propos de nous"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte de présentation *
                </label>
                <textarea
                  value={data.aboutText}
                  onChange={(e) => setData({ ...data, aboutText: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={8}
                  placeholder="Racontez votre histoire, vos valeurs, votre expertise..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Parlez de votre expérience, votre formation, vos spécialités, ce qui vous différencie
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">💡 Conseils pour une bonne présentation :</h4>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>• Racontez votre parcours et votre passion</li>
                  <li>• Mettez en avant vos certifications et formations</li>
                  <li>• Expliquez votre approche et vos valeurs</li>
                  <li>• Mentionnez vos spécialités uniques</li>
                  <li>• Créez une connexion émotionnelle avec vos clients</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Réseaux sociaux</h2>
            <p className="text-gray-600 mb-6">
              Connectez vos profils de réseaux sociaux pour augmenter votre visibilité
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={data.instagram}
                  onChange={(e) => setData({ ...data, instagram: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.instagram.com/votre-institut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={data.facebook}
                  onChange={(e) => setData({ ...data, facebook: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.facebook.com/votre-institut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-black" />
                  TikTok
                </label>
                <input
                  type="url"
                  value={data.tiktok}
                  onChange={(e) => setData({ ...data, tiktok: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.tiktok.com/@votre-institut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={data.linkedin}
                  onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.linkedin.com/company/votre-institut"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 Ces liens apparaîtront dans le pied de page de votre site et permettront à vos clients de vous suivre facilement
                </p>
              </div>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Référencement SEO</h2>
            <p className="text-gray-600 mb-6">
              Optimisez votre visibilité sur Google et les moteurs de recherche
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre SEO (Meta Title) *
                </label>
                <input
                  type="text"
                  value={data.metaTitle}
                  onChange={(e) => setData({ ...data, metaTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Institut de beauté à Paris | Soins du visage et épilation"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {data.metaTitle.length}/60 caractères (optimal : 50-60)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description SEO (Meta Description) *
                </label>
                <textarea
                  value={data.metaDescription}
                  onChange={(e) => setData({ ...data, metaDescription: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Découvrez notre institut de beauté à Paris. Soins du visage, épilation, massage. Prenez RDV en ligne."
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {data.metaDescription.length}/160 caractères (optimal : 120-160)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={data.keywords}
                  onChange={(e) => setData({ ...data, keywords: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="institut beauté paris, soins visage, épilation, massage"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">💡 Conseils SEO :</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Incluez votre ville et vos prestations principales</li>
                  <li>• Utilisez un langage naturel et attractif</li>
                  <li>• Évitez le bourrage de mots-clés</li>
                  <li>• Mettez en avant votre différence</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentions légales</h2>
            <p className="text-gray-600 mb-6">
              Conformez-vous aux obligations légales (RGPD, etc.)
            </p>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-900">
                  ⚠️ <strong>Important :</strong> Ces textes légaux sont obligatoires pour être en conformité avec la loi française.
                  Vous pouvez les personnaliser ou utiliser un générateur de mentions légales.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions Générales de Vente (CGV)
                </label>
                <textarea
                  value={data.termsOfService}
                  onChange={(e) => setData({ ...data, termsOfService: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows={6}
                  placeholder="Vos conditions générales de vente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Politique de Confidentialité (RGPD)
                </label>
                <textarea
                  value={data.privacyPolicy}
                  onChange={(e) => setData({ ...data, privacyPolicy: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows={6}
                  placeholder="Votre politique de confidentialité..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mentions Légales
                </label>
                <textarea
                  value={data.legalNotices}
                  onChange={(e) => setData({ ...data, legalNotices: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows={6}
                  placeholder="Vos mentions légales (raison sociale, SIRET, etc.)..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Besoin d'aide ?</strong> Utilisez des générateurs en ligne gratuits comme
                  <a href="https://www.cnil.fr" target="_blank" className="underline ml-1">CNIL.fr</a> ou consultez un avocat spécialisé.
                </p>
              </div>
            </div>
          </div>
        );

      case 'stripe':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration des paiements</h2>
            <p className="text-gray-600 mb-6">
              Activez les paiements en ligne avec Stripe
            </p>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CreditCard className="w-12 h-12 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 mb-2">Paiements sécurisés avec Stripe</h3>
                    <p className="text-sm text-purple-800 mb-4">
                      Stripe vous permet d'accepter les paiements par carte bancaire directement sur votre site.
                      C'est simple, sécurisé et conforme aux normes bancaires.
                    </p>
                    <ul className="space-y-1 text-sm text-purple-700">
                      <li>✓ Paiements sécurisés (3D Secure)</li>
                      <li>✓ Toutes les cartes bancaires acceptées</li>
                      <li>✓ Virements instantanés sur votre compte</li>
                      <li>✓ Frais transparents : 1.4% + 0.25€ par transaction</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.stripeEnabled}
                    onChange={(e) => setData({ ...data, stripeEnabled: e.target.checked })}
                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-900">
                    Activer les paiements en ligne avec Stripe
                  </span>
                </label>
              </div>

              {data.stripeEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 mb-3">
                    ✅ <strong>Stripe activé !</strong>
                  </p>
                  <p className="text-sm text-green-800">
                    Après avoir terminé ce wizard, vous pourrez finaliser la configuration Stripe dans <strong>"Paramètres → Configuration du site → Intégrations"</strong>.
                    Vous aurez deux options :
                  </p>
                  <ul className="space-y-1 text-sm text-green-800 ml-4 mt-2">
                    <li>• <strong>Stripe Connect</strong> (recommandé) : Paiements directs sur votre compte</li>
                    <li>• <strong>Clés API Stripe</strong> : Configuration manuelle</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'email':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration email</h2>
            <p className="text-gray-600 mb-6">
              Choisissez votre fournisseur d'envoi d'emails
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setData({ ...data, emailProvider: 'brevo' })}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition ${
                    data.emailProvider === 'brevo'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Brevo (Sendinblue)</h3>
                    {data.emailProvider === 'brevo' && (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solution tout-en-un pour emails, SMS et marketing
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>✓ 300 emails/jour gratuits</li>
                    <li>✓ Templates inclus</li>
                    <li>✓ SMS disponibles</li>
                    <li>✓ Interface en français</li>
                  </ul>
                </div>

                <div
                  onClick={() => setData({ ...data, emailProvider: 'resend' })}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition ${
                    data.emailProvider === 'resend'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Resend</h3>
                    {data.emailProvider === 'resend' && (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solution moderne et simple pour développeurs
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>✓ 100 emails/jour gratuits</li>
                    <li>✓ API simple</li>
                    <li>✓ Très bon taux de délivrabilité</li>
                    <li>✓ Support React Email</li>
                  </ul>
                </div>
              </div>

              {data.emailProvider && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 mb-3">
                    ✅ <strong>{data.emailProvider === 'brevo' ? 'Brevo' : 'Resend'} sélectionné !</strong>
                  </p>
                  <p className="text-sm text-green-800 mb-2">
                    Après avoir terminé ce wizard, finalisez la configuration dans l'onglet <strong>"Emailing"</strong> de votre admin :
                  </p>
                  <ol className="space-y-1 text-sm text-green-800 ml-4">
                    <li>1. Créez un compte sur {data.emailProvider === 'brevo' ? 'brevo.com' : 'resend.com'}</li>
                    <li>2. Vérifiez votre domaine email</li>
                    <li>3. Récupérez votre clé API</li>
                    <li>4. Entrez-la dans les paramètres</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        );

      case 'services':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos services</h2>
            <p className="text-gray-600 mb-6">
              Ajoutez et gérez vos prestations
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                Gérez vos services depuis le tableau de bord
              </h3>
              <p className="text-gray-700 mb-6 max-w-xl mx-auto">
                L'onglet <strong>Services</strong> vous permet de créer et gérer toutes vos prestations :
                soins du visage, épilation, massages, forfaits, etc.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-purple-900 mb-1">📋 Catégories</div>
                  <div className="text-gray-600">Organisez vos services</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-purple-900 mb-1">💰 Tarifs</div>
                  <div className="text-gray-600">Définissez vos prix</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-purple-900 mb-1">⏱️ Durées</div>
                  <div className="text-gray-600">Configurez les horaires</div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-purple-900">
                  💡 <strong>Prochaine étape après le wizard :</strong>
                </p>
                <p className="text-sm text-purple-800 mt-2">
                  Vous pourrez ajouter et gérer vos services depuis l'onglet <strong>"Services"</strong> de votre tableau de bord admin. C'est là que vous créerez vos prestations avec prix, durées et descriptions.
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-pulse">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Félicitations ! Votre site est entièrement configuré ! 🎉
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Vous venez de parcourir TOUTES les étapes de configuration de votre site professionnel.
              Vous êtes maintenant prêt(e) à accueillir vos clients !
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-left">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Configuration de base
                </h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>✅ Informations générales</li>
                  <li>✅ Template et couleurs</li>
                  <li>✅ Coordonnées de contact</li>
                  <li>✅ Localisation GPS</li>
                  <li>✅ Horaires d'ouverture</li>
                  <li>✅ Gestion de l'équipe</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 text-left">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Contenu & Marketing
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✅ Page d'accueil personnalisée</li>
                  <li>✅ À propos</li>
                  <li>✅ Réseaux sociaux</li>
                  <li>✅ SEO et référencement</li>
                  <li>✅ Mentions légales</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-left">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Paiements & Email
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>✅ Configuration Stripe</li>
                  <li>✅ Fournisseur d'emails</li>
                  <li>✅ Notifications clients</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 text-left">
                <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Prochaines étapes
                </h3>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li>→ Ajoutez vos services</li>
                  <li>→ Invitez votre équipe</li>
                  <li>→ Testez les réservations</li>
                  <li>→ Partagez votre site !</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-300 rounded-2xl p-6 max-w-3xl mx-auto mb-8">
              <h3 className="font-bold text-purple-900 mb-3 text-lg">🚀 Votre site est maintenant opérationnel !</h3>
              <p className="text-purple-800 text-sm mb-4">
                Toutes les configurations essentielles sont en place. Vous pouvez maintenant :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="font-bold text-purple-900 mb-1">📅</div>
                  <div className="text-gray-700">Gérer votre planning</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="font-bold text-purple-900 mb-1">👥</div>
                  <div className="text-gray-700">Suivre vos clients</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="font-bold text-purple-900 mb-1">💰</div>
                  <div className="text-gray-700">Encaisser en ligne</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Finalisation en cours...' : 'Accéder à mon tableau de bord admin 🚀'}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Vous pourrez toujours modifier ces paramètres depuis l'onglet "Paramètres" de votre admin
            </p>
          </div>
        );

      default:
        return <div>Étape en cours de développement...</div>;
    }
  };

  // Ne pas afficher tant que l'initialisation n'est pas terminée
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Exit Button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndExit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Sauvegarder et quitter
            </button>
          </div>
          {currentStep !== 'welcome' && currentStep !== 'complete' && (
            <div className="text-sm text-gray-500">
              💾 Votre progression est sauvegardée automatiquement
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {currentStepIndex + 1} sur {steps.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Configuration : {calculateCompletionRate()}%
              </span>
              <span className="text-sm font-medium text-gray-700">
                Progression : {progress}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {calculateCompletionRate() >= 70 && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              ✅ Configuration suffisante atteinte ! Le wizard se fermera automatiquement.
            </p>
          )}
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>

            <button
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Suivant'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentStep === 'welcome' && (
          <div className="text-center space-y-4">
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition"
            >
              Commencer la configuration
              <ChevronRight className="w-5 h-5 inline ml-2" />
            </button>
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Revenir plus tard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
