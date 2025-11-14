import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * POST /api/admin/assign-template
 * Assigne un template à une organisation
 */
export async function POST(request: Request) {
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
