import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(decoded.role) && (decoded.role as string) !== 'ADMIN' && (decoded.role as string) !== 'STAFF') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      organizationId: user.organizationId ?? undefined
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Ajouter des statistiques DE CETTE ORGANISATION
    const stats = {
      total: await prisma.lead.count({ where: { organizationId: user.organizationId ?? undefined } }),
      new: await prisma.lead.count({ where: { organizationId: user.organizationId, status: "NEW" } }),
      contacted: await prisma.lead.count({ where: { organizationId: user.organizationId, status: "CONTACTED" } }),
      qualified: await prisma.lead.count({ where: { organizationId: user.organizationId, status: "QUALIFIED" } }),
      converted: await prisma.lead.count({ where: { organizationId: user.organizationId, status: "WON" } }),
      lost: await prisma.lead.count({ where: { organizationId: user.organizationId, status: "LOST" } })
    };

    return NextResponse.json({ leads, stats });
  } catch (error) {
    log.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(decoded.role) && (decoded.role as string) !== 'ADMIN' && (decoded.role as string) !== 'STAFF') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Vérifier que le lead appartient à cette organisation
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: user.organizationId ?? undefined
      }
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(lead);
  } catch (error) {
    log.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Convertir un lead en client
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await prisma.user.findFirst({
      where: { email: lead.contactEmail }
    });

    if (existingUser) {
      // Lier le lead au user existant
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "WON",
          organizationId: existingUser.organizationId
        }
      });

      return NextResponse.json({ 
        message: 'Lead converti et lié au client existant',
        user: existingUser 
      });
    }

    // Créer un nouveau client
    const newUser = await prisma.user.create({
      data: {
        email: lead.contactEmail,
        name: lead.contactName,
        phone: lead.contactPhone || undefined,
        password: '', // Le client devra réinitialiser son mot de passe
        role: 'CLIENT'
      }
    });

    // Mettre à jour le lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "WON",
        organizationId: newUser.organizationId
      }
    });

    return NextResponse.json({ 
      message: 'Lead converti en nouveau client',
      user: newUser 
    });
  } catch (error) {
    log.error('Error converting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}