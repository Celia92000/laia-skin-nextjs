import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { log } from '@/lib/logger';

// PUT - Modifier un utilisateur
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params

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

    const { email, password, name, phone, role } = await request.json()

    // Vérifier que l'utilisateur existe et appartient à cette organisation
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: id
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          organizationId: id,
          email: email,
          id: { not: userId }
        }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre utilisateur' },
          { status: 400 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      email,
      name,
      phone: phone || null,
      role: role || existingUser.role
    }

    // Mettre à jour le mot de passe uniquement si fourni
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      message: 'Utilisateur modifié avec succès',
      user: updatedUser
    })

  } catch (error) {
    log.error('Erreur modification utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params

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

    // Vérifier que l'utilisateur existe et appartient à cette organisation
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: id
      },
      select: {
        id: true,
        role: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Empêcher la suppression du propriétaire
    if (user.role === 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Impossible de supprimer le propriétaire de l\'organisation' },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    log.error('Erreur suppression utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
