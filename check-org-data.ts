import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrgData() {
  try {
    const org = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      select: {
        name: true,
        legalName: true,
        ownerFirstName: true,
        ownerLastName: true,
        ownerEmail: true,
        ownerPhone: true,
        siret: true,
        tvaNumber: true,
        billingEmail: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        billingCountry: true
      }
    })

    console.log('📊 Données de l\'organisation Laia Skin Institut:')
    console.log(JSON.stringify(org, null, 2))

    if (!org?.legalName || !org?.ownerFirstName) {
      console.log('\n⚠️  Les champs de l\'organisation sont vides ou manquants!')
      console.log('Il faut remplir ces champs lors de l\'onboarding ou manuellement.')
    } else {
      console.log('\n✅ Les champs sont remplis!')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrgData()
