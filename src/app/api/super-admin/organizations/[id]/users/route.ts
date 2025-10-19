import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer tous les utilisateurs de l'organisation
    const users = await prisma.user.findMany({
      where: { organizationId: params.id },
      include: {
        userLocations: {
          include: {
            location: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      isActive: u.isActive,
      locations: u.userLocations.map(ul => ul.location)
    }))

    return NextResponse.json({
      organization,
      users: formattedUsers
    })

  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
