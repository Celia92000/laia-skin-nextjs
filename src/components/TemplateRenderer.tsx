import dynamic from 'next/dynamic';

// Import dynamique des templates pour optimiser le chargement
const TemplateModern = dynamic(() => import('@/components/templates/TemplateModern'));
const TemplateClassic = dynamic(() => import('@/components/templates/TemplateClassic'));
const TemplateMinimal = dynamic(() => import('@/components/templates/TemplateMinimal'));
const TemplateElegance = dynamic(() => import('@/components/templates/TemplateElegance'));
const TemplateZen = dynamic(() => import('@/components/templates/TemplateZen'));
const TemplateFresh = dynamic(() => import('@/components/templates/TemplateFresh'));
const TemplateBoutique = dynamic(() => import('@/components/templates/TemplateBoutique'));
const TemplateProfessional = dynamic(() => import('@/components/templates/TemplateProfessional'));
const TemplateLuxe = dynamic(() => import('@/components/templates/TemplateLuxe'));
const TemplateLaia = dynamic(() => import('@/components/templates/TemplateLaia'));
const TemplateMedical = dynamic(() => import('@/components/templates/TemplateMedical'));
const TemplateSpaLuxe = dynamic(() => import('@/components/templates/TemplateSpaLuxe'));
const TemplateLaserTech = dynamic(() => import('@/components/templates/TemplateLaserTech'));

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

  // Parse business hours if available
  let parsedBusinessHours = null;
  if (config.businessHours) {
    try {
      parsedBusinessHours = typeof config.businessHours === 'string'
        ? JSON.parse(config.businessHours)
        : config.businessHours;
    } catch (e) {
      console.error('Error parsing business hours:', e);
    }
  }

  // Parse footer config if available
  let parsedFooterConfig = null;
  if (config.footerConfig) {
    try {
      parsedFooterConfig = typeof config.footerConfig === 'string'
        ? JSON.parse(config.footerConfig)
        : config.footerConfig;
    } catch (e) {
      console.error('Error parsing footer config:', e);
    }
  }

  // Préparer les données dans le format TemplateData - VERSION COMPLÈTE (70+ champs)
  const templateData = {
    organization: {
      // Identité de base
      name: organization.name,
      slug: organization.slug,
      description: config.siteDescription || config.siteTagline || organization.name,

      // Couleurs (critiques pour personnalisation)
      primaryColor: config.primaryColor || '#d4b5a0',
      secondaryColor: config.secondaryColor || '#c9a084',
      accentColor: config.accentColor || '#2c3e50',

      // Images (critiques - logo, hero, favicon, fondateur)
      logoUrl: config.logoUrl,
      heroImage: config.heroImage,
      heroVideo: config.heroVideo,
      faviconUrl: config.faviconUrl,
      founderImage: config.founderImage,

      // Contact & Localisation (critiques)
      email: config.contactEmail || config.email,
      contactEmail: config.contactEmail || config.email,
      phone: config.phone,
      address: config.address,
      city: config.city,
      postalCode: config.postalCode,
      country: config.country || 'France',
      googleMapsUrl: config.googleMapsUrl,
      latitude: config.latitude,
      longitude: config.longitude,

      // Réseaux sociaux (importants)
      facebook: config.facebook,
      instagram: config.instagram,
      tiktok: config.tiktok,
      whatsapp: config.whatsapp,
      linkedin: config.linkedin,
      youtube: config.youtube,

      // Horaires d'ouverture (critiques)
      businessHours: parsedBusinessHours,

      // Fondateur (important pour storytelling)
      founderName: config.founderName,
      founderTitle: config.founderTitle,
      founderQuote: config.founderQuote,

      // Contenu enrichi
      aboutText: config.aboutText,
      aboutIntro: config.aboutIntro,
      aboutParcours: config.aboutParcours,

      // Footer & Légal (importants)
      footerConfig: parsedFooterConfig,
      termsAndConditions: config.termsAndConditions,
      privacyPolicy: config.privacyPolicy,
      legalNotice: config.legalNotice,

      // Informations légales (obligatoires)
      siret: config.siret,
      siren: config.siren,
      tvaNumber: config.tvaNumber,
      apeCode: config.apeCode,
      rcs: config.rcs,
      capital: config.capital,
      legalForm: config.legalForm,
      legalRepName: config.legalRepName,
      legalRepTitle: config.legalRepTitle,

      // Assurance & Banque
      insuranceCompany: config.insuranceCompany,
      insuranceContract: config.insuranceContract,
      insuranceAddress: config.insuranceAddress,
      bankName: config.bankName,
      bankIban: config.bankIban,
      bankBic: config.bankBic,

      // SEO (critiques pour visibilité)
      metaTitle: config.defaultMetaTitle,
      metaDescription: config.defaultMetaDescription,
      metaKeywords: config.defaultMetaKeywords,

      // Analytics
      googleAnalyticsId: config.googleAnalyticsId,
      facebookPixelId: config.facebookPixelId,
      googleVerificationCode: config.googleVerificationCode,
      metaVerificationCode: config.metaVerificationCode,

      // Google My Business
      googlePlaceId: config.googlePlaceId,
      googleBusinessUrl: config.googleBusinessUrl,
      googleApiKey: config.googleApiKey,

      // Apparence avancée
      fontFamily: config.fontFamily,
      headingFont: config.headingFont,
      baseFontSize: config.baseFontSize,
      headingSize: config.headingSize,

      // Communication
      emailSignature: config.emailSignature,
      welcomeEmailText: config.welcomeEmailText,
      crispWebsiteId: config.crispWebsiteId,
      crispEnabled: config.crispEnabled,

      // Template
      websiteTemplate: config.websiteTemplate,
      homeTemplate: config.homeTemplate,
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
      heroSubtitle: config.heroSubtitle || 'une beauté révélée',
      siteTagline: config.siteTagline || 'Institut de Beauté',
      businessHours: parsedBusinessHours,
      footerConfig: parsedFooterConfig
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
    case 'laia':
    case 'laia-skin':
      return <TemplateLaia {...modernStyleProps} />;
    case 'medical':
      return <TemplateMedical data={templateData} />;
    case 'spa-luxe':
    case 'spaluxe':
      return <TemplateSpaLuxe data={templateData} />;
    case 'laser-tech':
    case 'lasertech':
      return <TemplateLaserTech data={templateData} />;
    default:
      // Par défaut, utiliser le template Modern
      return <TemplateModern {...modernStyleProps} />;
  }
}
