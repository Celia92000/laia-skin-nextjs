import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

// GET - Générer un nouveau secret 2FA et QR code
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true, twoFactorEnabled: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA déjà activé' }, { status: 400 })
    }

    // Générer un nouveau secret
    const secret = speakeasy.generateSecret({
      name: `LAIA Connect (${user.email})`,
      issuer: 'LAIA Connect',
      length: 32
    })

    // Générer le QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '')

    // Générer les codes de récupération
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    // Stocker temporairement le secret (non activé)
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: JSON.stringify(backupCodes)
      }
    })

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      backupCodes,
      message: 'Scannez le QR code avec votre application d\'authentification'
    })
  } catch (error) {
    console.error('Erreur setup 2FA:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Activer le 2FA après vérification du code
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

    const { code } = await request.json()

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'Configuration 2FA non trouvée' }, { status: 400 })
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA déjà activé' }, { status: 400 })
    }

    // Vérifier le code TOTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!verified) {
      return NextResponse.json({ error: 'Code incorrect' }, { status: 400 })
    }

    // Activer le 2FA
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { twoFactorEnabled: true }
    })

    return NextResponse.json({
      success: true,
      message: '2FA activé avec succès'
    })
  } catch (error) {
    console.error('Erreur activation 2FA:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
