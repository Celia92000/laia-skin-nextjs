import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Clé de cache unique par service
    const cacheKey = `service:${slug}`;

    // Vérifier le cache
    const cachedService = cache.get(cacheKey);
    if (cachedService) {
      return NextResponse.json(cachedService);
    }

    const prisma = await getPrismaClient();
    const service = await prisma.service.findFirst({
      where: {
        slug,
        active: true
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
        { status: 404 }
      );
    }

    // Mettre en cache pour 30 minutes
    cache.set(cacheKey, service, 1800000);

    return NextResponse.json(service);
  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}