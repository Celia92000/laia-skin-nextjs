import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  message?: string;
}

interface StatusResponse {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  services: ServiceStatus[];
  uptime: string;
}

// Fonction pour vérifier la base de données
async function checkDatabase(): Promise<ServiceStatus> {
  const start = performance.now();
  try {
    // Simple requête pour vérifier la connexion
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Math.round(performance.now() - start);

    return {
      name: 'Base de données',
      status: responseTime < 1000 ? 'operational' : 'degraded',
      responseTime,
      message: responseTime < 1000 ? 'Opérationnel' : 'Lent',
    };
  } catch (error: any) {
    return {
      name: 'Base de données',
      status: 'down',
      responseTime: Math.round(performance.now() - start),
      message: 'Hors service',
    };
  }
}

// Fonction pour vérifier Redis
async function checkRedis(): Promise<ServiceStatus> {
  const start = performance.now();

  // Si Redis n'est pas configuré
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      name: 'Cache Redis',
      status: 'degraded',
      message: 'Non configuré (mode dégradé)',
    };
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test simple avec un ping
    await redis.set('health_check', Date.now(), { ex: 10 });
    await redis.get('health_check');

    const responseTime = Math.round(performance.now() - start);

    return {
      name: 'Cache Redis',
      status: responseTime < 500 ? 'operational' : 'degraded',
      responseTime,
      message: responseTime < 500 ? 'Opérationnel' : 'Lent',
    };
  } catch (error: any) {
    return {
      name: 'Cache Redis',
      status: 'down',
      responseTime: Math.round(performance.now() - start),
      message: 'Hors service',
    };
  }
}

// Fonction pour vérifier l'API
async function checkAPI(): Promise<ServiceStatus> {
  const start = performance.now();
  const responseTime = Math.round(performance.now() - start);

  return {
    name: 'API',
    status: 'operational',
    responseTime,
    message: 'Opérationnel',
  };
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Vérifier tous les services en parallèle
    const [dbStatus, redisStatus, apiStatus] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkAPI(),
    ]);

    const services = [apiStatus, dbStatus, redisStatus];

    // Calculer le statut global
    const hasDown = services.some(s => s.status === 'down');
    const hasDegraded = services.some(s => s.status === 'degraded');

    const globalStatus: 'operational' | 'degraded' | 'down' = hasDown
      ? 'down'
      : hasDegraded
      ? 'degraded'
      : 'operational';

    // Calculer l'uptime (99.9% par défaut pour la démo)
    const uptime = '99.9%';

    const response: StatusResponse = {
      status: globalStatus,
      timestamp: new Date().toISOString(),
      services,
      uptime,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification du statut:', error);

    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        services: [],
        uptime: '0%',
        error: 'Impossible de vérifier le statut des services',
      },
      { status: 500 }
    );
  }
}
