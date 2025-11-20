import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
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
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source
    if (assignedTo) where.assignedToUserId = assignedTo
    if (search) {
      where.OR = [
        { institutName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true,
              plan: true,
              status: true
            }
          },
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              type: true,
              createdAt: true
            }
          }
        },
        orderBy: [
          { updatedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.lead.count({ where })
    ])

    // Stats globales
    const stats = {
      total: await prisma.lead.count(),
      byStatus: await (prisma.lead as any).groupBy({
        by: ['status'],
        _count: {
          _all: true
        }
      }),
      bySource: await (prisma.lead as any).groupBy({
        by: ['source'],
        _count: {
          _all: true
        }
      }),
      totalValue: await (prisma.lead as any).aggregate({
        where: { status: { notIn: ['WON', 'LOST'] } },
        _sum: { estimatedValue: true }
      }),
      avgProbability: await (prisma.lead as any).aggregate({
        where: { status: { notIn: ['WON', 'LOST'] } },
        _avg: { probability: true }
      })
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    })

  } catch (error) {
    log.error('Erreur leads:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Validation
    if (!data.institutName || !data.contactName || !data.contactEmail) {
      return NextResponse.json(
        { error: 'Nom institut, contact et email requis' },
        { status: 400 }
      )
    }

    // Vérifier si le lead existe déjà (email)
    const existing = await prisma.lead.findFirst({
      where: { contactEmail: data.contactEmail }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un lead existe déjà avec cet email' },
        { status: 409 }
      )
    }

    // Calcul automatique du score basique
    let score = 50 // Score de base

    // +20 si email professionnel
    if (data.contactEmail && !data.contactEmail.includes('@gmail') && !data.contactEmail.includes('@outlook')) {
      score += 20
    }

    // +10 si a un site web
    if (data.website) score += 10

    // +20 si plusieurs emplacements
    if (data.numberOfLocations && data.numberOfLocations > 1) score += 20

    const lead = await prisma.lead.create({
      data: {
        institutName: data.institutName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        website: data.website,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || 'France',
        numberOfLocations: data.numberOfLocations || 1,
        numberOfEmployees: data.numberOfEmployees,
        currentSoftware: data.currentSoftware,
        estimatedRevenue: data.estimatedRevenue,
        painPoints: data.painPoints || [],
        status: 'NEW',
        source: data.source || 'OTHER',
        score: Math.min(score, 100),
        probability: 30, // Probabilité initiale
        estimatedValue: data.estimatedValue,
        assignedToUserId: data.assignedToUserId || decoded.userId,
        tags: data.tags || [],
        notes: data.notes
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(lead, { status: 201 })

  } catch (error) {
    log.error('Erreur création lead:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
