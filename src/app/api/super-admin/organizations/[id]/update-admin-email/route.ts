import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Récupérer le nouvel email
    const { newEmail } = await request.json()

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await prisma.user.findFirst({
      where: { email: newEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un autre utilisateur' },
        { status: 400 }
      )
    }

    // Trouver l'admin de l'organisation
    const orgAdmin = await prisma.user.findFirst({
      where: {
        organizationId: id,
        role: 'ORG_ADMIN'
      }
    })

    if (!orgAdmin) {
      return NextResponse.json(
        { error: 'Admin de l\'organisation introuvable' },
        { status: 404 }
      )
    }

    // Mettre à jour l'email de l'admin ET l'email du propriétaire de l'organisation
    await prisma.user.update({
      where: { id: orgAdmin.id },
      data: { email: newEmail }
    })

    await prisma.organization.update({
      where: { id },
      data: { ownerEmail: newEmail }
    })

    return NextResponse.json({
      message: 'Email modifié avec succès',
      newEmail
    })

  } catch (error) {
    log.error('Erreur modification email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}
