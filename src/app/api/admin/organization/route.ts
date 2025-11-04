import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/organization
 * Récupérer les informations de l'organisation de l'utilisateur connecté
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      console.log('[admin/organization] Pas de token')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      console.log('[admin/organization] Token invalide')
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    console.log('[admin/organization] UserId:', decoded.userId, 'OrganizationId:', decoded.organizationId)

    // Récupérer l'utilisateur et son organisation
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: true
      }
    })

    if (!user) {
      console.log('[admin/organization] Utilisateur non trouvé')
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (!user.organization) {
      console.log('[admin/organization] Pas d\'organisation')
      return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 404 })
    }

    console.log('[admin/organization] Organisation trouvée:', user.organization.name)

    return NextResponse.json({
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        status: user.organization.status,
        plan: user.organization.plan,
        trialEndsAt: user.organization.trialEndsAt,
        stripeCustomerId: user.organization.stripeCustomerId,
        stripeSubscriptionId: user.organization.stripeSubscriptionId,
        currentPeriodEnd: user.organization.currentPeriodEnd,
        isOnboarded: user.organization.isOnboarded
      }
    })

  } catch (error: any) {
    console.error('[admin/organization] Erreur:', error?.message || error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message },
      { status: 500 }
    )
  }
}
