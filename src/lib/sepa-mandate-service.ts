import PDFDocument from 'pdfkit'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export interface SepaMandateData {
  organizationId: string
  organizationName: string
  legalName?: string
  siret?: string
  address?: string
  accountHolder: string
  iban: string
  bic: string
  mandateRef: string
  mandateDate: Date
}

/**
 * Génère un PDF de mandat SEPA
 */
export async function generateSepaMandatePDF(data: SepaMandateData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // === HEADER ===
      doc
        .fontSize(20)
        .fillColor('#d4b5a0')
        .text('MANDAT DE PRÉLÈVEMENT SEPA', 50, 50, { align: 'center' })

      doc
        .fontSize(10)
        .fillColor('#666')
        .text('En signant ce formulaire de mandat, vous autorisez LAIA SAS', 50, 85, { align: 'center' })
        .text('à envoyer des instructions à votre banque pour débiter votre compte.', 50, 100, { align: 'center' })

      // === INFORMATIONS CRÉANCIER ===
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('CRÉANCIER', 50, 140)
        .rect(50, 155, 495, 1)
        .fillAndStroke('#d4b5a0', '#d4b5a0')

      doc
        .fontSize(10)
        .fillColor('#333')
        .text('Nom du créancier : LAIA SAS', 50, 170)
        .text('Adresse : 123 Avenue de la Beauté, 75001 Paris, France', 50, 185)
        .text('Identifiant Créancier SEPA (ICS) : FR00ZZZ123456', 50, 200)

      // === INFORMATIONS DÉBITEUR ===
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('DÉBITEUR', 50, 240)
        .rect(50, 255, 495, 1)
        .fillAndStroke('#d4b5a0', '#d4b5a0')

      doc
        .fontSize(10)
        .fillColor('#333')
        .text(`Nom du débiteur : ${data.legalName || data.organizationName}`, 50, 270)

      if (data.siret) {
        doc.text(`SIRET : ${data.siret}`, 50, 285)
      }

      if (data.address) {
        doc.text(`Adresse : ${data.address}`, 50, data.siret ? 300 : 285)
      }

      // === COORDONNÉES BANCAIRES ===
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('COORDONNÉES BANCAIRES', 50, 340)
        .rect(50, 355, 495, 1)
        .fillAndStroke('#d4b5a0', '#d4b5a0')

      // Masquer partiellement l'IBAN pour la sécurité (garder 4 premiers et 4 derniers)
      const maskedIban = data.iban.substring(0, 8) + '****' + data.iban.substring(data.iban.length - 4)

      doc
        .fontSize(10)
        .fillColor('#333')
        .text(`Titulaire du compte : ${data.accountHolder}`, 50, 370)
        .text(`IBAN : ${maskedIban}`, 50, 385)
        .text(`BIC : ${data.bic}`, 50, 400)

      // === TYPE DE PAIEMENT ===
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('TYPE DE PAIEMENT', 50, 440)
        .rect(50, 455, 495, 1)
        .fillAndStroke('#d4b5a0', '#d4b5a0')

      doc
        .fontSize(10)
        .fillColor('#333')
        .text('☑ Paiement récurrent', 50, 470)
        .text('Ce mandat autorise des prélèvements récurrents pour votre abonnement mensuel LAIA.', 50, 485)

      // === RÉFÉRENCE DU MANDAT ===
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('RÉFÉRENCE UNIQUE DU MANDAT (RUM)', 50, 525)
        .rect(50, 540, 495, 1)
        .fillAndStroke('#d4b5a0', '#d4b5a0')

      doc
        .fontSize(10)
        .fillColor('#333')
        .text(`${data.mandateRef}`, 50, 555)

      // === AUTORISATION ===
      doc
        .fontSize(11)
        .fillColor('#333')
        .text('AUTORISATION', 50, 595, { underline: true })

      doc
        .fontSize(9)
        .fillColor('#333')
        .text(
          'En signant ce formulaire de mandat, vous autorisez LAIA SAS à envoyer des instructions à votre banque ' +
          'pour débiter votre compte, et votre banque à débiter votre compte conformément aux instructions de LAIA SAS.',
          50,
          615,
          { width: 495, align: 'justify', lineGap: 3 }
        )

      doc
        .text(
          'Vous bénéficiez du droit d\'être remboursé par votre banque selon les conditions décrites dans la convention ' +
          'que vous avez passée avec elle. Une demande de remboursement doit être présentée dans les 8 semaines suivant ' +
          'la date de débit de votre compte pour un prélèvement autorisé.',
          50,
          650,
          { width: 495, align: 'justify', lineGap: 3 }
        )

      // === SIGNATURE ===
      doc
        .fontSize(10)
        .fillColor('#333')
        .text(`Date de signature : ${data.mandateDate.toLocaleDateString('fr-FR')}`, 50, 710)
        .text('Signature :', 50, 730)

      // Ligne pour la signature
      doc
        .moveTo(130, 745)
        .lineTo(300, 745)
        .stroke('#999')

      // === PIED DE PAGE ===
      doc
        .fontSize(7)
        .fillColor('#999')
        .text(
          'LAIA SAS - Capital social: 10 000€ - RCS Paris 123 456 789 - SIRET: 123 456 789 00012',
          50,
          770,
          { align: 'center', width: 495 }
        )
        .text(
          'TVA intracommunautaire: FR12345678900 - contact@laiaskininstitut.fr',
          50,
          780,
          { align: 'center', width: 495 }
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Sauvegarde un mandat SEPA PDF
 */
export async function saveSepaMandatePDF(
  mandateRef: string,
  pdfBuffer: Buffer
): Promise<string> {
  const mandatesDir = path.join(process.cwd(), 'public', 'mandates')

  if (!fs.existsSync(mandatesDir)) {
    fs.mkdirSync(mandatesDir, { recursive: true })
  }

  const filename = `${mandateRef}.pdf`
  const filepath = path.join(mandatesDir, filename)

  fs.writeFileSync(filepath, pdfBuffer)

  return `/mandates/${filename}`
}

/**
 * Génère et sauvegarde un mandat SEPA complet
 */
export async function generateAndSaveSepaMandatePDF(
  organizationId: string
): Promise<{ mandateRef: string; pdfPath: string; pdfUrl: string; pdfBuffer: Buffer } | null> {
  try {
    // Récupérer les infos de l'organisation avec SEPA
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        config: true,
      },
    })

    if (!org) {
      throw new Error('Organisation introuvable')
    }

    // Vérifier que les infos SEPA sont présentes
    if (!org.sepaIban || !org.sepaBic || !org.sepaMandateRef || !org.sepaAccountHolder) {
      console.warn('Informations SEPA manquantes pour l\'organisation', organizationId)
      return null
    }

    // Déchiffrer l'IBAN et BIC
    const { decrypt } = await import('@/lib/encryption-service')
    const iban = decrypt(org.sepaIban)
    const bic = decrypt(org.sepaBic)

    const mandateData: SepaMandateData = {
      organizationId,
      organizationName: org.name,
      legalName: org.legalName || org.name,
      siret: org.config?.siret || undefined,
      address: org.billingAddress || undefined,
      accountHolder: org.sepaAccountHolder,
      iban,
      bic,
      mandateRef: org.sepaMandateRef,
      mandateDate: org.sepaMandateDate || new Date(),
    }

    // Générer le PDF
    const pdfBuffer = await generateSepaMandatePDF(mandateData)

    // Sauvegarder le PDF
    const pdfPath = await saveSepaMandatePDF(org.sepaMandateRef, pdfBuffer)

    // URL publique
    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}${pdfPath}`

    return {
      mandateRef: org.sepaMandateRef,
      pdfPath,
      pdfUrl,
      pdfBuffer,
    }
  } catch (error) {
    console.error('Erreur génération mandat SEPA:', error)
    return null
  }
}
