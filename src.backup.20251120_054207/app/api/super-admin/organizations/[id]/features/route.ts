import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-session'
import { log } from '@/lib/logger';

/**
 * PATCH /api/super-admin/organizations/[id]/features
 * Modifie les features personnalisées d'une organisation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification super-admin
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { customFeaturesEnabled, customFeaturesDisabled } = body

    // Valider que ce sont bien des arrays
    if (
      !Array.isArray(customFeaturesEnabled) ||
      !Array.isArray(customFeaturesDisabled)
    ) {
      return NextResponse.json(
        { error: 'customFeaturesEnabled et customFeaturesDisabled doivent être des arrays' },
        { status: 400 }
      )
    }

    // Mettre à jour l'organisation
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        customFeaturesEnabled: JSON.stringify(customFeaturesEnabled),
        customFeaturesDisabled: JSON.stringify(customFeaturesDisabled)
      }
    })

    return NextResponse.json({
      success: true,
      organization: {
        ...updatedOrganization,
        customFeaturesEnabled: JSON.parse(
          updatedOrganization.customFeaturesEnabled || '[]'
        ),
        customFeaturesDisabled: JSON.parse(
          updatedOrganization.customFeaturesDisabled || '[]'
        )
      }
    })
  } catch (error) {
    log.error('Erreur mise à jour custom features:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
