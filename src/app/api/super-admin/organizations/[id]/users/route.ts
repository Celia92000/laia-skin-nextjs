import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { log } from '@/lib/logger';

// GET - Récupérer tous les utilisateurs de l'organisation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification super admin
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

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        plan: true,
        maxUsers: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer tous les utilisateurs de l'organisation
    const users = await prisma.user.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      organization,
      users
    })

  } catch (error) {
    log.error('Erreur récupération utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification super admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const superAdmin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer l'organisation et vérifier les limites
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Vérifier la limite d'utilisateurs
    if (organization.users.length >= organization.maxUsers) {
      return NextResponse.json({
        error: `Limite atteinte : le plan ${organization.plan} autorise maximum ${organization.maxUsers} utilisateur(s). Actuellement : ${organization.users.length}/${organization.maxUsers}.`
      }, { status: 400 })
    }

    const { email, password, name, phone, role } = await request.json()

    // Vérifier que l'email n'existe pas déjà dans cette organisation
    const existingUser = await prisma.user.findFirst({
      where: {
        organizationId: id,
        email: email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà dans cette organisation' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        organizationId: id,
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: role || 'STAFF'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: newUser
    })

  } catch (error) {
    log.error('Erreur création utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
