import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { log } from '@/lib/logger';

// API publique pour vérifier s'il y a des produits actifs
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();

    // Récupérer l'organisation depuis le host
    const host = request.headers.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // 1. Chercher par domaine personnalisé
    if (!cleanHost.includes('localhost')) {
      organization = await prisma.organization.findUnique({
        where: { domain: cleanHost }
      });
    }

    // 2. Chercher par subdomain
    if (!organization) {
      const parts = cleanHost.split('.');
      let subdomain = 'laia-skin-institut';
      if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
        subdomain = parts[0];
      }
      organization = await prisma.organization.findUnique({
        where: { subdomain: subdomain }
      });
    }

    // 3. Fallback
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' }
      });
    }

    if (!organization) {
      return NextResponse.json([], { status: 200 });
    }

    const cacheKey = `products:${organization.id}:active`;

    // Vérifier le cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const products = await prisma.product.findMany({
      where: {
        organizationId: organization.id,
        active: true
      },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    // Mettre en cache pour 2 minutes
    cache.set(cacheKey, products, 120000);

    return NextResponse.json(products);
  } catch (error) {
    log.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json([], { status: 200 }); // Retourne tableau vide en cas d'erreur
  }
}
