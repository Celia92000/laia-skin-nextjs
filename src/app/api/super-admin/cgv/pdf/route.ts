import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PDFDocument from 'pdfkit'

export const dynamic = 'force-dynamic'

interface CGVData {
  version: string
  lastUpdated: string
  companyName: string
  companyAddress: string
  companyPostalCode: string
  companyCity: string
  companySiret: string
  companyEmail: string
  companyPhone: string
  companyWebsite: string
  priceSolo: number
  priceDuo: number
  priceTeam: number
  pricePremium: number
  tvaRate: number
  trialDays: number
  supportResponseTime: string
  dataRetentionDays: number
  liabilityCapMonths: number
  modificationNoticeDays: number
  priceChangeNoticeDays: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data: CGVData = await request.json()

    // Créer le PDF
    const pdfBuffer = await generateCGVPDF(data)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CGV_LAIA_Connect_v${data.version}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erreur génération PDF CGV:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function generateCGVPDF(data: CGVData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `CGV ${data.companyName} - Version ${data.version}`,
        Author: data.companyName,
        Subject: 'Conditions Générales de Vente',
        CreationDate: new Date(),
      },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const purple = '#7c3aed'
    const gray = '#374151'
    const lightGray = '#6b7280'

    // En-tête
    doc.fontSize(24).fillColor(purple).text('CONDITIONS GÉNÉRALES DE VENTE', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(16).fillColor(purple).text(data.companyName, { align: 'center' })
    doc.fontSize(10).fillColor(lightGray).text('Plateforme SaaS de gestion pour instituts de beauté', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(9).fillColor(lightGray).text(`Version ${data.version} - Mise à jour le ${new Date(data.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' })
    doc.moveDown(1)

    // Bandeau SANS ENGAGEMENT
    doc.rect(50, doc.y, 495, 50).fill('#dcfce7')
    doc.fontSize(12).fillColor('#166534').text('SANS ENGAGEMENT • SANS PRÉAVIS', 60, doc.y - 40, { width: 475, align: 'center' })
    doc.fontSize(9).fillColor('#166534').text('Résiliez quand vous voulez, sans frais, sans préavis.', 60, doc.y + 5, { width: 475, align: 'center' })
    doc.y += 30

    doc.moveDown(1.5)

    // Fonction pour ajouter un article
    const addArticle = (title: string, content: string) => {
      if (doc.y > 700) {
        doc.addPage()
      }
      doc.fontSize(11).fillColor(gray).font('Helvetica-Bold').text(title)
      doc.moveDown(0.3)
      doc.fontSize(9).fillColor(gray).font('Helvetica').text(content, { align: 'justify' })
      doc.moveDown(0.8)
    }

    // Article 1 - Définitions
    addArticle('Article 1 - Définitions',
      `« ${data.companyName} » : Société éditrice et exploitante de la plateforme SaaS de gestion pour instituts de beauté.\n` +
      `« Client » ou « Abonné » : Toute personne physique ou morale ayant souscrit un abonnement à ${data.companyName}.\n` +
      `« Plateforme » ou « Service » : Ensemble des fonctionnalités et services accessibles via ${data.companyName} en mode SaaS.\n` +
      `« Abonnement » : Formule tarifaire mensuelle choisie par le Client (SOLO, DUO, TEAM ou PREMIUM).`
    )

    // Article 2 - Objet et Acceptation
    addArticle('Article 2 - Objet et Acceptation',
      `Les présentes Conditions Générales de Vente (CGV) régissent l'accès et l'utilisation de la plateforme ${data.companyName}, solution SaaS destinée à la gestion complète d'instituts de beauté.\n\n` +
      `L'acceptation des CGV est obligatoire pour souscrire un abonnement. ${data.companyName} se réserve le droit de modifier les présentes CGV à tout moment avec un préavis de ${data.modificationNoticeDays} jours calendaires.`
    )

    // Article 4 - Tarification
    addArticle('Article 4 - Formules et Tarification',
      `SOLO - ${data.priceSolo}€ HT/mois : 1 utilisateur, fonctionnalités essentielles\n` +
      `DUO - ${data.priceDuo}€ HT/mois : 3 utilisateurs, Blog + CRM + Email Marketing\n` +
      `TEAM - ${data.priceTeam}€ HT/mois : 10 utilisateurs, 3 emplacements, Boutique + WhatsApp\n` +
      `PREMIUM - ${data.pricePremium}€ HT/mois : Illimité, toutes fonctionnalités avancées\n\n` +
      `Période d'essai gratuite : ${data.trialDays} jours offerts. Aucun prélèvement durant cette période.\n` +
      `TVA au taux en vigueur (${data.tvaRate}%) sera ajoutée. Les tarifs sont révisables avec un préavis de ${data.priceChangeNoticeDays} jours.`
    )

    // Article 7 - Résiliation
    addArticle('Article 7 - Durée et Résiliation',
      `L'abonnement est souscrit pour une durée indéterminée avec reconduction tacite mensuelle. Il n'y a aucun engagement de durée minimum.\n\n` +
      `Le Client peut résilier son abonnement à tout moment, sans préavis et sans frais, depuis son Espace Client ou par email à ${data.companyEmail}.\n` +
      `À la date effective de résiliation, les données sont conservées ${data.dataRetentionDays} jours puis supprimées définitivement.`
    )

    // Article 8 - Obligations
    addArticle('Article 8 - Obligations de ' + data.companyName,
      `${data.companyName} s'engage à maintenir le Service accessible 24h/24 et 7j/7, hors opérations de maintenance.\n\n` +
      `Support Technique : Support par email avec réponse sous ${data.supportResponseTime} maximum. Tous les clients bénéficient du même niveau de support.`
    )

    // Article 11 - Limitation de responsabilité
    addArticle('Article 11 - Limitation de Responsabilité',
      `${data.companyName} est tenu à une obligation de moyens et non de résultat.\n\n` +
      `En toute hypothèse, la responsabilité totale et cumulée de ${data.companyName} est strictement plafonnée au montant des sommes effectivement payées par le Client au cours des ${data.liabilityCapMonths} derniers mois précédant le fait générateur du dommage.`
    )

    // Article 12 bis - Non-Garantie de Résultats
    addArticle('Article 12 bis - Non-Garantie de Résultats',
      `Le Client reconnaît expressément que ${data.companyName} ne garantit aucun résultat commercial (augmentation du chiffre d'affaires, du nombre de clients, de la rentabilité).\n` +
      `Le Service est fourni « en l'état » (« as is »). Le Client est seul responsable de l'utilisation qu'il fait du Service.`
    )

    // Article 18 - Contact
    doc.addPage()
    addArticle('Article 18 - Contact et Service Client',
      `${data.companyName}\n` +
      `Adresse : ${data.companyAddress}, ${data.companyPostalCode} ${data.companyCity}, France\n` +
      `SIRET : ${data.companySiret}\n` +
      `Email : ${data.companyEmail}\n` +
      (data.companyPhone ? `Téléphone : ${data.companyPhone}\n` : '') +
      (data.companyWebsite ? `Site web : ${data.companyWebsite}` : '')
    )

    // Pied de page
    doc.moveDown(2)
    doc.fontSize(8).fillColor(lightGray).text('Document généré automatiquement. Pour la version complète et à jour des CGV, consultez ' + data.companyWebsite + '/cgv-laia-connect', { align: 'center' })
    doc.moveDown(0.5)
    doc.text(`© ${new Date().getFullYear()} ${data.companyName} - Tous droits réservés`, { align: 'center' })

    doc.end()
  })
}
