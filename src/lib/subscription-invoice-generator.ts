import PDFDocument from 'pdfkit'
import { prisma } from './prisma'

interface SubscriptionInvoiceData {
  organizationId: string
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  billingPeriodStart: Date
  billingPeriodEnd: Date
  plan: string
  basePlanPrice: number
  addons: Array<{
    name: string
    price: number
  }>
  totalHT: number
  vatRate: number
  totalTVA: number
  totalTTC: number
  isFirstInvoice?: boolean // Facture d'activation (période d'essai)
}

/**
 * Récupère les informations complètes d'une organisation pour facturation
 */
export async function getOrganizationBillingInfo(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      config: true
    }
  })

  if (!organization) {
    throw new Error('Organisation non trouvée')
  }

  return {
    // Informations légales
    legalName: organization.legalName || organization.name,
    siret: organization.siret,
    tvaNumber: organization.tvaNumber,

    // Adresse de facturation
    billingEmail: organization.billingEmail || organization.ownerEmail,
    billingAddress: organization.billingAddress,
    billingPostalCode: organization.billingPostalCode,
    billingCity: organization.billingCity,
    billingCountry: organization.billingCountry || 'France',

    // Contact
    ownerFirstName: organization.ownerFirstName,
    ownerLastName: organization.ownerLastName,
    ownerEmail: organization.ownerEmail,
    ownerPhone: organization.ownerPhone,

    // Abonnement
    plan: organization.plan,
    monthlyAmount: organization.monthlyAmount,
    addons: organization.addons ? JSON.parse(organization.addons) : { active: [] },

    // SEPA
    sepaMandateRef: organization.sepaMandateRef,
    sepaMandateDate: organization.sepaMandateDate
  }
}

/**
 * Génère un numéro de facture unique
 */
export function generateSubscriptionInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const timestamp = date.getTime().toString().slice(-6)

  return `LAIA-${year}${month}-${timestamp}`
}

/**
 * Calcule le prix de base par plan
 */
export function getBasePlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    SOLO: 49,
    DUO: 69,
    TEAM: 119,
    PREMIUM: 179
  }
  return prices[plan] || 49
}

/**
 * Génère une facture PDF pour un abonnement LAIA Connect
 */
export async function generateSubscriptionInvoicePDF(
  data: SubscriptionInvoiceData
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Récupérer les infos de l'organisation
      const orgInfo = await getOrganizationBillingInfo(data.organizationId)

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Facture ${data.invoiceNumber}`,
          Author: 'LAIA Connect',
          Subject: `Facture d'abonnement LAIA Connect`,
          Keywords: 'facture, abonnement, LAIA',
          CreationDate: new Date()
        }
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)

      // Couleurs LAIA
      const primaryColor = '#667eea'
      const secondaryColor = '#764ba2'
      const grayDark = '#374151'
      const grayLight = '#9ca3af'

      // ======================
      // EN-TÊTE
      // ======================
      doc.fontSize(24)
         .fillColor(primaryColor)
         .text('LAIA Connect', 50, 50)

      doc.fontSize(10)
         .fillColor(grayLight)
         .text('Plateforme SaaS pour Instituts de Beauté', 50, 80)

      // Informations LAIA (émetteur) - MENTIONS LÉGALES COMPLÈTES
      doc.fontSize(9)
         .fillColor(grayDark)
         .text('LAIA SAS', 50, 110)
         .text('Société par Actions Simplifiée', 50, 125)
         .text('123 Avenue de l\'Innovation', 50, 140)
         .text('75001 Paris, France', 50, 155)
         .text('', 50, 170)

      doc.fontSize(8)
         .fillColor(grayLight)
         .text('SIRET : 123 456 789 00012', 50, 185)
         .text('N° TVA Intracommunautaire : FR12 123456789', 50, 197)
         .text('RCS Paris B 123 456 789', 50, 209)
         .text('Code APE : 6201Z (Programmation informatique)', 50, 221)
         .text('Capital social : 10 000 €', 50, 233)

      doc.fontSize(9)
         .fillColor(grayDark)
         .text('Tél : +33 1 XX XX XX XX', 50, 250)
         .text('Email : contact@laia-connect.fr', 50, 262)
         .text('Web : www.laia-connect.fr', 50, 274)

      // Informations de facture (droite)
      doc.fontSize(20)
         .fillColor(primaryColor)
         .text('FACTURE', 400, 50, { align: 'right' })

      doc.fontSize(10)
         .fillColor(grayDark)
         .text(`N° ${data.invoiceNumber}`, 400, 80, { align: 'right' })

      doc.fontSize(9)
         .fillColor(grayLight)
         .text(`Date d'émission : ${data.issueDate.toLocaleDateString('fr-FR')}`, 400, 100, { align: 'right' })
         .text(`Date d'échéance : ${data.dueDate.toLocaleDateString('fr-FR')}`, 400, 115, { align: 'right' })

      if (data.isFirstInvoice) {
        doc.fontSize(12)
           .fillColor('#10b981')
           .text('✓ FACTURE D\'ACTIVATION', 400, 140, { align: 'right' })
      }

      // ======================
      // INFORMATIONS CLIENT
      // ======================
      doc.moveTo(50, 240)
         .lineTo(545, 240)
         .strokeColor(grayLight)
         .stroke()

      doc.fontSize(11)
         .fillColor(primaryColor)
         .text('FACTURÉ À', 50, 260)

      doc.fontSize(10)
         .fillColor(grayDark)
         .text(orgInfo.legalName, 50, 280)

      if (orgInfo.ownerFirstName && orgInfo.ownerLastName) {
        doc.text(`${orgInfo.ownerFirstName} ${orgInfo.ownerLastName}`, 50, 295)
      }

      if (orgInfo.billingAddress) {
        doc.text(orgInfo.billingAddress, 50, 310)
        doc.text(`${orgInfo.billingPostalCode} ${orgInfo.billingCity}`, 50, 325)
        doc.text(orgInfo.billingCountry, 50, 340)
      }

      if (orgInfo.siret) {
        doc.fontSize(9)
           .fillColor(grayLight)
           .text(`SIRET : ${orgInfo.siret}`, 50, 360)
      }

      if (orgInfo.tvaNumber) {
        doc.text(`TVA : ${orgInfo.tvaNumber}`, 50, 375)
      }

      doc.fontSize(9)
         .text(`Email : ${orgInfo.billingEmail}`, 50, 390)

      if (orgInfo.ownerPhone) {
        doc.text(`Tél : ${orgInfo.ownerPhone}`, 50, 405)
      }

      // ======================
      // PÉRIODE DE FACTURATION
      // ======================
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text('PÉRIODE DE FACTURATION', 350, 260)

      doc.fontSize(9)
         .fillColor(grayDark)
         .text(`Du ${data.billingPeriodStart.toLocaleDateString('fr-FR')}`, 350, 280)
         .text(`Au ${data.billingPeriodEnd.toLocaleDateString('fr-FR')}`, 350, 295)

      // ======================
      // TABLEAU DES SERVICES
      // ======================
      const tableTop = 450
      let currentY = tableTop

      // En-tête du tableau
      doc.rect(50, currentY, 495, 25)
         .fillAndStroke(primaryColor, primaryColor)

      doc.fontSize(10)
         .fillColor('white')
         .text('DÉSIGNATION', 60, currentY + 8)
         .text('QUANTITÉ', 320, currentY + 8)
         .text('PRIX UNITAIRE', 390, currentY + 8)
         .text('MONTANT HT', 480, currentY + 8)

      currentY += 25

      // Ligne : Forfait de base
      doc.fontSize(9)
         .fillColor(grayDark)

      const planNames: Record<string, string> = {
        SOLO: 'Formule Solo',
        DUO: 'Formule Duo',
        TEAM: 'Formule Team',
        PREMIUM: 'Formule Premium'
      }

      doc.text(`Abonnement LAIA Connect - ${planNames[data.plan]}`, 60, currentY + 5)
         .text('1', 320, currentY + 5)
         .text(`${data.basePlanPrice.toFixed(2)} €`, 390, currentY + 5)
         .text(`${data.basePlanPrice.toFixed(2)} €`, 480, currentY + 5)

      currentY += 25

      // Lignes : Add-ons
      if (data.addons && data.addons.length > 0) {
        data.addons.forEach(addon => {
          doc.text(`Add-on : ${addon.name}`, 60, currentY + 5)
             .text('1', 320, currentY + 5)
             .text(`${addon.price.toFixed(2)} €`, 390, currentY + 5)
             .text(`${addon.price.toFixed(2)} €`, 480, currentY + 5)

          currentY += 25
        })
      }

      // Ligne de séparation
      doc.moveTo(50, currentY)
         .lineTo(545, currentY)
         .strokeColor(grayLight)
         .stroke()

      currentY += 10

      // ======================
      // TOTAUX
      // ======================
      const totalsX = 380

      // Total HT
      doc.fontSize(10)
         .fillColor(grayDark)
         .text('Total HT :', totalsX, currentY)
         .text(`${data.totalHT.toFixed(2)} €`, 480, currentY)

      currentY += 20

      // TVA
      doc.text(`TVA (${data.vatRate}%) :`, totalsX, currentY)
         .text(`${data.totalTVA.toFixed(2)} €`, 480, currentY)

      currentY += 20

      // Total TTC
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text('TOTAL TTC :', totalsX, currentY)
         .text(`${data.totalTTC.toFixed(2)} €`, 480, currentY)

      currentY += 40

      // ======================
      // INFORMATIONS DE PAIEMENT
      // ======================
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text('MODALITÉS DE PAIEMENT', 50, currentY)

      currentY += 20

      doc.fontSize(9)
         .fillColor(grayDark)

      if (orgInfo.sepaMandateRef) {
        doc.text(`Prélèvement automatique SEPA`, 50, currentY)
        currentY += 15
        doc.fillColor(grayLight)
           .text(`Référence du mandat : ${orgInfo.sepaMandateRef}`, 50, currentY)
        currentY += 15
        if (orgInfo.sepaMandateDate) {
          doc.text(`Date de signature : ${orgInfo.sepaMandateDate.toLocaleDateString('fr-FR')}`, 50, currentY)
          currentY += 15
        }
        doc.text(`Le prélèvement sera effectué à la date d'échéance.`, 50, currentY)
      } else {
        doc.text('Paiement par carte bancaire via Stripe', 50, currentY)
      }

      currentY += 30

      // ======================
      // MENTIONS LÉGALES OBLIGATOIRES
      // ======================
      doc.fontSize(9)
         .fillColor(primaryColor)
         .text('MENTIONS LÉGALES OBLIGATOIRES', 50, currentY)

      currentY += 15

      doc.fontSize(7)
         .fillColor(grayLight)
         .text('• Abonnement mensuel renouvelable automatiquement selon l\'article L215-1 du Code de la consommation', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Résiliation possible à tout moment sans frais, avec effet au terme de la période en cours (30 jours de préavis)', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Période d\'essai de 30 jours offerte sur le premier mois (aucun prélèvement pendant cette période)', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Pénalités de retard en cas de non-paiement : 3 fois le taux d\'intérêt légal (art. L441-10 du Code de commerce)', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Indemnité forfaitaire pour frais de recouvrement : 40€ (D. 441-5 du Code de commerce)', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Facture payable à réception, date limite de paiement indiquée ci-dessus', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Aucun escompte ne sera accordé en cas de paiement anticipé', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• TVA non applicable, art. 293 B du CGI (franchise en base de TVA)', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• Conformément à la loi n°2014-344 du 17/03/2014, le client peut demander la médiation du CMAP (cmap.fr)', 50, currentY, { width: 495 })
      currentY += 15
      doc.text('• En cas de litige, compétence exclusive des tribunaux de Paris', 50, currentY, { width: 495 })

      // ======================
      // PIED DE PAGE
      // ======================
      const footerY = 750

      doc.moveTo(50, footerY)
         .lineTo(545, footerY)
         .strokeColor(grayLight)
         .stroke()

      doc.fontSize(8)
         .fillColor(grayLight)
         .text('LAIA SAS - Capital social : 10 000€ - RCS Paris B 123 456 789', 50, footerY + 10, {
           align: 'center',
           width: 495
         })

      doc.text('contact@laia-connect.fr - www.laia-connect.fr', 50, footerY + 22, {
        align: 'center',
        width: 495
      })

      // Finaliser le PDF
      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Crée une facture d'abonnement dans la base de données et génère le PDF
 */
export async function createSubscriptionInvoice(organizationId: string, isFirstInvoice: boolean = false) {
  try {
    // Récupérer les infos de l'organisation
    const orgInfo = await getOrganizationBillingInfo(organizationId)

    // Générer le numéro de facture
    const invoiceNumber = generateSubscriptionInvoiceNumber()

    // Dates
    const issueDate = new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 7) // 7 jours pour payer

    // Période de facturation
    const billingPeriodStart = new Date()
    const billingPeriodEnd = new Date(billingPeriodStart)
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1)

    // Calculer les montants
    const basePlanPrice = getBasePlanPrice(orgInfo.plan)

    // Récupérer les add-ons actifs
    const addonsData = orgInfo.addons.active || []
    const addons: Array<{ name: string; price: number }> = []

    // TODO: Mapper les add-ons avec leurs prix depuis addons-manager
    // Pour l'instant, on utilise le monthlyAmount total
    const totalHT = orgInfo.monthlyAmount || basePlanPrice
    const vatRate = 20 // TVA à 20%
    const totalTVA = totalHT * (vatRate / 100)
    const totalTTC = totalHT + totalTVA

    // Générer le PDF
    const pdfBuffer = await generateSubscriptionInvoicePDF({
      organizationId,
      invoiceNumber,
      issueDate,
      dueDate,
      billingPeriodStart,
      billingPeriodEnd,
      plan: orgInfo.plan,
      basePlanPrice,
      addons,
      totalHT,
      vatRate,
      totalTVA,
      totalTTC,
      isFirstInvoice
    })

    // Enregistrer la facture dans la base de données
    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        invoiceNumber,
        amount: totalTTC,
        plan: orgInfo.plan,
        status: 'PENDING',
        issueDate,
        dueDate,
        description: isFirstInvoice
          ? `Activation abonnement LAIA Connect - Formule ${orgInfo.plan}`
          : `Abonnement mensuel LAIA Connect - Formule ${orgInfo.plan}`,
        billingPeriodStart,
        billingPeriodEnd,
        metadata: {
          basePlanPrice,
          addons,
          totalHT,
          vatRate,
          totalTVA,
          isFirstInvoice
        } as any
      }
    })

    console.log(`✅ Facture ${invoiceNumber} générée pour ${orgInfo.legalName}`)

    return {
      invoice,
      pdfBuffer,
      invoiceNumber
    }

  } catch (error) {
    console.error('❌ Erreur génération facture:', error)
    throw error
  }
}
