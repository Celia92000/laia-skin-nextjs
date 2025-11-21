import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// Générer un numéro de commande unique
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}-${random}`;
}

// POST - Créer une commande
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const body = await request.json();

    // Validation des champs obligatoires
    if (!body.customerName || !body.customerEmail || !body.totalAmount || !body.orderType) {
      return NextResponse.json({
        error: 'Champs obligatoires manquants: customerName, customerEmail, totalAmount, orderType'
      }, { status: 400 });
    }

    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation depuis le host
    const host = request.headers.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // 1. Chercher par domaine personnalisé
    if (!cleanHost.includes('localhost')) {
      organization = await prisma.organization.findUnique({
        where: { domain: cleanHost }
      });
    }

    // 2. Chercher par subdomain
    if (!organization) {
      const parts = cleanHost.split('.');
      let subdomain = 'laia-skin-institut';
      if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
        subdomain = parts[0];
      }
      organization = await prisma.organization.findUnique({
        where: { subdomain: subdomain }
      });
    }

    // 3. Fallback
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' }
      });
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Vérifier si utilisateur connecté
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId = null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        organizationId: organization.id, // 🔒 Sécurité multi-tenant
        userId,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || null,
        customerAddress: body.customerAddress || null,
        orderType: body.orderType, // 'product', 'formation', or 'service'
        items: JSON.stringify(body.items),
        subtotal: body.subtotal,
        shippingCost: body.shippingCost || 0,
        discount: body.discount || 0,
        totalAmount: body.totalAmount,
        paymentMethod: body.paymentMethod || 'pending',
        paymentStatus: 'pending',
        status: 'pending',
        notes: body.notes || null
      }
    });

    // Si c'est une prestation, créer aussi une réservation
    if (body.orderType === 'service' && body.selectedDate && body.selectedTime) {
      const serviceItem = body.items[0];

      // 🔒 Utiliser l'organizationId déjà récupéré
      await prisma.reservation.create({
        data: {
          userId: userId || 'guest',
          organizationId: organization.id, // 🔒 Sécurité multi-tenant
          serviceId: serviceItem.id,
          services: JSON.stringify([serviceItem.id]),
          packages: '{}',
          date: new Date(body.selectedDate),
          time: body.selectedTime,
          totalPrice: body.totalAmount,
          status: 'pending',
          source: 'site',
          notes: body.notes || null,
          paymentStatus: 'unpaid'
        }
      });
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Commande créée avec succès'
    }, { status: 201 });

  } catch (error) {
    log.error('Erreur création commande:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la commande'
    }, { status: 500 });
  }
}

// GET - Récupérer les commandes (admin ou utilisateur)
export async function GET(request: NextRequest) {
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

    // Vérifier si admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    let orders;

    const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'STAFF'];
    if (adminRoles.includes(user.role)) {
      // 🔒 SÉCURITÉ MULTI-TENANT : Admin voit seulement les commandes de SON organisation
      if (!user.organizationId) {
        return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
      }

      orders = await prisma.order.findMany({
        where: {
          organizationId: user.organizationId
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    } else {
      // Client voit seulement ses commandes
      orders = await prisma.order.findMany({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(orders);

  } catch (error) {
    log.error('Erreur récupération commandes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
