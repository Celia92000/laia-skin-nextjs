import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Mise à jour des paramètres de facturation...\n')

    const updated = await prisma.invoiceSettings.update({
      where: { id: 'default_settings' },
      data: {
        isCompany: false,
        legalStatus: 'Auto-Entrepreneur',
        companyName: 'LAIA Connect',
        address: '65 RUE de la Croix',
        postalCode: '92000',
        city: 'Nanterre',
        country: 'France',
        siret: '98869193700001',
        tvaNumber: '',
        capitalSocial: '',
        rcs: '',
        apeCode: '6201Z',
        email: 'contact@laiaconnect.fr',
        phone: '06 83 71 70 50',
        website: 'https://www.laiaconnect.fr',
        invoicePrefix: 'LAIA',
        tvaRate: 0.0,
        paymentTerms: 'Prélèvement SEPA automatique',
        latePenalty: 'En cas de retard de paiement, indemnité forfaitaire de 40€ pour frais de recouvrement.',
        footerText: 'Auto-entrepreneur - Dispensé d\'immatriculation au RCS et au RM',
        updatedAt: new Date()
      }
    })

    console.log('✅ Paramètres mis à jour avec succès !\n')
    console.log('📋 Nouvelles valeurs :')
    console.log(`  Nom entreprise : ${updated.companyName}`)
    console.log(`  SIRET : ${updated.siret}`)
    console.log(`  Adresse : ${updated.address}`)
    console.log(`  ${updated.postalCode} ${updated.city}`)
    console.log(`  Email : ${updated.email}`)
    console.log(`  Téléphone : ${updated.phone}`)
    console.log(`  Site web : ${updated.website}`)
    console.log('\n🎉 Toutes les factures et contrats utiliseront maintenant ces informations !')

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
