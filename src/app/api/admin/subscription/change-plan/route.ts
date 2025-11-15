import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { OrgPlan } from '@prisma/client'
import { PLAN_FEATURES } from '@/lib/features-simple'

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur a les droits pour changer le plan (ORG_OWNER, SUPER_ADMIN uniquement)
    const allowedRoles = ['ORG_ADMIN', 'SUPER_ADMIN']
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({
        error: 'Vous n\'avez pas les droits pour changer l\'abonnement. Seuls les propriétaires peuvent effectuer cette action.'
      }, { status: 403 })
    }

    const { newPlan } = await request.json()

    // Valider le plan
    const validPlans: OrgPlan[] = ['SOLO', 'DUO', 'TEAM', 'PREMIUM']
    if (!validPlans.includes(newPlan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Récupérer l'organisation actuelle
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { plan: true, name: true }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Vérifier si c'est un changement réel
    if (organization.plan === newPlan) {
      return NextResponse.json({ error: 'Vous êtes déjà sur ce plan' }, { status: 400 })
    }

    // Récupérer les features du nouveau plan
    const newFeatures = PLAN_FEATURES[newPlan]

    // Mettre à jour le plan et les features
    await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        plan: newPlan,
        // Mettre à jour tous les feature flags
        featureBlog: newFeatures.featureBlog,
        featureCRM: newFeatures.featureCRM,
        featureEmailing: newFeatures.featureEmailing,
        featureShop: newFeatures.featureShop,
        featureWhatsApp: newFeatures.featureWhatsApp,
        featureSMS: newFeatures.featureSMS,
        featureSocialMedia: newFeatures.featureSocialMedia,
        featureStock: newFeatures.featureStock,
        featureProducts: newFeatures.featureShop, // featureProducts = featureShop
        featureFormations: newFeatures.featureShop, // featureFormations inclus dans shop
      }
    })

    return NextResponse.json({
      success: true,
      message: `Plan changé vers ${newPlan}. Le nouveau tarif s'appliquera à partir du prochain cycle de facturation.`
    })
  } catch (error) {
    console.error('Erreur changement de plan:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
