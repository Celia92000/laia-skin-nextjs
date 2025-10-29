import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(decoded.role) && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      organizationId: user.organizationId
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
      total: await prisma.lead.count({ where: { organizationId: user.organizationId } }),
      new: await prisma.lead.count({ where: { organizationId: user.organizationId, status: 'new' } }),
      contacted: await prisma.lead.count({ where: { organizationId: user.organizationId, status: 'contacted' } }),
      qualified: await prisma.lead.count({ where: { organizationId: user.organizationId, status: 'qualified' } }),
      converted: await prisma.lead.count({ where: { organizationId: user.organizationId, status: 'converted' } }),
      lost: await prisma.lead.count({ where: { organizationId: user.organizationId, status: 'lost' } })
    };

    return NextResponse.json({ leads, stats });
  } catch (error) {
    console.error('Error fetching leads:', error);
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
    if (!decoded || !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(decoded.role) && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findUnique({
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
        organizationId: user.organizationId
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
        user: {
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
    console.error('Error updating lead:', error);
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
    if (!user || !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role as string)) {
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
    const existingUser = await prisma.user.findUnique({
      where: { email: lead.email }
    });

    if (existingUser) {
      // Lier le lead au user existant
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'converted',
          userId: existingUser.id
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
        email: lead.email,
        name: lead.name,
        phone: lead.phone || undefined,
        password: '', // Le client devra réinitialiser son mot de passe
        role: 'CLIENT'
      }
    });

    // Mettre à jour le lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'converted',
        userId: newUser.id
      }
    });

    return NextResponse.json({ 
      message: 'Lead converti en nouveau client',
      user: newUser 
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}