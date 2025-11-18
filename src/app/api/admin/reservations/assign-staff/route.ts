import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * POST /api/admin/reservations/assign-staff
 * Assigner un employé à une réservation
 */
export async function POST(req: NextRequest) {
  const prisma = await getPrismaClient()
  
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

    // Vérifier que c'est un admin
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    })

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'ADMIN', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const { reservationId, staffId } = body

    if (!reservationId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 })
    }

    // Vérifier que la réservation existe et appartient à l'organisation
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        organizationId: user.organizationId
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    // Si staffId est fourni, vérifier que l'employé existe
    if (staffId) {
      const staff = await prisma.user.findFirst({
        where: {
          id: staffId,
          organizationId: user.organizationId,
          role: 'EMPLOYEE'
        }
      })

      if (!staff) {
        return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
      }
    }

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        staffId: staffId || null // null si on veut désassigner
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Récupérer le nom de l'employé si assigné
    let staffName = null
    if (staffId) {
      const staff = await prisma.user.findFirst({
        where: { id: staffId },
        select: { name: true }
      })
      staffName = staff?.name
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      staffName
    })

  } catch (error) {
    log.error('Erreur assignation employé:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'assignation' },
      { status: 500 }
    )
  }
}
