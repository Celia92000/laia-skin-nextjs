
import { verifyToken } from '@/lib/auth';/**
 * API Route: Métriques business pour dashboard super-admin
 * Retourne les KPIs critiques
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Période: 30 derniers jours
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 1. Revenus mensuels (estimés selon les plans)
    const organizations = await prisma.organization.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      select: {
        plan: true,
        status: true,
        createdAt: true,
        nextBillingDate: true,
      },
    })

    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179,
    }

    const monthlyRevenue = organizations
      .filter(org => org.status === 'ACTIVE')
      .reduce((sum, org) => sum + (planPrices[org.plan] || 0), 0)

    const potentialRevenue = organizations
      .filter(org => org.status === 'TRIAL')
      .reduce((sum, org) => sum + (planPrices[org.plan] || 0), 0)

    // 2. Nouveaux clients (30 derniers jours)
    const newCustomers = await prisma.organization.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // 3. Clients actifs vs en trial
    const activeCustomers = await prisma.organization.count({
      where: { status: 'ACTIVE' },
    })

    const trialCustomers = await prisma.organization.count({
      where: { status: 'TRIAL' },
    })

    const suspendedCustomers = await prisma.organization.count({
      where: { status: 'SUSPENDED' },
    })

    // 4. Répartition par plan
    const planDistribution = await (prisma.organization.groupBy as any)({
      by: ['plan'],
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      _count: {
        id: true,
      },
    })

    // 5. Taux de conversion Trial → Active (derniers 90 jours)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const recentOrgs = await prisma.organization.findMany({
      where: {
        createdAt: {
          gte: ninetyDaysAgo,
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
    })

    const trialStarted = recentOrgs.length
    const converted = recentOrgs.filter(org => org.status === 'ACTIVE').length
    const conversionRate = trialStarted > 0 ? (converted / trialStarted) * 100 : 0

    // 6. Prochaines facturations (7 prochains jours)
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const upcomingBillings = await prisma.organization.count({
      where: {
        nextBillingDate: {
          gte: new Date(),
          lte: sevenDaysLater,
        },
        status: 'ACTIVE',
      },
    })

    const upcomingRevenue = await prisma.organization.findMany({
      where: {
        nextBillingDate: {
          gte: new Date(),
          lte: sevenDaysLater,
        },
        status: 'ACTIVE',
      },
      select: {
        plan: true,
      },
    })

    const upcomingAmount = upcomingRevenue.reduce(
      (sum, org) => sum + (planPrices[org.plan] || 0),
      0
    )

    // 7. Croissance MoM (Month over Month)
    const lastMonthStart = new Date()
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    lastMonthStart.setDate(1)

    const lastMonthEnd = new Date()
    lastMonthEnd.setDate(1)

    const lastMonthNewCustomers = await prisma.organization.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lt: lastMonthEnd,
        },
      },
    })

    const growthRate =
      lastMonthNewCustomers > 0
        ? ((newCustomers - lastMonthNewCustomers) / lastMonthNewCustomers) * 100
        : 0

    return NextResponse.json({
      success: true,
      metrics: {
        // Revenus
        monthlyRevenue,
        potentialRevenue,
        upcomingRevenue: {
          count: upcomingBillings,
          amount: upcomingAmount,
        },

        // Clients
        totalCustomers: activeCustomers + trialCustomers,
        activeCustomers,
        trialCustomers,
        suspendedCustomers,
        newCustomers,

        // Croissance
        conversionRate: Math.round(conversionRate * 10) / 10,
        growthRate: Math.round(growthRate * 10) / 10,

        // Répartition
        planDistribution: planDistribution.map(p => ({
          plan: p.plan,
          count: p._count.id,
          revenue: (p._count.id * (planPrices[p.plan] || 0)),
        })),

        // Meta
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Erreur récupération métriques:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
