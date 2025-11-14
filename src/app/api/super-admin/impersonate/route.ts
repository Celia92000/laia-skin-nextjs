import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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
    const superAdmin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true }
    })

    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { userId, organizationId } = await request.json()

    console.log('🔍 Impersonation request:', { userId, organizationId })

    let targetUser

    if (userId) {
      // Impersonnation d'un utilisateur spécifique
      targetUser = await prisma.user.findFirst({
        where: { id: userId },
        include: { organization: true }
      })
      console.log('👤 Target user by userId:', targetUser?.email)
    } else if (organizationId) {
      // Impersonnation du premier admin de l'organisation (ORG_OWNER ou ORG_ADMIN)
      targetUser = await prisma.user.findFirst({
        where: {
          organizationId: organizationId,
          role: { in: ['ORG_OWNER', 'ORG_ADMIN'] }
        },
        include: { organization: true },
        orderBy: { createdAt: 'asc' } // Prendre le premier créé (= le propriétaire)
      })
      console.log('🏢 Target user by organizationId:', targetUser?.email, 'Organization:', targetUser?.organization?.slug)
    } else {
      return NextResponse.json({ error: 'userId ou organizationId requis' }, { status: 400 })
    }

    if (!targetUser) {
      console.error('❌ No user found for organizationId:', organizationId)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Empêcher l'impersonnation d'un autre SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Impossible d\'impersonner un autre super admin' },
        { status: 403 }
      )
    }

    // Créer un nouveau token pour l'utilisateur cible
    const impersonationToken = generateToken({
      userId: targetUser.id,
      role: targetUser.role,
      organizationId: targetUser.organizationId
    })

    // Stocker l'information d'impersonnation dans un cookie séparé
    const cookieStore2 = await cookies()
    cookieStore2.set('impersonating-as', targetUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 heures
    })

    cookieStore2.set('original-admin', superAdmin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 heures
    })

    // Définir le nouveau token d'authentification
    cookieStore2.set('auth-token', impersonationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 heures
    })

    // Déterminer la redirection selon le rôle
    const roleRedirects: { [key: string]: string } = {
      'ORG_OWNER': '/admin',
      'ORG_ADMIN': '/admin',
      'LOCATION_MANAGER': '/admin',
      'STAFF': '/admin',
      'RECEPTIONIST': '/admin',
      'CLIENT': '/espace-client'
    }

    const baseUrl = targetUser.organization
      ? `/${targetUser.organization.slug}`
      : ''

    const redirect = baseUrl + (roleRedirects[targetUser.role] || '/admin')

    console.log('✅ Impersonation successful - Redirect to:', redirect)

    return NextResponse.json({
      success: true,
      redirect,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    })

  } catch (error) {
    console.error('Erreur impersonnation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Endpoint pour sortir du mode impersonnation
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const originalAdminId = cookieStore.get('original-admin')?.value

    if (!originalAdminId) {
      return NextResponse.json({ error: 'Pas en mode impersonnation' }, { status: 400 })
    }

    // Récupérer le super admin original
    const superAdmin = await prisma.user.findFirst({
      where: { id: originalAdminId }
    })

    if (!superAdmin) {
      return NextResponse.json({ error: 'Super admin non trouvé' }, { status: 404 })
    }

    // Recréer le token du super admin
    const superAdminToken = generateToken({
      userId: superAdmin.id,
      role: superAdmin.role,
      organizationId: superAdmin.organizationId
    })

    // Nettoyer les cookies d'impersonnation
    cookieStore.delete('impersonating-as')
    cookieStore.delete('original-admin')

    // Restaurer le token du super admin
    cookieStore.set('auth-token', superAdminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    })

    return NextResponse.json({
      success: true,
      redirect: '/super-admin'
    })

  } catch (error) {
    console.error('Erreur sortie impersonnation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
