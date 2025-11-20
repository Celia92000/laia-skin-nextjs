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

    // Récupérer les clients de l'organisation
    const clients = await prisma.user.findMany({
      where: {
        organizationId: decoded.organizationId || undefined,
        role: 'CLIENT'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        Reservation_Reservation_userIdToUser: {
          select: {
            id: true,
            date: true,
            status: true
          },
          orderBy: { date: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(clients)
  } catch (error) {
    log.error('Erreur récupération clients:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
