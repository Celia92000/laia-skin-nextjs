import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient()

/**
 * GET /api/super-admin/contract-clauses
 * Récupère toutes les clauses de contrat triées par ordre
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Vérification SUPER_ADMIN obligatoire
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé - Rôle SUPER_ADMIN requis' }, { status: 403 });
    }

    const clauses = await prisma.contractClause.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(clauses)
  } catch (error) {
    log.error('Erreur lors de la récupération des clauses:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clauses' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/contract-clauses
 * Met à jour toutes les clauses (upsert)
 *
 * Body: Array<{
 *   key: string
 *   title: string
 *   content: string
 *   order: number
 *   isDefault: boolean
 *   isActive: boolean
 * }>
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 Vérification SUPER_ADMIN obligatoire
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé - Rôle SUPER_ADMIN requis' }, { status: 403 });
    }

    const clauses = await req.json()

    if (!Array.isArray(clauses)) {
      return NextResponse.json(
        { error: 'Le corps de la requête doit être un tableau de clauses' },
        { status: 400 }
      )
    }

    // Valider les clauses
    for (const clause of clauses) {
      if (!clause.key || !clause.title || !clause.content) {
        return NextResponse.json(
          { error: 'Chaque clause doit avoir key, title et content' },
          { status: 400 }
        )
      }
    }

    // Récupérer les clés actuelles pour identifier les clauses à supprimer
    const existingClauses = await prisma.contractClause.findMany({
      select: { key: true }
    })
    const existingKeys = new Set(existingClauses.map(c => c.key))
    const newKeys = new Set(clauses.map(c => c.key))

    // Identifier les clauses à supprimer (celles qui ne sont plus dans la nouvelle liste)
    const keysToDelete = [...existingKeys].filter(k => !newKeys.has(k))

    // Utiliser une transaction pour garantir la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // Supprimer les clauses qui ne sont plus présentes
      if (keysToDelete.length > 0) {
        await tx.contractClause.deleteMany({
          where: {
            key: {
              in: keysToDelete
            }
          }
        })
      }

      // Upsert chaque clause
      const operations = clauses.map(clause =>
        tx.contractClause.upsert({
          where: { key: clause.key },
          update: {
            title: clause.title,
            content: clause.content,
            order: clause.order ?? 0,
            isActive: clause.isActive ?? true,
            updatedAt: new Date()
          },
          create: {
            id: `clause_${clause.key}`,
            key: clause.key,
            title: clause.title,
            content: clause.content,
            order: clause.order ?? 0,
            isDefault: clause.isDefault ?? false,
            isActive: clause.isActive ?? true
          }
        })
      )

      return await Promise.all(operations)
    })

    return NextResponse.json({
      success: true,
      message: `${result.length} clauses enregistrées avec succès`,
      count: result.length
    })
  } catch (error) {
    log.error('Erreur lors de la sauvegarde des clauses:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des clauses' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
