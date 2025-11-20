import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/demos/count-new
 * Compter les nouvelles démos non vues par le super-admin
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

    // Compter les démos non vues (jamais ouvertes par le super-admin) et à venir
    const count = await prisma.demoBooking.count({
      where: {
        status: 'CONFIRMED', // Démos confirmées, pas encore faites
        viewedByAdminAt: null, // Jamais vues par le super-admin
        DemoSlot: {
          date: {
            gte: new Date() // Rendez-vous dans le futur uniquement
          }
        }
      }
    })

    return NextResponse.json({ count })

  } catch (error) {
    log.error('Erreur comptage nouvelles démos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', count: 0 },
      { status: 500 }
    )
  }
}
