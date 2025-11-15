import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { log } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est super admin
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer tous les prospects (DemoBooking)
    const prospects = await prisma.demoBooking.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        institutName: true,
        message: true,
        preferredDate: true,
        preferredTime: true,
        status: true,
        leadSource: true,
        createdAt: true
      }
    })

    // Récupérer les nouveaux clients (Organizations PENDING)
    const newClients = await prisma.organization.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        ownerFirstName: true,
        ownerLastName: true,
        ownerEmail: true,
        ownerPhone: true,
        plan: true,
        leadSource: true,
        createdAt: true,
        convertedAt: true,
        sepaMandateRef: true,
        users: {
          where: { role: 'ORG_ADMIN' },
          take: 1,
          select: {
            email: true
          }
        }
      }
    })

    // Récupérer les clients actifs (Organizations TRIAL/ACTIVE)
    const activeClients = await prisma.organization.findMany({
      where: {
        status: {
          in: ['TRIAL', 'ACTIVE']
        }
      },
      orderBy: {
        activatedAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        ownerFirstName: true,
        ownerLastName: true,
        ownerEmail: true,
        ownerPhone: true,
        plan: true,
        status: true,
        leadSource: true,
        createdAt: true,
        activatedAt: true,
        convertedAt: true,
        trialEndsAt: true,
        users: {
          where: { role: 'ORG_ADMIN' },
          take: 1,
          select: {
            email: true,
            lastLoginAt: true
          }
        }
      }
    })

    return NextResponse.json({
      prospects: prospects.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        institutName: p.institutName,
        message: p.message,
        preferredDate: p.preferredDate,
        preferredTime: p.preferredTime,
        status: p.status,
        leadSource: p.leadSource || 'DEMO_FORM',
        createdAt: p.createdAt,
        type: 'prospect'
      })),
      newClients: newClients.map(c => ({
        id: c.id,
        name: c.name,
        ownerName: `${c.ownerFirstName} ${c.ownerLastName}`,
        ownerFirstName: c.ownerFirstName,
        ownerLastName: c.ownerLastName,
        email: c.ownerEmail || c.users[0]?.email,
        phone: c.ownerPhone,
        plan: c.plan,
        leadSource: c.leadSource || 'WEBSITE',
        createdAt: c.createdAt,
        convertedAt: c.convertedAt,
        sepaMandateRef: c.sepaMandateRef,
        type: 'new_client'
      })),
      activeClients: activeClients.map(c => ({
        id: c.id,
        name: c.name,
        ownerName: `${c.ownerFirstName} ${c.ownerLastName}`,
        ownerFirstName: c.ownerFirstName,
        ownerLastName: c.ownerLastName,
        email: c.ownerEmail || c.users[0]?.email,
        phone: c.ownerPhone,
        plan: c.plan,
        status: c.status,
        leadSource: c.leadSource || 'WEBSITE',
        createdAt: c.createdAt,
        activatedAt: c.activatedAt,
        convertedAt: c.convertedAt,
        trialEndsAt: c.trialEndsAt,
        lastLoginAt: c.users[0]?.lastLoginAt,
        type: 'active_client'
      }))
    })

  } catch (error: any) {
    log.error('Erreur récupération données CRM:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
