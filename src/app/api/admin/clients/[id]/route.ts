import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Vérifier l'organizationId de l'admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    if (!admin || !admin.organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔒 Récupérer les détails du client UNIQUEMENT si même organisation
    const client = await prisma.user.findFirst({
      where: {
        id,
        organizationId: admin.organizationId ?? undefined
      },
      include: {
        reservations: {
          orderBy: {
            date: 'desc'
          }
        },
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Calculer les statistiques
    const totalSpent = client.reservations.reduce((sum, res) => {
      return sum + (res.totalPrice || 0);
    }, 0);

    const lastVisit = client.reservations[0]?.date;

    // Formater la réponse
    const clientDetail = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      birthDate: client.birthDate,
      lastVisit,
      totalVisits: client._count.reservations,
      totalSpent,
      loyaltyPoints: client.loyaltyPoints,
      tags: (client as any).tags ? JSON.parse((client as any).tags) : [],
      notes: (client as any).notes,
      vip: (client as any).vip || false,
      createdAt: client.createdAt,
      reservations: client.reservations
    };

    return NextResponse.json(clientDetail);

  } catch (error) {
    log.error('Erreur récupération client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Mise à jour des informations client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Vérifier que c'est un admin ET récupérer son organizationId
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    if (!admin || !admin.organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (admin.role && !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔒 Vérifier que le client appartient à la même organisation
    const existingClient = await prisma.user.findFirst({
      where: {
        id,
        organizationId: admin.organizationId ?? undefined
      }
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client non trouvé ou accès refusé' }, { status: 404 });
    }

    const body = await request.json();
    const { notes, tags, vip, ...updateData } = body;

    // 🔒 Mettre à jour le client (vérification organizationId déjà faite)
    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        notes,
        tags: tags ? JSON.stringify(tags) : undefined,
        vip
      }
    });

    return NextResponse.json({
      success: true,
      client: updatedClient
    });

  } catch (error) {
    log.error('Erreur mise à jour client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}