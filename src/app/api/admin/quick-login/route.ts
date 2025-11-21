import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    // Vérifier que la requête vient d'un admin
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (authorization) {
      const token = authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-1234567890') as any;
        const adminUser = await prisma.user.findFirst({
          where: { id: decoded.userId }
        });
        
        const adminRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'];
        if (!adminUser || !adminRoles.includes(adminUser.role)) {
          return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
    }
    
    const { email } = await request.json();

    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId ?? undefined
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    log.error('Erreur quick login:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}