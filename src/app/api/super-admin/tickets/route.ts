import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // V�rifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifi�' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // V�rifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acc�s refus�' }, { status: 403 })
    }

    // R�cup�rer tous les tickets avec leurs relations
    const tickets = await prisma.supportTicket.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tickets)

  } catch (error) {
    console.error('Erreur r�cup�ration tickets:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
