import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const organizationId = headersList.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer toutes les locations de l'organisation
    const locations = await prisma.location.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            staff: true,
            workingHours: true,
          },
        },
      },
      orderBy: [
        { isMainLocation: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(locations)
  } catch (error) {
    log.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const organizationId = headersList.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, address, city, postalCode, country, phone, email, isMainLocation } = body

    // Vérifier les limites du plan
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        locations: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })
    }

    // Vérifier si la limite est atteinte
    if (organization.locations.length >= organization.maxLocations) {
      return NextResponse.json(
        { error: `Limite de ${organization.maxLocations} emplacement(s) atteinte pour votre forfait ${organization.plan}` },
        { status: 403 }
      )
    }

    // Vérifier que le slug est unique pour cette organisation
    const existingSlug = await prisma.location.findFirst({
      where: {
        organizationId,
        slug,
      },
    })

    if (existingSlug) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
    }

    // Si c'est le premier emplacement, le marquer comme principal
    const isFirst = organization.locations.length === 0

    // Créer la location
    const location = await prisma.location.create({
      data: {
        organizationId,
        name,
        slug,
        address,
        city,
        postalCode,
        country: country || 'France',
        phone,
        email,
        isMainLocation: isFirst ? true : isMainLocation,
      },
    })

    // Si isMainLocation est true, démarquer les autres
    if (isMainLocation && !isFirst) {
      await prisma.location.updateMany({
        where: {
          organizationId,
          id: { not: location.id },
        },
        data: {
          isMainLocation: false,
        },
      })
    }

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    log.error('Error creating location:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
