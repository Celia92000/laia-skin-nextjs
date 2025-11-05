import PDFDocument from 'pdfkit'

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
 * Génère un PDF du contrat d'abonnement LAIA Connect
 */
export async function generateSubscriptionContract(
  data: ContractData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
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
        .text('LAIA Connect')
        .text('[Adresse complète à renseigner]')
        .text('[SIRET à renseigner]')
        .text('Email : contact@laiaconnect.fr')
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

      // Article 1 - Objet
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('ARTICLE 1 - OBJET DU CONTRAT')
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica')
        .text(
          'Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire met à disposition du Client sa solution SaaS LAIA Connect, comprenant un site web personnalisable, un système de réservation en ligne, et diverses fonctionnalités de gestion pour instituts de beauté.',
          { align: 'justify' }
        )
        .moveDown()

      // Article 2 - Formule souscrite
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('ARTICLE 2 - FORMULE SOUSCRITE')
        .moveDown(0.5)

      // Encadré de la formule
      const boxY = doc.y
      doc
        .rect(50, boxY, 495, 100)
        .fillAndStroke('#f3f4f6', '#d1d5db')

      doc
        .fillColor('#000')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Formule ${planNames[data.plan]}`, 60, boxY + 15)
        .fontSize(11)
        .font('Helvetica')
        .text(`Prix : ${data.monthlyAmount}€ HT par mois`, 60, boxY + 40)
        .text(`Soit ${(data.monthlyAmount * 1.2).toFixed(2)}€ TTC par mois (TVA 20%)`, 60, boxY + 60)
        .text(`Mode de paiement : Prélèvement SEPA automatique`, 60, boxY + 80)

      doc.y = boxY + 110
      doc.moveDown()

      // Article 3 - Période d'essai
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('ARTICLE 3 - PÉRIODE D\'ESSAI GRATUITE')
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Le Client bénéficie d'une période d'essai gratuite de 30 jours à compter de la date de souscription. Le premier prélèvement interviendra le ${data.trialEndsAt.toLocaleDateString('fr-FR')}.`,
          { align: 'justify' }
        )
        .moveDown()

      // Article 4 - Durée
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('ARTICLE 4 - DURÉE ET RÉSILIATION')
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica')
        .text(
          'Le contrat est conclu pour une durée indéterminée. Il se renouvelle automatiquement chaque mois par tacite reconduction. Le Client peut résilier à tout moment avec un préavis de 30 jours.',
          { align: 'justify' }
        )
        .moveDown()

      // Article 5 - Mandat SEPA
      if (data.sepaMandateRef) {
        doc.addPage()

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('ARTICLE 5 - MANDAT DE PRÉLÈVEMENT SEPA')
          .moveDown(0.5)

        // Encadré SEPA
        const sepaBoxY = doc.y
        doc
          .rect(50, sepaBoxY, 495, 150)
          .fillAndStroke('#fef3c7', '#fbbf24')

        doc
          .fillColor('#000')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('MANDAT DE PRÉLÈVEMENT SEPA', 60, sepaBoxY + 15)
          .font('Helvetica')
          .moveDown(0.5)

        doc.text(`Référence Unique de Mandat (RUM) : ${data.sepaMandateRef}`, 60)

        if (data.sepaMandateDate) {
          doc.text(`Date de signature : ${data.sepaMandateDate.toLocaleDateString('fr-FR')}`, 60)
        }

        if (data.sepaAccountHolder) {
          doc.text(`Titulaire du compte : ${data.sepaAccountHolder}`, 60)
        }

        if (data.sepaIban) {
          // Masquer partiellement l'IBAN pour sécurité
          const maskedIban = data.sepaIban.slice(0, 8) + '****' + data.sepaIban.slice(-4)
          doc.text(`IBAN : ${maskedIban}`, 60)
        }

        if (data.sepaBic) {
          doc.text(`BIC : ${data.sepaBic}`, 60)
        }

        doc
          .moveDown(0.5)
          .fontSize(9)
          .fillColor('#92400e')
          .text(
            'En signant ce mandat, le Client autorise LAIA Connect à envoyer des instructions à sa banque pour débiter son compte, et sa banque à débiter son compte conformément aux instructions de LAIA Connect.',
            60,
            sepaBoxY + 110,
            { width: 475, align: 'justify' }
          )

        doc.y = sepaBoxY + 160
        doc.fillColor('#000').moveDown()
      }

      // Article 6 - CGV
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('ARTICLE 6 - CONDITIONS GÉNÉRALES DE VENTE')
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica')
        .text(
          'Le présent contrat est régi par les Conditions Générales de Vente (CGV) de LAIA Connect, accessibles en ligne à l\'adresse : https://www.laiaconnect.fr/cgv',
          { align: 'justify' }
        )
        .moveDown()
        .text(
          'Le Client déclare avoir pris connaissance des CGV et les accepter sans réserve.',
          { align: 'justify' }
        )
        .moveDown(2)

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

  return {
    contractNumber,
    pdfBuffer: contractBuffer
  }
}
