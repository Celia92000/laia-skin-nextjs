import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculer la date de début selon la période
    const now = new Date()
    let startDate = new Date()
    let monthsCount = 6

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        monthsCount = 1
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        monthsCount = 3
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        monthsCount = 6
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        monthsCount = 12
        break
    }

    // Croissance - Organisations
    const organizations = await prisma.organization.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true
      }
    })

    const orgsByMonth = new Map()
    organizations.forEach(org => {
      const monthKey = org.createdAt.toISOString().slice(0, 7) // YYYY-MM
      orgsByMonth.set(monthKey, (orgsByMonth.get(monthKey) || 0) + 1)
    })

    // Croissance - Utilisateurs
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        role: { not: 'SUPER_ADMIN' }
      },
      select: {
        createdAt: true
      }
    })

    const usersByMonth = new Map()
    users.forEach(user => {
      const monthKey = user.createdAt.toISOString().slice(0, 7)
      usersByMonth.set(monthKey, (usersByMonth.get(monthKey) || 0) + 1)
    })

    // Croissance - Réservations
    const reservations = await prisma.reservation.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true
      }
    })

    const reservationsByMonth = new Map()
    reservations.forEach(res => {
      const monthKey = res.createdAt.toISOString().slice(0, 7)
      reservationsByMonth.set(monthKey, (reservationsByMonth.get(monthKey) || 0) + 1)
    })

    // Générer les derniers mois
    const months = []
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      months.push({
        key: monthKey,
        name: monthName
      })
    }

    const growth = {
      organizations: months.map(m => ({ month: m.name, count: orgsByMonth.get(m.key) || 0 })),
      users: months.map(m => ({ month: m.name, count: usersByMonth.get(m.key) || 0 })),
      reservations: months.map(m => ({ month: m.name, count: reservationsByMonth.get(m.key) || 0 }))
    }

    // Conversion
    const allOrgs = await prisma.organization.findMany()
    const trialOrgs = allOrgs.filter(o => o.status === 'TRIAL')
    const activeOrgs = allOrgs.filter(o => o.status === 'ACTIVE')
    const cancelledOrgs = allOrgs.filter(o => o.status === 'CANCELLED')

    const totalConverted = activeOrgs.length
    const totalTrial = trialOrgs.length + activeOrgs.length + cancelledOrgs.length
    const trialToActive = totalTrial > 0 ? Math.round((totalConverted / totalTrial) * 100) : 0

    // Orgs créées il y a 3+ mois
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const orgsOlderThan3Months = allOrgs.filter(o => o.createdAt <= threeMonthsAgo)
    const orgsStillActive = orgsOlderThan3Months.filter(o => o.status === 'ACTIVE')
    const retentionRate = orgsOlderThan3Months.length > 0
      ? Math.round((orgsStillActive.length / orgsOlderThan3Months.length) * 100)
      : 100

    const cancellationRate = allOrgs.length > 0
      ? Math.round((cancelledOrgs.length / allOrgs.length) * 100)
      : 0

    // Revenus
    const planPrices: { [key: string]: number } = {
      SOLO: 49,
      DUO: 99,
      TEAM: 199,
      PREMIUM: 399
    }

    const revenueByPlan = Object.keys(planPrices).map(plan => {
      const orgsWithPlan = allOrgs.filter(o => o.plan === plan && o.status === 'ACTIVE')
      return {
        plan,
        count: orgsWithPlan.length,
        revenue: orgsWithPlan.length * planPrices[plan]
      }
    })

    const mrr = revenueByPlan.reduce((sum, p) => sum + p.revenue, 0)
    const arr = mrr * 12

    // Top organisations par revenus
    const topByRevenue = allOrgs
      .filter(o => o.status === 'ACTIVE')
      .map(o => ({
        id: o.id,
        name: o.name,
        revenue: planPrices[o.plan] || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Top organisations par réservations
    const orgsWithReservations = await Promise.all(
      allOrgs.slice(0, 20).map(async org => {
        const count = await prisma.reservation.count({
          where: { organizationId: org.id }
        })
        return {
          id: org.id,
          name: org.name,
          reservations: count
        }
      })
    )

    const topByReservations = orgsWithReservations
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 5)

    return NextResponse.json({
      growth,
      conversion: {
        trialToActive,
        retentionRate,
        cancellationRate
      },
      revenue: {
        mrr,
        arr,
        byPlan: revenueByPlan
      },
      topOrganizations: {
        byRevenue: topByRevenue,
        byReservations: topByReservations
      }
    })

  } catch (error) {
    console.error('Erreur analytics:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
