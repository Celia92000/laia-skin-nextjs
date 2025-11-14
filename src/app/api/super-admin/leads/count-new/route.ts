import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/leads/count-new
 * Compter les nouveaux leads non traités (NEW + QUALIFIED)
 */
export async function GET() {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
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

    // Compter les leads non vus (jamais ouverts par le super-admin)
    const count = await prisma.lead.count({
      where: {
        status: {
          in: ['NEW', 'QUALIFIED']
        },
        organizationId: null, // Pas encore convertis en organisation
        lastContactDate: null // Jamais vu par le super-admin
      }
    })

    return NextResponse.json({ count })

  } catch (error) {
    log.error('Erreur comptage nouveaux leads:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', count: 0 },
      { status: 500 }
    )
  }
}
