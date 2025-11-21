import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Rechercher l'utilisateur par email
    // Utiliser findFirst car le schema a une contrainte unique composée (organizationId_email)
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        organization: {
          select: {
            slug: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a un mot de passe (pas OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Impossible de se connecter avec un compte OAuth' },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier que l'organisation n'est pas suspendue ou annulée
    if (user.organization && ['SUSPENDED', 'CANCELLED'].includes(user.organization.status)) {
      return NextResponse.json(
        { error: 'Votre compte est suspendu. Contactez le support.' },
        { status: 403 }
      )
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId
    })

    // Définir le cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    })

    // Déterminer la redirection selon le rôle
    let redirect = '/'

    switch (user.role) {
      case 'SUPER_ADMIN':
        redirect = '/super-admin'
        break

      case 'ORG_ADMIN':
        redirect = '/admin'
        break

      case 'STAFF':
      case 'RECEPTIONIST':
      case 'LOCATION_MANAGER':
        // Rediriger vers l'admin avec des permissions limitées
        redirect = '/admin'
        break

      case 'ACCOUNTANT':
        // Rediriger vers l'admin (section comptabilité)
        redirect = '/admin'
        break

      case 'CLIENT':
        // Rediriger vers l'espace client
        redirect = '/espace-client'
        break

      default:
        redirect = '/'
    }

    return NextResponse.json({
      message: 'Connexion réussie',
      redirect,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    log.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
