import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const prisma = await getPrismaClient();
    const { slug } = await params;
    
    // Utiliser findFirst car slug seul n'est pas unique (nécessite organizationId)
    const service = await prisma.service.findFirst({
      where: {
        slug,
        active: true
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    log.error('Erreur lors de la récupération du service:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}