import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer toutes les organisations - optimisé avec juste le count des locations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        subdomain: true,
        domain: true,
        createdAt: true,
        _count: {
          select: { locations: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformer pour garder la même structure (locations comme array avec length = count)
    const organizationsWithLocations = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      subdomain: org.subdomain,
      domain: org.domain,
      createdAt: org.createdAt,
      locations: Array(org._count.locations).fill({}) // Compatibilité: array vide avec la bonne longueur
    }))

    return NextResponse.json({ organizations: organizationsWithLocations })

  } catch (error) {
    console.error('Erreur récupération organisations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
