import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateInvoiceNumber,
  generateInvoiceMetadata,
  calculateInvoiceTotal,
  getCurrentBillingPeriod,
  getNextBillingDate
} from '@/lib/subscription-billing'
import { sendInvoiceEmail } from '@/lib/email-service'
import { log } from '@/lib/logger';

/**
 * POST /api/super-admin/invoices/generate
 * Génère une facture pour une organisation
 */
export async function POST(request: Request) {
  try {
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
    const { organizationId, generateForAllOrganizations } = data

    // Mode 1 : Générer pour toutes les organisations actives
    if (generateForAllOrganizations) {
      const organizations = await prisma.organization.findMany({
        where: {
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          plan: true,
          addons: true,
          ownerEmail: true
        }
      })

      const invoices = []

      for (const org of organizations) {
        const invoice = await generateInvoiceForOrganization(org.id, org.plan, org.addons)
        invoices.push(invoice)
      }

      return NextResponse.json({
        message: `${invoices.length} factures générées`,
        invoices
      })
    }

    // Mode 2 : Générer pour une organisation spécifique
    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId requis' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        plan: true,
        addons: true,
        ownerEmail: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    const invoice = await generateInvoiceForOrganization(
      organization.id,
      organization.plan,
      organization.addons
    )

    return NextResponse.json(invoice)

  } catch (error) {
    log.error('Erreur génération facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Fonction helper pour générer une facture pour une organisation
 */
async function generateInvoiceForOrganization(
  organizationId: string,
  plan: any,
  addonsJson: string | null
) {
  const billingPeriod = getCurrentBillingPeriod()
  const dueDate = getNextBillingDate()

  // Générer les métadonnées de la facture
  const metadata = generateInvoiceMetadata(
    plan,
    addonsJson,
    billingPeriod.start,
    billingPeriod.end
  )

  // Calculer le montant total
  const amount = calculateInvoiceTotal(plan, addonsJson)

  // Générer le numéro de facture
  const invoiceNumber = generateInvoiceNumber()

  // Créer la facture dans la base de données
  const invoice = await prisma.invoice.create({
    data: {
      organizationId,
      invoiceNumber,
      amount,
      plan,
      status: 'PENDING',
      issueDate: new Date(),
      dueDate,
      description: `Abonnement ${plan} - ${billingPeriod.start.toLocaleDateString('fr-FR')} au ${billingPeriod.end.toLocaleDateString('fr-FR')}`,
      metadata: metadata as any
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

  // Envoyer la facture par email automatiquement
  try {
    await sendInvoiceEmail({
      organizationName: invoice.organization.name,
      ownerEmail: invoice.organization.ownerEmail,
      invoiceNumber,
      amount,
      dueDate,
      plan,
      lineItems: metadata.lineItems,
      prorata: metadata.prorata
    })
    log.info(`✅ Facture ${invoiceNumber} envoyée par email à ${invoice.organization.ownerEmail}`)
  } catch (emailError) {
    log.error('⚠️ Erreur envoi email facture:', emailError)
    // On ne bloque pas la création de la facture si l'envoi email échoue
  }

  return invoice
}
