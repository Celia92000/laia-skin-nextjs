import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import jwt from 'jsonwebtoken';
import { hasAdminAccess } from '@/lib/admin-roles';

const CONFIG_CACHE_KEY = 'site_config';
const CONFIG_CACHE_TTL = 3600000; // 60 minutes (optimisé pour réduire les requêtes DB)

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!hasAdminAccess(user)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return null;
  }
}

// GET - Récupérer la configuration du site (avec cache)
export async function GET(request: NextRequest) {
  try {
    // Vérifier le cache d'abord
    const cached = cache.get(CONFIG_CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    const prisma = await getPrismaClient();

    // Récupérer ou créer la configuration
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      // Créer une configuration par défaut
      config = await prisma.siteConfig.create({
        data: {
          siteName: 'Laia Skin Institut',
          siteTagline: 'Institut de Beauté & Bien-être',
          email: 'contact@laiaskin.com',
          phone: '+33 6 XX XX XX XX',
          primaryColor: '#d4b5a0',
          secondaryColor: '#2c3e50',
          accentColor: '#20b2aa'
        }
      });
    }

    // Stocker en cache
    cache.set(CONFIG_CACHE_KEY, config, CONFIG_CACHE_TTL);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour la configuration
export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    const data = await request.json();

    // Récupérer la config existante
    let config = await prisma.siteConfig.findFirst();

    if (config) {
      // Mettre à jour
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data
      });
    } else {
      // Créer
      config = await prisma.siteConfig.create({
        data
      });
    }

    // Vider le cache après modification
    cache.clear(CONFIG_CACHE_KEY);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
