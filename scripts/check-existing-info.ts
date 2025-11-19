import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExistingInfo() {
  try {
    console.log('🔍 Vérification des informations existantes...\n')

    // 1. InvoiceSettings pour LAIA Connect
    console.log('=== LAIA CONNECT (InvoiceSettings) ===')
    const invoiceSettings = await prisma.invoiceSettings.findFirst()

    if (invoiceSettings) {
      console.log('✅ InvoiceSettings trouvé')
      console.log('Nom entreprise:', invoiceSettings.companyName || '❌ Non défini')
      console.log('Adresse:', invoiceSettings.companyAddress || '❌ Non défini')
      console.log('SIRET:', invoiceSettings.companySiret || '❌ Non défini')
      console.log('Email:', invoiceSettings.companyEmail || '❌ Non défini')
      console.log('Téléphone:', invoiceSettings.companyPhone || '❌ Non défini')
    } else {
      console.log('❌ Aucun InvoiceSettings trouvé')
    }

    console.log('\n=== LAIA SKIN INSTITUT (Organization) ===')

    // 2. Organisation Laia Skin Institut
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
      console.log('✅ Organisation trouvée')
      console.log('Nom:', organization.name)
      console.log('Slug:', organization.slug)

      if (organization.config) {
        console.log('\nConfiguration:')
        console.log('Nom du site:', organization.config.siteName || '❌ Non défini')
        console.log('Adresse:', organization.config.address || '❌ Non défini')
        console.log('Code postal:', organization.config.postalCode || '❌ Non défini')
        console.log('Ville:', organization.config.city || '❌ Non défini')
        console.log('Téléphone:', organization.config.phone || '❌ Non défini')
        console.log('Email:', organization.config.email || '❌ Non défini')
        console.log('SIRET:', organization.config.siret || '❌ Non défini')
        console.log('TVA:', organization.config.vatNumber || '❌ Non défini')
      } else {
        console.log('❌ Aucune configuration trouvée')
      }
    } else {
      console.log('❌ Aucune organisation "Laia Skin Institut" trouvée')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingInfo()
