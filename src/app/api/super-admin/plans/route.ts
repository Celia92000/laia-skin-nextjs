import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-session'

/**
 * GET /api/super-admin/plans
 * Récupère toutes les formules d'abonnement
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super-admin
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
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
    console.error('Erreur récupération plans:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
