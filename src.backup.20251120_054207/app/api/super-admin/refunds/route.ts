import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

/**
 * API Super-Admin : Récupérer TOUS les remboursements de TOUTES les organisations
 * Accessible uniquement au super-admin LAIA Connect
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Vérifier que l'utilisateur est super-admin
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé - Super-admin uniquement' },
        { status: 403 }
      )
    }

    const prisma = await getPrismaClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const organizationId = searchParams.get('organizationId')
    const search = searchParams.get('search')

    // Construction du where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { stripeRefundId: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Récupérer tous les remboursements avec relations
    const refunds = await prisma.refund.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            clientEmail: true,
            clientName: true,
          },
        },
        reservation: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
            date: true,
            status: true,
            totalAmount: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
      take: 100, // Limiter à 100 résultats
    })

    // Calculer les statistiques globales
    const stats = await prisma.refund.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: organizationId ? { organizationId } : undefined,
    })

    const statsByStatus = await prisma.refund.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
      where: organizationId ? { organizationId } : undefined,
    })

    // Statistiques par organisation
    const statsByOrg = await prisma.refund.groupBy({
      by: ['organizationId'],
      _count: { id: true },
      _sum: { amount: true },
    })

    const orgStats = await Promise.all(
      statsByOrg.map(async (stat) => {
        const org = await prisma.organization.findUnique({
          where: { id: stat.organizationId },
          select: { name: true, slug: true },
        })
        return {
          organizationId: stat.organizationId,
          organizationName: org?.name || 'Unknown',
          organizationSlug: org?.slug || '',
          totalRefunds: stat._count.id,
          totalAmount: stat._sum.amount || 0,
        }
      })
    )

    return NextResponse.json({
      refunds: refunds.map((refund) => ({
        id: refund.id,
        organizationId: refund.organizationId,
        organizationName: refund.organization.name,
        organizationSlug: refund.organization.slug,
        type: refund.invoiceId ? 'invoice' : 'reservation',
        amount: refund.amount,
        reason: refund.reason,
        status: refund.status,
        stripeRefundId: refund.stripeRefundId,
        requestedBy: refund.requestedBy,
        requestedAt: refund.requestedAt,
        processedAt: refund.processedAt,
        approvedBy: refund.approvedBy,
        notes: refund.notes,
        client: {
          name:
            refund.invoice?.clientName || refund.reservation?.clientName || '',
          email:
            refund.invoice?.clientEmail ||
            refund.reservation?.clientEmail ||
            '',
          phone: refund.reservation?.clientPhone || '',
        },
        invoice: refund.invoice
          ? {
              id: refund.invoice.id,
              invoiceNumber: refund.invoice.invoiceNumber,
              total: refund.invoice.total,
              status: refund.invoice.status,
            }
          : null,
        reservation: refund.reservation
          ? {
              id: refund.reservation.id,
              date: refund.reservation.date,
              totalAmount: refund.reservation.totalAmount,
              status: refund.reservation.status,
            }
          : null,
      })),
      stats: {
        total: stats._count.id || 0,
        totalAmount: stats._sum.amount || 0,
        byStatus: statsByStatus.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = {
            count: stat._count.id,
            amount: stat._sum.amount || 0,
          }
          return acc
        }, {} as Record<string, { count: number; amount: number }>),
        byOrganization: orgStats,
      },
    })
  } catch (error: any) {
    console.error('❌ Erreur API super-admin refunds:', error)
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
