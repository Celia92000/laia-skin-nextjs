import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const organizationId = headersList.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Vérifier que la location appartient à l'organisation
    const location = await prisma.location.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Emplacement introuvable' }, { status: 404 })
    }

    // Si on marque comme principal, démarquer les autres
    if (body.isMainLocation === true) {
      await prisma.location.updateMany({
        where: {
          organizationId,
          id: { not: id },
        },
        data: {
          isMainLocation: false,
        },
      })
    }

    // Mettre à jour la location
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(updatedLocation)
  } catch (error) {
    log.error('Error updating location:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const organizationId = headersList.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Vérifier que la location appartient à l'organisation
    const location = await prisma.location.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Emplacement introuvable' }, { status: 404 })
    }

    // Empêcher la suppression de l'emplacement principal s'il y en a d'autres
    if (location.isMainLocation) {
      const locationsCount = await prisma.location.count({
        where: { organizationId },
      })

      if (locationsCount > 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer l\'emplacement principal. Marquez d\'abord un autre emplacement comme principal.' },
          { status: 400 }
        )
      }
    }

    // Supprimer la location
    await prisma.location.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Emplacement supprimé' }, { status: 200 })
  } catch (error) {
    log.error('Error deleting location:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
