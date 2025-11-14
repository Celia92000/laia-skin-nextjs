import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSubscriptionInvoice } from '@/lib/subscription-invoice-generator'
import { log } from '@/lib/logger';

/**
 * POST /api/super-admin/invoices/[id]/regenerate
 * Régénère une facture (crée une nouvelle facture et marque l'ancienne comme remplacée)
 *
 * IMPORTANT: Règles légales françaises
 * - On ne supprime JAMAIS une facture émise
 * - On crée une nouvelle facture et on marque l'ancienne comme "REPLACED"
 * - La nouvelle facture référence l'ancienne
 * - Conserve la traçabilité complète
 */
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

    const { reason } = await request.json()

    // Récupérer la facture d'origine
    const originalInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
            addons: true
          }
        }
      }
    })

    if (!originalInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Vérifier que la facture n'est pas déjà payée
    if (originalInvoice.status === 'PAID') {
      return NextResponse.json(
        {
          error: 'Impossible de régénérer une facture déjà payée. Créez un avoir à la place.'
        },
        { status: 400 }
      )
    }

    // Vérifier que la facture n'a pas déjà été remplacée
    if (originalInvoice.status === 'REPLACED') {
      return NextResponse.json(
        { error: 'Cette facture a déjà été remplacée' },
        { status: 400 }
      )
    }

    // Créer la nouvelle facture avec les données actuelles de l'organisation
    const { invoice: newInvoice, pdfBuffer, invoiceNumber } = await createSubscriptionInvoice(
      originalInvoice.organizationId,
      false // Ce n'est pas la première facture
    )

    // Marquer l'ancienne facture comme remplacée
    await prisma.invoice.update({
      where: { id: originalInvoice.id },
      data: {
        status: 'REPLACED',
        metadata: {
          ...(originalInvoice.metadata as any || {}),
          replacedAt: new Date().toISOString(),
          replacedBy: decoded.userId,
          replacementInvoiceId: newInvoice.id,
          replacementInvoiceNumber: invoiceNumber,
          replacementReason: reason || 'Régénération demandée par le super-admin'
        } as any
      }
    })

    // Ajouter une référence à l'ancienne facture dans la nouvelle
    await prisma.invoice.update({
      where: { id: newInvoice.id },
      data: {
        metadata: {
          ...(newInvoice.metadata as any || {}),
          replacesInvoiceId: originalInvoice.id,
          replacesInvoiceNumber: originalInvoice.invoiceNumber,
          replacementReason: reason || 'Régénération demandée par le super-admin'
        } as any
      }
    })

    return NextResponse.json({
      success: true,
      oldInvoice: {
        id: originalInvoice.id,
        invoiceNumber: originalInvoice.invoiceNumber,
        status: 'REPLACED'
      },
      newInvoice: {
        id: newInvoice.id,
        invoiceNumber,
        amount: newInvoice.amount,
        status: newInvoice.status
      },
      message: `Nouvelle facture ${invoiceNumber} créée. Ancienne facture ${originalInvoice.invoiceNumber} marquée comme remplacée.`,
      pdfBuffer: pdfBuffer.toString('base64')
    })

  } catch (error) {
    log.error('Erreur régénération facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
