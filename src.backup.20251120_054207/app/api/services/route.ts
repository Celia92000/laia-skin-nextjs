import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getOrganizationFromHost } from '@/lib/get-organization';
import { cache } from '@/lib/cache';
import { log } from '@/lib/logger';

// API publique pour vérifier s'il y a des services actifs
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const host = request.headers.get('host') || '';
    const organization = await getOrganizationFromHost(prisma, host);

    if (!organization) {
      return NextResponse.json([], { status: 200 });
    }

    const cacheKey = `services:${organization.id}:active`;

    // Vérifier le cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const services = await prisma.service.findMany({
      where: {
        organizationId: organization.id,
        active: true
      },
      select: {
        id: true,
        slug: true,
        name: true
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Mettre en cache pour 2 minutes
    cache.set(cacheKey, services, 120000);

    return NextResponse.json(services);
  } catch (error) {
    log.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json([], { status: 200 }); // Retourne tableau vide en cas d'erreur
  }
}
