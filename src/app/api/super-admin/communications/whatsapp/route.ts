import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer tous les messages WhatsApp de toutes les organisations
    const messages = await prisma.whatsAppMessage.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 500 // Limiter pour éviter les surcharges
    })

    // Transformer les données pour correspondre au format attendu
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      from: msg.from || '',
      to: msg.to || '',
      message: msg.message,
      status: msg.status,
      direction: msg.direction,
      sentAt: msg.sentAt,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
      organizationId: msg.organizationId,
      organization: msg.organization,
      userId: msg.userId,
      clientName: msg.user?.name || msg.from || msg.to,
      clientEmail: msg.user?.email || '',
      createdAt: msg.createdAt
    }))

    return NextResponse.json(transformedMessages)
  } catch (error) {
    console.error('Erreur récupération messages WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
