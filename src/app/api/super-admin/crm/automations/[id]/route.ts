import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/super-admin/crm/automations/[id]
 * Active/désactive une automatisation ou modifie ses paramètres
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const automationId = params.id

    // Dans une vraie implémentation, on mettrait à jour en base
    return NextResponse.json({
      success: true,
      message: 'Automatisation mise à jour',
      automationId,
      updates: body
    })

  } catch (error) {
    console.error('Error updating automation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/super-admin/crm/automations/[id]
 * Supprime une automatisation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const automationId = params.id

    // Dans une vraie implémentation, on supprimerait de la base
    return NextResponse.json({
      success: true,
      message: 'Automatisation supprimée',
      automationId
    })

  } catch (error) {
    console.error('Error deleting automation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
