/**
 * Configuration des templates de site web disponibles
 * Utilisé dans l'onboarding et la gestion des templates
 */

export interface WebsiteTemplate {
  id: string
  name: string
  description: string
  minTier: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  thumbnail?: string
  previewUrl?: string
  features: string[]
}

export const websiteTemplates: WebsiteTemplate[] = [
  // Templates accessibles à tous (SOLO, DUO, TEAM, PREMIUM)
  {
    id: 'classic',
    name: 'Classique',
    description: 'L\'intemporalité au service de votre image',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/classic/preview',
    features: []
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'L\'élégance contemporaine redéfinie',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/modern/preview',
    features: []
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'La pureté des lignes, l\'essence du raffinement',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/minimal/preview',
    features: []
  },
  {
    id: 'professional',
    name: 'Professionnel',
    description: 'La rigueur au service de l\'excellence',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/professional/preview',
    features: []
  },
  {
    id: 'boutique',
    name: 'Boutique',
    description: 'L\'art de l\'accueil avec distinction',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/boutique/preview',
    features: []
  },
  {
    id: 'fresh',
    name: 'Dynamique',
    description: 'L\'énergie sublimée par le design',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/fresh/preview',
    features: []
  },
  {
    id: 'laia',
    name: 'LAIA Signature',
    description: 'L\'élégance rose gold, signature LAIA',
    minTier: 'TEAM',
    previewUrl: '/super-admin/templates/laia/preview',
    features: ['Rose gold design', 'Élégance premium', 'Signature LAIA']
  },
  {
    id: 'zen',
    name: 'Nature',
    description: 'L\'harmonie naturelle au cœur de votre espace',
    minTier: 'SOLO',
    previewUrl: '/super-admin/templates/zen/preview',
    features: []
  },

  // Templates premium (TEAM & PREMIUM)
  {
    id: 'luxe',
    name: 'Luxe Noir',
    description: 'Le raffinement absolu dans l\'obscurité dorée',
    minTier: 'TEAM',
    previewUrl: '/super-admin/templates/luxe/preview',
    features: ['Design dark luxury', 'Accents or', 'Glassmorphisme', 'Animations premium']
  },
  {
    id: 'elegance',
    name: 'Élégance Raffinée',
    description: 'La grâce et la sophistication avec particules flottantes',
    minTier: 'TEAM',
    previewUrl: '/super-admin/templates/elegance/preview',
    features: ['Particules animées', 'Design raffiné', 'Effets premium']
  },
  {
    id: 'medical',
    name: 'Médical Raffiné',
    description: 'L\'excellence médicale avec prestance',
    minTier: 'TEAM',
    previewUrl: '/super-admin/templates/medical/preview',
    features: ['Design clinique', 'Minimalisme professionnel']
  },
  {
    id: 'spa-luxe',
    name: 'Harmonie Spa',
    description: 'L\'art du bien-être dans un écrin de luxe',
    minTier: 'TEAM',
    previewUrl: '/super-admin/templates/spa-luxe/preview',
    features: ['Parallax immersif', 'Full-screen sections', 'Design magazine']
  },
  {
    id: 'laser-tech',
    name: 'Précision Laser',
    description: 'La précision technologique sublimée',
    minTier: 'TEAM',
    previewUrl: '/super-admin/templates/laser-tech/preview',
    features: ['Design technique', 'Minimalisme high-tech']
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
export function getTemplatesForPlan(plan: string): WebsiteTemplate[] {
  // Mapping des anciens plans vers les nouveaux
  const planMapping: Record<string, 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'> = {
    SOLO: 'SOLO',
    DUO: 'DUO',
    TEAM: 'TEAM',
    PREMIUM: 'PREMIUM',
    STARTER: 'SOLO',
    ESSENTIAL: 'DUO',
    PROFESSIONAL: 'TEAM',
    ENTERPRISE: 'PREMIUM'
  }

  const normalizedPlan = planMapping[plan] || 'SOLO'

  const tierHierarchy = {
    SOLO: ['SOLO'],
    DUO: ['SOLO', 'DUO'],
    TEAM: ['SOLO', 'DUO', 'TEAM'],
    PREMIUM: ['SOLO', 'DUO', 'TEAM', 'PREMIUM']
  }

  const allowedTiers = tierHierarchy[normalizedPlan] || ['SOLO']

  return websiteTemplates.filter(template =>
    allowedTiers.includes(template.minTier)
  )
}
