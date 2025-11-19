import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('🔄 Application de la migration SQL...\n')

    console.log('📋 Ajout des champs pour InvoiceSettings...')

    // Exécuter les ALTER TABLE séparément pour InvoiceSettings
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalDiscountPolicy" TEXT DEFAULT 'Aucun escompte accordé pour paiement anticipé (art. L441-9 du Code de commerce)';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalLatePaymentPenalty" TEXT DEFAULT 'Taux de pénalités de retard : 3 fois le taux d''intérêt légal en vigueur (art. L441-10 du Code de commerce). Le taux d''intérêt légal est consultable sur www.banque-france.fr';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalRecoveryFee" TEXT DEFAULT 'Indemnité forfaitaire pour frais de recouvrement due au créancier : 40,00 € (décret n°2012-1115 du 2 octobre 2012). Cette indemnité est due de plein droit en cas de retard de paiement.';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalCancellationPolicy" TEXT DEFAULT 'Résiliation possible à tout moment sans frais, avec effet au terme de la période en cours. Préavis de résiliation : 30 jours avant la date anniversaire.';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalDataOwnership" TEXT DEFAULT 'Vos données restent votre propriété exclusive. Export de vos données possible à tout moment au format CSV/Excel. Hébergement sécurisé en France (RGPD).';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalMediation" TEXT DEFAULT 'Médiation de la consommation (loi n°2014-344 du 17/03/2014) : CMAP (www.cmap.fr)';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InvoiceSettings"
      ADD COLUMN IF NOT EXISTS "legalJurisdiction" TEXT DEFAULT 'Défaut de paiement : compétence exclusive des tribunaux de Paris';
    `)

    console.log('✅ Champs InvoiceSettings ajoutés\n')

    console.log('📋 Ajout des champs pour OrganizationConfig...')

    // Exécuter les ALTER TABLE séparément pour OrganizationConfig
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "invoicePrefix" TEXT DEFAULT 'FACT';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "invoiceLegalDiscount" TEXT DEFAULT 'Aucun escompte accordé pour paiement anticipé';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "invoiceLegalPenalty" TEXT DEFAULT 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d''intérêt légal';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "invoiceLegalRecoveryFee" TEXT DEFAULT 'Indemnité forfaitaire de 40€ pour frais de recouvrement en cas de retard';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "invoiceLegalPaymentTerms" TEXT DEFAULT 'Paiement à réception';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "invoiceLegalFooter" TEXT DEFAULT 'Facture à conserver 10 ans';
    `)

    console.log('✅ Champs OrganizationConfig ajoutés\n')
    console.log('✅ Migration appliquée avec succès !\n')

  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration :', error)
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
