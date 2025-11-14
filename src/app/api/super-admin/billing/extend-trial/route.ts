import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/audit-logger'
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const data = await request.json()
    const { organizationId, days } = data

    if (!organizationId || !days) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        trialEndsAt: true,
        status: true
      }
    })

    if (!org) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    const currentEndDate = org.trialEndsAt || new Date()
    const newEndDate = new Date(currentEndDate)
    newEndDate.setDate(newEndDate.getDate() + parseInt(days))

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        trialEndsAt: newEndDate,
        status: org.status === 'CANCELLED' ? 'TRIAL' : org.status
      }
    })

    // Log l'action
    await createAuditLog({
      userId: decoded.userId,
      action: 'UPDATE_ORG',
      targetType: 'ORGANIZATION',
      targetId: organizationId,
      organizationId,
      before: { trialEndsAt: org.trialEndsAt, status: org.status },
      after: { trialEndsAt: newEndDate, status: updated.status },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: { action: 'extend_trial', days: parseInt(days) }
    })

    return NextResponse.json(updated)

  } catch (error) {
    log.error('Erreur prolongation essai:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
