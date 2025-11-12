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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // 🔒 Récupérer les réductions DE CETTE ORGANISATION
    const discounts = await prisma.discount.findMany({
      where: {
        userId,
        organizationId: organizationId
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(discounts);

  } catch (error) {
    console.error('Erreur récupération historique réductions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}