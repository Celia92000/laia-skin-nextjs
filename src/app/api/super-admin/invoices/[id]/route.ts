import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/invoices/[id]
 * Récupère les détails d'une facture
 */
export async function GET(
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

    // Récupérer l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer la facture
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            legalName: true,
            ownerEmail: true,
            ownerPhone: true
          }
        },
        payments: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions
    // SUPER_ADMIN peut voir toutes les factures
    // Les autres ne peuvent voir que les factures de leur organisation
    if (user.role !== 'SUPER_ADMIN' && invoice.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json(invoice)

  } catch (error) {
    log.error('Erreur récupération facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/super-admin/invoices/[id]
 * Modifier une facture (correction d'erreur)
 */
export async function PATCH(
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

    const data = await request.json()

    // Vérifier que la facture existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Ne permettre la modification que si la facture n'est pas encore payée
    if (existingInvoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Impossible de modifier une facture déjà payée' },
        { status: 400 }
      )
    }

    // Mettre à jour la facture
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        amount: data.amount !== undefined ? data.amount : undefined,
        description: data.description !== undefined ? data.description : undefined,
        dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : undefined,
        status: data.status !== undefined ? data.status : undefined,
        metadata: data.metadata !== undefined ? data.metadata : undefined
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            ownerEmail: true
          }
        }
      }
    })

    return NextResponse.json(invoice)

  } catch (error) {
    log.error('Erreur modification facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/super-admin/invoices/[id]
 * Supprimer une facture (en cas d'erreur)
 */
export async function DELETE(
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

    // Vérifier que la facture existe
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Ne permettre la suppression que si la facture n'est pas payée
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une facture déjà payée' },
        { status: 400 }
      )
    }

    // Supprimer la facture
    await prisma.invoice.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Facture supprimée avec succès'
    })

  } catch (error) {
    log.error('Erreur suppression facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
