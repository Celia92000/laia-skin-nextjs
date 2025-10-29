import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await context.params;
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

    const data = await request.json()

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        role: data.role !== undefined ? data.role : undefined
      }
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
