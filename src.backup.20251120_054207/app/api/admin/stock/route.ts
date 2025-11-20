import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// API pour gérer les stocks (admin)
export async function GET(request: NextRequest) {
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

    const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer seulement les stocks de CETTE organisation
    const stocks = await prisma.stock.findMany({
      where: {
        organizationId: user.organizationId
      },
      include: {
        serviceLinks: {
          include: {
            service: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json(stocks);
  } catch (error) {
    log.error('Erreur lors de la récupération des stocks:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();

    const stockData = {
      organizationId: user.organizationId, // 🔒 Sécurité multi-tenant
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      quantity: body.quantity || 0,
      initialQuantity: body.initialQuantity || body.quantity || null,
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

    const stock = await prisma.stock.create({
      data: stockData
    });

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    log.error('Erreur lors de la création du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
