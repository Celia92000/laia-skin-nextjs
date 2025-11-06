import dynamic from 'next/dynamic';

// Import dynamique des templates pour optimiser le chargement
const TemplateModern = dynamic(() => import('@/components/templates/TemplateModern'));
const TemplateClassic = dynamic(() => import('@/components/templates/ClassicTemplate'));
const TemplateMinimal = dynamic(() => import('@/components/templates/MinimalTemplate'));
const TemplateElegance = dynamic(() => import('@/components/templates/TemplateElegance'));
const TemplateZen = dynamic(() => import('@/components/templates/TemplateZen'));
const TemplateFresh = dynamic(() => import('@/components/templates/TemplateFresh'));
const TemplateBoutique = dynamic(() => import('@/components/templates/TemplateBoutique'));
const TemplateProfessional = dynamic(() => import('@/components/templates/TemplateProfessional'));
const TemplateLuxe = dynamic(() => import('@/components/templates/TemplateLuxe'));
const TemplateMedical = dynamic(() => import('@/components/templates/TemplateMedical'));

interface TemplateRendererProps {
  templateId: string;
  organization: any;
  services: any[];
  config: any;
  testimonials?: any[];
}

/**
 * Composant qui charge dynamiquement le bon template selon le templateId
 */
export function TemplateRenderer({
  templateId,
  organization,
  services,
  config,
  testimonials = []
}: TemplateRendererProps) {

  // Préparer les données dans le format TemplateData
  const templateData = {
    organization: {
      name: organization.name,
      primaryColor: config.primaryColor || '#d4b5a0',
      secondaryColor: config.secondaryColor || '#c9a084',
      accentColor: config.accentColor || '#2c3e50'
    },
    services: services.map(service => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      price: service.price,
      promoPrice: service.promoPrice,
      duration: service.duration,
      description: service.description || service.shortDescription,
      mainImage: service.mainImage,
      featured: service.featured,
      order: service.order
    })),
    config: {
      ...config,
      heroTitle: config.heroTitle || 'Une peau respectée,',
      heroSubtitle: config.heroSubtitle || 'une beauté révélée'
    },
    testimonials: testimonials || []
  };

  // Props pour les templates style TemplateModern (props directes)
  const modernStyleProps = {
    organization: templateData.organization,
    services: templateData.services,
    team: [],
    content: {
      hero: {
        title: config.heroTitle || 'Révélez Votre Beauté',
        description: config.siteDescription || config.siteTagline,
        ctaPrimary: 'Réserver'
      },
      services: {
        title: 'Nos Services',
        description: 'Des soins innovants pour votre beauté'
      },
      team: {
        title: 'Notre Équipe',
        description: 'Des experts à votre service'
      },
      cta: {
        title: 'Prêt à découvrir ?',
        description: 'Réservez votre soin',
        button: 'Réserver'
      },
      footer: {
        tagline: config.siteTagline || 'Institut de Beauté'
      }
    }
  };

  // Switch selon le templateId
  switch (templateId?.toLowerCase()) {
    case 'modern':
      return <TemplateModern {...modernStyleProps} />;
    case 'classic':
      return <TemplateClassic data={templateData} />;
    case 'minimal':
      return <TemplateMinimal data={templateData} />;
    case 'elegance':
      return <TemplateElegance data={templateData} />;
    case 'zen':
      return <TemplateZen data={templateData} />;
    case 'fresh':
      return <TemplateFresh data={templateData} />;
    case 'boutique':
      return <TemplateBoutique data={templateData} />;
    case 'professional':
      return <TemplateProfessional data={templateData} />;
    case 'luxe':
      return <TemplateLuxe data={templateData} />;
    case 'medical':
      return <TemplateMedical data={templateData} />;
    default:
      // Par défaut, utiliser le template Modern
      return <TemplateModern {...modernStyleProps} />;
  }
}
