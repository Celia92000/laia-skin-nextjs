import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';
import { PLAN_LIMITS } from '@/lib/quotas';

export async function GET(
  request: Request,
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
    if (!decoded || !decoded.userId) {
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

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        legalName: true,
        slug: true,
        subdomain: true,
        domain: true,
        plan: true,
        status: true,
        monthlyAmount: true,
        trialEndsAt: true,
        ownerEmail: true,
        ownerFirstName: true,
        ownerLastName: true,
        ownerPhone: true,
        billingEmail: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        siret: true,
        tvaNumber: true,
        sepaMandateRef: true,
        contractNumber: true,
        contractPdfPath: true,
        contractSignedAt: true,
        createdAt: true,
        updatedAt: true,
        config: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })
    }

    // Récupérer les factures
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: id },
      orderBy: { createdAt: 'desc' }
    })

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Récupérer les quotas/usage
    const usage = await prisma.organizationUsage.findUnique({
      where: { organizationId: id }
    })

    // Récupérer les emplacements
    const locationsCount = await prisma.location.count({
      where: { organizationId: id }
    })

    // Limites du plan
    const planLimits = PLAN_LIMITS[organization.plan] || PLAN_LIMITS.SOLO

    const quotas = {
      users: {
        current: users.length,
        limit: planLimits.users,
        unlimited: planLimits.users === -1
      },
      locations: {
        current: locationsCount,
        limit: planLimits.locations,
        unlimited: planLimits.locations === -1
      },
      storage: {
        current: Number(usage?.currentStorageBytes || 0),
        limit: planLimits.storage,
        unlimited: planLimits.storage === -1
      },
      emails: {
        current: usage?.emailsSentThisMonth || 0,
        limit: planLimits.emails,
        unlimited: planLimits.emails === -1
      },
      sms: {
        current: usage?.smsSentThisMonth || 0,
        limit: planLimits.sms,
        unlimited: planLimits.sms === -1
      },
      whatsapp: {
        current: usage?.whatsappSentThisMonth || 0,
        limit: planLimits.whatsapp,
        unlimited: planLimits.whatsapp === -1
      }
    }

    return NextResponse.json({
      organization: {
        ...organization,
        config: organization.config || {}
      },
      invoices,
      users,
      quotas
    })

  } catch (error) {
    log.error('Erreur récupération organisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
