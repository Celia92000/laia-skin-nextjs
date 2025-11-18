import PDFDocument from 'pdfkit'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

/**
 * Télécharge une image depuis une URL
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          resolve(null)
          return
        }
        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
        response.on('error', () => resolve(null))
      }).on('error', () => resolve(null))
    } catch (error) {
      resolve(null)
    }
  })
}

export interface InvoiceData {
  invoiceNumber: string
  organizationId: string
  organizationName: string
  legalName?: string
  siret?: string
  address?: string
  plan: string
  amount: number
  date: Date
  dueDate: Date
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
}

/**
 * Génère un numéro de facture unique
 * Format: LAIA-2025-001234
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `LAIA-${year}-`

  // Compter le nombre de factures cette année
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
  })

  // Numéro avec padding de 6 chiffres
  const number = (count + 1).toString().padStart(6, '0')

  return `${prefix}${number}`
}

/**
 * Crée une facture dans la base de données
 */
export async function createInvoiceRecord(data: {
  organizationId: string
  invoiceNumber: string
  amount: number
  plan: string
  status: 'PAID' | 'PENDING' | 'FAILED'
  pdfPath?: string
  stripePaymentIntentId?: string
}) {
  return await prisma.invoice.create({
    data: {
      organizationId: data.organizationId,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      plan: data.plan,
      status: data.status,
      pdfPath: data.pdfPath,
      stripePaymentIntentId: data.stripePaymentIntentId,
      issueDate: new Date(),
      dueDate: new Date(), // Immédiat pour SEPA
    },
  })
}

/**
 * Génère un PDF de facture
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Récupérer les paramètres de facturation
      const settings = await prisma.invoiceSettings.findFirst()

      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks: Buffer[] = []

      // Capturer les données du PDF
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // === HEADER ===
      let logoY = 50

      // Essayer d'afficher le logo si URL fournie
      if (settings?.logoUrl) {
        try {
          const logoBuffer = await downloadImage(settings.logoUrl)
          if (logoBuffer) {
            doc.image(logoBuffer, 50, 50, { width: 100 })
            logoY = 160 // Décaler le texte si logo affiché
          }
        } catch (error) {
          console.warn('Impossible de charger le logo:', error)
        }
      }

      // Nom de l'entreprise
      doc
        .fontSize(logoY === 160 ? 18 : 28)
        .fillColor(settings?.primaryColor || '#667eea')
        .text((logoY === 160 ? '' : '🌸 ') + (settings?.companyName || 'LAIA Connect'), 50, logoY)

      const baselineY = logoY + (logoY === 160 ? 10 : 35)

      doc
        .fontSize(10)
        .fillColor('#666')
        .text('Logiciel de gestion pour instituts de beauté', 50, baselineY)

      // Coordonnées LAIA
      doc
        .fontSize(9)
        .fillColor('#333')
        .text(settings?.companyName || 'LAIA SAS', 50, baselineY + 25)
        .text(settings?.address || '123 Avenue de la Beauté', 50, baselineY + 38)
        .text(`${settings?.postalCode || '75001'} ${settings?.city || 'Paris'}, ${settings?.country || 'France'}`, 50, baselineY + 51)
        .text(`SIRET: ${settings?.siret || '123 456 789 00012'}`, 50, baselineY + 64)
        .text(`TVA: ${settings?.tvaNumber || 'FR12345678900'}`, 50, baselineY + 77)

      // Informations facture (droite)
      doc
        .fontSize(20)
        .fillColor('#667eea')
        .text('FACTURE', 400, 50, { align: 'right' })

      doc
        .fontSize(10)
        .fillColor('#333')
        .text(`N° ${data.invoiceNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${data.date.toLocaleDateString('fr-FR')}`, 400, 95, { align: 'right' })
        .text(`Échéance: ${data.dueDate.toLocaleDateString('fr-FR')}`, 400, 110, { align: 'right' })

      // === CLIENT ===
      doc
        .fontSize(12)
        .fillColor('#667eea')
        .text('FACTURÉ À', 50, 210)

      doc
        .fontSize(10)
        .fillColor('#333')
        .text(data.legalName || data.organizationName, 50, 230)

      if (data.siret) {
        doc.text(`SIRET: ${data.siret}`, 50, 243)
      }

      if (data.address) {
        doc.text(data.address, 50, 256)
      }

      // === TABLEAU DES ITEMS ===
      const tableTop = 320
      const tableLeft = 50

      // Header du tableau
      doc
        .fontSize(10)
        .fillColor('#fff')
        .rect(tableLeft, tableTop, 495, 25)
        .fillAndStroke('#667eea', '#667eea')

      doc
        .fillColor('#fff')
        .text('Description', tableLeft + 10, tableTop + 8, { width: 250 })
        .text('Qté', tableLeft + 270, tableTop + 8, { width: 50, align: 'center' })
        .text('Prix unit.', tableLeft + 330, tableTop + 8, { width: 70, align: 'right' })
        .text('Total HT', tableLeft + 410, tableTop + 8, { width: 75, align: 'right' })

      // Lignes du tableau
      let yPosition = tableTop + 35
      let totalHT = 0

      data.items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff'

        doc
          .rect(tableLeft, yPosition - 5, 495, 25)
          .fillAndStroke(bgColor, bgColor)

        doc
          .fillColor('#333')
          .fontSize(9)
          .text(item.description, tableLeft + 10, yPosition, { width: 250 })
          .text(item.quantity.toString(), tableLeft + 270, yPosition, { width: 50, align: 'center' })
          .text(`${item.unitPrice.toFixed(2)} €`, tableLeft + 330, yPosition, { width: 70, align: 'right' })
          .text(`${item.total.toFixed(2)} €`, tableLeft + 410, yPosition, { width: 75, align: 'right' })

        totalHT += item.total
        yPosition += 30
      })

      // === TOTAUX ===
      const totalsTop = yPosition + 20

      // Total HT
      doc
        .fontSize(10)
        .fillColor('#333')
        .text('Total HT', 380, totalsTop)
        .text(`${totalHT.toFixed(2)} €`, 450, totalsTop, { align: 'right' })

      // TVA (20%)
      const tva = totalHT * 0.20
      doc
        .text('TVA (20%)', 380, totalsTop + 20)
        .text(`${tva.toFixed(2)} €`, 450, totalsTop + 20, { align: 'right' })

      // Total TTC
      const totalTTC = totalHT + tva
      doc
        .fontSize(12)
        .fillColor('#667eea')
        .rect(tableLeft, totalsTop + 50, 495, 30)
        .fillAndStroke('#f0f0f0', '#f0f0f0')

      doc
        .fillColor('#667eea')
        .font('Helvetica-Bold')
        .text('TOTAL TTC', 380, totalsTop + 58)
        .fontSize(14)
        .text(`${totalTTC.toFixed(2)} €`, 450, totalsTop + 58, { align: 'right' })
        .font('Helvetica')

      // === CONDITIONS DE PAIEMENT ===
      const footerTop = totalsTop + 120

      doc
        .fontSize(9)
        .fillColor('#666')
        .text('Conditions de paiement : Prélèvement SEPA automatique', 50, footerTop)
        .text('Aucun escompte pour règlement anticipé', 50, footerTop + 15)
        .text('En cas de retard de paiement, indemnité forfaitaire de 40€ pour frais de recouvrement.', 50, footerTop + 30)

      // === PIED DE PAGE ===
      doc
        .fontSize(8)
        .fillColor('#999')
        .text(
          'LAIA SAS - Capital social: 10 000€ - RCS Paris 123 456 789',
          50,
          750,
          { align: 'center', width: 495 }
        )
        .text(
          'TVA intracommunautaire: FR12345678900',
          50,
          765,
          { align: 'center', width: 495 }
        )

      // Finaliser le PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Sauvegarde une facture PDF
 */
export async function saveInvoicePDF(
  invoiceNumber: string,
  pdfBuffer: Buffer
): Promise<string> {
  // Créer le dossier invoices s'il n'existe pas
  const invoicesDir = path.join(process.cwd(), 'public', 'invoices')

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true })
  }

  // Nom du fichier
  const filename = `${invoiceNumber}.pdf`
  const filepath = path.join(invoicesDir, filename)

  // Sauvegarder le fichier
  fs.writeFileSync(filepath, pdfBuffer)

  // Retourner le chemin public
  return `/invoices/${filename}`
}

/**
 * Génère et sauvegarde une facture complète
 */
export async function generateAndSaveInvoice(
  organizationId: string,
  amount: number,
  plan: string,
  stripePaymentIntentId?: string
): Promise<{ invoiceNumber: string; pdfPath: string; pdfUrl: string }> {
  try {
    // Récupérer les infos de l'organisation
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        config: true,
      },
    })

    if (!org) {
      throw new Error('Organisation introuvable')
    }

    // Générer le numéro de facture
    const invoiceNumber = await generateInvoiceNumber()

    // Calculer la TVA
    const amountHT = amount / 1.20
    const tva = amount - amountHT

    // Préparer les données de la facture
    const invoiceData: InvoiceData = {
      invoiceNumber,
      organizationId,
      organizationName: org.name,
      legalName: org.legalName || org.name,
      siret: org.config?.siret || undefined,
      address: org.billingAddress || undefined,
      plan,
      amount: amountHT,
      date: new Date(),
      dueDate: new Date(), // Immédiat pour SEPA
      items: [
        {
          description: `Abonnement LAIA ${plan} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          quantity: 1,
          unitPrice: amountHT,
          total: amountHT,
        },
      ],
    }

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData)

    // Sauvegarder le PDF
    const pdfPath = await saveInvoicePDF(invoiceNumber, pdfBuffer)

    // Créer l'enregistrement en base de données
    await createInvoiceRecord({
      organizationId,
      invoiceNumber,
      amount,
      plan,
      status: 'PAID',
      pdfPath,
      stripePaymentIntentId,
    })

    // URL publique
    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}${pdfPath}`

    return { invoiceNumber, pdfPath, pdfUrl }
  } catch (error) {
    console.error('Erreur génération facture:', error)
    throw error
  }
}
