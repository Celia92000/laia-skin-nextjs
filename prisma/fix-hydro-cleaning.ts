import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Hydro'Cleaning - 60 minutes (1h)
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      duration: 60,
      price: 150,
      launchPrice: 120,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Diagnostic',
          description: 'Analyse approfondie de la peau',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Vapeur & Préparation',
          description: 'Ouverture des pores à la vapeur',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'HydraFacial Nettoyage',
          description: 'Nettoyage profond avec technologie Vortex',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'Extraction & Purification',
          description: 'Extraction des impuretés et points noirs',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Apaisement & Protection',
          description: 'Masque purifiant et protection finale',
          duration: '10 min'
        }
      ])
    }
  })

  console.log("✅ Hydro'Cleaning corrigé : 60 minutes (1h)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })