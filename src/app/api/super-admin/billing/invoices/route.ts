import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAndSaveInvoice } from '@/lib/invoice-service'
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const organizationId = searchParams.get('organizationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status) where.status = status
    if (organizationId) where.organizationId = organizationId

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true
            }
          },
          payments: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.invoice.count({ where })
    ])

    const stats = {
      total: await prisma.invoice.count(),
      pending: await prisma.invoice.count({ where: { status: 'PENDING' } }),
      paid: await prisma.invoice.count({ where: { status: 'PAID' } }),
      failed: await prisma.invoice.count({ where: { status: 'FAILED' } }),
      totalRevenue: await prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      }).then(res => res._sum.amount || 0)
    }

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    })

  } catch (error) {
    log.error('Erreur invoices:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const data = await request.json()
    const { organizationId, amount, dueDate, description } = data

    if (!organizationId || !amount) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Récupérer l'organisation par ID ou par nom
    let org = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    // Si pas trouvé par ID, chercher par nom
    if (!org) {
      org = await prisma.organization.findFirst({
        where: { name: organizationId }
      })
    }

    if (!org) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })
    }

    // Générer la facture avec PDF
    const invoiceData = await generateAndSaveInvoice(
      org.id, // Utiliser org.id au cas où l'utilisateur a fourni un nom
      parseFloat(amount),
      org.plan,
      undefined // Pas de Stripe payment intent pour facture manuelle
    )

    // Récupérer la facture créée avec les relations
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: invoiceData.invoiceNumber },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(invoice)

  } catch (error) {
    log.error('Erreur création invoice:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
