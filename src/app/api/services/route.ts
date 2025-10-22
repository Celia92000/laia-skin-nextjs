import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exclude = searchParams.get('exclude');
    const limit = searchParams.get('limit');

    // Créer une clé de cache unique basée sur les paramètres
    const cacheKey = `services:${exclude || 'all'}:${limit || 'all'}`;

    // Vérifier le cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const prisma = await getPrismaClient();
    const where: any = { active: true };

    if (exclude) {
      where.slug = { not: exclude };
    }

    const services = await prisma.service.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDescription: true,
        price: true,
        promoPrice: true,
        launchPrice: true,
        forfaitPrice: true,
        forfaitPromo: true,
        duration: true,
        mainImage: true,
        categoryId: true,
        subcategoryId: true,
        active: true,
        featured: true,
        order: true,
        canBeOption: true,
      }
    });

    // Mettre en cache pour 30 minutes (optimisé pour réduire les requêtes DB)
    cache.set(cacheKey, services, 1800000);

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}