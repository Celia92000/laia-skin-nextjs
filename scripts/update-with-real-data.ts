import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateWithRealData() {
  try {
    console.log('🔄 Mise à jour avec les vraies données...\n')

    // 1. Mettre à jour LAIA SKIN INSTITUT avec les vraies données
    console.log('🏢 Mise à jour de Laia Skin Institut avec les données officielles...')

    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: { contains: 'Laia Skin', mode: 'insensitive' } },
          { slug: { contains: 'laia-skin', mode: 'insensitive' } }
        ]
      },
      include: {
        config: true
      }
    })

    if (organization && organization.config) {
      await prisma.organizationConfig.update({
        where: { id: organization.config.id },
        data: {
          // Informations générales
          siteName: 'LAIA SKIN INSTITUT',
          address: '65 Rue de la Croix, Bâtiment 5, 2e étage, 523',
          postalCode: '92000',
          city: 'Nanterre',
          phone: '06 83 71 70 50',
          email: 'celia.ivorra95@hotmail.fr',
          siret: '988 691 937 00011',
          tvaNumber: null, // Pas de TVA (micro-entrepreneur)

          // Préfixe facture
          invoicePrefix: 'LAIA',

          // Mentions légales détaillées
          invoiceLegalDiscount: 'Aucun escompte accordé pour paiement anticipé (art. L441-9 du Code de commerce)',

          invoiceLegalPenalty: 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d\'intérêt légal (art. L441-10 du Code de commerce).\nTaux applicable en 2025 : 5,31% pour les professionnels.\nPénalité exigible sans mise en demeure préalable.',

          invoiceLegalRecoveryFee: 'Indemnité forfaitaire de 40,00 € pour frais de recouvrement en cas de retard (décret n°2012-1115 du 2 octobre 2012).\nSi les frais réels de recouvrement sont supérieurs, une indemnisation complémentaire pourra être demandée sur justificatif.',

          invoiceLegalPaymentTerms: 'Paiement à réception de la facture.\nModes de paiement acceptés : Carte bancaire, espèces (dans la limite légale de 1 000€).\nAucun délai de paiement accordé.',

          invoiceLegalFooter: 'Facture à conserver 10 ans (article L123-22 du Code de commerce).\nTVA non applicable - Article 293 B du CGI (franchise en base de TVA).\nMicro-entrepreneur dispensé d\'immatriculation au RCS (art. L123-1-1 du Code de commerce).\nSIREN : 988 691 937 - Code APE : 9602B - Activité artisanale non réglementée.'
        }
      })

      console.log('✅ Laia Skin Institut mis à jour avec les données officielles\n')
    } else {
      console.log('⚠️  Organisation Laia Skin Institut non trouvée\n')
    }

    // 2. Mettre à jour InvoiceSettings pour LAIA Connect avec des données professionnelles
    console.log('📋 Mise à jour InvoiceSettings pour LAIA Connect...')

    const invoiceSettings = await prisma.invoiceSettings.findFirst()

    if (invoiceSettings) {
      await prisma.invoiceSettings.update({
        where: { id: invoiceSettings.id },
        data: {
          // Informations entreprise LAIA Connect (à compléter avec les vraies données)
          address: '[Adresse à compléter]',
          postalCode: '[Code postal]',
          city: '[Ville]',
          country: 'France',
          siret: '[SIRET à compléter]',
          tvaNumber: '[Numéro TVA intracommunautaire]',
          email: 'contact@laiaconnect.fr',
          phone: '[Téléphone à compléter]',

          // Mentions légales conformes
          legalDiscountPolicy: 'Aucun escompte accordé pour paiement anticipé (art. L441-9 du Code de commerce)',

          legalLatePaymentPenalty: 'Taux de pénalités de retard : 3 fois le taux d\'intérêt légal en vigueur (art. L441-10 du Code de commerce).\nLe taux d\'intérêt légal est consultable sur www.banque-france.fr\nTaux en vigueur depuis le 01/01/2025 : 5,31% pour les professionnels.\nPénalités exigibles sans mise en demeure préalable, dès le premier jour de retard.',

          legalRecoveryFee: 'Indemnité forfaitaire pour frais de recouvrement due au créancier : 40,00 € (décret n°2012-1115 du 2 octobre 2012).\nCette indemnité est due de plein droit en cas de retard de paiement.\nSi les frais de recouvrement exposés sont supérieurs à ce montant, une indemnisation complémentaire pourra être demandée sur justificatif.',

          legalCancellationPolicy: 'Résiliation possible à tout moment sans frais, avec effet au terme de la période en cours.\nPréavis de résiliation : 30 jours avant la date anniversaire.\nConformément à l\'article L215-1 du Code de la consommation.\nNotification de résiliation à adresser par email à : contact@laiaconnect.fr ou par courrier recommandé avec AR.',

          legalDataOwnership: 'Vos données restent votre propriété exclusive à tout moment.\nExport de vos données possible à tout moment au format CSV/Excel depuis votre espace client.\nHébergement sécurisé en France (RGPD) - Infrastructure Supabase certifiée ISO 27001.\nDroit d\'accès, de rectification, de portabilité et de suppression : contact@laiaconnect.fr\nConformité RGPD (Règlement UE 2016/679) et Loi Informatique et Libertés.',

          legalMediation: 'En cas de litige, vous pouvez recourir à une médiation conventionnelle ou tout autre mode alternatif de règlement des différends.\nMédiateur de la consommation (loi n°2014-344 du 17/03/2014) :\nCMAP - Centre de Médiation et d\'Arbitrage de Paris\nSite web : www.cmap.fr\nAdresse : 39 avenue Franklin D. Roosevelt, 75008 Paris\nEmail : cmap@cmap.fr',

          legalJurisdiction: 'En cas de défaut de paiement, compétence exclusive des tribunaux du ressort du siège social de LAIA CONNECT.\nLoi applicable : Loi française.\nTout litige relatif à l\'interprétation ou à l\'exécution des présentes conditions sera soumis au droit français.'
        }
      })

      console.log('✅ InvoiceSettings LAIA Connect mis à jour\n')
    } else {
      console.log('⚠️  Aucun InvoiceSettings trouvé\n')
    }

    console.log('✅ Mise à jour terminée avec succès !')
    console.log('\n📝 Note : Les champs marqués [à compléter] pour LAIA Connect doivent être remplis avec les vraies données de l\'entreprise.')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour :', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateWithRealData()
