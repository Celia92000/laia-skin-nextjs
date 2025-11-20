import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

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
        slug: true,
        maxLocations: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer tous les emplacements
    const locations = await prisma.location.findMany({
      where: { organizationId: id },
      orderBy: [
        { isMainLocation: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({
      organization,
      locations
    })

  } catch (error) {
    log.error('Erreur récupération emplacements:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Vérifier que l'organisation existe et n'a pas atteint sa limite
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        locations: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    if (organization.locations.length >= organization.maxLocations) {
      return NextResponse.json(
        { error: 'Limite d\'emplacements atteinte' },
        { status: 400 }
      )
    }

    const data = await request.json()

    // Vérifier que le slug est unique pour cette organisation
    const existingLocation = await prisma.location.findFirst({
      where: {
        organizationId: id,
        slug: data.slug
      }
    })

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà pour cette organisation' },
        { status: 400 }
      )
    }

    // Créer le nouvel emplacement
    const location = await prisma.location.create({
      data: {
        organizationId: id,
        name: data.name,
        slug: data.slug,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        phone: data.phone || null,
        email: data.email || null,
        active: data.active !== undefined ? data.active : true,
        isMainLocation: false
      }
    })

    return NextResponse.json(location)

  } catch (error) {
    log.error('Erreur création emplacement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
