import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getOrganizationFromHost } from '@/lib/get-organization';
import { cache } from '@/lib/cache';
import { log } from '@/lib/logger';

// API publique pour vérifier s'il y a des produits actifs
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const host = request.headers.get('host') || '';
    const organization = await getOrganizationFromHost(prisma, host);

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
