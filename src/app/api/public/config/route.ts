import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

// GET - Récupérer la configuration publique du site (sans authentification)
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const host = request.headers.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // Sur localhost, on force Laia Skin Institut
    if (cleanHost.includes('localhost')) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
        include: { OrganizationConfig: true }
      });
    } else {
      // Optimisation: recherche parallèle par domaine, subdomain et fallback
      const parts = cleanHost.split('.');
      const subdomain = parts.length > 1 && parts[0] !== 'www'
        ? parts[0]
        : 'laia-skin-institut';

      const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
        prisma.organization.findUnique({
          where: { domain: cleanHost },
          include: { OrganizationConfig: true }
        }),
        prisma.organization.findUnique({
          where: { subdomain: subdomain },
          include: { OrganizationConfig: true }
        }),
        prisma.organization.findFirst({
          where: { slug: 'laia-skin-institut' },
          include: { OrganizationConfig: true }
        })
      ]);

      organization = orgByDomain || orgBySubdomain || orgBySlug;
    }

    if (!organization || !organization.OrganizationConfig) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Retourner uniquement la configuration (pas les données sensibles de l'organisation)
    return NextResponse.json(organization.OrganizationConfig, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    log.error('Erreur lors de la récupération de la configuration publique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}
