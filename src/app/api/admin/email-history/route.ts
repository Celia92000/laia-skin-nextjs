import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

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

    // Vérifier que c'est un admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer l'historique des emails
    const emailHistory = await prisma.emailHistory.findMany({
      include: {
        campaign: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limiter aux 100 derniers emails
    });

    return NextResponse.json(emailHistory);
  } catch (error) {
    log.error('Erreur récupération historique emails:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // 🔒 Récupérer l'admin avec son organizationId
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!admin || !admin.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const data = await request.json();

    // 🔒 Créer l'entrée dans l'historique avec organizationId
    const emailEntry = await prisma.emailHistory.create({
      data: {
        from: data.from || '${email}',
        to: data.to,
        subject: data.subject,
        content: data.content,
        template: data.template,
        status: data.status || 'sent',
        direction: data.direction || 'outgoing',
        campaignId: data.campaignId,
        userId: data.userId,
        errorMessage: data.errorMessage,
        organizationId: admin.organizationId
      }
    });

    return NextResponse.json(emailEntry);
  } catch (error) {
    log.error('Erreur création historique email:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}