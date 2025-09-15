import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // HydraFacial - 60 minutes
  await prisma.service.update({
    where: { slug: 'hydrafacial' },
    data: {
      duration: 60,
      price: 180,
      launchPrice: 150,
      promoPrice: 160,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Nettoyage & Exfoliation',
          description: 'Élimination des cellules mortes et ouverture des pores',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Peeling Doux',
          description: 'Mélange d\'acides doux pour renouveler la peau',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Extraction',
          description: 'Aspiration douce des impuretés et points noirs',
          duration: '15 min'
        },
        {
          step: 4,
          title: 'Hydratation',
          description: 'Infusion de sérums personnalisés',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'Protection',
          description: 'LED thérapie et protection finale',
          duration: '10 min'
        }
      ])
    }
  })

  // BB Glow - 60 minutes (1h)
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      duration: 60,
      price: 150,
      launchPrice: 120,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Consultation',
          description: 'Analyse de peau et choix de la teinte',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Préparation',
          description: 'Nettoyage profond et désinfection',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Application BB Sérum',
          description: 'Dermapen avec sérum BB Glow',
          duration: '30 min'
        },
        {
          step: 4,
          title: 'Massage',
          description: 'Massage pour faire pénétrer le sérum',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Finition',
          description: 'Masque apaisant et protection',
          duration: '5 min'
        }
      ])
    }
  })

  // Dermapen (ex-Microneedling) - 60 minutes
  await prisma.service.update({
    where: { slug: 'microneedling' },
    data: {
      slug: 'dermapen',
      duration: 60,
      price: 200,
      launchPrice: 170,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Consultation',
          description: 'Évaluation des besoins',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Préparation',
          description: 'Nettoyage et désinfection',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Traitement Dermapen',
          description: 'Micro-perforation contrôlée',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'Sérums',
          description: 'Application de sérums adaptés',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Apaisement',
          description: 'Masque et LED rouge',
          duration: '10 min'
        }
      ])
    }
  })

  // LED Thérapie - 30 minutes
  await prisma.service.update({
    where: { slug: 'led-therapie' },
    data: {
      duration: 30,
      price: 80,
      launchPrice: 60,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Analyse',
          description: 'Choix du programme LED',
          duration: '3 min'
        },
        {
          step: 2,
          title: 'Nettoyage',
          description: 'Préparation de la peau',
          duration: '5 min'
        },
        {
          step: 3,
          title: 'LED Thérapie',
          description: 'Exposition aux LED',
          duration: '20 min'
        },
        {
          step: 4,
          title: 'Finition',
          description: 'Sérum et protection',
          duration: '2 min'
        }
      ])
    }
  })

  // Hydro'Naissance - 90 minutes (1h30)
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      duration: 90,
      price: 280,
      launchPrice: 230,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Préparation',
          description: 'Analyse et nettoyage',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'HydraFacial',
          description: 'Protocole complet HydraFacial',
          duration: '40 min'
        },
        {
          step: 3,
          title: 'Dermapen',
          description: 'Micro-perforation avec sérums',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'LED Rouge',
          description: 'Photobiomodulation',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Finition',
          description: 'Masque et massage',
          duration: '5 min'
        }
      ])
    }
  })

  // Hydro'Cleaning - 45 minutes
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      duration: 45,
      price: 120,
      launchPrice: 100,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Analyse',
          description: 'Diagnostic de peau',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Vapeur',
          description: 'Ouverture des pores',
          duration: '5 min'
        },
        {
          step: 3,
          title: 'HydraFacial Nettoyage',
          description: 'Aspiration et nettoyage profond',
          duration: '20 min'
        },
        {
          step: 4,
          title: 'Extraction',
          description: 'Extraction manuelle si nécessaire',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Apaisement',
          description: 'Masque purifiant',
          duration: '5 min'
        }
      ])
    }
  })

  // Renaissance - 75 minutes (1h15)
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      duration: 75,
      price: 250,
      launchPrice: 200,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Préparation',
          description: 'Nettoyage et analyse',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Dermapen',
          description: 'Traitement complet visage',
          duration: '30 min'
        },
        {
          step: 3,
          title: 'Sérums Actifs',
          description: 'Application de cocktails spécifiques',
          duration: '10 min'
        },
        {
          step: 4,
          title: 'LED Thérapie',
          description: 'LED rouge anti-âge',
          duration: '20 min'
        },
        {
          step: 5,
          title: 'Masque',
          description: 'Masque bio-cellulose',
          duration: '5 min'
        }
      ])
    }
  })

  console.log("✅ Toutes les durées et process ont été mis à jour")
  console.log("- HydraFacial: 60 min")
  console.log("- BB Glow: 60 min")
  console.log("- Dermapen: 60 min")
  console.log("- LED Thérapie: 30 min")
  console.log("- Hydro'Naissance: 90 min")
  console.log("- Hydro'Cleaning: 45 min")
  console.log("- Renaissance: 75 min")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })