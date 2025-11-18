import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

// Générer un code de parrainage unique
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}-${random}`;
}

// GET - Obtenir les informations de parrainage d'un utilisateur
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-secret-2024') as any;

    // 🔒 Récupérer le profil de fidélité DE CETTE ORGANISATION
    const loyaltyProfile = await prisma.loyaltyProfile.findFirst({
      where: {
        userId: decoded.id,
        organizationId: decoded.organizationId
      },
      include: {
        user: true
      }
    });

    // Si pas de code de parrainage, en générer un
    if (loyaltyProfile && !loyaltyProfile.referralCode) {
      const code = generateReferralCode(loyaltyProfile.user.name);
      await prisma.loyaltyProfile.update({
        where: { id: loyaltyProfile.id },
        data: { referralCode: code }
      });
      loyaltyProfile.referralCode = code;
    }

    // 🔒 Récupérer les parrainages effectués DE CETTE ORGANISATION
    const referrals = await prisma.referral.findMany({
      where: {
        referrerUserId: decoded.id,
        organizationId: decoded.organizationId
      },
      include: {
        referred: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer les récompenses disponibles
    const availableRewards = referrals.filter(r => 
      r.status === 'rewarded' && !r.rewardUsedAt
    );
    const totalRewardsAmount = availableRewards.reduce((sum, r) => sum + r.rewardAmount, 0);

    return NextResponse.json({
      referralCode: loyaltyProfile?.referralCode,
      totalReferrals: loyaltyProfile?.totalReferrals || 0,
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.referredName || r.referred?.name || 'En attente',
        email: r.referredEmail || r.referred?.email,
        status: r.status,
        rewardAmount: r.rewardAmount,
        createdAt: r.createdAt,
        firstServiceDate: r.firstServiceDate,
        canUseReward: r.status === 'rewarded' && !r.rewardUsedAt
      })),
      availableRewardsAmount: totalRewardsAmount,
      shareUrl: `https://laiaskin.fr/register?ref=${loyaltyProfile?.referralCode}`
    });
  } catch (error) {
    log.error('Erreur récupération parrainage:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des informations' 
    }, { status: 500 });
  }
}

// POST - Créer un nouveau parrainage
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-secret-2024') as any;

    const { email, name } = await request.json();

    // 🔒 Vérifier si l'email n'est pas déjà client DE CETTE ORGANISATION
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId: decoded.organizationId
      }
    });

    if (existingUser) {
      return NextResponse.json({
        error: 'Cette personne est déjà cliente'
      }, { status: 400 });
    }

    // 🔒 Vérifier si pas déjà parrainé DANS CETTE ORGANISATION
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referredEmail: email,
        organizationId: decoded.organizationId,
        status: { not: 'cancelled' }
      }
    });

    if (existingReferral) {
      return NextResponse.json({
        error: 'Cette personne a déjà été parrainée'
      }, { status: 400 });
    }

    // 🔒 Récupérer le profil de fidélité du parrain DE CETTE ORGANISATION
    const loyaltyProfile = await prisma.loyaltyProfile.findFirst({
      where: {
        userId: decoded.id,
        organizationId: decoded.organizationId
      },
      include: { user: true }
    });

    if (!loyaltyProfile?.referralCode) {
      const code = generateReferralCode(decoded.name);
      await prisma.loyaltyProfile.update({
        where: { id: loyaltyProfile.id },
        data: { referralCode: code }
      });
    }

    // 🔒 Créer le parrainage POUR CETTE ORGANISATION
    const referral = await prisma.referral.create({
      data: {
        referrerUserId: decoded.id,
        organizationId: decoded.organizationId,
        referralCode: `${loyaltyProfile?.referralCode || generateReferralCode(decoded.name)}-${Date.now()}`,
        referredEmail: email,
        referredName: name,
        status: 'pending',
        rewardAmount: 20
      }
    });

    // Envoyer un email d'invitation (à implémenter avec Resend)
    // ...

    return NextResponse.json({
      success: true,
      referralId: referral.id,
      message: 'Invitation envoyée avec succès'
    });
  } catch (error) {
    log.error('Erreur création parrainage:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création du parrainage' 
    }, { status: 500 });
  }
}

// PUT - Utiliser une récompense de parrainage
export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try{
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-secret-2024') as any;

    const { referralId } = await request.json();

    // 🔒 Vérifier que le parrainage existe, appartient à l'utilisateur ET à cette organisation
    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        referrerUserId: decoded.id,
        organizationId: decoded.organizationId,
        status: 'rewarded',
        rewardUsedAt: null
      }
    });

    if (!referral) {
      return NextResponse.json({ 
        error: 'Récompense non disponible' 
      }, { status: 400 });
    }

    // Marquer la récompense comme utilisée
    await prisma.referral.update({
      where: { id: referralId },
      data: { rewardUsedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: `Réduction de ${referral.rewardAmount}€ appliquée`
    });
  } catch (error) {
    log.error('Erreur utilisation récompense:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'utilisation de la récompense' 
    }, { status: 500 });
  }
}