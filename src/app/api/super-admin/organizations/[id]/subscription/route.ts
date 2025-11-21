import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

const PLAN_LIMITS = {
  SOLO: { users: 2, locations: 1, storage: 1 },
  DUO: { users: 5, locations: 2, storage: 5 },
  TEAM: { users: 15, locations: 5, storage: 20 },
  PREMIUM: { users: -1, locations: -1, storage: 100 } // -1 = illimité
}

const PLAN_PRICES = {
  SOLO: 49,
  DUO: 69,
  TEAM: 119,
  PREMIUM: 179
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    const data = await request.json()
    const { plan, status, trialEndDate, note } = data

    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Mettre à jour l'abonnement
    const updateData: any = {}

    if (plan) {
      updateData.plan = plan
      // Mettre à jour les limites selon le plan
      const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
      if (limits) {
        updateData.maxUsers = limits.users
        updateData.maxLocations = limits.locations
        updateData.maxStorageGB = limits.storage
      }
    }

    if (status) {
      updateData.status = status

      // Si passage de TRIAL à ACTIVE, définir la date de début de facturation
      if (status === 'ACTIVE' && organization.status === 'TRIAL') {
        updateData.subscriptionStartDate = new Date()
      }

      // Si annulation, définir la date de fin
      if (status === 'CANCELLED') {
        updateData.subscriptionEndDate = new Date()
      }
    }

    if (trialEndDate) {
      updateData.trialEndDate = new Date(trialEndDate)
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: updateData
    })

    // Enregistrer l'activité
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'CHANGE_PLAN',
        targetType: 'ORGANIZATION',
        targetId: id,
        organizationId: id,
        before: {
          plan: organization.plan,
          status: organization.status
        },
        after: {
          plan: plan || organization.plan,
          status: status || organization.status
        },
        metadata: {
          note
        }
      }
    })

    return NextResponse.json({
      success: true,
      organization: updatedOrg
    })

  } catch (error) {
    log.error('Erreur mise à jour abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
