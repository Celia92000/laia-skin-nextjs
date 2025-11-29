import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import speakeasy from 'speakeasy'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST - Vérifier le code 2FA lors de la connexion
export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true
      }
    })

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'Configuration 2FA non trouvée' }, { status: 400 })
    }

    // Vérifier le code TOTP
    let verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    // Si le code TOTP échoue, vérifier les codes de récupération
    if (!verified && user.twoFactorBackupCodes) {
      const backupCodes: string[] = JSON.parse(user.twoFactorBackupCodes)
      const codeIndex = backupCodes.findIndex(
        (bc) => bc.toUpperCase() === code.toUpperCase()
      )

      if (codeIndex !== -1) {
        verified = true
        // Supprimer le code utilisé
        backupCodes.splice(codeIndex, 1)
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorBackupCodes: JSON.stringify(backupCodes) }
        })
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Code incorrect' }, { status: 400 })
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    })

    // Générer le token JWT complet
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        twoFactorVerified: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      }
    })
  } catch (error) {
    console.error('Erreur vérification 2FA:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
