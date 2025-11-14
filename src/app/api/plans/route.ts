import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/plans
 * Récupère les formules d'abonnement actives (API publique)
 * Utilisé par : onboarding, page tarifs, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })

    // Parser les JSON fields et formater pour le client
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      planKey: plan.planKey,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly || plan.priceMonthly * 12,
      maxLocations: plan.maxLocations,
      maxUsers: plan.maxUsers,
      maxStorage: plan.maxStorage,
      features: JSON.parse(plan.features || '[]'),
      highlights: JSON.parse(plan.highlights || '[]'),
      isPopular: plan.isPopular,
      isRecommended: plan.isRecommended,
      stripePriceId: plan.stripePriceId
    }))

    return NextResponse.json({ plans: formattedPlans })
  } catch (error) {
    log.error('Erreur récupération plans publics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
