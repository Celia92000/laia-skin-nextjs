import PDFDocument from 'pdfkit'
import { prisma } from './prisma'
import { join } from 'path'
import { existsSync } from 'fs'

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
  migrationFee?: number // Frais de migration de données (300€ HT)
}

/**
 * Récupère ou crée les paramètres de facturation
 */
export async function getInvoiceSettings() {
  let settings = await prisma.invoiceSettings.findFirst()

  if (!settings) {
    // Créer les settings par défaut si ils n'existent pas
    settings = await prisma.invoiceSettings.create({
      data: {
        isCompany: false,
        legalStatus: 'Auto-Entrepreneur',
        companyName: 'LAIA Connect',
        address: '[Votre adresse]',
        postalCode: '[Code postal]',
        city: '[Ville]',
        country: 'France',
        siret: '[Votre SIRET]',
        tvaNumber: '',
        capitalSocial: '',
        rcs: '',
        apeCode: '6201Z',
        email: '[Votre email]',
        phone: '[Votre téléphone]',
        website: 'https://www.laia-connect.fr',
        invoicePrefix: 'LAIA',
        tvaRate: 0.0,
        paymentTerms: 'Prélèvement SEPA automatique',
        latePenalty: 'En cas de retard de paiement, indemnité forfaitaire de 40€',
        footerText: 'Dispensé d\'immatriculation au RCS et au RM',
        // Nouvelles mentions légales configurables
        legalDiscountPolicy: 'Aucun escompte accordé pour paiement anticipé (art. L441-9 du Code de commerce)',
        legalLatePaymentPenalty: 'Taux de pénalités de retard : 3 fois le taux d\'intérêt légal en vigueur (art. L441-10 du Code de commerce).\nLe taux d\'intérêt légal est consultable sur www.banque-france.fr',
        legalRecoveryFee: 'Indemnité forfaitaire pour frais de recouvrement due au créancier : 40,00 € (décret n°2012-1115 du 2 octobre 2012).\nCette indemnité est due de plein droit en cas de retard de paiement.',
        legalCancellationPolicy: 'Résiliation possible à tout moment sans frais, avec effet au terme de la période en cours.\nPréavis de résiliation : 30 jours avant la date anniversaire.',
        legalDataOwnership: 'Vos données restent votre propriété exclusive.\nExport de vos données possible à tout moment au format CSV/Excel.\nHébergement sécurisé en France (RGPD).',
        legalMediation: 'Médiation de la consommation (loi n°2014-344 du 17/03/2014) : CMAP (www.cmap.fr)',
        legalJurisdiction: 'Défaut de paiement : compétence exclusive des tribunaux de Paris'
      }
    })
  }

  return settings
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
export async function generateSubscriptionInvoiceNumber(date: Date = new Date()): Promise<string> {
  const settings = await getInvoiceSettings()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const timestamp = date.getTime().toString().slice(-6)

  return `${settings.invoicePrefix}-${year}${month}-${timestamp}`
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
      // Récupérer les infos de l'organisation et les settings
      const orgInfo = await getOrganizationBillingInfo(data.organizationId)
      const settings = await getInvoiceSettings()

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

      // Logo LAIA Connect
      const logoPath = join(process.cwd(), 'public', 'logo-laia-connect.png')
      let startY = 50
      if (existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 })
        startY = 115
      }

      // ======================
      // EN-TÊTE
      // ======================
      doc.fontSize(24)
         .fillColor(primaryColor)
         .text(settings.companyName, 50, startY)

      doc.fontSize(10)
         .fillColor(grayLight)
         .text('Plateforme SaaS pour Instituts de Beauté', 50, startY + 30)

      // Informations LAIA (émetteur)
      doc.fontSize(9)
         .fillColor(grayDark)
         .text(settings.companyName, 50, startY + 60)
         .text(settings.legalStatus, 50, startY + 75)
         .text(settings.address, 50, startY + 90)
         .text(`${settings.postalCode} ${settings.city}, ${settings.country}`, 50, startY + 105)
         .text('', 50, startY + 120)

      doc.fontSize(8)
         .fillColor(grayLight)
         .text(`SIRET : ${settings.siret}`, 50, startY + 135)
         .text(`Code APE : ${settings.apeCode} (Programmation informatique)`, 50, startY + 147)

      let currentInfoY = startY + 159
      if (settings.isCompany && settings.tvaNumber) {
        doc.text(`TVA : ${settings.tvaNumber}`, 50, currentInfoY)
        currentInfoY += 12
      }
      if (settings.isCompany && settings.rcs) {
        doc.text(`RCS : ${settings.rcs}`, 50, currentInfoY)
        currentInfoY += 12
      }
      if (settings.isCompany && settings.capitalSocial) {
        doc.text(`Capital social : ${settings.capitalSocial}`, 50, currentInfoY)
        currentInfoY += 12
      }
      if (!settings.isCompany && settings.footerText) {
        doc.text(settings.footerText, 50, currentInfoY)
        currentInfoY += 12
      }

      doc.fontSize(9)
         .fillColor(grayDark)
         .text(`Tél : ${settings.phone || ''}`, 50, currentInfoY + 12)
         .text(`Email : ${settings.email || ''}`, 50, currentInfoY + 27)
         .text(`Web : ${settings.website || ''}`, 50, currentInfoY + 42)

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
      doc.moveTo(50, 300)
         .lineTo(545, 300)
         .strokeColor(grayLight)
         .stroke()

      doc.fontSize(11)
         .fillColor(primaryColor)
         .text('FACTURÉ À', 50, 320)

      doc.fontSize(10)
         .fillColor(grayDark)
         .text(orgInfo.legalName, 50, 345)

      if (orgInfo.ownerFirstName && orgInfo.ownerLastName) {
        doc.text(`${orgInfo.ownerFirstName} ${orgInfo.ownerLastName}`, 50, 360)
      }

      if (orgInfo.billingAddress) {
        doc.text(orgInfo.billingAddress, 50, 375)
        doc.text(`${orgInfo.billingPostalCode} ${orgInfo.billingCity}`, 50, 390)
        doc.text(orgInfo.billingCountry, 50, 405)
      }

      if (orgInfo.siret) {
        doc.fontSize(9)
           .fillColor(grayLight)
           .text(`SIRET : ${orgInfo.siret}`, 50, 425)
      }

      if (orgInfo.tvaNumber) {
        doc.text(`TVA : ${orgInfo.tvaNumber}`, 50, 440)
      }

      doc.fontSize(9)
         .text(`Email : ${orgInfo.billingEmail}`, 50, 455)

      if (orgInfo.ownerPhone) {
        doc.text(`Tél : ${orgInfo.ownerPhone}`, 50, 470)
      }

      // ======================
      // PÉRIODE DE FACTURATION
      // ======================
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text('PÉRIODE DE FACTURATION', 350, 320)

      doc.fontSize(9)
         .fillColor(grayDark)
         .text(`Du ${data.billingPeriodStart.toLocaleDateString('fr-FR')}`, 350, 345)
         .text(`Au ${data.billingPeriodEnd.toLocaleDateString('fr-FR')}`, 350, 360)

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

      // Ligne : Migration de données (si applicable)
      if (data.migrationFee && data.migrationFee > 0) {
        doc.text('Migration de vos données existantes', 60, currentY + 5)
           .text('1', 320, currentY + 5)
           .text(`${data.migrationFee.toFixed(2)} €`, 390, currentY + 5)
           .text(`${data.migrationFee.toFixed(2)} €`, 480, currentY + 5)

        currentY += 25
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
      if (settings.tvaRate === 0) {
        // Pas de TVA pour auto-entrepreneur
        doc.fontSize(9)
           .fillColor(grayLight)
           .text('TVA non applicable (art. 293 B du CGI)', totalsX, currentY)
        currentY += 20

        // Total TTC = Total HT
        doc.fontSize(12)
           .fillColor(primaryColor)
           .text('MONTANT TOTAL :', totalsX, currentY)
           .text(`${data.totalHT.toFixed(2)} €`, 480, currentY)
      } else {
        // TVA applicable pour société
        const tvaAmount = data.totalHT * (settings.tvaRate / 100)
        const totalTTC = data.totalHT + tvaAmount

        doc.fontSize(10)
           .fillColor(grayDark)
           .text(`TVA (${settings.tvaRate}%) :`, totalsX, currentY)
           .text(`${tvaAmount.toFixed(2)} €`, 480, currentY)

        currentY += 20

        // Total TTC
        doc.fontSize(12)
           .fillColor(primaryColor)
           .text('MONTANT TOTAL TTC :', totalsX, currentY)
           .text(`${totalTTC.toFixed(2)} €`, 480, currentY)
      }

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
      // MENTIONS LÉGALES OBLIGATOIRES (Art. L441-9 du Code de commerce)
      // ======================
      doc.fontSize(9)
         .fillColor(primaryColor)
         .text('CONDITIONS GÉNÉRALES DE VENTE ET MENTIONS LÉGALES OBLIGATOIRES', 50, currentY)

      currentY += 15

      doc.fontSize(7)
         .fillColor(grayDark)

      // 1. Conditions de paiement (OBLIGATOIRE art. L441-9)
      doc.text('1. CONDITIONS DE PAIEMENT', 50, currentY, { width: 495 })
      currentY += 12
      doc.fillColor(grayLight)
         .text('• Date limite de paiement : indiquée ci-dessus (date d\'échéance)', 50, currentY, { width: 495 })
      currentY += 10

      // Escompte (configurable)
      const discountLines = settings.legalDiscountPolicy.split('\n')
      discountLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

      // Pénalités de retard (configurable)
      const penaltyLines = settings.legalLatePaymentPenalty.split('\n')
      penaltyLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

      // Indemnité de recouvrement (configurable)
      const recoveryLines = settings.legalRecoveryFee.split('\n')
      recoveryLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

      currentY += 5

      // 2. Abonnement et résiliation (configurable)
      doc.fillColor(grayDark)
         .text('2. ABONNEMENT ET RÉSILIATION', 50, currentY, { width: 495 })
      currentY += 12
      doc.fillColor(grayLight)
         .text('• Abonnement mensuel renouvelable automatiquement (art. L215-1 du Code de la consommation)', 50, currentY, { width: 495 })
      currentY += 10

      const cancellationLines = settings.legalCancellationPolicy.split('\n')
      cancellationLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

      doc.text('• Période d\'essai gratuite de 30 jours offerte sur le premier mois (si applicable)', 50, currentY, { width: 495 })
      currentY += 15

      // 3. Données et propriété (configurable)
      doc.fillColor(grayDark)
         .text('3. DONNÉES ET PROPRIÉTÉ INTELLECTUELLE', 50, currentY, { width: 495 })
      currentY += 12
      doc.fillColor(grayLight)

      const dataOwnershipLines = settings.legalDataOwnership.split('\n')
      dataOwnershipLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

      currentY += 5

      // 4. Médiation et litiges (configurable)
      doc.fillColor(grayDark)
         .text('4. MÉDIATION ET LITIGES', 50, currentY, { width: 495 })
      currentY += 12
      doc.fillColor(grayLight)

      const mediationLines = settings.legalMediation.split('\n')
      mediationLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

      const jurisdictionLines = settings.legalJurisdiction.split('\n')
      jurisdictionLines.forEach(line => {
        doc.text(`• ${line}`, 50, currentY, { width: 495 })
        currentY += 10
      })

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
         .text(`${settings.companyName} - ${settings.legalStatus}${settings.footerText ? ' - ' + settings.footerText : ''}`, 50, footerY + 10, {
           align: 'center',
           width: 495
         })

      doc.text(`${settings.email} - ${settings.website}`, 50, footerY + 22, {
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
export async function createSubscriptionInvoice(organizationId: string, isFirstInvoice: boolean = false, includeMigrationFee: boolean = false, isPaid: boolean = false) {
  try {
    // Récupérer les infos de l'organisation et les settings
    const orgInfo = await getOrganizationBillingInfo(organizationId)
    const settings = await getInvoiceSettings()

    // Générer le numéro de facture
    const invoiceNumber = await generateSubscriptionInvoiceNumber()

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
    let totalHT = orgInfo.monthlyAmount || basePlanPrice

    // Ajouter les frais de migration si nécessaire (300€ HT)
    const migrationFee = includeMigrationFee ? 300 : 0
    totalHT += migrationFee

    const vatRate = settings.tvaRate
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
      isFirstInvoice,
      migrationFee
    })

    // Enregistrer la facture dans la base de données
    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        invoiceNumber,
        amount: totalTTC,
        plan: orgInfo.plan,
        status: isPaid ? 'PAID' : 'PENDING',
        issueDate,
        dueDate,
        paidAt: isPaid ? new Date() : null,
        description: isFirstInvoice
          ? `Activation abonnement LAIA Connect - Formule ${orgInfo.plan}`
          : `Abonnement mensuel LAIA Connect - Formule ${orgInfo.plan}`,
        metadata: {
          basePlanPrice,
          addons,
          totalHT,
          vatRate,
          totalTVA,
          isFirstInvoice,
          billingPeriodStart: billingPeriodStart.toISOString(),
          billingPeriodEnd: billingPeriodEnd.toISOString()
        } as any
      }
    })

    console.log(`✅ Facture ${invoiceNumber} générée pour ${orgInfo.legalName} - Statut: ${isPaid ? 'PAYÉE' : 'EN ATTENTE'}`)

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
