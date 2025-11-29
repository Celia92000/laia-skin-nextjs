import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import speakeasy from 'speakeasy'

// POST - Désactiver le 2FA
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { code, password } = await request.json()

    if (!code || !password) {
      return NextResponse.json({ error: 'Code et mot de passe requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true
      }
    })

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA non activé' }, { status: 400 })
    }

    // Vérifier le mot de passe
    const bcrypt = await import('bcryptjs')
    const passwordValid = user.password ? await bcrypt.compare(password, user.password) : false

    if (!passwordValid) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 400 })
    }

    // Vérifier le code TOTP ou code de récupération
    let verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!verified && user.twoFactorBackupCodes) {
      const backupCodes: string[] = JSON.parse(user.twoFactorBackupCodes)
      verified = backupCodes.some((bc) => bc.toUpperCase() === code.toUpperCase())
    }

    if (!verified) {
      return NextResponse.json({ error: 'Code incorrect' }, { status: 400 })
    }

    // Désactiver le 2FA
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA désactivé avec succès'
    })
  } catch (error) {
    console.error('Erreur désactivation 2FA:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
