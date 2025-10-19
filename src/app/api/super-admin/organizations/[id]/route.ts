import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getOrganizationById } from '@/lib/tenant-service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer l'organisation
    const organization = await getOrganizationById(params.id)

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer les statistiques
    const usersCount = await prisma.user.count({
      where: { organizationId: organization.id }
    })

    const reservationsCount = await prisma.reservation.count({
      where: { organizationId: organization.id }
    })

    const servicesCount = await prisma.service.count({
      where: { organizationId: organization.id }
    })

    const productsCount = await prisma.product.count({
      where: { organizationId: organization.id }
    })

    return NextResponse.json({
      organization,
      stats: {
        usersCount,
        reservationsCount,
        servicesCount,
        productsCount
      }
    })

  } catch (error) {
    console.error('Erreur récupération organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const data = await request.json()

    // Vérifier que l'organisation existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id: params.id }
    })

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Si on change le slug ou subdomain, vérifier qu'ils sont uniques
    if (data.slug && data.slug !== existingOrg.slug) {
      const slugExists = await prisma.organization.findFirst({
        where: { slug: data.slug, id: { not: params.id } }
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
      }
    }

    if (data.subdomain && data.subdomain !== existingOrg.subdomain) {
      const subdomainExists = await prisma.organization.findFirst({
        where: { subdomain: data.subdomain, id: { not: params.id } }
      })
      if (subdomainExists) {
        return NextResponse.json({ error: 'Ce subdomain existe déjà' }, { status: 400 })
      }
    }

    // Calculer les nouvelles limites si le plan change
    let updateData: any = {
      name: data.name,
      slug: data.slug,
      legalName: data.legalName || null,
      type: data.type,
      subdomain: data.subdomain,
      domain: data.domain || null,
      plan: data.plan,
      status: data.status,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone || null
    }

    if (data.trialEndsAt) {
      updateData.trialEndsAt = new Date(data.trialEndsAt)
    }

    // Si le plan change, mettre à jour les limites
    if (data.plan && data.plan !== existingOrg.plan) {
      const planLimits = {
        SOLO: { maxLocations: 1, maxUsers: 1, maxStorage: 5 },
        DUO: { maxLocations: 1, maxUsers: 3, maxStorage: 10 },
        TEAM: { maxLocations: 3, maxUsers: 10, maxStorage: 50 },
        PREMIUM: { maxLocations: 999, maxUsers: 999, maxStorage: 999 }
      }
      const limits = planLimits[data.plan as keyof typeof planLimits]
      if (limits) {
        updateData = { ...updateData, ...limits }
      }
    }

    // Mettre à jour l'organisation
    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(organization)

  } catch (error) {
    console.error('Erreur mise à jour organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
