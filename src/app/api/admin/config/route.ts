import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  // Vérifier d'abord les cookies, puis les headers
  const cookieStore = await cookies();
  let token = cookieStore.get('auth-token')?.value;

  if (!token) {
    token = request.headers.get('authorization')?.replace('Bearer ', '');
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    log.error('Erreur vérification admin:', error);
    return null;
  }
}

// GET - Récupérer la configuration du site
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin || !admin.organizationId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const prisma = await getPrismaClient();

    // Récupérer ou créer la configuration de l'organisation
    let config = await prisma.organizationConfig.findUnique({
      where: { organizationId: admin.organizationId }
    });

    if (!config) {
      // Créer une configuration par défaut
      config = await prisma.organizationConfig.create({
        data: {
          organizationId: admin.organizationId,
          siteName: 'LAIA SKIN Institut',
          siteTagline: 'Institut de Beauté & Bien-être',
          email: 'contact@laiaskininstitut.fr',
          phone: '+33 6 31 10 75 31',
          primaryColor: '#d4b5a0',
          secondaryColor: '#2c3e50',
          accentColor: '#20b2aa',
          crispEnabled: false
        }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    log.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour la configuration
export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin || !admin.organizationId) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    const data = await request.json();

    // Retirer l'id et organizationId du data pour éviter les erreurs
    const { id, organizationId, ...updateData } = data;

    // Récupérer la config existante
    let config = await prisma.organizationConfig.findUnique({
      where: { organizationId: admin.organizationId }
    });

    if (config) {
      // Mettre à jour
      config = await prisma.organizationConfig.update({
        where: { organizationId: admin.organizationId },
        data: updateData
      });
    } else {
      // Créer
      config = await prisma.organizationConfig.create({
        data: {
          ...updateData,
          organizationId: admin.organizationId
        }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    log.error('Erreur lors de la mise à jour de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
