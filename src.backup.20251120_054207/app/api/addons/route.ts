import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import {
  getAvailableAddonsForPlan,
  activateAddons,
  deactivateAddons,
  getActiveAddons,
  calculateTotalMonthlyCost
} from '@/lib/addons-manager'

/**
 * GET /api/addons - Récupère les add-ons disponibles et actifs
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'utilisateur et son organisation
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        organizationId: true,
        role: true,
        organization: {
          select: {
            plan: true
          }
        }
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Seuls les admins peuvent voir/gérer les add-ons
    if (user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const plan = user.organization?.plan || 'SOLO'

    // Récupérer les add-ons disponibles pour ce plan
    const availableAddons = getAvailableAddonsForPlan(plan)

    // Récupérer les add-ons actifs
    const activeAddons = await getActiveAddons(user.organizationId)

    // Calculer le coût total
    const totalMonthlyCost = await calculateTotalMonthlyCost(user.organizationId)

    return NextResponse.json({
      plan,
      availableAddons,
      activeAddons,
      totalMonthlyCost
    })

  } catch (error: any) {
    log.error('Erreur récupération add-ons:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/addons - Active des add-ons
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { addonIds } = await req.json()

    if (!Array.isArray(addonIds) || addonIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'add-ons invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        organizationId: true,
        role: true
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Seuls les admins peuvent activer des add-ons
    if (user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Activer les add-ons
    const result = await activateAddons(user.organizationId, addonIds)

    return NextResponse.json({
      success: true,
      ...result,
      message: `${result.activatedAddons.length} add-on(s) activé(s) avec succès`
    })

  } catch (error: any) {
    log.error('Erreur activation add-ons:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/addons - Désactive des add-ons
 */
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { addonIds } = await req.json()

    if (!Array.isArray(addonIds) || addonIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'add-ons invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        organizationId: true,
        role: true
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Seuls les admins peuvent désactiver des add-ons
    if (user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Désactiver les add-ons
    const result = await deactivateAddons(user.organizationId, addonIds)

    return NextResponse.json({
      success: true,
      ...result,
      message: `${result.deactivatedAddons.length} add-on(s) désactivé(s) avec succès`
    })

  } catch (error: any) {
    log.error('Erreur désactivation add-ons:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
