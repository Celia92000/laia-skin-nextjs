import { PrismaClient } from '@prisma/client';

/**
 * Helper function to get organization from request host
 * Optimized with parallel database queries
 */
export async function getOrganizationFromHost(
  prisma: PrismaClient,
  host: string
): Promise<any | null> {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');
  const subdomain = parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www'
    ? parts[0]
    : 'laia-skin-institut';

  // Parallelize all organization lookups
  const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
    !cleanHost.includes('localhost')
      ? prisma.organization.findUnique({ where: { domain: cleanHost } })
      : Promise.resolve(null),
    prisma.organization.findUnique({ where: { subdomain: subdomain } }),
    prisma.organization.findFirst({ where: { slug: 'laia-skin-institut' } })
  ]);

  return orgByDomain || orgBySubdomain || orgBySlug;
}
