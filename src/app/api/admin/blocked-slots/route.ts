import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

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
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // 🔒 Récupérer les créneaux bloqués DE CETTE ORGANISATION
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        location: {
          organizationId: user.organizationId ?? undefined
        },
        date: {
          gte: today
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    return NextResponse.json(blockedSlots);
  } catch (error) {
    log.error('Erreur lors de la récupération des créneaux bloqués:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { date, allDay, time, reason, locationId } = await request.json();

    // 🔒 Vérifier que la location appartient à cette organisation
    let actualLocationId = locationId;
    if (!actualLocationId) {
      // Récupérer la première location de l'organisation
      const location = await prisma.location.findFirst({
        where: { organizationId: user.organizationId ?? undefined },
        select: { id: true }
      });

      if (!location) {
        return NextResponse.json({ error: 'Aucune location trouvée pour cette organisation' }, { status: 404 });
      }

      actualLocationId = location.id;
    } else {
      // Vérifier que la location appartient bien à l'organisation
      const location = await prisma.location.findFirst({
        where: {
          id: actualLocationId,
          organizationId: user.organizationId ?? undefined
        }
      });

      if (!location) {
        return NextResponse.json({ error: 'Location non autorisée' }, { status: 403 });
      }
    }

    // 🔒 Créer le créneau bloqué POUR CETTE LOCATION
    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        locationId: actualLocationId,
        date: new Date(date),
        allDay: allDay || false,
        time: allDay ? null : time,
        reason: reason || 'Indisponible'
      }
    });

    return NextResponse.json(blockedSlot);
  } catch (error) {
    log.error('Erreur lors de la création du créneau bloqué:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}