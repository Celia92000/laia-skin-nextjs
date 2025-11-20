import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'

/**
 * GET /api/admin/onboarding/progress
 * Récupère la progression de la checklist d'onboarding
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer les infos de l'utilisateur et de son organisation
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer ou créer l'organisation (pour les admins)
    const organization = await prisma.organization.findFirst({
      where: {
        users: {
          some: { id: user.id }
        }
      },
      include: {
        _count: {
          select: {
            services: true,
            reservations: true,
            users: true
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Définir les items de la checklist avec leur statut
    const items = [
      {
        id: 'add-service',
        title: 'Ajouter votre premier service',
        description: 'Créez au moins un soin ou prestation',
        completed: organization._count.services > 0,
        link: '/admin/services',
        linkText: 'Ajouter un service'
      },
      {
        id: 'customize-site',
        title: 'Personnaliser votre site web',
        description: 'Ajoutez votre logo, couleurs et contenus',
        completed: false, // TODO: vérifier si le site a été personnalisé
        link: '/admin/website',
        linkText: 'Personnaliser'
      },
      {
        id: 'set-schedule',
        title: 'Configurer vos horaires',
        description: 'Définissez vos heures d\'ouverture',
        completed: false, // TODO: vérifier si les horaires sont configurés
        link: '/admin/settings',
        linkText: 'Configurer'
      },
      {
        id: 'first-booking',
        title: 'Recevoir votre première réservation',
        description: 'Attendez qu\'un client prenne RDV',
        completed: organization._count.reservations > 0,
        link: '/admin/reservations',
        linkText: 'Voir les réservations'
      },
      {
        id: 'invite-team',
        title: 'Inviter votre équipe',
        description: 'Ajoutez des collaborateurs si besoin',
        completed: organization._count.users > 1,
        link: '/admin/team',
        linkText: 'Gérer l\'équipe'
      },
      {
        id: 'configure-payments',
        title: 'Activer les paiements en ligne',
        description: 'Connectez Stripe pour accepter les paiements',
        completed: !!organization.stripeAccountId,
        link: '/admin/payments',
        linkText: 'Configurer Stripe'
      }
    ]

    return NextResponse.json({
      items,
      completedCount: items.filter(i => i.completed).length,
      totalCount: items.length
    })

  } catch (error) {
    log.error('Erreur récupération progression onboarding:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/onboarding/progress
 * Marque un item comme complété
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, completed } = body

    // TODO: Sauvegarder la progression dans la base si nécessaire
    // Pour l'instant, la progression est calculée dynamiquement

    log.info(`Item ${itemId} marqué comme ${completed ? 'complété' : 'non complété'} par user ${decoded.userId}`)

    return NextResponse.json({
      success: true,
      itemId,
      completed
    })

  } catch (error) {
    log.error('Erreur mise à jour progression onboarding:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
