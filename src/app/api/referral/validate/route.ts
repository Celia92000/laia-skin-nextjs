import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { notifyLoyaltyMilestone } from '@/lib/notifications';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code, clientId } = await request.json();

    if (!code || !clientId) {
      return NextResponse.json(
        { error: 'Code et clientId requis' },
        { status: 400 }
      );
    }

    // Vérifier que le client existe
    const client = await prisma.user.findFirst({
      where: { id: clientId },
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

    // Vérifier que le code existe et appartient à un autre client
    const referrer = await prisma.loyaltyProfile.findFirst({
      where: { 
        referralCode: code,
        userId: { not: clientId }
      },
      include: { user: true }
    });

    if (!referrer) {
      return NextResponse.json(
        { error: 'Code de parrainage invalide' },
        { status: 400 }
      );
    }

    // Créer ou mettre à jour le profil de fidélité du client
    await prisma.loyaltyProfile.upsert({
      where: { userId: clientId },
      create: {
        userId: clientId,
        referredBy: code
      },
      update: {
        referredBy: code
      }
    });

    // Créer l'entrée de parrainage
    await prisma.referral.create({
      data: {
        referrerUserId: referrer.userId,
        referralCode: code,
        referredUserId: clientId,
        status: 'used',
        rewardAmount: 15
      }
    });

    // Créer les réductions pour les deux parties
    // Réduction pour le nouveau client/filleul (utilisable immédiatement) - 10€
    await prisma.discount.create({
      data: {
        userId: clientId,
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

    // Envoyer une notification au parrain
    await prisma.notification.create({
      data: {
        userId: referrer.userId,
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
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId requis' },
        { status: 400 }
      );
    }

    // Récupérer le code de parrainage du client
    const profile = await prisma.loyaltyProfile.findUnique({
      where: { userId: clientId }
    });

    if (!profile || !profile.referralCode) {
      // Créer un code de parrainage si n'existe pas
      const user = await prisma.user.findFirst({
        where: { id: clientId }
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