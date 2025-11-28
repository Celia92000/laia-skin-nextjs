import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getUsageDashboard } from '@/lib/quotas';

/**
 * GET /api/super-admin/usage
 * Récupère l'usage de toutes les organisations (Super Admin uniquement)
 */
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès Super Admin requis' }, { status: 403 });
    }

    const prisma = await getPrismaClient();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organizationId');

    // Si un ID d'organisation est fourni, retourner uniquement cette org
    if (organizationId) {
      const dashboard = await getUsageDashboard(organizationId);
      return NextResponse.json(dashboard);
    }

    // Sinon, retourner un résumé de toutes les organisations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        maxUsers: true,
        maxLocations: true,
        maxStorage: true,
        usage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      limits: {
        users: org.maxUsers,
        locations: org.maxLocations,
        storage: org.maxStorage,
      },
      usage: org.usage
        ? {
            users: org.usage.currentUsers,
            locations: org.usage.currentLocations,
            storageGB: Number(org.usage.currentStorageBytes) / (1024 * 1024 * 1024),
            emailsThisMonth: org.usage.emailsSentThisMonth,
            whatsappThisMonth: org.usage.whatsappSentThisMonth,
            totalRevenue: org.usage.totalRevenue,
          }
        : null,
    }));

    // Calculer les totaux plateforme
    const platformTotals = {
      totalOrganizations: organizations.length,
      activeOrganizations: organizations.filter((o) => o.status === 'ACTIVE').length,
      trialOrganizations: organizations.filter((o) => o.status === 'TRIAL').length,
      totalUsers: summary.reduce((acc, o) => acc + (o.usage?.users || 0), 0),
      totalLocations: summary.reduce((acc, o) => acc + (o.usage?.locations || 0), 0),
      totalStorageGB: summary.reduce((acc, o) => acc + (o.usage?.storageGB || 0), 0),
      totalEmailsThisMonth: summary.reduce((acc, o) => acc + (o.usage?.emailsThisMonth || 0), 0),
      totalRevenue: summary.reduce((acc, o) => acc + (o.usage?.totalRevenue || 0), 0),
      byPlan: {
        SOLO: organizations.filter((o) => o.plan === 'SOLO').length,
        TEAM: organizations.filter((o) => o.plan === 'TEAM').length,
        PREMIUM: organizations.filter((o) => o.plan === 'PREMIUM').length,
        ENTERPRISE: organizations.filter((o) => o.plan === 'ENTERPRISE').length,
      },
    };

    return NextResponse.json({
      organizations: summary,
      platform: platformTotals,
    });
  } catch (error) {
    console.error('Erreur récupération usage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
