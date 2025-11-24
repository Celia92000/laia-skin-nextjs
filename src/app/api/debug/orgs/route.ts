import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET() {
  const prisma = await getPrismaClient();

  try {
    // Lister toutes les organisations
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        status: true,
        referralEnabled: true,
        referralRewardType: true,
        referralReferrerReward: true
      }
    });

    // Pour chaque org, récupérer les admins
    const orgsWithAdmins = await Promise.all(
      orgs.map(async (org) => {
        const admins = await prisma.user.findMany({
          where: {
            organizationId: org.id,
            OR: [
              { role: 'ORG_ADMIN' },
              { role: 'SUPER_ADMIN' }
            ]
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        });

        return {
          ...org,
          admins
        };
      })
    );

    return NextResponse.json({
      organizations: orgsWithAdmins,
      total: orgs.length
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
