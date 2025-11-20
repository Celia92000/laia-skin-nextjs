import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Récupérer l'organisation par domaine personnalisé ou subdomain
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // Sur localhost, on force Laia Skin Institut
    if (cleanHost.includes('localhost')) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' }
      });
    } else {
      // Recherche par domaine, subdomain et fallback
      const parts = cleanHost.split('.');
      const subdomain = parts.length > 1 && parts[0] !== 'www'
        ? parts[0]
        : 'laia-skin-institut';

      const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
        prisma.organization.findUnique({
          where: { domain: cleanHost }
        }),
        prisma.organization.findUnique({
          where: { subdomain: subdomain }
        }),
        prisma.organization.findFirst({
          where: { slug: 'laia-skin-institut' }
        })
      ]);

      organization = orgByDomain || orgBySubdomain || orgBySlug;
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer le service
    const service = await prisma.service.findFirst({
      where: {
        organizationId: organization.id,
        slug: slug,
        active: true
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 });
    }

    return NextResponse.json(service);

  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
