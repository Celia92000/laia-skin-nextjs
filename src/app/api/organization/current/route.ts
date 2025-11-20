import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // 1️⃣ Domaine personnalisé
    if (!cleanHost.includes('localhost')) {
      organization = await prisma.organization.findUnique({
        where: { domain: cleanHost },
        include: { OrganizationConfig: true }
      });
    }

    // 2️⃣ Subdomain
    if (!organization) {
      const parts = cleanHost.split('.');
      let subdomain = 'laia-skin-institut';

      if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
        subdomain = parts[0];
      }

      organization = await prisma.organization.findUnique({
        where: { subdomain },
        include: { OrganizationConfig: true }
      });
    }

    // 3️⃣ Fallback
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
        include: { OrganizationConfig: true }
      });
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Retourner uniquement les données nécessaires pour le menu
    const config = organization.OrganizationConfig?.[0];
    return NextResponse.json({
      name: organization.name,
      plan: organization.plan,
      featureBlog: organization.featureBlog,
      featureProducts: organization.featureProducts,
      featureFormations: organization.featureFormations,
      config: {
        siteName: config?.siteName,
        logoUrl: config?.logoUrl,
        primaryColor: config?.primaryColor || '#d4b5a0',
        secondaryColor: config?.secondaryColor || '#c9a084',
        accentColor: config?.accentColor || '#2c3e50',
      }
    });
  } catch (error) {
    log.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
