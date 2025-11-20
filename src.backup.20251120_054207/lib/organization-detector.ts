/**
 * Système de détection d'organisation multi-tenant
 * Détecte l'organisation via domaine, sous-domaine ou slug URL
 */

import { prisma } from '@/lib/prisma'

export interface DetectedOrganization {
  id: string
  name: string
  slug: string
  domain: string | null
  subdomain: string
  websiteTemplateId: string | null
}

/**
 * Détecte l'organisation depuis une requête HTTP
 * @param request - Requête Next.js
 * @returns Organisation détectée ou null
 */
export async function detectOrganizationFromRequest(
  request: Request
): Promise<DetectedOrganization | null> {
  const url = new URL(request.url)
  const hostname = url.hostname

  console.log('[org-detector] Hostname:', hostname)

  // 1. Vérifier si c'est un domaine custom (ex: laiaskin-institut.fr)
  const orgByDomain = await prisma.organization.findFirst({
    where: { domain: hostname },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      subdomain: true,
      websiteTemplateId: true,
    },
  })

  if (orgByDomain) {
    console.log('[org-detector] Trouvé par domaine custom:', orgByDomain.name)
    return orgByDomain
  }

  // 2. Vérifier si c'est un sous-domaine (ex: laia-skin.laiaconnect.fr)
  if (hostname.includes('.')) {
    const parts = hostname.split('.')

    // Si c'est laia-skin.laiaconnect.fr, on extrait "laia-skin"
    if (parts.length >= 3) {
      const subdomain = parts[0]

      // Ignorer les sous-domaines réservés
      if (!['www', 'app', 'admin', 'super-admin', 'api'].includes(subdomain)) {
        const orgBySubdomain = await prisma.organization.findFirst({
          where: { subdomain },
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
            subdomain: true,
            websiteTemplateId: true,
          },
        })

        if (orgBySubdomain) {
          console.log('[org-detector] Trouvé par sous-domaine:', orgBySubdomain.name)
          return orgBySubdomain
        }
      }
    }
  }

  // 3. Vérifier si c'est un slug dans l'URL (ex: laiaconnect.fr/laia-skin)
  const pathSegments = url.pathname.split('/').filter(Boolean)

  if (pathSegments.length > 0) {
    const potentialSlug = pathSegments[0]

    // Ignorer les routes réservées
    const reservedRoutes = [
      'admin', 'super-admin', 'api', 'auth', 'login', 'connexion',
      '_next', 'static', 'espace-client', 'comptable', 'employee'
    ]

    if (!reservedRoutes.includes(potentialSlug)) {
      const orgBySlug = await prisma.organization.findFirst({
        where: { slug: potentialSlug },
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          subdomain: true,
          websiteTemplateId: true,
        },
      })

      if (orgBySlug) {
        console.log('[org-detector] Trouvé par slug URL:', orgBySlug.name)
        return orgBySlug
      }
    }
  }

  // 4. En développement local, retourner LAIA SKIN INSTITUT par défaut
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('[org-detector] Localhost détecté, recherche LAIA SKIN INSTITUT...')
    const defaultOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: 'laia-skin-institut' },
          { name: { contains: 'Laia Skin', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        subdomain: true,
        websiteTemplateId: true,
      },
    })

    if (defaultOrg) {
      console.log('[org-detector] Organisation par défaut (localhost):', defaultOrg.name)
      return defaultOrg
    }
  }

  console.log('[org-detector] Aucune organisation trouvée')
  return null
}

/**
 * Détecte l'organisation depuis le slug dans l'URL
 * Utilisé pour le routing dynamique [slug]
 */
export async function detectOrganizationFromSlug(
  slug: string
): Promise<DetectedOrganization | null> {
  const org = await prisma.organization.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      subdomain: true,
      websiteTemplateId: true,
    },
  })

  if (org) {
    console.log('[org-detector] Organisation trouvée par slug:', org.name)
    return org
  }

  return null
}

/**
 * Récupère toutes les organisations pour la génération de routes statiques
 */
export async function getAllOrganizationSlugs(): Promise<string[]> {
  const orgs = await prisma.organization.findMany({
    where: {
      status: { in: ['ACTIVE', 'TRIAL'] }
    },
    select: { slug: true },
  })

  return orgs.map((org) => org.slug)
}
