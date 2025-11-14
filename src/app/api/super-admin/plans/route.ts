import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/plans
 * Récupère toutes les formules d'abonnement
 */
export async function GET(request: NextRequest) {
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

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { displayOrder: 'asc' }
    })

    // Parser les JSON fields
    const parsedPlans = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]'),
      highlights: JSON.parse(plan.highlights || '[]')
    }))

    return NextResponse.json({ plans: parsedPlans })
  } catch (error) {
    log.error('Erreur récupération plans:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
