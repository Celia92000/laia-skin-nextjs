import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/admin/laia-invoices
 * Récupérer les factures d'abonnement LAIA pour l'organisation de l'admin connecté
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      log.info('[laia-invoices] Pas de token')
      return NextResponse.json({ error: 'Non authentifié', invoices: [] }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId || !decoded.organizationId) {
      log.info('[laia-invoices] Token invalide')
      return NextResponse.json({ error: 'Token invalide', invoices: [] }, { status: 401 })
    }

    log.info('[laia-invoices] Récupération factures pour organisation:', decoded.organizationId)

    // Vérifier que l'utilisateur est admin de l'organisation
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    })

    if (!user || !['ORG_ADMIN', 'ACCOUNTANT'].includes(user.role)) {
      log.info('[laia-invoices] Accès refusé - rôle:', user?.role)
      return NextResponse.json({ error: 'Accès refusé', invoices: [] }, { status: 403 })
    }

    // Récupérer toutes les factures d'abonnement LAIA pour cette organisation
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: decoded.organizationId
      },
      orderBy: {
        issueDate: 'desc'
      }
    })

    log.info('[laia-invoices] Factures trouvées:', invoices.length)
    return NextResponse.json({ invoices })

  } catch (error: any) {
    log.error('[laia-invoices] Erreur:', error?.message || error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message, invoices: [] },
      { status: 500 }
    )
  }
}
