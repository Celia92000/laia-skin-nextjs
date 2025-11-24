'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, Palette, FileText, MapPin, Settings } from 'lucide-react';
import { websiteTemplates } from '@/lib/website-templates';
import LiveTemplatePreview from './LiveTemplatePreview';

type Step = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  // Étape 1 : Template
  selectedTemplate: string;

  // Étape 2 : Couleurs
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Étape 3 : Textes & Photos
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  logoUrl: string;
  heroImage: string;

  // Fondateur/Équipe
  founderName: string;
  founderTitle: string;
  founderQuote: string;
  founderImage: string;

  // Étape 4 : Contact, Localisation & Réseaux
  contactEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  googleMapsUrl: string;

  // Horaires
  mondayHours: string;
  tuesdayHours: string;
  wednesdayHours: string;
  thursdayHours: string;
  fridayHours: string;
  saturdayHours: string;
  sundayHours: string;

  // Étape 5 : Entreprise & Légal
  legalName: string;
  siret: string;
  siren: string;
  tvaNumber: string;
  apeCode: string;
  rcs: string;
  capital: string;
  legalForm: string;
  legalRepName: string;
  legalRepTitle: string;

  // Assurance
  insuranceCompany: string;
  insuranceContract: string;
  insuranceAddress: string;

  // Finances
  bankName: string;
  bankIban: string;
  bankBic: string;

  // SEO & Tracking
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultMetaKeywords: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleVerificationCode: string;
  metaVerificationCode: string;
}

export default function OnboardingWizardComplete({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>({
    selectedTemplate: 'modern',
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    accentColor: '#20b2aa',
    siteName: '',
    siteTagline: '',
    siteDescription: '',
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    logoUrl: '',
    heroImage: '',
    founderName: '',
    founderTitle: '',
    founderQuote: '',
    founderImage: '',
    contactEmail: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    googleMapsUrl: '',
    mondayHours: '9h00 - 18h00',
    tuesdayHours: '9h00 - 18h00',
    wednesdayHours: '9h00 - 18h00',
    thursdayHours: '9h00 - 18h00',
    fridayHours: '9h00 - 18h00',
    saturdayHours: '10h00 - 16h00',
    sundayHours: 'Fermé',

    // Entreprise & Légal
    legalName: '',
    siret: '',
    siren: '',
    tvaNumber: '',
    apeCode: '',
    rcs: '',
    capital: '',
    legalForm: 'SARL',
    legalRepName: '',
    legalRepTitle: 'Gérant(e)',

    // Assurance
    insuranceCompany: '',
    insuranceContract: '',
    insuranceAddress: '',

    // Finances
    bankName: '',
    bankIban: '',
    bankBic: '',

    // SEO & Tracking
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultMetaKeywords: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    googleVerificationCode: '',
    metaVerificationCode: ''
  });
  const [saving, setSaving] = useState(false);

  // Fonction pour gérer l'upload de fichiers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de la taille
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB vidéo, 5MB image
    if (file.size > maxSize) {
      alert(`Fichier trop volumineux. Maximum : ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Créer un URL temporaire pour la preview
    const url = URL.createObjectURL(file);
    setData({ ...data, [field]: url });
  };

  // Charger les données existantes
  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const config = await response.json();
        setData({
          selectedTemplate: config.websiteTemplate || 'modern',
          primaryColor: config.primaryColor || '#d4b5a0',
          secondaryColor: config.secondaryColor || '#2c3e50',
          accentColor: config.accentColor || '#20b2aa',
          siteName: config.siteName || '',
          siteTagline: config.siteTagline || '',
          siteDescription: config.siteDescription || '',
          heroTitle: config.heroTitle || '',
          heroSubtitle: config.heroSubtitle || '',
          aboutText: config.aboutText || '',
          logoUrl: config.logoUrl || '',
          heroImage: config.heroImage || '',
          founderName: config.founderName || '',
          founderTitle: config.founderTitle || '',
          founderQuote: config.founderQuote || '',
          founderImage: config.founderImage || '',
          contactEmail: config.contactEmail || config.email || '',
          phone: config.phone || '',
          address: config.address || '',
          city: config.city || '',
          postalCode: config.postalCode || '',
          country: config.country || 'France',
          facebook: config.facebook || '',
          instagram: config.instagram || '',
          tiktok: config.tiktok || '',
          whatsapp: config.whatsapp || '',
          googleMapsUrl: config.googleMapsUrl || '',
          mondayHours: '9h00 - 18h00',
          tuesdayHours: '9h00 - 18h00',
          wednesdayHours: '9h00 - 18h00',
          thursdayHours: '9h00 - 18h00',
          fridayHours: '9h00 - 18h00',
          saturdayHours: '10h00 - 16h00',
          sundayHours: 'Fermé'
        });
      }
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      // Construire l'objet businessHours
      const businessHours = {
        lundi: data.mondayHours,
        mardi: data.tuesdayHours,
        mercredi: data.wednesdayHours,
        jeudi: data.thursdayHours,
        vendredi: data.fridayHours,
        samedi: data.saturdayHours,
        dimanche: data.sundayHours
      };

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteTemplate: data.selectedTemplate,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          siteName: data.siteName,
          siteTagline: data.siteTagline,
          siteDescription: data.siteDescription,
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          aboutText: data.aboutText,
          logoUrl: data.logoUrl,
          heroImage: data.heroImage,
          founderName: data.founderName,
          founderTitle: data.founderTitle,
          founderQuote: data.founderQuote,
          founderImage: data.founderImage,
          contactEmail: data.contactEmail,
          email: data.contactEmail,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          facebook: data.facebook,
          instagram: data.instagram,
          tiktok: data.tiktok,
          whatsapp: data.whatsapp,
          googleMapsUrl: data.googleMapsUrl,
          businessHours: JSON.stringify(businessHours)
        })
      });

      if (response.ok) {
        handleNext();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    try {
      // Sauvegarder les données de l'étape 5 (entreprise, légal, finances, SEO)
      const configResponse = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Entreprise
          legalName: data.legalName,
          siret: data.siret,
          siren: data.siren,
          tvaNumber: data.tvaNumber,
          apeCode: data.apeCode,
          rcs: data.rcs,
          capital: data.capital,
          legalForm: data.legalForm,
          legalRepName: data.legalRepName,
          legalRepTitle: data.legalRepTitle,

          // Assurance
          insuranceCompany: data.insuranceCompany,
          insuranceContract: data.insuranceContract,
          insuranceAddress: data.insuranceAddress,

          // Finances
          bankName: data.bankName,
          bankIban: data.bankIban,
          bankBic: data.bankBic,

          // SEO
          defaultMetaTitle: data.defaultMetaTitle,
          defaultMetaDescription: data.defaultMetaDescription,
          defaultMetaKeywords: data.defaultMetaKeywords,
          googleAnalyticsId: data.googleAnalyticsId,
          facebookPixelId: data.facebookPixelId,
          googleVerificationCode: data.googleVerificationCode,
          metaVerificationCode: data.metaVerificationCode
        })
      });

      if (!configResponse.ok) {
        alert('Erreur lors de la sauvegarde des informations');
        setSaving(false);
        return;
      }

      // Marquer l'onboarding comme terminé
      const response = await fetch('/api/admin/onboarding/complete', {
        method: 'POST'
      });

      if (response.ok) {
        onComplete();
      } else {
        alert('Erreur lors de la finalisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la finalisation');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Template', icon: Sparkles, completed: currentStep > 1 },
    { number: 2, title: 'Couleurs', icon: Palette, completed: currentStep > 2 },
    { number: 3, title: 'Textes', icon: FileText, completed: currentStep > 3 },
    { number: 4, title: 'Contact', icon: MapPin, completed: currentStep > 4 },
    { number: 5, title: 'Finalisation', icon: Settings, completed: false }
  ];

  const dayNames = {
    lundi: { label: 'Lundi', value: 'mondayHours' },
    mardi: { label: 'Mardi', value: 'tuesdayHours' },
    mercredi: { label: 'Mercredi', value: 'wednesdayHours' },
    jeudi: { label: 'Jeudi', value: 'thursdayHours' },
    vendredi: { label: 'Vendredi', value: 'fridayHours' },
    samedi: { label: 'Samedi', value: 'saturdayHours' },
    dimanche: { label: 'Dimanche', value: 'sundayHours' }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Colonne Gauche - Formulaire */}
      <div className="w-full md:w-1/2 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Configuration guidée de votre site</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenue dans votre espace LAIA Connect
          </h1>
          <p className="text-gray-600 text-lg">
            Configurons votre site en quelques étapes simples
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.completed ? <Check className="w-6 h-6" /> : step.number}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <step.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Étape 1 : Choix du template */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choisissez votre template de site
              </h2>
              <p className="text-gray-600 mb-6">
                Sélectionnez le design qui correspond le mieux à votre style
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {websiteTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setData({ ...data, selectedTemplate: template.id })}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition hover:shadow-lg ${
                      data.selectedTemplate === template.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">{template.name}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {template.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Étape 2 : Couleurs */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personnalisez vos couleurs
              </h2>
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
                    <div>
                      <input
                        type="text"
                        value={data.primaryColor}
                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#d4b5a0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Couleur principale</p>
                    </div>
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
                    <div>
                      <input
                        type="text"
                        value={data.secondaryColor}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#2c3e50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Textes & titres</p>
                    </div>
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
                    <div>
                      <input
                        type="text"
                        value={data.accentColor}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#20b2aa"
                      />
                      <p className="text-xs text-gray-500 mt-1">Boutons & liens</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
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
          )}

          {/* Étape 3 : Textes & Photos */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Textes et images de votre site
              </h2>
              <p className="text-gray-600 mb-6">
                Personnalisez le contenu qui apparaîtra sur votre site
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slogan
                    </label>
                    <input
                      type="text"
                      value={data.siteTagline}
                      onChange={(e) => setData({ ...data, siteTagline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Votre beauté, notre passion"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description de votre institut
                  </label>
                  <textarea
                    value={data.siteDescription}
                    onChange={(e) => setData({ ...data, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Décrivez votre institut en quelques phrases..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre principal (Hero)
                    </label>
                    <input
                      type="text"
                      value={data.heroTitle}
                      onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Révélez votre beauté naturelle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre (Hero)
                    </label>
                    <input
                      type="text"
                      value={data.heroSubtitle}
                      onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Des soins sur-mesure pour votre peau"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte "À propos"
                  </label>
                  <textarea
                    value={data.aboutText}
                    onChange={(e) => setData({ ...data, aboutText: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Présentez votre institut, votre équipe, vos valeurs..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logoUrl')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                    />
                    {data.logoUrl && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <img src={data.logoUrl} alt="Logo preview" className="h-16 object-contain mx-auto" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Format recommandé : PNG avec fond transparent (max 5MB)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image d'accueil
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e, 'heroImage')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                    />
                    {data.heroImage && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <img src={data.heroImage} alt="Hero preview" className="h-32 w-full object-cover rounded" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Image ou vidéo (max 20MB vidéo, 5MB image)
                    </p>
                  </div>
                </div>

                {/* Fondateur/Équipe */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Fondateur / Équipe (optionnel)
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={data.founderName}
                          onChange={(e) => setData({ ...data, founderName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Sophie Martin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre / Fonction
                        </label>
                        <input
                          type="text"
                          value={data.founderTitle}
                          onChange={(e) => setData({ ...data, founderTitle: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Fondatrice & Esthéticienne diplômée"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Citation / Message
                      </label>
                      <textarea
                        value={data.founderQuote}
                        onChange={(e) => setData({ ...data, founderQuote: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Votre passion pour la beauté naturelle, votre engagement..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Un message personnel qui apparaîtra sur votre page "À propos"
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo du fondateur/fondatrice
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'founderImage')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                      />
                      {data.founderImage && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <img src={data.founderImage} alt="Founder preview" className="h-32 w-32 object-cover rounded-full mx-auto" />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Photo professionnelle (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 : Contact, Localisation & Réseaux sociaux */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Coordonnées et présence en ligne
              </h2>
              <p className="text-gray-600 mb-6">
                Ces informations permettront à vos clients de vous contacter facilement
              </p>

              <div className="space-y-8">
                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📞</span>
                    Informations de contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contact *
                      </label>
                      <input
                        type="email"
                        value={data.contactEmail}
                        onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="contact@mon-institut.fr"
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
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    Adresse physique
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse complète
                      </label>
                      <input
                        type="text"
                        value={data.address}
                        onChange={(e) => setData({ ...data, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="12 rue de la Beauté"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code postal
                        </label>
                        <input
                          type="text"
                          value={data.postalCode}
                          onChange={(e) => setData({ ...data, postalCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="75001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ville
                        </label>
                        <input
                          type="text"
                          value={data.city}
                          onChange={(e) => setData({ ...data, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Paris"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pays
                        </label>
                        <input
                          type="text"
                          value={data.country}
                          onChange={(e) => setData({ ...data, country: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="France"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien Google Maps (optionnel)
                      </label>
                      <input
                        type="url"
                        value={data.googleMapsUrl}
                        onChange={(e) => setData({ ...data, googleMapsUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://maps.google.com/..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Copiez le lien de partage depuis Google Maps
                      </p>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🌐</span>
                    Réseaux sociaux (optionnel)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                          📘 Facebook
                        </span>
                      </label>
                      <input
                        type="url"
                        value={data.facebook}
                        onChange={(e) => setData({ ...data, facebook: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://facebook.com/votre-page"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                          📸 Instagram
                        </span>
                      </label>
                      <input
                        type="url"
                        value={data.instagram}
                        onChange={(e) => setData({ ...data, instagram: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://instagram.com/votre-compte"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                          🎵 TikTok
                        </span>
                      </label>
                      <input
                        type="url"
                        value={data.tiktok}
                        onChange={(e) => setData({ ...data, tiktok: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://tiktok.com/@votre-compte"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                          💬 WhatsApp
                        </span>
                      </label>
                      <input
                        type="text"
                        value={data.whatsapp}
                        onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="+33612345678"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Numéro au format international (sans espaces)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horaires */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⏰</span>
                    Horaires d'ouverture
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(dayNames).map(([key, day]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {day.label}
                        </label>
                        <input
                          type="text"
                          value={data[day.value as keyof OnboardingData] as string}
                          onChange={(e) => setData({ ...data, [day.value]: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="9h00 - 18h00 ou Fermé"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 5 : Informations légales, SEO et Finances */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informations légales et SEO
              </h2>
              <p className="text-gray-600 mb-6">
                Complétez les informations administratives et de référencement (optionnel mais recommandé)
              </p>

              <div className="space-y-8">
                {/* Informations entreprise */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏢</span>
                    Informations légales de l'entreprise
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom légal de l'entreprise
                      </label>
                      <input
                        type="text"
                        value={data.legalName}
                        onChange={(e) => setData({ ...data, legalName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="SARL Mon Institut"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SIRET
                        </label>
                        <input
                          type="text"
                          value={data.siret}
                          onChange={(e) => setData({ ...data, siret: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="123 456 789 00012"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SIREN
                        </label>
                        <input
                          type="text"
                          value={data.siren}
                          onChange={(e) => setData({ ...data, siren: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="123 456 789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de TVA
                        </label>
                        <input
                          type="text"
                          value={data.tvaNumber}
                          onChange={(e) => setData({ ...data, tvaNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="FR12 345678901"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code APE
                        </label>
                        <input
                          type="text"
                          value={data.apeCode}
                          onChange={(e) => setData({ ...data, apeCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="9602B"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          RCS
                        </label>
                        <input
                          type="text"
                          value={data.rcs}
                          onChange={(e) => setData({ ...data, rcs: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Paris B 123 456 789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capital social
                        </label>
                        <input
                          type="text"
                          value={data.capital}
                          onChange={(e) => setData({ ...data, capital: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="10000 EUR"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Forme juridique
                        </label>
                        <select
                          value={data.legalForm}
                          onChange={(e) => setData({ ...data, legalForm: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="SARL">SARL</option>
                          <option value="EURL">EURL</option>
                          <option value="SAS">SAS</option>
                          <option value="SASU">SASU</option>
                          <option value="EI">Entreprise Individuelle</option>
                          <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Représentant légal
                        </label>
                        <input
                          type="text"
                          value={data.legalRepName}
                          onChange={(e) => setData({ ...data, legalRepName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Sophie Martin"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du représentant
                      </label>
                      <input
                        type="text"
                        value={data.legalRepTitle}
                        onChange={(e) => setData({ ...data, legalRepTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Gérant(e)"
                      />
                    </div>
                  </div>
                </div>

                {/* Assurance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🛡️</span>
                    Assurance professionnelle
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compagnie d'assurance
                        </label>
                        <input
                          type="text"
                          value={data.insuranceCompany}
                          onChange={(e) => setData({ ...data, insuranceCompany: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="AXA, Allianz, MMA..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de contrat
                        </label>
                        <input
                          type="text"
                          value={data.insuranceContract}
                          onChange={(e) => setData({ ...data, insuranceContract: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="CONT123456"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse de l'assurance
                      </label>
                      <input
                        type="text"
                        value={data.insuranceAddress}
                        onChange={(e) => setData({ ...data, insuranceAddress: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="10 rue de l'Assurance, 75001 Paris"
                      />
                    </div>
                  </div>
                </div>

                {/* Coordonnées bancaires */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏦</span>
                    Coordonnées bancaires
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la banque
                      </label>
                      <input
                        type="text"
                        value={data.bankName}
                        onChange={(e) => setData({ ...data, bankName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="BNP Paribas, Crédit Mutuel..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN
                        </label>
                        <input
                          type="text"
                          value={data.bankIban}
                          onChange={(e) => setData({ ...data, bankIban: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="FR76 1234 5678 9012 3456 7890 123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BIC
                        </label>
                        <input
                          type="text"
                          value={data.bankBic}
                          onChange={(e) => setData({ ...data, bankBic: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="BNPAFRPPXXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO & Tracking */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    SEO & Tracking (optionnel)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre de la page (meta title)
                      </label>
                      <input
                        type="text"
                        value={data.defaultMetaTitle}
                        onChange={(e) => setData({ ...data, defaultMetaTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Institut de beauté à Paris | Mon Institut"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max 60 caractères - {data.defaultMetaTitle.length}/60
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (meta description)
                      </label>
                      <textarea
                        value={data.defaultMetaDescription}
                        onChange={(e) => setData({ ...data, defaultMetaDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Découvrez notre institut de beauté à Paris. Soins du visage, épilation, massages..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max 160 caractères - {data.defaultMetaDescription.length}/160
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mots-clés (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={data.defaultMetaKeywords}
                        onChange={(e) => setData({ ...data, defaultMetaKeywords: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="institut beauté, soins visage, épilation, Paris"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          value={data.googleAnalyticsId}
                          onChange={(e) => setData({ ...data, googleAnalyticsId: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook Pixel ID
                        </label>
                        <input
                          type="text"
                          value={data.facebookPixelId}
                          onChange={(e) => setData({ ...data, facebookPixelId: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="123456789012345"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code de vérification Google
                        </label>
                        <input
                          type="text"
                          value={data.googleVerificationCode}
                          onChange={(e) => setData({ ...data, googleVerificationCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="google-site-verification=..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code de vérification Meta
                        </label>
                        <input
                          type="text"
                          value={data.metaVerificationCode}
                          onChange={(e) => setData({ ...data, metaVerificationCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="facebook-domain-verification=..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleCompleteOnboarding}
                    disabled={saving}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition disabled:opacity-50"
                  >
                    {saving ? 'Chargement...' : 'Accéder à mon espace admin 🚀'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>

              <button
                onClick={currentStep === 4 ? handleSaveAndContinue : handleNext}
                disabled={saving || (currentStep === 3 && !data.siteName) || (currentStep === 4 && (!data.contactEmail || !data.phone))}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Enregistrement...' : currentStep === 4 ? 'Enregistrer et continuer' : 'Suivant'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Colonne Droite - Preview Live (cachée sur mobile, visible sur desktop) */}
      <div className="hidden md:block md:w-1/2 bg-gray-900 sticky top-0 h-screen overflow-hidden">
        <LiveTemplatePreview
          templateId={data.selectedTemplate}
          organizationName={data.siteName}
          description={data.siteDescription}
          siteTagline={data.siteTagline}
          primaryColor={data.primaryColor}
          secondaryColor={data.secondaryColor}
          accentColor={data.accentColor}
          logoUrl={data.logoUrl}
          heroImage={data.heroImage}
          heroTitle={data.heroTitle}
          heroSubtitle={data.heroSubtitle}
          aboutText={data.aboutText}
          founderName={data.founderName}
          founderTitle={data.founderTitle}
          founderQuote={data.founderQuote}
          founderImage={data.founderImage}
          phone={data.phone}
          email={data.contactEmail}
          contactEmail={data.contactEmail}
          address={data.address}
          city={data.city}
          postalCode={data.postalCode}
          country={data.country}
          facebook={data.facebook}
          instagram={data.instagram}
          tiktok={data.tiktok}
          whatsapp={data.whatsapp}
          googleMapsUrl={data.googleMapsUrl}
        />
      </div>
    </div>
  );
}
