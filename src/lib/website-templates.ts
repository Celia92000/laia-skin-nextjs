/**
 * Configuration des templates de site web disponibles
 * Utilisé dans l'onboarding et la gestion des templates
 */

export interface WebsiteTemplate {
  id: string
  name: string
  description: string
  minTier: 'STANDARD' | 'TEAM' | 'PREMIUM'
  thumbnail?: string
  previewUrl?: string
  features: string[]
}

export const websiteTemplates: WebsiteTemplate[] = [
  // ===== TEMPLATES STANDARD (6 templates) =====
  {
    id: 'classic',
    name: 'Classic',
    description: 'Design élégant et intemporel avec mise en page magazine',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/classic/preview',
    features: [
      'Design élégant et sophistiqué',
      'Mise en page magazine',
      'Sections services détaillées',
      'Présentation d\'équipe professionnelle'
    ]
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Style futuriste et dynamique avec animations',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/modern/preview',
    features: [
      'Animations fluides',
      'Design moderne et épuré',
      'Effets visuels avancés',
      'Interface intuitive'
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Approche minimaliste type éditorial',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/minimal/preview',
    features: [
      'Design épuré',
      'Typographie élégante',
      'Mise en page aérée',
      'Focus sur le contenu'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Look corporatif et structuré',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/professional/preview',
    features: [
      'Apparence professionnelle',
      'Structure claire',
      'Badges de confiance',
      'Mise en page organisée'
    ]
  },
  {
    id: 'boutique',
    name: 'Boutique Chic',
    description: 'Style boutique intime et chaleureux',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/boutique/preview',
    features: [
      'Ambiance chaleureuse',
      'Design romantique',
      'Photos arrondies',
      'Décorations élégantes'
    ]
  },
  {
    id: 'fresh',
    name: 'Fresh & Dynamic',
    description: 'Look jeune et énergique avec couleurs vives',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/fresh/preview',
    features: [
      'Design dynamique',
      'Couleurs éclatantes',
      'Badges colorés',
      'Typographie audacieuse'
    ]
  },
  {
    id: 'laia-skin',
    name: 'Laia Skin Institut',
    description: 'Minimalisme luxueux avec dégradés rose poudré et élégance moderne',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/laia-skin/preview',
    features: [
      'Rose poudré et taupe élégant',
      'Typographie Playfair + Inter',
      'Dégradés subtils et raffinés',
      'Design premium mais chaleureux',
      'Éléments arrondis et ombres douces',
      'Placeholders photos/vidéos personnalisables',
      'Galerie immersive',
      'Section valeurs sophistiquée'
    ]
  },

  {
    id: 'luxe',
    name: 'Luxe',
    description: 'Design sophistiqué avec fond noir et effets élégants',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/luxe/preview',
    features: [
      'Fond noir sophistiqué',
      'Animations subtiles',
      'Section expérience',
      'Stats élégantes'
    ]
  },
  {
    id: 'elegance',
    name: 'Élégance',
    description: 'Sophistication avec animations et effets modernes',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/elegance/preview',
    features: [
      'Header flottant',
      'Animations fluides',
      'Effets au survol',
      'Design raffiné'
    ]
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Ambiance naturelle et apaisante',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/zen/preview',
    features: [
      'Design organique',
      'Couleurs naturelles',
      'Formes douces',
      'Ambiance zen'
    ]
  },

  // ===== TEMPLATES PREMIUM (3 nouveaux templates exclusifs) =====
  {
    id: 'medical',
    name: 'Medical Premium',
    description: 'Design médical professionnel inspiré des cliniques esthétiques',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/medical/preview',
    features: [
      'Design médical premium',
      'Interface clinique moderne',
      'Sections avant/après',
      'Certifications médicales',
      'Formulaire de consultation'
    ]
  },
  {
    id: 'spa-luxe',
    name: 'Spa Luxe Premium',
    description: 'Expérience spa haut de gamme avec réservation intégrée',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/spa-luxe/preview',
    features: [
      'Carrousel full-screen',
      'Vidéo de fond',
      'Formulaire multi-étapes',
      'Galerie immersive',
      'Témoignages vidéo'
    ]
  },
  {
    id: 'laser-tech',
    name: 'Laser Tech Premium',
    description: 'Design technologique pour centres d\'épilation laser',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/laser-tech/preview',
    features: [
      'Animations technologiques',
      'Comparatifs interactifs',
      'Zones de traitement',
      'Calculateur de prix',
      'FAQ interactive'
    ]
  }
]

/**
 * Récupère un template par son ID
 */
export function getTemplateById(id: string): WebsiteTemplate | undefined {
  return websiteTemplates.find(template => template.id === id)
}

/**
 * Récupère les templates disponibles pour un plan donné
 */
export function getTemplatesForPlan(plan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'): WebsiteTemplate[] {
  if (plan === 'PREMIUM') {
    return websiteTemplates // Tous les templates
  } else if (plan === 'TEAM') {
    // TEAM a accès aux standards + quelques premium
    return websiteTemplates.filter(t => t.minTier === 'STANDARD' || t.minTier === 'TEAM')
  } else {
    // SOLO et DUO ont accès uniquement aux standards
    return websiteTemplates.filter(t => t.minTier === 'STANDARD')
  }
}
