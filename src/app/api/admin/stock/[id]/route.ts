import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer un élément de stock spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    // 🔒 Authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Vérifier que c'est un admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    const adminRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // 🔒 SÉCURITÉ MULTI-TENANT : Vérifier que le stock appartient à cette organisation
    const stock = await prisma.stock.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      },
      include: {
        serviceLinks: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        },
        movements: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!stock) {
      return NextResponse.json({ error: 'Élément de stock non trouvé' }, { status: 404 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erreur lors de la récupération du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    // 🔒 Authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Vérifier que c'est un admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    const adminRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // 🔒 SÉCURITÉ MULTI-TENANT : Vérifier que le stock appartient à cette organisation
    const existingStock = await prisma.stock.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!existingStock) {
      return NextResponse.json({ error: 'Élément de stock non trouvé' }, { status: 404 });
    }

    const body = await request.json();

    const stockData = {
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      quantity: body.quantity || 0,
      initialQuantity: body.initialQuantity !== undefined ? body.initialQuantity : undefined,
      minQuantity: body.minQuantity || 5,
      unit: body.unit || null,
      cost: body.cost ? parseFloat(body.cost) : null,
      supplier: body.supplier || null,
      purchaseUrl: body.purchaseUrl || null,
      reference: body.reference || null,
      barcode: body.barcode || null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      lastRestocked: body.lastRestocked ? new Date(body.lastRestocked) : null,
      location: body.location || null,
      notes: body.notes || null,
      active: body.active !== undefined ? body.active : true
    };

    const stock = await prisma.stock.update({
      where: { id },
      data: stockData
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    // 🔒 Authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Vérifier que c'est un admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    const adminRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { id } = await params;

    // 🔒 SÉCURITÉ MULTI-TENANT : Vérifier que le stock appartient à cette organisation
    const existingStock = await prisma.stock.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!existingStock) {
      return NextResponse.json({ error: 'Élément de stock non trouvé' }, { status: 404 });
    }

    await prisma.stock.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Stock supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
