import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * PATCH: Mettre à jour le statut d'une réservation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    const booking = await prisma.demoBooking.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes || undefined,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
        cancelledAt: data.status === 'CANCELLED' ? new Date() : undefined
      },
      include: {
        slot: true,
        lead: true
      }
    })

    // Mettre à jour le lead associé si changement de statut
    if (booking.leadId) {
      if (data.status === 'COMPLETED') {
        // Démo réalisée → passer au statut DEMO_DONE
        await prisma.lead.update({
          where: { id: booking.leadId },
          data: {
            status: 'DEMO_DONE',
            lastContactDate: new Date()
          }
        })
      } else if (data.status === 'NO_SHOW' || data.status === 'CANCELLED') {
        // Absent ou annulé → possibilité de repasser à CONTACTED
        await prisma.lead.update({
          where: { id: booking.leadId },
          data: {
            status: 'CONTACTED',
            lastContactDate: new Date()
          }
        })
      }
    }

    return NextResponse.json(booking)

  } catch (error) {
    log.error('Erreur mise à jour réservation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
