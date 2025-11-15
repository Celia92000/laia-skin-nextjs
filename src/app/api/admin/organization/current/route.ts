import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/admin/organization/current
 * Récupère l'organisation de l'utilisateur connecté
 */
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

    // Récupérer l'utilisateur avec son organisation
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            addons: true,
            status: true,
            isOnboarded: true,
            smsCredits: true,
            smsTotalPurchased: true,
            // Features activées
            featureCRM: true,
            featureEmailing: true,
            featureWhatsApp: true,
            featureSMS: true,
            featureShop: true,
            featureStock: true,
            featureSocialMedia: true,
            featureBlog: true,
          }
        }
      }
    })

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    return NextResponse.json(user.organization)

  } catch (error) {
    log.error('Erreur récupération organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
