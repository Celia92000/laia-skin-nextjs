// Service de gestion des tenants (organisations)
import { PrismaClient, Organization } from '@prisma/client'
import { cache } from 'react'

const prisma = new PrismaClient()

// Cache des organisations par domaine/subdomain (optimisation)
const orgCache = new Map<string, Organization>()

/**
 * Récupère l'organisation en fonction du domaine ou subdomain
 * @param host - Le hostname complet (ex: "laia-skin.localhost:3001" ou "beaute-eternelle.fr")
 * @returns L'organisation trouvée ou null
 */
export async function getOrganizationByHost(host: string): Promise<Organization | null> {
  try {
    // Nettoyer le host (enlever le port)
    const cleanHost = host.split(':')[0].toLowerCase()

    // Vérifier le cache
    if (orgCache.has(cleanHost)) {
      return orgCache.get(cleanHost)!
    }

    let organization: Organization | null = null

    // Vérifier si c'est un domaine personnalisé (ex: beaute-eternelle.fr)
    organization = await prisma.organization.findUnique({
      where: { domain: cleanHost },
      include: {
        config: true,
        locations: {
          where: { active: true },
          orderBy: { isMainLocation: 'desc' }
        },
        paymentSettings: true,
        loyaltyProgram: true,
        bookingSettings: true
      }
    })

    // Si pas trouvé, vérifier si c'est un subdomain (ex: laia-skin.localhost ou laia-skin.myplatform.com)
    if (!organization) {
      const subdomain = cleanHost.split('.')[0]

      organization = await prisma.organization.findUnique({
        where: { subdomain },
        include: {
          config: true,
          locations: {
            where: { active: true },
            orderBy: { isMainLocation: 'desc' }
          },
          paymentSettings: true,
          loyaltyProgram: true,
          bookingSettings: true
        }
      })
    }

    // Si pas trouvé, retourner l'organisation par défaut (Laia Skin)
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin' },
        include: {
          config: true,
          locations: {
            where: { active: true },
            orderBy: { isMainLocation: 'desc' }
          },
          paymentSettings: true,
          loyaltyProgram: true,
          bookingSettings: true
        }
      })
    }

    // Mettre en cache
    if (organization) {
      orgCache.set(cleanHost, organization)
    }

    return organization
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'organisation:', error)
    return null
  }
}

/**
 * Récupère l'organisation par son ID
 */
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  try {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        config: true,
        locations: {
          where: { active: true },
          orderBy: { isMainLocation: 'desc' }
        },
        paymentSettings: true,
        loyaltyProgram: true,
        bookingSettings: true
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'organisation:', error)
    return null
  }
}

/**
 * Récupère l'organisation par son slug
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  try {
    return await prisma.organization.findUnique({
      where: { slug },
      include: {
        config: true,
        locations: {
          where: { active: true },
          orderBy: { isMainLocation: 'desc' }
        },
        paymentSettings: true,
        loyaltyProgram: true,
        bookingSettings: true
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'organisation:', error)
    return null
  }
}

/**
 * Récupère toutes les organisations actives
 */
export async function getAllOrganizations() {
  try {
    return await prisma.organization.findMany({
      where: { status: 'ACTIVE' },
      include: {
        config: true,
        locations: {
          where: { active: true },
          orderBy: { isMainLocation: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des organisations:', error)
    return []
  }
}

/**
 * Vide le cache des organisations (à utiliser après une mise à jour)
 */
export function clearOrganizationCache(host?: string) {
  if (host) {
    const cleanHost = host.split(':')[0].toLowerCase()
    orgCache.delete(cleanHost)
  } else {
    orgCache.clear()
  }
}

/**
 * Version cachée de getOrganizationByHost pour Next.js
 */
export const getCachedOrganizationByHost = cache(getOrganizationByHost)
