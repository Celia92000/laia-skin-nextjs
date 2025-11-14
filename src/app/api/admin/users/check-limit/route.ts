import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { OrgPlan } from '@prisma/client'

/**
 * Limites d'utilisateurs par formule
 */
const USER_LIMITS: Record<OrgPlan, number | null> = {
  SOLO: 1,           // 1 seul utilisateur
  DUO: 3,            // 3 utilisateurs max
  TEAM: 10,          // 10 utilisateurs max
  PREMIUM: null,     // Illimité
  // Anciens plans (compatibilité)
  STARTER: 1,
  ESSENTIAL: 3,
  PROFESSIONAL: 10,
  ENTERPRISE: null,
}

/**
 * GET /api/admin/users/check-limit
 * Vérifie si l'organisation peut ajouter un nouvel utilisateur selon sa formule
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'organisation avec son plan
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: {
        id: true,
        name: true,
        plan: true,
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Compter le nombre d'utilisateurs actuels
    const currentUsersCount = await prisma.user.count({
      where: {
        organizationId: session.user.organizationId,
        // Exclure les clients (ne comptent pas dans la limite)
        role: { not: 'CLIENT' }
      }
    })

    // Récupérer la limite pour ce plan
    const limit = USER_LIMITS[organization.plan]

    // Si limite = null (PREMIUM/ENTERPRISE), c'est illimité
    const canAddUser = limit === null || currentUsersCount < limit
    const remainingSlots = limit === null ? null : limit - currentUsersCount

    return NextResponse.json({
      canAddUser,
      currentUsersCount,
      limit,
      remainingSlots,
      plan: organization.plan,
      planName: getPlanName(organization.plan),
      message: canAddUser
        ? `Vous pouvez ajouter ${remainingSlots === null ? 'un nombre illimité d' : remainingSlots} utilisateur(s) supplémentaire(s).`
        : `Limite atteinte ! Votre formule ${getPlanName(organization.plan)} permet ${limit} utilisateur(s) maximum. Passez à une formule supérieure pour ajouter plus d'utilisateurs.`
    })
  } catch (error) {
    console.error('Erreur vérification limite utilisateurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Helper : Retourne le nom du plan
 */
function getPlanName(plan: OrgPlan): string {
  const names: Record<OrgPlan, string> = {
    SOLO: 'Solo',
    DUO: 'Duo',
    TEAM: 'Team',
    PREMIUM: 'Premium',
    STARTER: 'Solo',
    ESSENTIAL: 'Duo',
    PROFESSIONAL: 'Team',
    ENTERPRISE: 'Premium',
  }
  return names[plan]
}
