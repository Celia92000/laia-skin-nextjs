import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';

const prisma = new PrismaClient();

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

    // 🔒 Récupérer les parrainages effectués par ce client DANS CETTE ORGANISATION
    const referrals = await prisma.referral.findMany({
      where: {
        referrerUserId: clientId,
        organizationId: organizationId
      }
    });

    // 🔒 Calculer les récompenses gagnées DANS CETTE ORGANISATION
    const rewards = await prisma.discount.findMany({
      where: {
        userId: clientId,
        organizationId: organizationId,
        type: 'referral',
        status: { in: ['used', 'available'] }
      }
    });

    const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);
    const successfulReferrals = referrals.filter(r => r.status === 'rewarded').length;

    return NextResponse.json({
      referred: referrals.length,
      rewards: totalRewards,
      successfulReferrals,
      pendingRewards: referrals.filter(r => r.status === 'used').length
    });

  } catch (error) {
    console.error('Erreur stats parrainage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    );
  }
}