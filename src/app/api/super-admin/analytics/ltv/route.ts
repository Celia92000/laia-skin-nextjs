import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

interface OrganizationLTV {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: Date

  // Métriques de revenus
  totalRevenue: number              // CA total généré
  monthlySubscriptionFee: number    // Abonnement mensuel

  // Métriques temporelles
  lifetimeMonths: number            // Nombre de mois depuis création
  activeMonths: number              // Nombre de mois actifs

  // Métriques d'activité
  totalReservations: number
  averageReservationsPerMonth: number

  // Calculs LTV
  historicalLTV: number             // LTV réel historique
  predictedLTV: number              // LTV prédit basé sur les tendances
  remainingLTV: number              // LTV restant estimé

  // Métriques avancées
  churnProbability: number          // Probabilité de churn (0-1)
  averageLifetimeExpectancy: number // Durée de vie client estimée (mois)
  monthlyGrowthRate: number         // Taux de croissance mensuel (%)
}

/**
 * GET /api/super-admin/analytics/ltv
 * Calcule le LTV (Lifetime Value) de toutes les organisations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer toutes les organisations avec leurs données
    const organizations = await prisma.organization.findMany({
      include: {
        reservations: {
          where: {
            status: { in: ['completed', 'confirmed', 'COMPLETED', 'CONFIRMED'] }
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    const now = new Date()

    // Plans pricing (aligné avec la structure réelle)
    const planPrices: Record<string, number> = {
      'SOLO': 49,
      'DUO': 89,
      'TEAM': 149,
      'PREMIUM': 249
    }

    // Calculer le LTV pour chaque organisation
    const ltvData: OrganizationLTV[] = organizations.map(org => {
      const createdAt = new Date(org.createdAt)

      // Métriques temporelles
      const lifetimeMonths = Math.max(1, Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      ))

      // Calculer les mois actifs (mois avec au moins 1 réservation)
      const monthsWithActivity = new Set(
        org.reservations.map(r => {
          const date = new Date(r.createdAt)
          return `${date.getFullYear()}-${date.getMonth() + 1}`
        })
      ).size
      const activeMonths = Math.max(1, monthsWithActivity)

      // Revenus
      const totalRevenue = org.reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
      const monthlySubscriptionFee = planPrices[org.plan] || 0

      // Activité
      const totalReservations = org.reservations.length
      const averageReservationsPerMonth = totalReservations / lifetimeMonths

      // LTV historique (ce que le client a déjà généré)
      const historicalLTV = totalRevenue + (monthlySubscriptionFee * lifetimeMonths)

      // Probabilité de churn basée sur l'activité récente
      const lastReservation = org.reservations.length > 0
        ? new Date(Math.max(...org.reservations.map(r => new Date(r.createdAt).getTime())))
        : createdAt
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastReservation.getTime()) / (1000 * 60 * 60 * 24)
      )

      let churnProbability = 0
      if (daysSinceLastActivity > 180) churnProbability = 0.8
      else if (daysSinceLastActivity > 90) churnProbability = 0.5
      else if (daysSinceLastActivity > 30) churnProbability = 0.2
      else churnProbability = 0.05

      // Ajuster le churn selon le statut
      if (org.status === 'CANCELLED') churnProbability = 1.0
      if (org.status === 'SUSPENDED') churnProbability = 0.9
      if (org.status === 'TRIAL') churnProbability = 0.3

      // Durée de vie moyenne attendue (en mois)
      // Formule basée sur le taux de churn : lifetime = 1 / churn_rate
      const monthlyChurnRate = Math.max(0.01, churnProbability / 12)
      const averageLifetimeExpectancy = Math.round(1 / monthlyChurnRate)

      // Taux de croissance mensuel
      const recentMonthsRevenue = org.reservations
        .filter(r => {
          const monthsAgo = (now.getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
          return monthsAgo <= 3
        })
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0)

      const previousMonthsRevenue = org.reservations
        .filter(r => {
          const monthsAgo = (now.getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
          return monthsAgo > 3 && monthsAgo <= 6
        })
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0)

      const monthlyGrowthRate = previousMonthsRevenue > 0
        ? Math.round(((recentMonthsRevenue - previousMonthsRevenue) / previousMonthsRevenue) * 100)
        : 0

      // LTV prédit (formule : ARPU × Durée de vie moyenne)
      const monthlyARPU = totalRevenue / Math.max(1, activeMonths)
      const predictedMonthlyRevenue = monthlyARPU + monthlySubscriptionFee
      const predictedLTV = predictedMonthlyRevenue * averageLifetimeExpectancy

      // LTV restant estimé
      const remainingMonths = Math.max(0, averageLifetimeExpectancy - lifetimeMonths)
      const remainingLTV = predictedMonthlyRevenue * remainingMonths

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        status: org.status,
        createdAt: org.createdAt,
        totalRevenue,
        monthlySubscriptionFee,
        lifetimeMonths,
        activeMonths,
        totalReservations,
        averageReservationsPerMonth: Math.round(averageReservationsPerMonth * 10) / 10,
        historicalLTV: Math.round(historicalLTV),
        predictedLTV: Math.round(predictedLTV),
        remainingLTV: Math.round(remainingLTV),
        churnProbability: Math.round(churnProbability * 100) / 100,
        averageLifetimeExpectancy,
        monthlyGrowthRate
      }
    })

    // Trier par LTV prédit décroissant
    ltvData.sort((a, b) => b.predictedLTV - a.predictedLTV)

    // Statistiques globales
    const stats = {
      totalOrganizations: ltvData.length,

      // LTV moyens
      averageHistoricalLTV: Math.round(
        ltvData.reduce((sum, o) => sum + o.historicalLTV, 0) / ltvData.length
      ),
      averagePredictedLTV: Math.round(
        ltvData.reduce((sum, o) => sum + o.predictedLTV, 0) / ltvData.length
      ),

      // Totaux
      totalHistoricalRevenue: Math.round(
        ltvData.reduce((sum, o) => sum + o.historicalLTV, 0)
      ),
      totalPredictedRevenue: Math.round(
        ltvData.reduce((sum, o) => sum + o.predictedLTV, 0)
      ),
      totalRemainingRevenue: Math.round(
        ltvData.reduce((sum, o) => sum + o.remainingLTV, 0)
      ),

      // Churn
      averageChurnProbability: Math.round(
        (ltvData.reduce((sum, o) => sum + o.churnProbability, 0) / ltvData.length) * 100
      ) / 100,
      highChurnRisk: ltvData.filter(o => o.churnProbability > 0.5).length,

      // Lifetime
      averageLifetimeMonths: Math.round(
        ltvData.reduce((sum, o) => sum + o.lifetimeMonths, 0) / ltvData.length
      ),
      averageLifetimeExpectancy: Math.round(
        ltvData.reduce((sum, o) => sum + o.averageLifetimeExpectancy, 0) / ltvData.length
      ),

      // Top performers
      top10ByLTV: ltvData.slice(0, 10).map(o => ({
        name: o.name,
        predictedLTV: o.predictedLTV,
        historicalLTV: o.historicalLTV
      })),

      // Distribution par plan
      byPlan: Object.keys(planPrices).map(plan => {
        const orgsInPlan = ltvData.filter(o => o.plan === plan)
        return {
          plan,
          count: orgsInPlan.length,
          averageLTV: orgsInPlan.length > 0
            ? Math.round(orgsInPlan.reduce((sum, o) => sum + o.predictedLTV, 0) / orgsInPlan.length)
            : 0,
          totalLTV: Math.round(orgsInPlan.reduce((sum, o) => sum + o.predictedLTV, 0))
        }
      })
    }

    return NextResponse.json({
      organizations: ltvData,
      stats,
      calculatedAt: new Date().toISOString()
    })

  } catch (error) {
    log.error('Error calculating LTV:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul du LTV' },
      { status: 500 }
    )
  }
}
