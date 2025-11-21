import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Récupérer un service spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // Récupérer le service DE CETTE ORGANISATION avec ses relations
    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      },
      include: {
        stockLinks: {
          include: {
            stock: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    log.error('Erreur lors de la récupération du service:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    // Supprimer l'id du body s'il existe
    delete body.id;

    // Vérifier que le service appartient à cette organisation
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 });
    }

    // Mettre à jour le service
    const service = await prisma.service.update({
      where: { id },
      data: body
    });

    return NextResponse.json(service);
  } catch (error) {
    log.error('Erreur lors de la mise à jour du service:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // Vérifier que le service appartient à cette organisation avant de le supprimer
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 });
    }

    // Supprimer le service
    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Erreur lors de la suppression du service:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}