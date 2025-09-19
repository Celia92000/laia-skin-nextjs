import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const evolutions = await prisma.clientEvolution.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { sessionDate: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(evolutions);
  } catch (error) {
    console.error('Erreur lors de la récupération des évolutions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      sessionNumber,
      serviceName,
      sessionDate,
      beforePhoto,
      afterPhoto,
      improvements,
      clientFeedback,
      adminNotes,
      skinAnalysis,
      treatedAreas,
      productsUsed,
      hydrationLevel,
      elasticity,
      pigmentation,
      wrinkleDepth
    } = body;

    const evolution = await prisma.clientEvolution.create({
      data: {
        userId,
        sessionNumber,
        serviceName,
        sessionDate: new Date(sessionDate),
        beforePhoto,
        afterPhoto,
        improvements,
        clientFeedback,
        adminNotes,
        skinAnalysis,
        treatedAreas,
        productsUsed,
        hydrationLevel,
        elasticity,
        pigmentation,
        wrinkleDepth
      }
    });

    return NextResponse.json(evolution);
  } catch (error) {
    console.error('Erreur lors de la création de l\'évolution:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}