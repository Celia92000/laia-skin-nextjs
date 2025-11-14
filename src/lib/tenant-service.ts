// Service de gestion des tenants (organisations)
import { Organization } from '@prisma/client'
import { cache } from 'react'
import { getActiveFeatures, type OrgFeatures } from './features-simple'
import prisma from './prisma'

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
    console.log('🌐 Host reçu:', host, '→ Clean host:', cleanHost)

    // Vérifier le cache
    if (orgCache.has(cleanHost)) {
      console.log('✅ Organisation trouvée en cache')
      return orgCache.get(cleanHost)!
    }

    let organization: Organization | null = null

    // Vérifier si c'est un domaine personnalisé (ex: beaute-eternelle.fr)
    console.log('🔍 Recherche par domaine:', cleanHost)
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
      console.log('🔍 Recherche par subdomain:', subdomain)

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

    // Si pas trouvé, retourner l'organisation par défaut (Laia Skin Institut)
    if (!organization) {
      console.log('🔍 Fallback sur slug: laia-skin-institut')
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
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
      console.log('✅ Organisation trouvée par subdomain:', organization.subdomain)
      orgCache.set(cleanHost, organization)
    } else {
      console.log('❌ Aucune organisation trouvée')
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
      // Récupérer TOUTES les organisations (ACTIVE, TRIAL, SUSPENDED, etc.)
      // Le super admin doit pouvoir voir toutes les organisations
      include: {
        config: true,
        locations: {
          where: { active: true },
          orderBy: { isMainLocation: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' } // Les plus récentes en premier
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

/**
 * 🎯 Récupère les features actives d'une organisation
 * Prend en compte le forfait de base + les add-ons achetés
 */
export function getOrganizationActiveFeatures(organization: Organization): OrgFeatures {
  return getActiveFeatures(organization.plan, organization.addons)
}

/**
 * ✅ Vérifie si une organisation a accès à une feature spécifique
 * (forfait de base ou add-on)
 */
export function organizationHasFeature(
  organization: Organization,
  feature: keyof OrgFeatures
): boolean {
  const activeFeatures = getOrganizationActiveFeatures(organization)
  return activeFeatures[feature]
}
