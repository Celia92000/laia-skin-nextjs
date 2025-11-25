import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/crm/scoring
 * Calcule et retourne le scoring RFM (Recency, Frequency, Monetary) de toutes les organisations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer toutes les organisations actives
    const organizations = await prisma.organization.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            reservations: {
              where: {
                status: { in: ['completed', 'confirmed', 'COMPLETED', 'CONFIRMED'] }
              },
              select: {
                id: true,
                totalPrice: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        reservations: {
          where: {
            status: { in: ['completed', 'confirmed', 'COMPLETED', 'CONFIRMED'] }
          },
          select: {
            id: true,
            totalPrice: true,
            createdAt: true
          }
        }
      }
    })

    // Calculer le scoring RFM pour chaque organisation
    const scoredOrganizations = organizations.map(org => {
      const now = new Date()

      // RECENCY: Nombre de jours depuis la dernière réservation
      const allReservations = org.reservations
      const lastReservation = allReservations[0]
      const daysSinceLastReservation = lastReservation
        ? Math.floor((now.getTime() - new Date(lastReservation.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      // FREQUENCY: Nombre total de réservations
      const totalReservations = allReservations.length

      // MONETARY: Chiffre d'affaires total
      const totalRevenue = allReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0)

      // Calcul des scores (1-5 pour chaque dimension)
      let recencyScore = 1
      if (daysSinceLastReservation <= 7) recencyScore = 5
      else if (daysSinceLastReservation <= 30) recencyScore = 4
      else if (daysSinceLastReservation <= 90) recencyScore = 3
      else if (daysSinceLastReservation <= 180) recencyScore = 2

      let frequencyScore = 1
      if (totalReservations >= 50) frequencyScore = 5
      else if (totalReservations >= 20) frequencyScore = 4
      else if (totalReservations >= 10) frequencyScore = 3
      else if (totalReservations >= 5) frequencyScore = 2

      let monetaryScore = 1
      if (totalRevenue >= 10000) monetaryScore = 5
      else if (totalRevenue >= 5000) monetaryScore = 4
      else if (totalRevenue >= 2000) monetaryScore = 3
      else if (totalRevenue >= 500) monetaryScore = 2

      // Score global (moyenne pondérée)
      const rfmScore = Math.round((recencyScore * 0.3 + frequencyScore * 0.3 + monetaryScore * 0.4) * 20)

      // Segment client
      let segment = 'Dormant'
      if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
        segment = 'Champions'
      } else if (recencyScore >= 3 && frequencyScore >= 4) {
        segment = 'Loyaux'
      } else if (monetaryScore >= 4) {
        segment = 'Gros dépensiers'
      } else if (recencyScore >= 4) {
        segment = 'Prometteurs'
      } else if (recencyScore <= 2 && frequencyScore >= 3) {
        segment = 'À risque'
      } else if (recencyScore <= 2 && monetaryScore >= 3) {
        segment = 'Hibernation'
      } else if (recencyScore === 1 && frequencyScore === 1) {
        segment = 'Perdus'
      }

      // Nombre de clients actifs (au moins 1 réservation dans les 6 derniers mois)
      const activeClients = org.users.filter(u => {
        const lastUserReservation = u.reservations[0]
        if (!lastUserReservation) return false
        const daysSince = Math.floor((now.getTime() - new Date(lastUserReservation.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        return daysSince <= 180
      }).length

      // Risque de churn (probabilité de perdre le client)
      let churnRisk = 'Faible'
      if (daysSinceLastReservation > 180) churnRisk = 'Élevé'
      else if (daysSinceLastReservation > 90) churnRisk = 'Moyen'

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        status: org.status,
        recency: {
          score: recencyScore,
          daysSinceLastActivity: daysSinceLastReservation,
          lastReservationDate: lastReservation?.createdAt || null
        },
        frequency: {
          score: frequencyScore,
          totalReservations,
          averagePerMonth: totalReservations > 0
            ? Math.round((totalReservations / Math.max(1, daysSinceLastReservation / 30)) * 10) / 10
            : 0
        },
        monetary: {
          score: monetaryScore,
          totalRevenue,
          averageOrderValue: totalReservations > 0
            ? Math.round(totalRevenue / totalReservations)
            : 0
        },
        rfmScore,
        segment,
        churnRisk,
        activeClients,
        totalClients: org.users.length,
        createdAt: org.createdAt
      }
    })

    // Trier par score RFM décroissant
    scoredOrganizations.sort((a, b) => b.rfmScore - a.rfmScore)

    // Statistiques globales
    const stats = {
      total: scoredOrganizations.length,
      bySegment: {
        Champions: scoredOrganizations.filter(o => o.segment === 'Champions').length,
        Loyaux: scoredOrganizations.filter(o => o.segment === 'Loyaux').length,
        'Gros dépensiers': scoredOrganizations.filter(o => o.segment === 'Gros dépensiers').length,
        Prometteurs: scoredOrganizations.filter(o => o.segment === 'Prometteurs').length,
        'À risque': scoredOrganizations.filter(o => o.segment === 'À risque').length,
        Hibernation: scoredOrganizations.filter(o => o.segment === 'Hibernation').length,
        Perdus: scoredOrganizations.filter(o => o.segment === 'Perdus').length,
        Dormant: scoredOrganizations.filter(o => o.segment === 'Dormant').length
      },
      byChurnRisk: {
        Faible: scoredOrganizations.filter(o => o.churnRisk === 'Faible').length,
        Moyen: scoredOrganizations.filter(o => o.churnRisk === 'Moyen').length,
        Élevé: scoredOrganizations.filter(o => o.churnRisk === 'Élevé').length
      },
      averageScore: Math.round(scoredOrganizations.reduce((sum, o) => sum + o.rfmScore, 0) / scoredOrganizations.length)
    }

    return NextResponse.json({
      organizations: scoredOrganizations,
      stats,
      calculatedAt: new Date().toISOString()
    })

  } catch (error) {
    log.error('Error calculating RFM scoring:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul du scoring' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/crm/scoring/refresh
 * Force le recalcul et la sauvegarde des scores RFM
 */
export async function POST(req: NextRequest) {
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

    // Appeler la méthode GET pour calculer les scores
    const getRequest = new NextRequest(req.url, { method: 'GET' })
    const response = await GET(getRequest)
    const data = await response.json()

    // Ici on pourrait sauvegarder les scores dans une table dédiée
    // Pour l'instant on retourne juste les scores calculés

    return NextResponse.json({
      success: true,
      message: 'Scores RFM recalculés avec succès',
      data
    })

  } catch (error) {
    log.error('Error refreshing RFM scores:', error)
    return NextResponse.json(
      { error: 'Erreur lors du rafraîchissement des scores' },
      { status: 500 }
    )
  }
}
