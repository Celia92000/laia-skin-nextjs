import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Vérifier le statut 2FA
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
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Compter les codes de récupération restants
    let backupCodesRemaining = 0
    if (user.twoFactorBackupCodes) {
      try {
        const codes: string[] = JSON.parse(user.twoFactorBackupCodes)
        backupCodesRemaining = codes.length
      } catch {
        backupCodesRemaining = 0
      }
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled,
      backupCodesRemaining
    })
  } catch (error) {
    console.error('Erreur statut 2FA:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
