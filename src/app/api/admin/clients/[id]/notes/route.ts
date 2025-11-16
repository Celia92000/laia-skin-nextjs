import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtenir une connexion Prisma garantie
    const prisma = await getPrismaClient();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    let adminUser: { role: string; organizationId: string | null } | null = null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        return NextResponse.json({ error: 'Token invalide - userId manquant' }, { status: 401 });
      }

      try {
        // 🔒 Récupérer l'admin avec son organizationId
        adminUser = await prisma.user.findFirst({
          where: { id: decoded.userId },
          select: { role: true, organizationId: true }
        });

        if (!adminUser || (adminUser.role as string) !== 'ADMIN') {
          return NextResponse.json({ error: 'Non autorisé - accès admin requis' }, { status: 403 });
        }

        if (!adminUser.organizationId) {
          return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
        }
      } catch (dbError) {
        log.error('Erreur connexion DB:', dbError);
        return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 503 });
      }
    } catch (tokenError: any) {
      log.error('Erreur décodage token:', tokenError);
      if (tokenError.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      } else if (tokenError.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    const { note } = await request.json();
    const userId = id;

    // 🔒 Vérifier que le client appartient à cette organisation
    const client = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: adminUser.organizationId
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // 🔒 Mettre à jour ou créer le profil de fidélité avec la note
    const loyaltyProfile = await prisma.loyaltyProfile.upsert({
        where: { userId },
        create: {
          userId,
          organizationId: adminUser.organizationId,
          points: 0,
          individualServicesCount: 0,
          packagesCount: 0,
          totalSpent: 0,
          tier: 'bronze',
          notes: note,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        update: {
          notes: note,
          updatedAt: new Date()
        }
      });

    return NextResponse.json({ 
      success: true,
      profile: loyaltyProfile
    });

  } catch (error) {
    log.error('Erreur sauvegarde note:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la sauvegarde de la note' 
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtenir une connexion Prisma garantie
    const prisma = await getPrismaClient();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    let adminUser: { role: string; organizationId: string | null } | null = null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        return NextResponse.json({ error: 'Token invalide - userId manquant' }, { status: 401 });
      }

      try {
        // 🔒 Récupérer l'admin avec son organizationId
        adminUser = await prisma.user.findFirst({
          where: { id: decoded.userId },
          select: { role: true, organizationId: true }
        });

        if (!adminUser || (adminUser.role as string) !== 'ADMIN') {
          return NextResponse.json({ error: 'Non autorisé - accès admin requis' }, { status: 403 });
        }

        if (!adminUser.organizationId) {
          return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
        }
      } catch (dbError) {
        log.error('Erreur connexion DB:', dbError);
        return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 503 });
      }
    } catch (tokenError: any) {
      log.error('Erreur décodage token:', tokenError);
      if (tokenError.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      } else if (tokenError.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    const userId = id;

    // 🔒 Vérifier que le client appartient à cette organisation
    const client = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: adminUser.organizationId
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // 🔒 Récupérer le profil UNIQUEMENT si même organization
    const loyaltyProfile = await prisma.loyaltyProfile.findFirst({
        where: {
          userId,
          organizationId: adminUser.organizationId
        },
        select: { notes: true }
      });

    return NextResponse.json({ 
      note: loyaltyProfile?.notes || ''
    });

  } catch (error) {
    log.error('Erreur récupération note:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération de la note' 
    }, { status: 500 });
  }
}