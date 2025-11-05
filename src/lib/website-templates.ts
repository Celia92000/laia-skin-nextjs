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
  // Templates classiques
  {
    id: 'classic',
    name: 'Classique',
    description: 'L\'intemporalité au service de votre image',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/classic/preview',
    features: []
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'L\'élégance contemporaine redéfinie',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/modern/preview',
    features: []
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'La pureté des lignes, l\'essence du raffinement',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/minimal/preview',
    features: []
  },
  {
    id: 'professional',
    name: 'Professionnel',
    description: 'La rigueur au service de l\'excellence',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/professional/preview',
    features: []
  },
  {
    id: 'boutique',
    name: 'Boutique',
    description: 'L\'art de l\'accueil avec distinction',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/boutique/preview',
    features: []
  },
  {
    id: 'fresh',
    name: 'Dynamique',
    description: 'L\'énergie sublimée par le design',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/fresh/preview',
    features: []
  },
  {
    id: 'laia-skin',
    name: 'Rose Poudré',
    description: 'La délicatesse incarnée dans chaque détail',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/laia-skin/preview',
    features: []
  },
  {
    id: 'luxe',
    name: 'Noir',
    description: 'Le raffinement absolu dans l\'obscurité',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/luxe/preview',
    features: []
  },
  {
    id: 'elegance',
    name: 'Élégant',
    description: 'La grâce et la sophistication réunies',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/elegance/preview',
    features: []
  },
  {
    id: 'zen',
    name: 'Nature',
    description: 'L\'harmonie naturelle au cœur de votre espace',
    minTier: 'STANDARD',
    previewUrl: '/super-admin/templates/zen/preview',
    features: []
  },

  // Templates premium
  {
    id: 'medical',
    name: 'Médical Raffiné',
    description: 'L\'excellence médicale avec prestance',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/medical/preview',
    features: []
  },
  {
    id: 'spa-luxe',
    name: 'Harmonie Spa',
    description: 'L\'art du bien-être dans un écrin de luxe',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/spa-luxe/preview',
    features: []
  },
  {
    id: 'laser-tech',
    name: 'Précision Laser',
    description: 'La précision technologique sublimée',
    minTier: 'PREMIUM',
    previewUrl: '/super-admin/templates/laser-tech/preview',
    features: []
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
