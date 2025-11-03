// Interface commune pour le contenu personnalisable des templates
export interface BaseTemplateContent {
  hero: {
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  services: {
    title: string;
    description?: string;
  };
  features?: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  team?: {
    title: string;
    description?: string;
  };
  testimonials?: {
    title: string;
    items: Array<{
      name: string;
      rating: number;
      text: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
    secondaryButton?: string;
    note?: string;
  };
  footer: {
    tagline?: string;
    contact?: {
      phone?: string;
      email?: string;
      address?: string;
    };
    hours?: string;
  };
}
