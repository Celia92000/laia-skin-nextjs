import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

    // Générer un nouveau mot de passe ultra-sécurisé
    const generateSecurePassword = () => {
      const length = 16
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const lowercase = 'abcdefghijklmnopqrstuvwxyz'
      const numbers = '0123456789'
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const allChars = uppercase + lowercase + numbers + specialChars

      let password = ''

      // Garantir au moins 2 de chaque type
      password += uppercase[Math.floor(Math.random() * uppercase.length)]
      password += uppercase[Math.floor(Math.random() * uppercase.length)]
      password += lowercase[Math.floor(Math.random() * lowercase.length)]
      password += lowercase[Math.floor(Math.random() * lowercase.length)]
      password += numbers[Math.floor(Math.random() * numbers.length)]
      password += numbers[Math.floor(Math.random() * numbers.length)]
      password += specialChars[Math.floor(Math.random() * specialChars.length)]
      password += specialChars[Math.floor(Math.random() * specialChars.length)]

      // Remplir le reste
      for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
      }

      // Fisher-Yates shuffle
      const arr = password.split('')
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }

      return arr.join('')
    }

    const newPassword = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe de l'admin
    await prisma.user.update({
      where: { id: orgAdmin.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès',
      newPassword: newPassword,
      adminEmail: orgAdmin.email
    })

  } catch (error) {
    log.error('Erreur réinitialisation mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    )
  }
}
