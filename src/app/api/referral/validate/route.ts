import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { notifyLoyaltyMilestone } from '@/lib/notifications';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { code, clientId } = await request.json();

    if (!code || !clientId) {
      return NextResponse.json(
        { error: 'Code et clientId requis' },
        { status: 400 }
      );
    }

    // 🔒 Vérifier que le client existe DANS CETTE ORGANISATION
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        organizationId: organizationId
      },
      include: { loyaltyProfile: true }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le client a déjà utilisé un code de parrainage
    if (client.loyaltyProfile?.referredBy) {
      return NextResponse.json(
        { error: 'Vous avez déjà utilisé un code de parrainage' },
        { status: 400 }
      );
    }

    // 🔒 Vérifier que le code existe et appartient à un autre client DE CETTE ORGANISATION
    const referrer = await prisma.loyaltyProfile.findFirst({
      where: {
        referralCode: code,
        userId: { not: clientId },
        organizationId: organizationId
      },
      include: { user: true }
    });

    if (!referrer) {
      return NextResponse.json(
        { error: 'Code de parrainage invalide' },
        { status: 400 }
      );
    }

    // 🔒 Créer ou mettre à jour le profil de fidélité du client DANS CETTE ORGANISATION
    await prisma.loyaltyProfile.upsert({
      where: { userId: clientId },
      create: {
        userId: clientId,
        organizationId: organizationId,
        referredBy: code
      },
      update: {
        referredBy: code
      }
    });

    // 🔒 Créer l'entrée de parrainage POUR CETTE ORGANISATION
    await prisma.referral.create({
      data: {
        referrerUserId: referrer.userId,
        organizationId: organizationId,
        referralCode: code,
        referredUserId: clientId,
        status: 'used',
        rewardAmount: 15
      }
    });

    // 🔒 Créer les réductions pour les deux parties DANS CETTE ORGANISATION
    // Réduction pour le nouveau client/filleul (utilisable immédiatement) - 10€
    await prisma.discount.create({
      data: {
        userId: clientId,
        organizationId: organizationId,
        type: 'referral_referred',
        amount: 10,
        status: 'available',
        originalReason: `Parrainage - Nouveau client (parrain: ${referrer.user.name})`,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 jours
      }
    });

    // Réduction pour le parrain (disponible après le premier soin du filleul) - 15€
    await prisma.discount.create({
      data: {
        userId: referrer.userId,
        organizationId: organizationId,
        type: 'referral_sponsor',
        amount: 15,
        status: 'pending',
        originalReason: `Parrainage - Récompense (filleul: ${client.name})`,
        notes: 'Sera activée après le premier soin du filleul'
      }
    });

    // Mettre à jour le compteur de parrainages
    await prisma.loyaltyProfile.update({
      where: { id: referrer.id },
      data: {
        totalReferrals: { increment: 1 }
      }
    });

    // 🔒 Envoyer une notification au parrain DANS CETTE ORGANISATION
    await prisma.notification.create({
      data: {
        userId: referrer.userId,
        organizationId: organizationId,
        type: 'referral',
        title: 'Code de parrainage utilisé',
        message: `🎉 ${client.name} a utilisé votre code de parrainage ! Vous recevrez 15€ de réduction après son premier soin.`,
        read: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Code de parrainage validé avec succès !',
      discount: 10, // Montant pour le filleul
      referrerDiscount: 15, // Montant pour le parrain
      referrerName: referrer.user.name
    });

  } catch (error) {
    console.error('Erreur validation parrainage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation du code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId requis' },
        { status: 400 }
      );
    }

    // 🔒 Récupérer le code de parrainage du client DE CETTE ORGANISATION
    const profile = await prisma.loyaltyProfile.findFirst({
      where: {
        userId: clientId,
        organizationId: organizationId
      }
    });

    if (!profile || !profile.referralCode) {
      // 🔒 Créer un code de parrainage si n'existe pas POUR CETTE ORGANISATION
      const user = await prisma.user.findFirst({
        where: {
          id: clientId,
          organizationId: organizationId
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const code = `LAIA${user.name.slice(0, 3).toUpperCase()}${clientId.slice(-4).toUpperCase()}`;

      const newProfile = await prisma.loyaltyProfile.upsert({
        where: { userId: clientId },
        create: {
          userId: clientId,
          organizationId: organizationId,
          referralCode: code
        },
        update: {
          referralCode: code
        }
      });

      return NextResponse.json({
        code: newProfile.referralCode,
        totalReferrals: newProfile.totalReferrals
      });
    }

    return NextResponse.json({
      code: profile.referralCode,
      totalReferrals: profile.totalReferrals,
      referredBy: profile.referredBy
    });

  } catch (error) {
    console.error('Erreur récupération code parrainage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du code' },
      { status: 500 }
    );
  }
}