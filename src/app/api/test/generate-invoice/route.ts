import { NextRequest, NextResponse } from 'next/server'
import { generateAndSaveInvoice } from '@/lib/invoice-service'
import { prisma } from '@/lib/prisma'

/**
 * Route de test pour générer une facture manuellement
 *
 * Usage: GET /api/test/generate-invoice?organizationId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId requis' },
        { status: 400 }
      )
    }

    // Récupérer l'organisation
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    // Calculer le montant selon le plan
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 89,
      TEAM: 149,
      PREMIUM: 249,
    }

    const amount = planPrices[org.plan] || 49

    // Générer la facture
    const invoice = await generateAndSaveInvoice(
      org.id,
      amount,
      org.plan,
      'test_payment_intent_' + Date.now()
    )

    console.log('✅ Facture de test générée:', invoice)

    return NextResponse.json({
      success: true,
      message: 'Facture générée avec succès',
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        pdfPath: invoice.pdfPath,
        pdfUrl: invoice.pdfUrl,
      },
    })
  } catch (error) {
    console.error('Erreur génération facture test:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
