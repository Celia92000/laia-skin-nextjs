import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Invalider le cache des réservations
    cache.clear('admin:');

    return NextResponse.json({
      success: true,
      message: 'Cache invalidé avec succès'
    });

  } catch (error: any) {
    log.error('Erreur invalidation cache:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
