import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET(request: Request) {
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

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, unread, read
    const type = searchParams.get('type') // filter by type

    const where: any = {}

    if (filter === 'unread') {
      where.read = false
    } else if (filter === 'read') {
      where.read = true
    }

    if (type) {
      where.type = type
    }

    const notifications = await prisma.superAdminNotification.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            subdomain: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const stats = {
      total: await prisma.superAdminNotification.count(),
      unread: await prisma.superAdminNotification.count({ where: { read: false } }),
      read: await prisma.superAdminNotification.count({ where: { read: true } })
    }

    return NextResponse.json({ notifications, stats })

  } catch (error) {
    log.error('Erreur notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Marquer comme lu/non lu
export async function PATCH(request: Request) {
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
    const { notificationIds, read } = data

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'IDs de notifications requis' }, { status: 400 })
    }

    await prisma.superAdminNotification.updateMany({
      where: {
        id: { in: notificationIds }
      },
      data: {
        read: read !== undefined ? read : true
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    log.error('Erreur mise à jour notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Supprimer des notifications
export async function DELETE(request: Request) {
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
    const notificationIds = searchParams.get('ids')?.split(',')

    if (!notificationIds || notificationIds.length === 0) {
      return NextResponse.json({ error: 'IDs de notifications requis' }, { status: 400 })
    }

    await prisma.superAdminNotification.deleteMany({
      where: {
        id: { in: notificationIds }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    log.error('Erreur suppression notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
