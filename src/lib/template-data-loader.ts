/**
 * Helper pour charger toutes les données nécessaires aux templates
 * Tous les templates reçoivent les mêmes données, seul le design diffère
 */

import { prisma } from '@/lib/prisma'
import { DetectedOrganization } from '@/lib/organization-detector'

export interface TemplateData {
  organization: DetectedOrganization
  services: any[]
  config: any
  testimonials: any[]
}

/**
 * Charge toutes les données nécessaires pour afficher un template
 */
export async function loadTemplateData(
  organization: DetectedOrganization
): Promise<TemplateData> {
  // 1. Charger les services de l'organisation
  let services: any[] = []
  try {
    services = await prisma.service.findMany({
      where: {
        active: true,
        category: { not: 'forfaits' },
        organizationId: organization.id,
      },
    })

    // Trier par featured puis par order
    services.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return (a.order || 0) - (b.order || 0)
    })
  } catch (error) {
    console.error('[template-data-loader] Error loading services:', error)
  }

  // 2. Charger la config de l'organisation (OrganizationConfig ou SiteConfig)
  let config: any = {}
  try {
    // D'abord essayer OrganizationConfig
    const orgConfig = await prisma.organizationConfig.findFirst({
      where: { organizationId: organization.id },
    })

    if (orgConfig) {
      config = orgConfig
    } else {
      // Sinon, fallback sur SiteConfig filtré par organizationId
      const siteConfig = await prisma.siteConfig.findFirst({
        where: { organizationId: organization.id },
      })

      if (siteConfig) {
        config = siteConfig
      } else {
        // Config par défaut
        config = {
          siteName: organization.name,
          siteTagline: 'Institut de Beauté & Bien-être',
          heroTitle: 'Une peau respectée,',
          heroSubtitle: 'une beauté révélée',
          founderName: '',
          founderTitle: 'Fondatrice & Experte en soins esthétiques',
          founderQuote:
            "La vraie beauté réside dans l'harmonie parfaite entre science, art et attention personnalisée",
        }
      }
    }
  } catch (error) {
    console.error('[template-data-loader] Error loading config:', error)
  }

  // 3. Parser les témoignages (JSON)
  let testimonials: any[] = []
  try {
    if (config.testimonials) {
      testimonials =
        typeof config.testimonials === 'string'
          ? JSON.parse(config.testimonials)
          : config.testimonials
    }
  } catch (error) {
    console.error('[template-data-loader] Error parsing testimonials:', error)
  }

  return {
    organization,
    services,
    config,
    testimonials,
  }
}
