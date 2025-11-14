import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { canAccessFeature, getAccessibleFeatures, FeatureKey } from '@/lib/feature-access'

/**
 * GET /api/admin/features/check-access
 * Vérifie l'accès à une feature spécifique pour l'utilisateur actuel
 *
 * Query params:
 * - feature: La feature à vérifier (ex: "featureCRM", "featureBlog")
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le paramètre feature
    const { searchParams } = new URL(request.url)
    const featureParam = searchParams.get('feature')

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

    // Si une feature spécifique est demandée
    if (featureParam) {
      const hasAccess = canAccessFeature(
        featureParam as FeatureKey,
        organization.plan,
        session.user.role as any
      )

      return NextResponse.json({
        feature: featureParam,
        hasAccess,
        plan: organization.plan,
        role: session.user.role,
        message: hasAccess
          ? `Accès autorisé à ${featureParam}`
          : `Accès refusé à ${featureParam}. Vérifiez votre formule et vos permissions.`
      })
    }

    // Sinon, retourner toutes les features accessibles
    const accessibleFeatures = getAccessibleFeatures(
      organization.plan,
      session.user.role as any
    )

    return NextResponse.json({
      plan: organization.plan,
      role: session.user.role,
      accessibleFeatures
    })
  } catch (error) {
    console.error('Erreur vérification accès features:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
