import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Obtenir la configuration du programme de parrainage
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer la configuration de l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: {
        referralEnabled: true,
        referralRewardType: true,
        referralRewardAmount: true,
        referralMinimumPurchase: true,
        referralReferrerReward: true,
        referralReferredReward: true,
        referralTermsUrl: true,
        referralEmailTemplate: true
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    log.error('Erreur récupération config parrainage:', error);
    return NextResponse.json({
      error: 'Erreur lors de la récupération de la configuration'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour la configuration du programme de parrainage
export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (decoded.role !== 'ORG_ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        error: 'Accès refusé - Admin uniquement'
      }, { status: 403 });
    }

    const body = await request.json();

    // Validation des données
    const updateData: {
      referralEnabled?: boolean;
      referralRewardType?: string;
      referralRewardAmount?: number;
      referralMinimumPurchase?: number;
      referralReferrerReward?: number;
      referralReferredReward?: number;
      referralTermsUrl?: string | null;
      referralEmailTemplate?: string | null;
    } = {};

    if (typeof body.referralEnabled === 'boolean') {
      updateData.referralEnabled = body.referralEnabled;
    }

    if (body.referralRewardType === 'FIXED' || body.referralRewardType === 'PERCENTAGE') {
      updateData.referralRewardType = body.referralRewardType;
    }

    if (typeof body.referralRewardAmount === 'number' && body.referralRewardAmount >= 0) {
      updateData.referralRewardAmount = body.referralRewardAmount;
    }

    if (typeof body.referralMinimumPurchase === 'number' && body.referralMinimumPurchase >= 0) {
      updateData.referralMinimumPurchase = body.referralMinimumPurchase;
    }

    if (typeof body.referralReferrerReward === 'number' && body.referralReferrerReward >= 0) {
      updateData.referralReferrerReward = body.referralReferrerReward;
    }

    if (typeof body.referralReferredReward === 'number' && body.referralReferredReward >= 0) {
      updateData.referralReferredReward = body.referralReferredReward;
    }

    if (body.referralTermsUrl !== undefined) {
      updateData.referralTermsUrl = body.referralTermsUrl || null;
    }

    if (body.referralEmailTemplate !== undefined) {
      updateData.referralEmailTemplate = body.referralEmailTemplate || null;
    }

    // Mettre à jour la configuration
    const organization = await prisma.organization.update({
      where: { id: decoded.organizationId },
      data: updateData,
      select: {
        referralEnabled: true,
        referralRewardType: true,
        referralRewardAmount: true,
        referralMinimumPurchase: true,
        referralReferrerReward: true,
        referralReferredReward: true,
        referralTermsUrl: true,
        referralEmailTemplate: true
      }
    });

    log.info('Configuration parrainage mise à jour', {
      organizationId: decoded.organizationId,
      userId: decoded.userId
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: organization
    });
  } catch (error) {
    log.error('Erreur mise à jour config parrainage:', error);
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour de la configuration'
    }, { status: 500 });
  }
}
