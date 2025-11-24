'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

// Import dynamique de tous les templates
const TemplateModern = dynamic(() => import('@/components/templates/TemplateModern'));
const TemplateClassic = dynamic(() => import('@/components/templates/TemplateClassic'));
const TemplateMinimal = dynamic(() => import('@/components/templates/TemplateMinimal'));
const TemplateProfessional = dynamic(() => import('@/components/templates/TemplateProfessional'));
const TemplateBoutique = dynamic(() => import('@/components/templates/TemplateBoutique'));
const TemplateFresh = dynamic(() => import('@/components/templates/TemplateFresh'));
const TemplateLaia = dynamic(() => import('@/components/templates/TemplateLaia'));
const TemplateZen = dynamic(() => import('@/components/templates/TemplateZen'));
const TemplateLuxe = dynamic(() => import('@/components/templates/TemplateLuxe'));
const TemplateElegance = dynamic(() => import('@/components/templates/TemplateElegance'));
const TemplateMedical = dynamic(() => import('@/components/templates/TemplateMedical'));
const TemplateSpaLuxe = dynamic(() => import('@/components/templates/TemplateSpaLuxe'));
const TemplateLaserTech = dynamic(() => import('@/components/templates/TemplateLaserTech'));

interface LiveTemplatePreviewProps {
  templateId: string;
  organizationName: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
  heroImage?: string;
  heroVideo?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  siteTagline?: string;
  aboutText?: string;
  founderName?: string;
  founderTitle?: string;
  founderQuote?: string;
  founderImage?: string;
  phone?: string;
  email?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  googleMapsUrl?: string;
}

export default function LiveTemplatePreview(props: LiveTemplatePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  // Mock data pour la preview
  const mockData = {
    organization: {
      name: props.organizationName || 'Votre Institut',
      description: props.description || props.siteTagline || 'Votre institut de beauté',
      primaryColor: props.primaryColor,
      secondaryColor: props.secondaryColor,
      accentColor: props.accentColor,
      logoUrl: props.logoUrl,
      heroImage: props.heroImage,
      heroVideo: props.heroVideo,
      phone: props.phone,
      email: props.contactEmail || props.email,
      contactEmail: props.contactEmail || props.email,
      address: props.address,
      city: props.city,
      postalCode: props.postalCode,
      country: props.country,
      facebook: props.facebook,
      instagram: props.instagram,
      tiktok: props.tiktok,
      whatsapp: props.whatsapp,
      googleMapsUrl: props.googleMapsUrl,
      founderName: props.founderName,
      founderTitle: props.founderTitle,
      founderQuote: props.founderQuote,
      founderImage: props.founderImage,
    },
    services: [
      {
        id: '1',
        name: 'Soin Visage Éclat',
        price: 75,
        duration: 60,
        description: 'Un soin complet pour retrouver l\'éclat de votre peau'
      },
      {
        id: '2',
        name: 'Épilation Classique',
        price: 45,
        duration: 30,
        description: 'Épilation professionnelle douce et efficace'
      },
      {
        id: '3',
        name: 'Massage Relaxant',
        price: 90,
        duration: 60,
        description: 'Massage complet pour une détente absolue'
      },
      {
        id: '4',
        name: 'Manucure Premium',
        price: 55,
        duration: 45,
        description: 'Des mains sublimées avec nos techniques expertes'
      },
    ],
    team: [],
    content: {
      hero: {
        title: props.heroTitle || 'Révélez votre beauté',
        description: props.heroSubtitle || 'Découvrez nos soins sur-mesure',
        ctaPrimary: 'Réserver'
      },
      services: {
        title: 'Nos Services',
        description: 'Des soins d\'exception pour votre bien-être'
      },
      team: {
        title: 'Notre Équipe',
        description: 'Des experts passionnés à votre service'
      },
      cta: {
        title: 'Prêt à vous offrir un moment de détente ?',
        description: 'Réservez dès maintenant votre prochain rendez-vous',
        button: 'Prendre rendez-vous'
      },
      footer: {
        tagline: props.siteTagline || 'Votre beauté, notre passion'
      }
    }
  };

  // Sélectionner le bon template
  const renderTemplate = () => {
    const TemplateComponent = {
      modern: TemplateModern,
      classic: TemplateClassic,
      minimal: TemplateMinimal,
      professional: TemplateProfessional,
      boutique: TemplateBoutique,
      fresh: TemplateFresh,
      laia: TemplateLaia,
      zen: TemplateZen,
      luxe: TemplateLuxe,
      elegance: TemplateElegance,
      medical: TemplateMedical,
      'spa-luxe': TemplateSpaLuxe,
      'laser-tech': TemplateLaserTech,
    }[props.templateId] || TemplateModern;

    return <TemplateComponent {...mockData} />;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header - Toggle Device + Label */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h3 className="text-white font-semibold">Aperçu en temps réel</h3>
          <p className="text-gray-400 text-sm">Vos modifications apparaissent instantanément</p>
        </div>

        {/* Device Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-2 rounded transition ${
              deviceMode === 'desktop'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title="Vue Desktop"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-2 rounded transition ${
              deviceMode === 'mobile'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title="Vue Mobile"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-white">
        <div
          className={`transition-all duration-300 mx-auto ${
            deviceMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
          }`}
          style={{
            transform: deviceMode === 'mobile' ? 'scale(0.8)' : 'scale(1)',
            transformOrigin: 'top center'
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
