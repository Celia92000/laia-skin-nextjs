import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

import { hasAdminAccess } from '@/lib/admin-roles';
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
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

    if (!hasAdminAccess(user)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les horaires de travail
    const workingHours = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json(workingHours);
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
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

    if (!hasAdminAccess(user)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const workingHours = await request.json();

    // Mettre à jour chaque jour
    const updates = workingHours.map((hour: any) => 
      prisma.workingHours.update({
        where: { id: hour.id },
        data: {
          isOpen: hour.isOpen,
          startTime: hour.startTime,
          endTime: hour.endTime
        }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}