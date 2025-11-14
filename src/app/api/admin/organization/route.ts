import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET() {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        smsCredits: true,
        smsTotalPurchased: true,
        smsLastPurchaseDate: true,
        ownerEmail: true,
        ownerPhone: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ organization })

  } catch (error) {
    log.error('Erreur récupération organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
