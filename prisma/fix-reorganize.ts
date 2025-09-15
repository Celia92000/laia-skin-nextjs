import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // D'abord, désactiver tous les soins non désirés
  await prisma.service.updateMany({
    where: {
      slug: {
        in: ['hydrafacial', 'microneedling', 'dermapen', 'led-therapie', 'bb-glow-express']
      }
    },
    data: {
      active: false
    }
  })

  // SOIN SIGNATURE (1 seul)
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      category: 'Soin signature',
      featured: true,
      order: 1,
      active: true,
      price: 350,
      name: "Hydro'Naissance",
      shortDescription: 'Le soin signature ultime : Hydro\'Cleaning + Dermapen + Masque Gold'
    }
  })

  // SOINS ESSENTIELS (4 soins)
  
  // 1. Renaissance (qui EST le Dermapen)
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      category: 'Soins essentiels',
      featured: false,
      order: 2,
      active: true,
      price: 220,
      name: 'Renaissance (Dermapen)',
      shortDescription: 'Le soin Dermapen anti-âge avec masque bio-cellulose',
      description: `Le Renaissance est notre protocole Dermapen complet. Cette technique de micro-perforation contrôlée stimule le renouvellement cellulaire et la production de collagène. Enrichi d'un masque bio-cellulose aux peptides et d'une séance de LED rouge, ce soin cible efficacement les signes de l'âge.`
    }
  })

  // 2. Hydro'Cleaning  
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      category: 'Soins essentiels',
      featured: false,
      order: 3,
      active: true,
      price: 150,
      name: "Hydro'Cleaning"
    }
  })

  // 3. BB Glow
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      category: 'Soins essentiels',
      featured: false,
      order: 4,
      active: true,
      price: 150,
      canBeOption: false,
      name: 'BB Glow'
    }
  })

  // 4. LED Thérapie (renommer la séance complète)
  const ledComplete = await prisma.service.findUnique({
    where: { slug: 'seance-led-complete' }
  })

  if (ledComplete) {
    await prisma.service.update({
      where: { slug: 'seance-led-complete' },
      data: {
        category: 'Soins essentiels',
        featured: false,
        order: 5,
        active: true,
        price: 120,
        name: 'LED Thérapie',
        shortDescription: 'Soin complet avec nettoyage, gommage, masque et LED'
      }
    })
  } else {
    // Si elle n'existe pas, la créer
    await prisma.service.create({
      data: {
        slug: 'led-therapie-complete',
        name: 'LED Thérapie',
        shortDescription: 'Soin complet avec nettoyage, gommage, masque et LED',
        description: 'Notre séance LED complète combine nettoyage professionnel, gommage enzymatique, masque adapté et LED thérapie personnalisée.',
        price: 120,
        duration: 60,
        category: 'Soins essentiels',
        active: true,
        featured: false,
        order: 5,
        process: JSON.stringify([
          {
            step: 1,
            title: 'Nettoyage',
            description: 'Double nettoyage',
            duration: '10 min'
          },
          {
            step: 2,
            title: 'Gommage',
            description: 'Exfoliation enzymatique',
            duration: '10 min'
          },
          {
            step: 3,
            title: 'Masque',
            description: 'Masque personnalisé',
            duration: '15 min'
          },
          {
            step: 4,
            title: 'LED',
            description: 'Photothérapie ciblée',
            duration: '20 min'
          },
          {
            step: 5,
            title: 'Finition',
            description: 'Protection finale',
            duration: '5 min'
          }
        ])
      }
    })
  }

  console.log("✅ Gamme finale simplifiée !")
  console.log("")
  console.log("🌟 SOIN SIGNATURE")
  console.log("   • Hydro'Naissance (350€) - Le combo ultime")
  console.log("")
  console.log("✨ SOINS ESSENTIELS")
  console.log("   • Renaissance/Dermapen (220€)")
  console.log("   • Hydro'Cleaning (150€)") 
  console.log("   • BB Glow (150€)")
  console.log("   • LED Thérapie (120€)")
  console.log("")
  console.log("Note: Renaissance = Dermapen (même soin)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })