import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * PATCH: Modifier un créneau
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

    const slot = await prisma.demoSlot.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        duration: data.duration || undefined,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(slot)

  } catch (error) {
    log.error('Erreur modification créneau:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Supprimer un créneau
 */
export async function DELETE(
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

    // Vérifier si le créneau a des réservations
    const slot = await prisma.demoSlot.findUnique({
      where: { id },
      include: { bookings: true }
    })

    if (slot && slot.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un créneau avec des réservations' },
        { status: 400 }
      )
    }

    await prisma.demoSlot.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    log.error('Erreur suppression créneau:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
