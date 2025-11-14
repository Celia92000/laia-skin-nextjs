import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/contracts
 * Récupère tous les contrats d'abonnement
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
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

    // Récupérer toutes les organisations qui ont un contrat
    const organizations = await prisma.organization.findMany({
      where: {
        contractNumber: { not: null },
        contractPdfPath: { not: null }
      },
      select: {
        id: true,
        name: true,
        plan: true,
        monthlyAmount: true,
        contractNumber: true,
        contractPdfPath: true,
        contractSignedAt: true,
        ownerEmail: true,
        ownerFirstName: true,
        ownerLastName: true
      },
      orderBy: {
        contractSignedAt: 'desc'
      }
    })

    // Formater les données
    const contracts = organizations.map(org => ({
      organizationId: org.id,
      organizationName: org.name,
      contractNumber: org.contractNumber!,
      contractPdfPath: org.contractPdfPath!,
      contractSignedAt: org.contractSignedAt!.toISOString(),
      plan: org.plan,
      monthlyAmount: org.monthlyAmount || 0,
      ownerEmail: org.ownerEmail,
      ownerFirstName: org.ownerFirstName,
      ownerLastName: org.ownerLastName
    }))

    return NextResponse.json({ contracts })

  } catch (error) {
    log.error('Erreur récupération contrats:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
