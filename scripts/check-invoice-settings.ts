import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Vérification des paramètres de facturation...\n')

    const settings = await prisma.invoiceSettings.findFirst()

    if (!settings) {
      console.log('❌ Aucun paramètre de facturation trouvé !')
      return
    }

    console.log('📋 Paramètres actuels :')
    console.log(`  Nom entreprise : ${settings.companyName}`)
    console.log(`  SIRET : ${settings.siret}`)
    console.log(`  Adresse : ${settings.address}`)
    console.log(`  Code postal : ${settings.postalCode}`)
    console.log(`  Ville : ${settings.city}`)
    console.log(`  Email : ${settings.email}`)
    console.log(`  Téléphone : ${settings.phone}`)
    console.log(`  Site web : ${settings.website}`)

    console.log('\n⚠️  Vérifiez que ces informations sont correctes pour la production !')

    if (settings.siret === '12345678900000' || settings.address.includes('Adresse à définir')) {
      console.log('\n🚨 ATTENTION : Les paramètres contiennent encore des valeurs de test !')
      console.log('   Vous devez les modifier avant de lancer en production.')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
