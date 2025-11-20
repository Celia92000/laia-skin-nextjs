import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET: Récupérer tous les créneaux de démo (avec réservations)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const slots = await prisma.demoSlot.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bookings: {
          include: {
            lead: {
              select: {
                id: true,
                institutName: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ slots })

  } catch (error) {
    log.error('Erreur récupération créneaux:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST: Créer un nouveau créneau de démo
 */
export async function POST(request: NextRequest) {
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

    const data = await request.json()

    if (!data.date) {
      return NextResponse.json(
        { error: 'Date requise' },
        { status: 400 }
      )
    }

    const slotDate = new Date(data.date)

    // Vérifier si un créneau existe déjà à cette date exacte (même heure, même jour)
    const existingSlot = await prisma.demoSlot.findFirst({
      where: {
        date: {
          gte: new Date(slotDate.getTime() - 60000), // -1 minute
          lte: new Date(slotDate.getTime() + 60000)  // +1 minute
        },
        duration: data.duration || 30
      }
    })

    // Si le créneau existe déjà, retourner 200 (succès silencieux)
    if (existingSlot) {
      return NextResponse.json(existingSlot, { status: 200 })
    }

    const slot = await prisma.demoSlot.create({
      data: {
        date: slotDate,
        duration: data.duration || 30,
        userId: data.userId || decoded.userId,
        isAvailable: true,
        isRecurring: data.isRecurring || false,
        dayOfWeek: data.dayOfWeek || null
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

    return NextResponse.json(slot, { status: 201 })

  } catch (error) {
    log.error('Erreur création créneau:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Supprimer tous les créneaux (avec filtre optionnel)
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('id')

    if (slotId) {
      // Supprimer un créneau spécifique
      await prisma.demoSlot.delete({
        where: { id: slotId }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  } catch (error) {
    log.error('Erreur suppression:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
