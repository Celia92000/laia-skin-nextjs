// Helper pour récupérer l'organisation courante dans les Server Components
import { headers } from 'next/headers'
import { getOrganizationByHost } from './tenant-service'
import type { Organization } from '@prisma/client'

/**
 * Récupère l'organisation courante en fonction du host dans les headers
 * À utiliser uniquement dans les Server Components
 */
export async function getCurrentOrganization(): Promise<Organization | null> {
  const headersList = await headers()
  const host = headersList.get('x-tenant-host') || headersList.get('host') || 'localhost'

  return await getOrganizationByHost(host)
}

/**
 * Récupère l'ID de l'organisation courante
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const org = await getCurrentOrganization()
  return org?.id || null
}
