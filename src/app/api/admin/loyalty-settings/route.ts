import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer les paramètres de fidélité
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const allowedRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN'];
    if (!auth.isValid || !auth.user || !allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les paramètres depuis la base de données
    const config = await prisma.siteConfig.findFirst();

    const settings = {
      serviceThreshold: config?.loyaltyServiceThreshold || 10,
      serviceDiscount: config?.loyaltyServiceDiscount || 10,
      packageThreshold: config?.loyaltyPackageThreshold || 3,
      packageDiscount: config?.loyaltyPackageDiscount || 20,
      referralSponsorDiscount: config?.referralSponsorDiscount || 10,
      referralReferredDiscount: config?.referralReferredDiscount || 10,
      birthdayDiscount: config?.birthdayDiscount || 10,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de fidélité:', error);
    // Retourner les valeurs par défaut en cas d'erreur
    return NextResponse.json({
      settings: {
        serviceThreshold: 10,
        serviceDiscount: 10,
        packageThreshold: 3,
        packageDiscount: 20,
        referralSponsorDiscount: 10,
        referralReferredDiscount: 10,
        birthdayDiscount: 10,
      }
    });
  }
}

// PUT - Mettre à jour les paramètres de fidélité
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const allowedRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN'];
    if (!auth.isValid || !auth.user || !allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceThreshold,
      serviceDiscount,
      packageThreshold,
      packageDiscount,
      referralSponsorDiscount,
      referralReferredDiscount,
      birthdayDiscount,
    } = body;

    // Mettre à jour les paramètres dans la base de données
    const config = await prisma.siteConfig.findFirst();

    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          loyaltyServiceThreshold: serviceThreshold,
          loyaltyServiceDiscount: serviceDiscount,
          loyaltyPackageThreshold: packageThreshold,
          loyaltyPackageDiscount: packageDiscount,
          referralSponsorDiscount: referralSponsorDiscount,
          referralReferredDiscount: referralReferredDiscount,
          birthdayDiscount: birthdayDiscount,
        },
      });
    } else {
      await prisma.siteConfig.create({
        data: {
          siteName: 'LAIA Skin Institut',
          loyaltyServiceThreshold: serviceThreshold,
          loyaltyServiceDiscount: serviceDiscount,
          loyaltyPackageThreshold: packageThreshold,
          loyaltyPackageDiscount: packageDiscount,
          referralSponsorDiscount: referralSponsorDiscount,
          referralReferredDiscount: referralReferredDiscount,
          birthdayDiscount: birthdayDiscount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de fidélité mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de fidélité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}
