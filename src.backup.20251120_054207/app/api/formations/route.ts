import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getOrganizationFromHost } from '@/lib/get-organization';
import { log } from '@/lib/logger';

// API publique pour vérifier s'il y a des formations actives
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const host = request.headers.get('host') || '';
    const organization = await getOrganizationFromHost(prisma, host);

    if (!organization) {
      return NextResponse.json([], { status: 200 });
    }

    const formations = await prisma.formation.findMany({
      where: {
        organizationId: organization.id,
        active: true
      },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    return NextResponse.json(formations);
  } catch (error) {
    log.error('Erreur lors de la récupération des formations:', error);
    return NextResponse.json([], { status: 200 }); // Retourne tableau vide en cas d'erreur
  }
}
