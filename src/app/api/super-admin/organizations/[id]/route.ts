import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getOrganizationById } from '@/lib/tenant-service'
import { prisma } from '@/lib/prisma'

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
    const organization = await getOrganizationById(id)

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
      where: { id: id }
    })

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Si on change le slug ou subdomain, vérifier qu'ils sont uniques
    if (data.slug && data.slug !== existingOrg.slug) {
      const slugExists = await prisma.organization.findFirst({
        where: { slug: data.slug, id: { not: id } }
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
      }
    }

    if (data.subdomain && data.subdomain !== existingOrg.subdomain) {
      const subdomainExists = await prisma.organization.findFirst({
        where: { subdomain: data.subdomain, id: { not: id } }
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
      where: { id: id },
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

export async function DELETE(
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

    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: id },
      include: {
        users: true,
        locations: true,
        services: true,
        products: true,
        reservations: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Empêcher la suppression de l'organisation par défaut (Laia Skin)
    if (organization.slug === 'laia-skin') {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'organisation par défaut (Laia Skin)' },
        { status: 400 }
      )
    }

    // Supprimer toutes les données liées (en cascade)
    // L'ordre est important pour respecter les contraintes de clés étrangères

    console.log(`🗑️ Suppression de l'organisation ${organization.name}...`)

    // 1. Supprimer les réservations
    await prisma.reservation.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.reservations.length} réservations supprimées`)

    // 2. Supprimer les services et produits
    await prisma.service.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.services.length} services supprimés`)

    await prisma.product.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.products.length} produits supprimés`)

    // 3. Supprimer les formations
    await prisma.formation.deleteMany({
      where: { organizationId: id }
    })

    // 4. Supprimer les articles de blog
    await prisma.blogArticle.deleteMany({
      where: { organizationId: id }
    })

    // 5. Supprimer les utilisateurs
    await prisma.user.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.users.length} utilisateurs supprimés`)

    // 6. Supprimer les emplacements
    await prisma.location.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.locations.length} emplacements supprimés`)

    // 7. Supprimer les paramètres
    await prisma.organizationConfig.deleteMany({
      where: { organizationId: id }
    })

    await prisma.paymentSettings.deleteMany({
      where: { organizationId: id }
    })

    await prisma.bookingSettings.deleteMany({
      where: { organizationId: id }
    })

    await prisma.loyaltyProgramSettings.deleteMany({
      where: { organizationId: id }
    })

    // 8. Supprimer l'organisation elle-même
    await prisma.organization.delete({
      where: { id: id }
    })

    console.log(`✅ Organisation ${organization.name} supprimée avec succès`)

    return NextResponse.json({
      message: 'Organisation supprimée avec succès',
      deleted: {
        organization: organization.name,
        users: organization.users.length,
        locations: organization.locations.length,
        services: organization.services.length,
        products: organization.products.length,
        reservations: organization.reservations.length
      }
    })

  } catch (error) {
    console.error('Erreur suppression organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    )
  }
}
