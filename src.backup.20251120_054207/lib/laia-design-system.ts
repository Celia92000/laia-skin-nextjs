/**
 * LAIA Design System - Modèle centralisé
 * 
 * Ce fichier définit le design system LAIA qui s'applique à TOUS les sites.
 * Les clients peuvent personnaliser les couleurs via OrganizationConfig,
 * mais la structure et les composants restent identiques.
 * 
 * Version actuelle du template : 1.0.0
 */

export const LAIA_TEMPLATE_VERSION = "1.0.0"

/**
 * Couleurs par défaut LAIA (utilisées si l'organisation n'a pas défini les siennes)
 */
export const DEFAULT_COLORS = {
  primary: '#d4b5a0',      // Rose gold
  secondary: '#2c3e50',    // Bleu foncé
  accent: '#20b2aa',       // Turquoise
  nude: '#f5e6d3',         // Nude clair
  rose: '#e8b4b8',         // Rose poudré
  dark: '#2c1810',         // Brun très foncé
  cream: '#faf7f3',        // Crème
}

/**
 * Typographie par défaut
 */
export const DEFAULT_FONTS = {
  body: 'Inter, system-ui, sans-serif',
  heading: 'Playfair Display, Georgia, serif',
  baseFontSize: '16px',
  headingSize: '2.5rem'
}

/**
 * Spacing system (utilisé partout pour la cohérence)
 */
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}

/**
 * Border radius (utilisé partout pour la cohérence)
 */
export const BORDER_RADIUS = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px'
}

/**
 * Shadows (utilisées partout pour la cohérence)
 */
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

/**
 * Breakpoints responsive (identiques pour tous les sites)
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

/**
 * Structure des pages (identique pour tous les sites)
 * Les clients NE PEUVENT PAS modifier cette structure
 */
export const PAGE_STRUCTURE = {
  header: {
    sticky: true,
    height: '80px',
    showLogo: true,
    showNav: true,
    showCTA: true
  },
  footer: {
    showSocialLinks: true,
    showLegalLinks: true,
    showNewsletter: true,
    copyrightText: 'Tous droits réservés'
  },
  sections: {
    hero: { enabled: true, fullWidth: true },
    services: { enabled: true, gridCols: 3 },
    about: { enabled: true },
    testimonials: { enabled: true },
    contact: { enabled: true }
  }
}

/**
 * Composants verrouillés (structure fixe)
 * Les clients peuvent modifier les CONTENUS mais pas la STRUCTURE
 */
export const LOCKED_COMPONENTS = [
  'Header',
  'Footer',
  'Navigation',
  'ServiceCard',
  'ProductCard',
  'BookingFlow',
  'PaymentFlow',
  'ClientPortal',
  'AdminPanel'
]

/**
 * Fonctionnalités standard incluses dans tous les sites
 */
export const STANDARD_FEATURES = {
  booking: true,          // Système de réservation
  payment: true,          // Paiement en ligne
  clientPortal: true,     // Espace client
  loyalty: true,          // Programme de fidélité
  reviews: true,          // Avis clients
  blog: true,             // Blog
  products: true,         // Boutique produits
  formations: true,       // Formations
  giftCards: true,        // Cartes cadeaux
  newsletter: true,       // Newsletter
  seo: true,              // SEO optimisé
  analytics: true,        // Analytics
}

/**
 * Changelog des versions du template
 */
export const TEMPLATE_CHANGELOG = {
  "1.0.0": {
    date: "2025-01-10",
    changes: [
      "Version initiale du modèle LAIA",
      "Design system centralisé",
      "Structure des pages verrouillée",
      "Personnalisation couleurs/textes",
      "Toutes les fonctionnalités standard incluses"
    ]
  }
}

/**
 * Fonction helper pour générer les CSS variables à partir d'OrganizationConfig
 */
export function generateCSSVariables(config: any) {
  return {
    '--color-primary': config?.primaryColor || DEFAULT_COLORS.primary,
    '--color-secondary': config?.secondaryColor || DEFAULT_COLORS.secondary,
    '--color-accent': config?.accentColor || DEFAULT_COLORS.accent,
    '--color-nude': DEFAULT_COLORS.nude,
    '--color-rose': DEFAULT_COLORS.rose,
    '--color-dark': DEFAULT_COLORS.dark,
    '--color-cream': DEFAULT_COLORS.cream,
    '--font-body': config?.fontFamily || DEFAULT_FONTS.body,
    '--font-heading': config?.headingFont || DEFAULT_FONTS.heading,
    '--font-size-base': config?.baseFontSize || DEFAULT_FONTS.baseFontSize,
    '--font-size-heading': config?.headingSize || DEFAULT_FONTS.headingSize,
  }
}
