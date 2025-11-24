import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

// 🔒 Fonction pour vérifier l'authentification admin AVEC organizationId
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        organizationId: true
      }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role as string)) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// GET - Récupérer tous les profils de fidélité de l'organisation
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Vérifier que l'admin a un organizationId
  if (!admin.organizationId) {
    return NextResponse.json(
      { error: 'Organization ID manquant' },
      { status: 400 }
    );
  }

  try {
    // Récupérer UNIQUEMENT les profils de fidélité de cette organisation
    const loyaltyProfiles = await prisma.loyaltyProfile.findMany({
      where: {
        user: {
          organizationId: admin.organizationId ?? undefined
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            birthDate: true,
            reservations: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      }
    });

    // Récupérer aussi les utilisateurs sans profil de fidélité (UNIQUEMENT de cette organisation)
    const usersWithoutProfile = await prisma.user.findMany({
      where: {
        organizationId: admin.organizationId ?? undefined,
        role: 'CLIENT',
        loyaltyProfile: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        reservations: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Créer des profils par défaut pour les utilisateurs sans profil
    const defaultProfiles = usersWithoutProfile.map(user => ({
      id: `temp-${user.id}`,
      userId: user.id,
      individualServicesCount: 0,
      packagesCount: 0,
      totalSpent: 0,
      availableDiscounts: [],
      lastVisit: null,
      user: user
    }));

    // Combiner les vrais profils et les profils par défaut
    const allProfiles = [...loyaltyProfiles, ...defaultProfiles];

    // Traiter les réductions disponibles (parse JSON)
    const processedProfiles = allProfiles.map(profile => ({
      ...profile,
      availableDiscounts: typeof profile.availableDiscounts === 'string' 
        ? JSON.parse(profile.availableDiscounts) 
        : profile.availableDiscounts
    }));

    return NextResponse.json(processedProfiles);
  } catch (error) {
    log.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Appliquer une réduction manuelle
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { userId, discountAmount, reason } = body;

    // Validate organizationId
    if (!admin.organizationId) {
      return NextResponse.json(
        { error: 'Organization ID manquant' },
        { status: 400 }
      );
    }

    // 🔒 Récupérer ou créer le profil de fidélité DE CETTE ORGANISATION
    let loyaltyProfile = await prisma.loyaltyProfile.findFirst({
      where: {
        userId,
        organizationId: admin.organizationId
      }
    });

    if (!loyaltyProfile) {
      loyaltyProfile = await prisma.loyaltyProfile.create({
        data: {
          userId,
          organizationId: admin.organizationId,
          individualServicesCount: 0,
          packagesCount: 0,
          totalSpent: 0,
          availableDiscounts: '[]'
        }
      });
    }

    // 🔒 Créer une entrée dans l'historique DE CETTE ORGANISATION
    await prisma.loyaltyHistory.create({
      data: {
        userId,
        organizationId: admin.organizationId,
        action: 'DISCOUNT_APPLIED',
        points: 0,
        description: `Réduction manuelle de ${discountAmount}€ : ${reason}`
      }
    });

    // Si c'est une réduction de fidélité, décrémenter les compteurs
    if (reason.includes('5 soins')) {
      await prisma.loyaltyProfile.update({
        where: { userId },
        data: {
          individualServicesCount: Math.max(0, loyaltyProfile.individualServicesCount - 5)
        }
      });
    } else if (reason.includes('3 forfaits')) {
      await prisma.loyaltyProfile.update({
        where: { userId },
        data: {
          packagesCount: Math.max(0, loyaltyProfile.packagesCount - 3)
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Erreur lors de l\'application de la réduction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'application' },
      { status: 500 }
    );
  }
}