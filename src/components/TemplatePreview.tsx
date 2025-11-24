'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import templates to avoid SSR issues
const TemplateBoutique = dynamic(() => import('./templates/TemplateBoutique'), { ssr: false });
const TemplateClassic = dynamic(() => import('./templates/TemplateClassic'), { ssr: false });
const TemplateElegance = dynamic(() => import('./templates/TemplateElegance'), { ssr: false });
const TemplateFresh = dynamic(() => import('./templates/TemplateFresh'), { ssr: false });
const TemplateLaia = dynamic(() => import('./templates/TemplateLaia'), { ssr: false });
const TemplateLaserTech = dynamic(() => import('./templates/TemplateLaserTech'), { ssr: false });
const TemplateLuxe = dynamic(() => import('./templates/TemplateLuxe'), { ssr: false });
const TemplateMedical = dynamic(() => import('./templates/TemplateMedical'), { ssr: false });
const TemplateMinimal = dynamic(() => import('./templates/TemplateMinimal'), { ssr: false });
const TemplateModern = dynamic(() => import('./templates/TemplateModern'), { ssr: false });
const TemplateProfessional = dynamic(() => import('./templates/TemplateProfessional'), { ssr: false });
const TemplateSpaLuxe = dynamic(() => import('./templates/TemplateSpaLuxe'), { ssr: false });
const TemplateZen = dynamic(() => import('./templates/TemplateZen'), { ssr: false });

interface TemplatePreviewProps {
  onPurchase?: (config: PreviewConfig) => void;
}

interface PreviewConfig {
  templateId: string;
  organizationName: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  heroImage?: string;
  heroVideo?: string;
  heroTitle?: string;
  heroDescription?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface TemplateInfo {
  id: string;
  name: string;
  tier: 'SOLO' | 'PREMIUM';
  component: any;
  thumbnail: string;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'laia',
    name: 'LAIA',
    tier: 'PREMIUM',
    component: TemplateLaia,
    thumbnail: '/templates/laia-thumb.jpg',
    defaultColors: { primary: '#d4a574', secondary: '#f5e6d3', accent: '#f7d7d7' }
  },
  {
    id: 'modern',
    name: 'Modern',
    tier: 'PREMIUM',
    component: TemplateModern,
    thumbnail: '/templates/modern-thumb.jpg',
    defaultColors: { primary: '#00f5ff', secondary: '#ff00ff', accent: '#00ff88' }
  },
  {
    id: 'luxe',
    name: 'Luxe',
    tier: 'PREMIUM',
    component: TemplateLuxe,
    thumbnail: '/templates/luxe-thumb.jpg',
    defaultColors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#ffffff' }
  },
  {
    id: 'elegance',
    name: 'Elegance',
    tier: 'PREMIUM',
    component: TemplateElegance,
    thumbnail: '/templates/elegance-thumb.jpg',
    defaultColors: { primary: '#8b7355', secondary: '#f5f0e8', accent: '#d4c4b0' }
  },
  {
    id: 'spaluxe',
    name: 'Spa Luxe',
    tier: 'PREMIUM',
    component: TemplateSpaLuxe,
    thumbnail: '/templates/spaluxe-thumb.jpg',
    defaultColors: { primary: '#2c5f5d', secondary: '#e8f4f3', accent: '#b8d4d3' }
  },
  {
    id: 'medical',
    name: 'Medical',
    tier: 'PREMIUM',
    component: TemplateMedical,
    thumbnail: '/templates/medical-thumb.jpg',
    defaultColors: { primary: '#0066cc', secondary: '#e6f2ff', accent: '#99c2ff' }
  },
  {
    id: 'lasertech',
    name: 'Laser Tech',
    tier: 'PREMIUM',
    component: TemplateLaserTech,
    thumbnail: '/templates/lasertech-thumb.jpg',
    defaultColors: { primary: '#00ffcc', secondary: '#1a1a2e', accent: '#ff006e' }
  },
  {
    id: 'professional',
    name: 'Professional',
    tier: 'SOLO',
    component: TemplateProfessional,
    thumbnail: '/templates/professional-thumb.jpg',
    defaultColors: { primary: '#2c3e50', secondary: '#ecf0f1', accent: '#3498db' }
  },
  {
    id: 'classic',
    name: 'Classic',
    tier: 'SOLO',
    component: TemplateClassic,
    thumbnail: '/templates/classic-thumb.jpg',
    defaultColors: { primary: '#c19a6b', secondary: '#f4e8d8', accent: '#8b6f47' }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tier: 'SOLO',
    component: TemplateMinimal,
    thumbnail: '/templates/minimal-thumb.jpg',
    defaultColors: { primary: '#000000', secondary: '#ffffff', accent: '#666666' }
  },
  {
    id: 'fresh',
    name: 'Fresh',
    tier: 'SOLO',
    component: TemplateFresh,
    thumbnail: '/templates/fresh-thumb.jpg',
    defaultColors: { primary: '#4ecca3', secondary: '#f8f9fa', accent: '#7bed9f' }
  },
  {
    id: 'zen',
    name: 'Zen',
    tier: 'SOLO',
    component: TemplateZen,
    thumbnail: '/templates/zen-thumb.jpg',
    defaultColors: { primary: '#8db596', secondary: '#f5f5f0', accent: '#c4d7b2' }
  },
  {
    id: 'boutique',
    name: 'Boutique',
    tier: 'SOLO',
    component: TemplateBoutique,
    thumbnail: '/templates/boutique-thumb.jpg',
    defaultColors: { primary: '#e91e63', secondary: '#fce4ec', accent: '#f48fb1' }
  }
];

// Mock services data
const MOCK_SERVICES = [
  { id: '1', name: 'Soin du Visage', price: 65, duration: 60, description: 'Soin professionnel adapté à votre type de peau' },
  { id: '2', name: 'Massage Relaxant', price: 75, duration: 75, description: 'Massage complet du corps pour une relaxation totale' },
  { id: '3', name: 'Épilation Complète', price: 85, duration: 90, description: 'Épilation douce et durable pour une peau parfaite' },
  { id: '4', name: 'Manucure & Pédicure', price: 55, duration: 60, description: 'Soins des mains et des pieds avec vernis de qualité' },
  { id: '5', name: 'Extension de Cils', price: 120, duration: 120, description: 'Extensions individuelles pour un regard magnifique' },
  { id: '6', name: 'Soin Anti-Âge', price: 95, duration: 75, description: 'Traitement avancé pour réduire les signes du vieillissement' }
];

const MOCK_TEAM = [
  { id: '1', name: 'Sophie Martin', role: 'Fondatrice & Esthéticienne', imageUrl: '' },
  { id: '2', name: 'Julie Dupont', role: 'Esthéticienne Senior', imageUrl: '' },
  { id: '3', name: 'Emma Petit', role: 'Spécialiste Soins', imageUrl: '' },
  { id: '4', name: 'Laura Bernard', role: 'Maquilleuse Pro', imageUrl: '' }
];

export default function TemplatePreview({ onPurchase }: TemplatePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(TEMPLATES[0]);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [config, setConfig] = useState<PreviewConfig>({
    templateId: TEMPLATES[0].id,
    organizationName: 'Mon Institut de Beauté',
    description: 'Votre institut de beauté premium',
    primaryColor: TEMPLATES[0].defaultColors.primary,
    secondaryColor: TEMPLATES[0].defaultColors.secondary,
    accentColor: TEMPLATES[0].defaultColors.accent,
    logoUrl: '',
    heroImage: '',
    heroVideo: '',
    heroTitle: '',
    heroDescription: '',
    phone: '',
    email: '',
    address: ''
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const heroVideoInputRef = useRef<HTMLInputElement>(null);

  // Update template when selection changes
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      templateId: selectedTemplate.id,
      primaryColor: selectedTemplate.defaultColors.primary,
      secondaryColor: selectedTemplate.defaultColors.secondary,
      accentColor: selectedTemplate.defaultColors.accent
    }));
  }, [selectedTemplate]);

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'heroImage' | 'heroVideo'
  ) => {
    if (!file) return;

    // Validate file size
    const maxSize = type === 'heroVideo' ? 20 * 1024 * 1024 : type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Le fichier est trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    const validTypes = {
      logo: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      heroImage: ['image/jpeg', 'image/png', 'image/webp'],
      heroVideo: ['video/mp4', 'video/webm']
    };

    if (!validTypes[type].includes(file.type)) {
      alert(`Type de fichier invalide. Types acceptés: ${validTypes[type].join(', ')}`);
      return;
    }

    // Create temporary URL for instant preview
    const tempUrl = URL.createObjectURL(file);
    setConfig(prev => ({
      ...prev,
      [`${type}Url`]: tempUrl,
      [type]: tempUrl
    }));
  };

  const handleReset = () => {
    setConfig({
      templateId: selectedTemplate.id,
      organizationName: 'Mon Institut de Beauté',
      description: 'Votre institut de beauté premium',
      primaryColor: selectedTemplate.defaultColors.primary,
      secondaryColor: selectedTemplate.defaultColors.secondary,
      accentColor: selectedTemplate.defaultColors.accent,
      logoUrl: '',
      heroImage: '',
      heroVideo: '',
      heroTitle: '',
      heroDescription: '',
      phone: '',
      email: '',
      address: ''
    });

    // Clear file inputs
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (heroImageInputRef.current) heroImageInputRef.current.value = '';
    if (heroVideoInputRef.current) heroVideoInputRef.current.value = '';
  };

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(config);
    }
  };

  const TemplateComponent = selectedTemplate.component;

  // Create organization object for template
  const organizationData = {
    name: config.organizationName,
    description: config.description,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    logoUrl: config.logoUrl,
    heroImage: config.heroImage,
    heroVideo: config.heroVideo,
    phone: config.phone,
    email: config.email,
    address: config.address,
    city: 'Paris',
    postalCode: '75001',
    founderName: 'Sophie Martin',
    founderTitle: 'Fondatrice',
    founderQuote: 'La beauté est un art, votre satisfaction est ma passion',
    founderImage: '',
    businessHours: {
      lundi: '9h-19h',
      mardi: '9h-19h',
      mercredi: '9h-19h',
      jeudi: '9h-19h',
      vendredi: '9h-19h',
      samedi: '10h-18h',
      dimanche: 'Fermé'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* CONTROL PANEL - Left 30% */}
        <div className="lg:w-[30%] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <h1 className="text-2xl font-bold text-gray-900">Prévisualisateur de Templates</h1>
            <p className="text-sm text-gray-600 mt-1">Personnalisez votre template en temps réel</p>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Template Selection */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Sélection du Template</h2>
              <div className="space-y-2">
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const template = TEMPLATES.find(t => t.id === e.target.value);
                    if (template) setSelectedTemplate(template);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TEMPLATES.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.tier})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded font-semibold ${
                    selectedTemplate.tier === 'PREMIUM'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedTemplate.tier}
                  </span>
                  <span className="text-gray-600">{selectedTemplate.name}</span>
                </div>
              </div>
            </section>

            {/* 2. Colors */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Couleurs</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur Principale
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur Secondaire
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.secondaryColor}
                      onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur d'Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#666666"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConfig({
                      ...config,
                      primaryColor: selectedTemplate.defaultColors.primary,
                      secondaryColor: selectedTemplate.defaultColors.secondary,
                      accentColor: selectedTemplate.defaultColors.accent
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Réinitialiser les couleurs par défaut
                </button>
              </div>
            </section>

            {/* 3. Branding */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Identité de Marque</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'Organisation
                  </label>
                  <input
                    type="text"
                    value={config.organizationName}
                    onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mon Institut de Beauté"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description / Tagline
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Votre institut de beauté premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo (max 2MB)
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {config.logoUrl && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <div className="relative w-32 h-16">
                        <Image
                          src={config.logoUrl}
                          alt="Logo preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setConfig({ ...config, logoUrl: '' });
                          if (logoInputRef.current) logoInputRef.current.value = '';
                        }}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 4. Hero Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Section Hero</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre Hero
                  </label>
                  <input
                    type="text"
                    value={config.heroTitle}
                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Laisser vide pour utiliser le titre par défaut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description Hero
                  </label>
                  <textarea
                    value={config.heroDescription}
                    onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Laisser vide pour utiliser la description par défaut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Hero (max 5MB)
                  </label>
                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'heroImage');
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {config.heroImage && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <div className="relative w-full h-24">
                        <Image
                          src={config.heroImage}
                          alt="Hero preview"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setConfig({ ...config, heroImage: '' });
                          if (heroImageInputRef.current) heroImageInputRef.current.value = '';
                        }}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vidéo Hero (max 20MB, mp4/webm)
                  </label>
                  <input
                    ref={heroVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'heroVideo');
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {config.heroVideo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <video
                        src={config.heroVideo}
                        className="w-full h-24 object-cover rounded"
                        muted
                      />
                      <button
                        onClick={() => {
                          setConfig({ ...config, heroVideo: '' });
                          if (heroVideoInputRef.current) heroVideoInputRef.current.value = '';
                        }}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 5. Contact Info */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Informations de Contact</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@institut.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="123 Rue de la Beauté, 75001 Paris"
                  />
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <section className="pt-6 border-t border-gray-200 space-y-3">
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={handlePurchase}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Commander ce design
              </button>
            </section>
          </div>
        </div>

        {/* PREVIEW AREA - Right 70% */}
        <div className="lg:w-[70%] bg-gray-100 overflow-hidden">
          {/* Preview Controls */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Aperçu:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    deviceView === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    deviceView === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedTemplate.name}</span> - <span className="text-gray-500">{selectedTemplate.tier}</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="h-[calc(100vh-60px)] overflow-y-auto bg-gray-200 p-6">
            <div
              className={`mx-auto bg-white shadow-2xl transition-all duration-300 ${
                deviceView === 'mobile'
                  ? 'max-w-[375px]'
                  : 'w-full'
              }`}
              style={{
                transform: deviceView === 'mobile' ? 'scale(0.9)' : 'scale(1)',
                transformOrigin: 'top center'
              }}
            >
              <TemplateComponent
                organization={organizationData}
                services={MOCK_SERVICES}
                team={MOCK_TEAM}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
