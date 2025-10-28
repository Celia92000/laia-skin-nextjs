import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmail } from '@/lib/email-service'

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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer la facture avec l'organisation
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Extraire les line items depuis les métadonnées
    const metadata = invoice.metadata as any
    const lineItems = metadata?.lineItems || []

    // Envoyer l'email
    await sendInvoiceEmail({
      organizationName: invoice.organization.name,
      ownerEmail: invoice.organization.billingEmail || invoice.organization.ownerEmail,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      plan: invoice.plan,
      lineItems: lineItems,
      changeType: metadata?.changeType,
      prorata: metadata?.prorata
    })

    console.log(`📧 Facture ${invoice.invoiceNumber} renvoyée par email à ${invoice.organization.billingEmail || invoice.organization.ownerEmail}`)

    return NextResponse.json({
      message: 'Facture renvoyée avec succès',
      email: invoice.organization.billingEmail || invoice.organization.ownerEmail
    })

  } catch (error) {
    console.error('Erreur renvoi facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renvoi de la facture' },
      { status: 500 }
    )
  }
}
