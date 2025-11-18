import PDFDocument from 'pdfkit'
import { getInvoiceSettings } from './subscription-invoice-generator'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

interface ContractData {
  // Organisation
  organizationName: string
  legalName?: string
  siret?: string
  tvaNumber?: string
  billingAddress?: string
  billingPostalCode?: string
  billingCity?: string
  billingCountry?: string

  // Propriétaire
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  ownerPhone?: string

  // Abonnement
  plan: string
  monthlyAmount: number
  trialEndsAt: Date
  subscriptionStartDate: Date

  // SEPA
  sepaIban?: string
  sepaBic?: string
  sepaAccountHolder?: string
  sepaMandateRef?: string
  sepaMandateDate?: Date

  // Identifiant contrat
  contractNumber: string
}

/**
 * Génère un numéro de contrat unique
 */
export function generateContractNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const timestamp = date.getTime().toString().slice(-6)

  return `CONTRAT-LAIA-${year}${month}${day}-${timestamp}`
}

/**
 * Récupère les clauses actives du contrat depuis la DB
 */
async function getActiveContractClauses() {
  try {
    const clauses = await prisma.contractClause.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return clauses
  } catch (error) {
    console.error('Erreur récupération clauses:', error)
    return []
  }
}

/**
 * Remplace les variables dans le contenu d'une clause
 */
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

/**
 * Sauvegarde un contrat PDF sur disque
 */
export async function saveContractPDF(
  pdfBuffer: Buffer,
  contractNumber: string
): Promise<string> {
  try {
    // Créer le dossier uploads/documents/contracts s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'uploads', 'documents', 'contracts')
    await mkdir(uploadsDir, { recursive: true })

    // Nettoyer le nom de fichier
    const sanitizedContractNumber = contractNumber.replace(/[^a-zA-Z0-9-]/g, '_')
    const fileName = `${sanitizedContractNumber}.pdf`
    const filePath = join(uploadsDir, fileName)

    // Écrire le fichier
    await writeFile(filePath, pdfBuffer)

    // Retourner le chemin relatif
    return `uploads/documents/contracts/${fileName}`
  } catch (error) {
    console.error('Erreur sauvegarde PDF contrat:', error)
    throw error
  }
}

/**
 * Génère un PDF du contrat d'abonnement LAIA Connect
 */
export async function generateSubscriptionContract(
  data: ContractData
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Récupérer les settings et les clauses
      const settings = await getInvoiceSettings()
      const clauses = await getActiveContractClauses()

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      const planNames: Record<string, string> = {
        SOLO: 'Solo',
        DUO: 'Duo',
        TEAM: 'Team',
        PREMIUM: 'Premium'
      }

      // Préparer les variables pour remplacement
      const variables: Record<string, string> = {
        plan: planNames[data.plan] || data.plan,
        monthlyAmount: data.monthlyAmount.toString(),
        monthlyAmountTTC: (data.monthlyAmount * 1.2).toFixed(2),
        trialEndsAt: data.trialEndsAt.toLocaleDateString('fr-FR'),
        sepaMandateRef: data.sepaMandateRef || 'Non fourni',
        organizationName: data.organizationName,
        ownerName: `${data.ownerFirstName} ${data.ownerLastName}`,
        contractNumber: data.contractNumber
      }

      // Logo LAIA Connect
      const logoPath = join(process.cwd(), 'public', 'logo-laia-connect.png')
      if (existsSync(logoPath)) {
        const pageWidth = doc.page.width
        const logoWidth = 80
        const logoX = (pageWidth - logoWidth) / 2
        doc.image(logoPath, logoX, 40, { width: logoWidth })
        doc.moveDown(4)
      }

      // En-tête
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#7c3aed')
        .text('CONTRAT D\'ABONNEMENT', { align: 'center' })
        .moveDown(0.5)

      doc
        .fontSize(16)
        .fillColor('#6b7280')
        .text('LAIA Connect - Plateforme SaaS', { align: 'center' })
        .moveDown(2)

      // Informations du contrat
      doc
        .fontSize(10)
        .fillColor('#000')
        .text(`N° de contrat : ${data.contractNumber}`, { align: 'right' })
        .text(`Date : ${data.subscriptionStartDate.toLocaleDateString('fr-FR')}`, { align: 'right' })
        .moveDown(2)

      // Parties au contrat
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('ENTRE LES SOUSSIGNÉS :')
        .moveDown()

      // Prestataire
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('LE PRESTATAIRE :')
        .font('Helvetica')
        .moveDown(0.5)
        .text(settings.companyName)
        .text(`${settings.address}`)
        .text(`${settings.postalCode} ${settings.city}, ${settings.country}`)
        .text(`SIRET : ${settings.siret}`)

      if (settings.isCompany && settings.tvaNumber) {
        doc.text(`N° TVA : ${settings.tvaNumber}`)
      }
      if (settings.isCompany && settings.rcs) {
        doc.text(`RCS : ${settings.rcs}`)
      }
      if (!settings.isCompany && settings.footerText) {
        doc.text(settings.footerText)
      }

      doc
        .text(`Email : ${settings.email}`)
        .text(`Tél : ${settings.phone}`)
        .moveDown()

      doc
        .fontSize(11)
        .text('Ci-après dénommé "le Prestataire"')
        .moveDown(2)

      // Client
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('LE CLIENT :')
        .font('Helvetica')
        .moveDown(0.5)

      if (data.legalName) {
        doc.text(`Raison sociale : ${data.legalName}`)
      }
      doc.text(`Institut : ${data.organizationName}`)

      if (data.siret) {
        doc.text(`SIRET : ${data.siret}`)
      }
      if (data.tvaNumber) {
        doc.text(`N° TVA : ${data.tvaNumber}`)
      }

      if (data.billingAddress) {
        doc.text(`Adresse : ${data.billingAddress}`)
        if (data.billingPostalCode && data.billingCity) {
          doc.text(`${data.billingPostalCode} ${data.billingCity}`)
        }
      }

      doc.text(`Représenté par : ${data.ownerFirstName} ${data.ownerLastName}`)
      doc.text(`Email : ${data.ownerEmail}`)
      if (data.ownerPhone) {
        doc.text(`Téléphone : ${data.ownerPhone}`)
      }

      doc
        .moveDown()
        .fontSize(11)
        .text('Ci-après dénommé "le Client"')
        .moveDown(2)

      // Nouvelle page pour les articles
      doc.addPage()

      // Générer les articles dynamiquement depuis les clauses
      for (let i = 0; i < clauses.length; i++) {
        const clause = clauses[i]
        const processedContent = replaceVariables(clause.content, variables)

        // Titre de l'article
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text(clause.title)
          .moveDown(0.5)

        // Contenu de l'article
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(processedContent, { align: 'justify' })
          .moveDown(1.5)

        // Vérifier s'il reste assez de place sur la page
        // Si on est proche du bas (y > 700), ajouter une nouvelle page
        if (doc.y > 700 && i < clauses.length - 1) {
          doc.addPage()
        }
      }

      // Signatures
      doc.addPage()

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SIGNATURES', { align: 'center' })
        .moveDown(2)

      // Signature électronique
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          'Le présent contrat a été conclu et accepté électroniquement par le Client lors de sa souscription en ligne le ' +
            data.subscriptionStartDate.toLocaleDateString('fr-FR') +
            ' à ' +
            data.subscriptionStartDate.toLocaleTimeString('fr-FR') +
            '.',
          { align: 'justify' }
        )
        .moveDown(2)

      // Tableau des signatures
      const signY = doc.y
      const leftX = 50
      const rightX = 320

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Pour le Prestataire', leftX, signY)
        .text('Pour le Client', rightX, signY)

      doc
        .fontSize(9)
        .font('Helvetica')
        .text('LAIA Connect', leftX, signY + 20)
        .text(`${data.ownerFirstName} ${data.ownerLastName}`, rightX, signY + 20)

      doc
        .fontSize(8)
        .fillColor('#6b7280')
        .text('Date : ' + data.subscriptionStartDate.toLocaleDateString('fr-FR'), leftX, signY + 35)
        .text(
          'Signature électronique\n' + data.subscriptionStartDate.toLocaleDateString('fr-FR'),
          rightX,
          signY + 35
        )

      // Pied de page avec numéro de contrat
      doc
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          `Contrat ${data.contractNumber} - LAIA Connect © ${new Date().getFullYear()}`,
          50,
          750,
          { align: 'center', width: 495 }
        )

      doc.end()
    } catch (error) {
      console.error('Erreur génération contrat PDF:', error)
      reject(error)
    }
  })
}

/**
 * Fonction helper pour créer un contrat lors de l'onboarding
 */
export async function createOnboardingContract(data: {
  organizationName: string
  legalName?: string
  siret?: string
  tvaNumber?: string
  billingAddress?: string
  billingPostalCode?: string
  billingCity?: string
  billingCountry?: string
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  ownerPhone?: string
  plan: string
  monthlyAmount: number
  trialEndsAt: Date
  subscriptionStartDate: Date
  sepaIban?: string
  sepaBic?: string
  sepaAccountHolder?: string
  sepaMandateRef?: string
  sepaMandateDate?: Date
}) {
  const contractNumber = generateContractNumber(data.subscriptionStartDate)

  const contractBuffer = await generateSubscriptionContract({
    ...data,
    contractNumber
  })

  // Sauvegarder le PDF sur disque
  const pdfPath = await saveContractPDF(contractBuffer, contractNumber)

  return {
    contractNumber,
    pdfBuffer: contractBuffer,
    pdfPath
  }
}
