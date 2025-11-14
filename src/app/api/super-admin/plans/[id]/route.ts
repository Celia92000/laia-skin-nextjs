import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { log } from '@/lib/logger';

/**
 * PATCH /api/super-admin/plans/[id]
 * Modifie une formule d'abonnement
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification super-admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const {
      displayName,
      description,
      priceMonthly,
      priceYearly,
      maxLocations,
      maxUsers,
      maxStorage,
      highlights,
      isPopular,
      isRecommended,
      isActive
    } = body

    // Préparer les données de mise à jour
    const updateData: any = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (description !== undefined) updateData.description = description
    if (priceMonthly !== undefined) updateData.priceMonthly = priceMonthly
    if (priceYearly !== undefined) updateData.priceYearly = priceYearly
    if (maxLocations !== undefined) updateData.maxLocations = maxLocations
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers
    if (maxStorage !== undefined) updateData.maxStorage = maxStorage
    if (isPopular !== undefined) updateData.isPopular = isPopular
    if (isRecommended !== undefined) updateData.isRecommended = isRecommended
    if (isActive !== undefined) updateData.isActive = isActive

    // JSON fields
    if (highlights !== undefined) {
      updateData.highlights = JSON.stringify(highlights)
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData
    })

    // Parser les JSON fields pour la réponse
    const parsedPlan = {
      ...updatedPlan,
      features: JSON.parse(updatedPlan.features || '[]'),
      highlights: JSON.parse(updatedPlan.highlights || '[]')
    }

    return NextResponse.json({ plan: parsedPlan })
  } catch (error) {
    log.error('Erreur mise à jour plan:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
