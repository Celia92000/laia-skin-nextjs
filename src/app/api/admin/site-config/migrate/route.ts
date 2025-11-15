import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier les permissions (seulement SUPER_ADMIN ou ORG_OWNER)
    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
    if (!allowedRoles.includes(decoded.role as string)) {
      return NextResponse.json({
        error: 'Accès refusé. Seuls les SUPER_ADMIN et ORG_OWNER peuvent effectuer cette opération.'
      }, { status: 403 });
    }

    // Récupérer l'utilisateur pour obtenir son organizationId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 403 });
    }

    const { action } = await request.json();

    // Action 1 : Configurer organizationId dans SiteConfig
    if (action === 'configure_site_config') {
      const siteConfig = await prisma.siteConfig.findFirst();

      if (!siteConfig) {
        return NextResponse.json({
          error: 'SiteConfig introuvable. Veuillez créer une configuration de site d\'abord.'
        }, { status: 404 });
      }

      await prisma.siteConfig.update({
        where: { id: siteConfig.id },
        data: { organizationId: user.organizationId }
      });

      return NextResponse.json({
        success: true,
        message: 'OrganizationId configuré dans SiteConfig',
        siteConfig: await prisma.siteConfig.findFirst()
      });
    }

    // Action 2 : Migrer les cartes cadeaux existantes
    if (action === 'migrate_gift_cards') {
      // Compter les cartes sans organizationId
      const cardsWithoutOrg = await prisma.giftCard.count({
        where: { organizationId: null }
      });

      if (cardsWithoutOrg === 0) {
        return NextResponse.json({
          success: true,
          message: 'Aucune carte cadeau à migrer',
          updated: 0
        });
      }

      // Mettre à jour toutes les cartes sans organizationId
      const result = await prisma.giftCard.updateMany({
        where: { organizationId: null },
        data: { organizationId: user.organizationId }
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} carte(s) cadeau migrée(s)`,
        updated: result.count
      });
    }

    // Action 3 : Vérifier l'état de la migration
    if (action === 'check_status') {
      const [
        siteConfig,
        totalGiftCards,
        giftCardsWithOrg,
        giftCardsWithoutOrg
      ] = await Promise.all([
        prisma.siteConfig.findFirst({ select: { organizationId: true } }),
        prisma.giftCard.count(),
        prisma.giftCard.count({ where: { organizationId: { not: null } } }),
        prisma.giftCard.count({ where: { organizationId: null } })
      ]);

      return NextResponse.json({
        siteConfig: {
          hasOrganizationId: !!siteConfig?.organizationId,
          organizationId: siteConfig?.organizationId
        },
        giftCards: {
          total: totalGiftCards,
          withOrganization: giftCardsWithOrg,
          withoutOrganization: giftCardsWithoutOrg,
          migrationNeeded: giftCardsWithoutOrg > 0
        }
      });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });

  } catch (error: any) {
    log.error('Erreur migration:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
