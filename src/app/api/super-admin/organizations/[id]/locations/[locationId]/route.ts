import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await params

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

    // Vérifier que l'emplacement existe et appartient à l'organisation
    const existingLocation = await prisma.location.findFirst({
      where: {
        id: locationId,
        organizationId: id
      }
    })

    if (!existingLocation) {
      return NextResponse.json({ error: 'Emplacement non trouvé' }, { status: 404 })
    }

    const data = await request.json()

    // Si on modifie le slug, vérifier qu'il est unique
    if (data.slug && data.slug !== existingLocation.slug) {
      const slugExists = await prisma.location.findFirst({
        where: {
          organizationId: id,
          slug: data.slug,
          id: { not: locationId }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ce slug existe déjà pour cette organisation' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'emplacement
    const location = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        phone: data.phone || null,
        email: data.email || null,
        active: data.active
      }
    })

    return NextResponse.json(location)

  } catch (error) {
    log.error('Erreur mise à jour emplacement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await params

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

    // Vérifier que l'emplacement existe et appartient à l'organisation
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        organizationId: id
      }
    })

    if (!location) {
      return NextResponse.json({ error: 'Emplacement non trouvé' }, { status: 404 })
    }

    // Empêcher la suppression de l'emplacement principal
    if (location.isMainLocation) {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'emplacement principal' },
        { status: 400 }
      )
    }

    // Supprimer l'emplacement
    await prisma.location.delete({
      where: { id: locationId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    log.error('Erreur suppression emplacement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
