'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, Palette, FileText, Settings } from 'lucide-react';
import { websiteTemplates } from '@/lib/website-templates';

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

  // Réseaux sociaux
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  showQRCodesSection: boolean;
  showGallerySection: boolean;
}

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
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
    instagram: '',
    facebook: '',
    tiktok: '',
    whatsapp: '',
    showQRCodesSection: true,
    showGallerySection: false
  });
  const [saving, setSaving] = useState(false);

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
          instagram: config.instagram || '',
          facebook: config.facebook || '',
          tiktok: config.tiktok || '',
          whatsapp: config.whatsapp || '',
          showQRCodesSection: config.showQRCodesSection !== false,
          showGallerySection: config.showGallerySection || false
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
      // Sauvegarder la configuration
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
          instagram: data.instagram,
          facebook: data.facebook,
          tiktok: data.tiktok,
          whatsapp: data.whatsapp,
          showQRCodesSection: data.showQRCodesSection,
          showGallerySection: data.showGallerySection
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
    { number: 3, title: 'Textes & Photos', icon: FileText, completed: currentStep > 3 },
    { number: 4, title: 'Réseaux sociaux', icon: Settings, completed: currentStep > 4 },
    { number: 5, title: 'Terminé', icon: Check, completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Configuration de votre site</span>
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
                      Logo (URL)
                    </label>
                    <input
                      type="url"
                      value={data.logoUrl}
                      onChange={(e) => setData({ ...data, logoUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uploadez votre logo sur un service comme Imgur ou utilisez votre propre URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image principale (URL)
                    </label>
                    <input
                      type="url"
                      value={data.heroImage}
                      onChange={(e) => setData({ ...data, heroImage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/hero.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image principale de votre page d'accueil
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 : Réseaux sociaux */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Réseaux sociaux
              </h2>
              <p className="text-gray-600 mb-6">
                Connectez vos réseaux sociaux pour afficher des QR codes sur votre site
              </p>

              <div className="space-y-6">
                {/* Liens réseaux sociaux */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram (URL complète)
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
                      Facebook (URL complète)
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
                      TikTok (URL complète)
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
                      WhatsApp (numéro avec indicatif)
                    </label>
                    <input
                      type="tel"
                      value={data.whatsapp}
                      onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="+33612345678"
                    />
                  </div>
                </div>

                {/* Options d'affichage */}
                <div className="mt-6 p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-4">Affichage sur le site vitrine</h3>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.showQRCodesSection}
                        onChange={(e) => setData({ ...data, showQRCodesSection: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Afficher la section QR Codes</p>
                        <p className="text-sm text-gray-600">Vos clients pourront scanner les QR codes pour vous suivre</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.showGallerySection}
                        onChange={(e) => setData({ ...data, showGallerySection: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Afficher la galerie photos</p>
                        <p className="text-sm text-gray-600">Galerie de vos réalisations et prestations</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Astuce :</strong> Vous pourrez compléter tous ces paramètres plus tard dans "Configuration du site" → "Réseaux sociaux"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 5 : Configuration terminée */}
          {currentStep === 5 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Configuration de base terminée ! 🎉
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Votre site est maintenant configuré avec les éléments essentiels.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto mb-8">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 justify-center">
                  <Settings className="w-5 h-5" />
                  <span>Que faire ensuite ?</span>
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 text-left">
                  <li>✅ Votre template : <strong>{websiteTemplates.find(t => t.id === data.selectedTemplate)?.name}</strong></li>
                  <li>✅ Vos couleurs sont configurées</li>
                  <li>✅ Vos textes sont enregistrés</li>
                  <li className="mt-4 pt-4 border-t border-blue-200">
                    📝 Vous pouvez maintenant accéder à la <strong>configuration détaillée</strong> pour :
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• Ajouter vos horaires d'ouverture</li>
                      <li>• Configurer vos réseaux sociaux</li>
                      <li>• Compléter vos informations légales</li>
                      <li>• Ajouter vos services</li>
                      <li>• Et bien plus encore...</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleCompleteOnboarding}
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition disabled:opacity-50"
              >
                {saving ? 'Chargement...' : 'Accéder à mon espace admin 🚀'}
              </button>
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
                disabled={saving || (currentStep === 3 && !data.siteName)}
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
  );
}
