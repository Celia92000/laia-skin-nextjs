import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/public/employees
 * Récupère la liste des employés disponibles pour la réservation
 * API publique (pas d'authentification requise)
 */
export async function GET(req: NextRequest) {
  const prisma = await getPrismaClient()

  try {
    // Récupérer tous les employés actifs et visibles
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        isAvailable: true, // Seulement les employés disponibles
        isVisible: true    // Seulement les employés visibles publiquement
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    log.error('Erreur récupération employés publics:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des employés' },
      { status: 500 }
    )
  }
}
