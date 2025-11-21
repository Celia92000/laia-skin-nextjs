import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exclude = searchParams.get('exclude');
    const limit = searchParams.get('limit');

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
      let subdomain = 'laia-skin-institut'; // Par défaut
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
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Créer une clé de cache unique basée sur les paramètres ET l'organisation
    const cacheKey = `services:${organization.id}:${exclude || 'all'}:${limit || 'all'}`;

    // Vérifier le cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const where: any = {
      organizationId: organization.id,
      active: true
    };

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

    // Mettre en cache pour 10 minutes
    cache.set(cacheKey, services, 600000);

    return NextResponse.json(services);
  } catch (error: any) {
    log.error('Erreur lors de la récupération des services:', error);
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