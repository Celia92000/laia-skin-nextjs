import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'

export async function GET() {
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

    // Récupérer les réservations de l'organisation de l'utilisateur
    const reservations = await prisma.reservation.findMany({
      where: {
        organizationId: decoded.organizationId || undefined
      },
      include: {
        User_Reservation_userIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        User_Reservation_staffIdToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        Service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 100
    })

    // Parser le JSON des services pour chaque réservation
    const formattedReservations = reservations.map(reservation => {
      let servicesArray = []
      try {
        servicesArray = JSON.parse(reservation.services)
      } catch {
        servicesArray = []
      }

      return {
        ...reservation,
        services: Array.isArray(servicesArray) ? servicesArray : []
      }
    })

    return NextResponse.json(formattedReservations)
  } catch (error) {
    log.error('Erreur récupération réservations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
