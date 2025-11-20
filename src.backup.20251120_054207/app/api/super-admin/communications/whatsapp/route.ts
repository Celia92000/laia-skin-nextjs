import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

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

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer tous les messages WhatsApp de toutes les organisations
    const messages = await prisma.whatsAppHistory.findMany({
      orderBy: {
        createdAt: 'desc'
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
      sentAt: msg.createdAt, // Utiliser createdAt comme sentAt
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
      userId: msg.userId,
      clientName: msg.from || msg.to,
      clientEmail: '',
      createdAt: msg.createdAt
    }))

    return NextResponse.json(transformedMessages)
  } catch (error) {
    log.error('Erreur récupération messages WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
