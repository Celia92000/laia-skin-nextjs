import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fillOrgData() {
  try {
    const org = await prisma.organization.update({
      where: { slug: 'laia-skin-institut' },
      data: {
        ownerFirstName: 'Célia',
        ownerLastName: 'LAIA',
        ownerPhone: '+33 6 31 10 75 31',
        siret: '12345678900010',
        billingEmail: 'admin@laiaskin.com',
        billingAddress: '123 Rue de la Beauté',
        billingPostalCode: '75001',
        billingCity: 'Paris'
      }
    })

    console.log('✅ Organisation mise à jour avec succès!')
    console.log(JSON.stringify(org, null, 2))
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fillOrgData()
