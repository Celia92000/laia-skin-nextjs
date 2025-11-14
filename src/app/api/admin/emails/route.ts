import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin ou super admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    const allowedRoles = ['ADMIN', 'admin', 'SUPER_ADMIN'];
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    // Filtrer par organisation pour les admins (pas pour super admin)
    if (user.role !== 'SUPER_ADMIN' && user.organizationId) {
      where.user = {
        organizationId: user.organizationId
      };
    }

    const emails = await prisma.emailHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 100,
      select: {
        id: true,
        to: true,
        from: true,
        subject: true,
        content: true,
        template: true,
        status: true,
        direction: true,
        errorMessage: true,
        userId: true,
        campaignId: true,
        openedAt: true,
        clickedAt: true,
        createdAt: true
      }
    });

    return NextResponse.json(emails);
  } catch (error) {
    log.error('Erreur récupération emails:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}