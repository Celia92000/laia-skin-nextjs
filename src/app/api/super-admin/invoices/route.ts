import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/invoices
 * Récupère toutes les factures (avec filtres optionnels)
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

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const organizationId = searchParams.get('organizationId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construire le filtre
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Récupérer les factures
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            ownerEmail: true,
            plan: true
          }
        },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques globales
    const stats = {
      total: invoices.length,
      pending: invoices.filter(inv => inv.status === 'PENDING').length,
      paid: invoices.filter(inv => inv.status === 'PAID').length,
      overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
      cancelled: invoices.filter(inv => inv.status === 'CANCELLED').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0),
      overdueAmount: invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.amount, 0)
    }

    // Statistiques par organisation
    const byOrganization = invoices.reduce((acc: any, invoice) => {
      const orgId = invoice.organizationId
      if (!acc[orgId]) {
        acc[orgId] = {
          organizationId: orgId,
          organizationName: invoice.organization.name,
          count: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0
        }
      }
      acc[orgId].count++
      acc[orgId].totalAmount += invoice.amount
      if (invoice.status === 'PAID') {
        acc[orgId].paidAmount += invoice.amount
      } else if (invoice.status === 'PENDING') {
        acc[orgId].pendingAmount += invoice.amount
      }
      return acc
    }, {})

    return NextResponse.json({
      invoices,
      stats,
      byOrganization: Object.values(byOrganization)
    })

  } catch (error) {
    log.error('Erreur récupération factures:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
