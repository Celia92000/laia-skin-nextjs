import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/admin/invoices
 * Récupère les factures de l'organisation de l'utilisateur connecté
 */
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

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        organizationId: true
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer les factures de l'organisation
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: user.organizationId
      },
      include: {
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques
    const stats = {
      total: invoices.length,
      pending: invoices.filter(inv => inv.status === 'PENDING').length,
      paid: invoices.filter(inv => inv.status === 'PAID').length,
      overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0)
    }

    return NextResponse.json({
      invoices,
      stats
    })

  } catch (error) {
    log.error('Erreur récupération factures:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
