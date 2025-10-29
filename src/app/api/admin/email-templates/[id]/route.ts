import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (admin?.role && !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const { name, subject, content, category } = await request.json();

    // Mettre à jour le template
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(content && { content }),
        ...(category && { category })
      }
    });

    return NextResponse.json(template);

  } catch (error: any) {
    console.error('Erreur mise à jour template:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (admin?.role && !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    // Marquer comme inactif au lieu de supprimer
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: 'Template supprimé' });

  } catch (error: any) {
    console.error('Erreur suppression template:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      message: error.message
    }, { status: 500 });
  }
}
