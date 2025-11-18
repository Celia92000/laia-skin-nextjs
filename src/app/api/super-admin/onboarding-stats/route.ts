import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

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
    const user = await prisma.user.findFirst({
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

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0) // Depuis le début
        break
    }

    // 1. Statistiques globales d'onboarding
    const allOrganizations = await prisma.organization.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        createdAt: true,
        trialEndsAt: true,
        // Infos légales
        siret: true,
        legalName: true,
        // Infos SEPA
        sepaIban: true,
        sepaMandate: true,
        sepaMandateDate: true,
        // Contact
        ownerFirstName: true,
        ownerLastName: true,
        ownerEmail: true,
        // Stripe
        stripeCustomerId: true,
        stripeSubscriptionId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 2. Comptage par statut
    const byStatus = {
      TRIAL: allOrganizations.filter(o => o.status === 'TRIAL').length,
      ACTIVE: allOrganizations.filter(o => o.status === 'ACTIVE').length,
      SUSPENDED: allOrganizations.filter(o => o.status === 'SUSPENDED').length,
      CANCELLED: allOrganizations.filter(o => o.status === 'CANCELLED').length
    }

    // 3. Comptage par plan
    const byPlan = {
      SOLO: allOrganizations.filter(o => o.plan === 'SOLO').length,
      DUO: allOrganizations.filter(o => o.plan === 'DUO').length,
      TEAM: allOrganizations.filter(o => o.plan === 'TEAM').length,
      PREMIUM: allOrganizations.filter(o => o.plan === 'PREMIUM').length
    }

    // 4. Taux de complétion des informations
    const completionStats = allOrganizations.map(org => {
      let completionScore = 0
      let totalFields = 7

      if (org.siret) completionScore++
      if (org.legalName) completionScore++
      if (org.ownerFirstName) completionScore++
      if (org.ownerLastName) completionScore++
      if (org.ownerEmail) completionScore++
      if (org.sepaIban) completionScore++
      if (org.sepaMandate) completionScore++

      return {
        organizationId: org.id,
        organizationName: org.name,
        completionRate: Math.round((completionScore / totalFields) * 100)
      }
    })

    const avgCompletionRate = completionStats.length > 0
      ? Math.round(completionStats.reduce((sum, org) => sum + org.completionRate, 0) / completionStats.length)
      : 0

    // 5. Organisations avec infos complètes vs incomplètes
    const completeOrgs = completionStats.filter(o => o.completionRate === 100).length
    const incompleteOrgs = completionStats.filter(o => o.completionRate < 100).length

    // 6. Taux de conversion SEPA (ont accepté le mandat SEPA)
    const withSepaMandate = allOrganizations.filter(o => o.sepaMandate).length
    const sepaConversionRate = allOrganizations.length > 0
      ? Math.round((withSepaMandate / allOrganizations.length) * 100)
      : 0

    // 7. Onboardings par jour (pour graphique)
    const onboardingsByDay = new Map<string, number>()
    allOrganizations.forEach(org => {
      const dayKey = org.createdAt.toISOString().slice(0, 10) // YYYY-MM-DD
      onboardingsByDay.set(dayKey, (onboardingsByDay.get(dayKey) || 0) + 1)
    })

    // Générer les derniers jours
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const days = []
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().slice(0, 10)
      const dayName = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      days.push({
        date: dayName,
        count: onboardingsByDay.get(dayKey) || 0
      })
    }

    // 8. Temps moyen jusqu'à activation (TRIAL -> ACTIVE)
    const activatedOrgs = await prisma.organization.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        // On utilisera la date de dernière mise à jour comme proxy pour l'activation
        updatedAt: true
      }
    })

    const activationTimes = activatedOrgs.map(org => {
      const diffMs = org.updatedAt.getTime() - org.createdAt.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      return diffDays
    })

    const avgActivationTime = activationTimes.length > 0
      ? Math.round(activationTimes.reduce((sum, time) => sum + time, 0) / activationTimes.length)
      : 0

    // 9. Derniers onboardings (détails)
    const recentOnboardings = allOrganizations.slice(0, 10).map(org => ({
      id: org.id,
      name: org.name,
      owner: `${org.ownerFirstName || ''} ${org.ownerLastName || ''}`.trim() || 'N/A',
      email: org.ownerEmail,
      plan: org.plan,
      status: org.status,
      createdAt: org.createdAt,
      hasSepaMandate: org.sepaMandate,
      hasSiret: !!org.siret,
      trialEndsAt: org.trialEndsAt
    }))

    // 10. Taux d'abandon (organisations créées mais sans SEPA)
    const abandonmentRate = allOrganizations.length > 0
      ? Math.round(((allOrganizations.length - withSepaMandate) / allOrganizations.length) * 100)
      : 0

    return NextResponse.json({
      period,
      summary: {
        total: allOrganizations.length,
        avgCompletionRate,
        completeOrgs,
        incompleteOrgs,
        sepaConversionRate,
        avgActivationTime,
        abandonmentRate
      },
      byStatus,
      byPlan,
      timeline: days,
      recentOnboardings,
      completionStats: completionStats.slice(0, 20) // Top 20 pour ne pas surcharger
    })

  } catch (error: any) {
    log.error('Erreur lors de la récupération des stats d\'onboarding:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
