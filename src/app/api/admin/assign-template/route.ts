import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/admin/assign-template
 * Assigne un template à une organisation
 */
export async function POST(request: Request) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const body = await request.json()
    const { organizationId, organizationSlug, templateId } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID requis' }, { status: 400 })
    }

    // Trouver l'organisation
    let org
    if (organizationId) {
      org = await prisma.organization.findUnique({
        where: { id: organizationId },
      })
    } else if (organizationSlug) {
      org = await prisma.organization.findFirst({
        where: { slug: organizationSlug },
      })
    } else {
      return NextResponse.json(
        { error: 'Organization ID ou slug requis' },
        { status: 400 }
      )
    }

    if (!org) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour le template
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: { websiteTemplateId: templateId },
    })

    return NextResponse.json({
      success: true,
      organization: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        websiteTemplateId: updated.websiteTemplateId,
      },
    })
  } catch (error: any) {
    log.error('[assign-template] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}
