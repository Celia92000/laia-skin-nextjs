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

    // Récupérer toutes les organisations avec les stats des utilisateurs
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        subdomain: true,
        domain: true,
        websiteTemplateId: true,
        createdAt: true,
        _count: {
          select: {
            locations: true,
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Pour chaque organisation, compter les différents types d'utilisateurs
    const organizationsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const [adminCount, staffCount, clientCount] = await Promise.all([
          prisma.user.count({
            where: {
              organizationId: org.id,
              role: { in: ['ORG_ADMIN', 'SUPER_ADMIN'] }
            }
          }),
          prisma.user.count({
            where: {
              organizationId: org.id,
              role: 'STAFF'
            }
          }),
          prisma.user.count({
            where: {
              organizationId: org.id,
              role: 'CLIENT'
            }
          })
        ])

        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          status: org.status,
          subdomain: org.subdomain,
          domain: org.domain,
          websiteTemplateId: org.websiteTemplateId,
          createdAt: org.createdAt,
          locations: Array(org._count.locations).fill({}), // Compatibilité
          stats: {
            totalUsers: org._count.users,
            admins: adminCount,
            staff: staffCount,
            clients: clientCount
          }
        }
      })
    )

    return NextResponse.json({ organizations: organizationsWithStats })

  } catch (error) {
    log.error('Erreur récupération organisations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
