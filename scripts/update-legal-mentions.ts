import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateLegalMentions() {
  try {
    console.log('🔄 Mise à jour des mentions légales...\n')

    // 1. Mettre à jour InvoiceSettings pour LAIA Connect
    console.log('📋 Mise à jour InvoiceSettings pour LAIA Connect...')

    const invoiceSettings = await prisma.invoiceSettings.findFirst()

    if (invoiceSettings) {
      await prisma.invoiceSettings.update({
        where: { id: invoiceSettings.id },
        data: {
          legalDiscountPolicy: 'Aucun escompte accordé pour paiement anticipé (art. L441-9 du Code de commerce)',
          legalLatePaymentPenalty: 'Taux de pénalités de retard : 3 fois le taux d\'intérêt légal en vigueur (art. L441-10 du Code de commerce).\nLe taux d\'intérêt légal est consultable sur www.banque-france.fr\nEn vigueur depuis le 01/01/2025 : 5,31% pour les professionnels.',
          legalRecoveryFee: 'Indemnité forfaitaire pour frais de recouvrement due au créancier : 40,00 € (décret n°2012-1115 du 2 octobre 2012).\nCette indemnité est due de plein droit en cas de retard de paiement.',
          legalCancellationPolicy: 'Résiliation possible à tout moment sans frais, avec effet au terme de la période en cours.\nPréavis de résiliation : 30 jours avant la date anniversaire.\nConformément à l\'article L215-1 du Code de la consommation.',
          legalDataOwnership: 'Vos données restent votre propriété exclusive.\nExport de vos données possible à tout moment au format CSV/Excel.\nHébergement sécurisé en France (RGPD) - Supabase.\nDroit d\'accès, de rectification et de suppression : contact@laiaconnect.fr',
          legalMediation: 'En cas de litige, vous pouvez recourir à une médiation conventionnelle ou tout autre mode alternatif de règlement des différends.\nMédiation de la consommation (loi n°2014-344 du 17/03/2014) : CMAP - www.cmap.fr\nAdresse : 39 avenue Franklin D. Roosevelt, 75008 Paris',
          legalJurisdiction: 'En cas de défaut de paiement, compétence exclusive des tribunaux de Paris.\nLoi applicable : Loi française.'
        }
      })
      console.log('✅ InvoiceSettings mis à jour pour LAIA Connect\n')
    } else {
      console.log('⚠️  Aucun InvoiceSettings trouvé\n')
    }

    // 2. Trouver l'organisation "Laia Skin Institut"
    console.log('🏢 Recherche de l\'organisation "Laia Skin Institut"...')

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

    if (organization) {
      console.log(`✅ Organisation trouvée : ${organization.name} (${organization.slug})`)

      if (organization.config) {
        console.log('📋 Mise à jour OrganizationConfig pour Laia Skin Institut...')

        await prisma.organizationConfig.update({
          where: { id: organization.config.id },
          data: {
            invoicePrefix: 'LAIA',
            invoiceLegalDiscount: 'Aucun escompte accordé pour paiement anticipé (art. L441-9 du Code de commerce)',
            invoiceLegalPenalty: 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d\'intérêt légal (art. L441-10).\nTaux applicable : 5,31% (année 2025 pour professionnels).\nPénalité exigible sans mise en demeure préalable.',
            invoiceLegalRecoveryFee: 'Indemnité forfaitaire de 40,00 € pour frais de recouvrement en cas de retard (décret n°2012-1115).\nSi les frais réels sont supérieurs, une indemnisation complémentaire pourra être demandée.',
            invoiceLegalPaymentTerms: 'Paiement à réception de la facture.\nMode de paiement accepté : Carte bancaire, espèces (dans la limite légale).\nAucun délai de paiement accordé.',
            invoiceLegalFooter: 'Facture à conserver 10 ans (article L123-22 du Code de commerce).\nTVA non applicable - Article 293 B du CGI (franchise en base de TVA).\nDispense d\'immatriculation au RCS (micro-entrepreneur).'
          }
        })
        console.log('✅ OrganizationConfig mis à jour pour Laia Skin Institut\n')
      } else {
        console.log('⚠️  Aucun OrganizationConfig trouvé pour cette organisation\n')
      }
    } else {
      console.log('⚠️  Aucune organisation "Laia Skin Institut" trouvée\n')
    }

    console.log('✅ Mise à jour terminée avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour :', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateLegalMentions()
