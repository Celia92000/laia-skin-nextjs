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

    // Récupérer les profils de fidélité de l'organisation via la relation User
    const loyaltyProfiles = await prisma.loyaltyProfile.findMany({
      where: {
        User: {
          organizationId: decoded.organizationId || undefined
        }
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { points: 'desc' },
      take: 100
    })

    return NextResponse.json(loyaltyProfiles)
  } catch (error) {
    log.error('Erreur récupération profils fidélité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
