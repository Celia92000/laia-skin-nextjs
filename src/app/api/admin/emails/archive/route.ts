import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
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

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { emailIds, archived } = await request.json();

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });
    }

    // Mettre à jour les emails
    await prisma.emailHistory.updateMany({
      where: {
        id: {
          in: emailIds
        }
      },
      data: {
        archived: archived === true
      }
    });

    return NextResponse.json({
      success: true,
      message: archived ? 'Emails archivés' : 'Emails désarchivés',
      count: emailIds.length
    });

  } catch (error: any) {
    log.error('Erreur archivage emails:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      message: error.message
    }, { status: 500 });
  }
}
