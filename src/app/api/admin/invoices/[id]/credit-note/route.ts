import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationBillingInfo } from '@/lib/subscription-invoice-generator'
import PDFDocument from 'pdfkit'
import { log } from '@/lib/logger';

/**
 * POST /api/admin/invoices/[id]/credit-note
 * Crée un avoir (credit note) pour une facture de l'organisation
 * Accessible par ORG_OWNER uniquement
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
      select: {
        role: true,
        organizationId: true
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions
    if (!['ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { reason, partialAmount } = await request.json()

    // Récupérer la facture d'origine
    const originalInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            legalName: true,
            ownerFirstName: true,
            ownerLastName: true,
            ownerEmail: true,
            plan: true
          }
        }
      }
    })

    if (!originalInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Vérifier que la facture appartient à l'organisation de l'utilisateur
    if (originalInvoice.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Vérifier si un avoir existe déjà
    const existingCreditNote = await prisma.invoice.findFirst({
      where: {
        type: 'CREDIT_NOTE',
        metadata: {
          path: ['originalInvoiceId'],
          equals: id
        }
      }
    })

    if (existingCreditNote && !partialAmount) {
      return NextResponse.json(
        { error: 'Un avoir complet existe déjà pour cette facture' },
        { status: 400 }
      )
    }

    const creditAmount = partialAmount || originalInvoice.amount

    // Générer le numéro d'avoir
    const year = new Date().getFullYear()
    const lastCreditNote = await prisma.invoice.findFirst({
      where: {
        type: 'CREDIT_NOTE',
        organizationId: user.organizationId ?? undefined,
        invoiceNumber: {
          startsWith: `AV-${year}-`
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    })

    let creditNoteNumber = `AV-${year}-0001`
    if (lastCreditNote) {
      const lastNumber = parseInt(lastCreditNote.invoiceNumber.split('-')[2])
      creditNoteNumber = `AV-${year}-${String(lastNumber + 1).padStart(4, '0')}`
    }

    // Créer l'avoir
    const creditNote = await prisma.invoice.create({
      data: {
        organizationId: originalInvoice.organizationId,
        invoiceNumber: creditNoteNumber,
        amount: -creditAmount,
        plan: originalInvoice.plan,
        type: 'CREDIT_NOTE',
        status: 'PAID',
        invoiceDate: new Date(),
        dueDate: new Date(),
        description: `Avoir sur facture ${originalInvoice.invoiceNumber}${reason ? ` - ${reason}` : ''}`,
        metadata: {
          originalInvoiceId: originalInvoice.id,
          originalInvoiceNumber: originalInvoice.invoiceNumber,
          originalAmount: originalInvoice.amount,
          creditAmount: -creditAmount,
          reason: reason || 'Annulation',
          isPartial: !!partialAmount,
          createdBy: decoded.userId
        } as any
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            legalName: true,
            ownerEmail: true
          }
        }
      }
    })

    // Si c'est un avoir complet, marquer la facture d'origine comme annulée
    if (!partialAmount) {
      await prisma.invoice.update({
        where: { id: originalInvoice.id },
        data: {
          status: 'CANCELLED',
          metadata: {
            ...(originalInvoice.metadata as any || {}),
            cancelledAt: new Date().toISOString(),
            cancelledBy: decoded.userId,
            creditNoteId: creditNote.id,
            creditNoteNumber: creditNoteNumber
          } as any
        }
      })
    }

    // Générer le PDF
    const orgInfo = await getOrganizationBillingInfo(originalInvoice.organizationId)
    const pdfBuffer = await generateCreditNotePDF({
      creditNote,
      originalInvoice,
      orgInfo,
      reason: reason || 'Annulation'
    })

    return NextResponse.json({
      success: true,
      creditNote,
      message: `Avoir ${creditNoteNumber} créé avec succès`,
      pdfBuffer: pdfBuffer.toString('base64')
    })

  } catch (error) {
    log.error('Erreur création avoir:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Génère le PDF d'un avoir (credit note)
 */
async function generateCreditNotePDF(data: {
  creditNote: any
  originalInvoice: any
  orgInfo: any
  reason: string
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const { creditNote, originalInvoice, orgInfo, reason } = data

      // En-tête
      doc.fontSize(20).font('Helvetica-Bold').text('AVOIR', 50, 50)
      doc.fontSize(10).font('Helvetica').text(`N° ${creditNote.invoiceNumber}`, 50, 75)
      doc.fontSize(9).text(`Date d'émission : ${new Date(creditNote.invoiceDate).toLocaleDateString('fr-FR')}`, 50, 90)
      doc.fontSize(9).text(`Référence facture : ${originalInvoice.invoiceNumber}`, 50, 105)

      // Informations LAIA (émetteur)
      doc.fontSize(10).font('Helvetica-Bold').text('LAIA SAS', 50, 140)
      doc.fontSize(9).font('Helvetica')
        .text('Société par Actions Simplifiée', 50, 155)
        .text('123 Avenue des Champs-Élysées', 50, 167)
        .text('75008 Paris, France', 50, 179)
        .text('', 50, 191)
        .text('SIRET : 123 456 789 00012', 50, 203)
        .text('N° TVA Intracommunautaire : FR12 123456789', 50, 215)
        .text('RCS Paris B 123 456 789', 50, 227)
        .text('Code APE : 6201Z (Programmation informatique)', 50, 239)
        .text('Capital social : 10 000 €', 50, 251)

      // Informations Client
      doc.fontSize(10).font('Helvetica-Bold').text('Client', 350, 140)
      doc.fontSize(9).font('Helvetica')
        .text(orgInfo.legalName || orgInfo.organizationName, 350, 155)
        .text(`${orgInfo.ownerFirstName} ${orgInfo.ownerLastName}`, 350, 167)
        .text(orgInfo.billingAddress || '', 350, 179)
        .text(`${orgInfo.billingPostalCode || ''} ${orgInfo.billingCity || ''}`, 350, 191)
        .text(`${orgInfo.billingCountry || 'France'}`, 350, 203)

      if (orgInfo.siret) {
        doc.text(`SIRET : ${orgInfo.siret}`, 350, 227)
      }

      // Ligne de séparation
      doc.moveTo(50, 280).lineTo(545, 280).stroke()

      // Motif
      doc.fontSize(10).font('Helvetica-Bold').text('Motif', 50, 300)
      doc.fontSize(9).font('Helvetica').text(reason, 50, 315, { width: 500 })

      // Tableau
      const tableTop = 360
      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Description', 50, tableTop)
      doc.text('Montant HT', 350, tableTop)
      doc.text('TVA', 430, tableTop)
      doc.text('Montant TTC', 480, tableTop)

      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke()

      const rowTop = tableTop + 25
      doc.fontSize(9).font('Helvetica')
      doc.text(`Avoir sur facture ${originalInvoice.invoiceNumber}`, 50, rowTop, { width: 280 })
      doc.text(`-${Math.abs(creditNote.amount).toFixed(2)} €`, 350, rowTop)
      doc.text('N/A', 430, rowTop)
      doc.text(`-${Math.abs(creditNote.amount).toFixed(2)} €`, 480, rowTop)

      doc.moveTo(50, rowTop + 20).lineTo(545, rowTop + 20).stroke()

      // Total
      const totalTop = rowTop + 35
      doc.fontSize(11).font('Helvetica-Bold')
      doc.text('TOTAL TTC', 350, totalTop)
      doc.text(`-${Math.abs(creditNote.amount).toFixed(2)} €`, 480, totalTop)

      // Mentions légales
      const legalTop = 680
      doc.fontSize(7).font('Helvetica')
        .text('Mentions légales :', 50, legalTop)
        .text('• TVA non applicable, art. 293 B du CGI', 50, legalTop + 12)
        .text('• Avoir émis conformément à l\'article 272 du CGI', 50, legalTop + 22)
        .text('• En cas de litige, médiation possible via le CMAP (www.cmap.fr)', 50, legalTop + 32)
        .text('• Compétence exclusive des tribunaux de Paris', 50, legalTop + 42)

      // Pied de page
      doc.fontSize(8)
        .text('LAIA SAS - contact@laia-connect.fr - www.laia-connect.fr', 50, 770, { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
