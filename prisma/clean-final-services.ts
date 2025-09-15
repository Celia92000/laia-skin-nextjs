import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Nettoyage final - Garder uniquement les 5 services...")

  // D'abord désactiver TOUS les services
  await prisma.service.updateMany({
    data: { active: false }
  })
  console.log("✅ Tous les services désactivés")

  // Maintenant activer et mettre à jour UNIQUEMENT les 5 bons services

  // 1. Hydro'Naissance
  const hydro = await prisma.service.findFirst({
    where: { slug: 'hydro-naissance' }
  })
  if (hydro) {
    await prisma.service.update({
      where: { id: hydro.id },
      data: {
        name: "Hydro'Naissance",
        slug: 'hydro-naissance',
        price: 180,
        launchPrice: 150,
        forfaitPrice: 400,
        duration: 90,
        category: 'Soin signature',
        featured: true,
        order: 1,
        active: true
      }
    })
    console.log("✅ Hydro'Naissance activé")
  }

  // 2. Renaissance (Dermapen)
  const renaissance = await prisma.service.findFirst({
    where: { 
      OR: [
        { slug: 'renaissance' },
        { slug: 'dermapen' }
      ]
    }
  })
  if (renaissance) {
    await prisma.service.update({
      where: { id: renaissance.id },
      data: {
        name: "Renaissance (Dermapen)",
        slug: 'renaissance',
        price: 120,
        launchPrice: 120,
        forfaitPrice: 320,
        duration: 60,
        category: 'Soins essentiels',
        featured: false,
        order: 2,
        active: true
      }
    })
    console.log("✅ Renaissance activé")
  }

  // 3. Hydro'Cleaning
  const hydroCleaning = await prisma.service.findFirst({
    where: { slug: 'hydro-cleaning' }
  })
  if (hydroCleaning) {
    await prisma.service.update({
      where: { id: hydroCleaning.id },
      data: {
        name: "Hydro'Cleaning",
        slug: 'hydro-cleaning',
        price: 80,
        launchPrice: 80,
        forfaitPrice: 210,
        duration: 60,
        category: 'Soins essentiels',
        featured: false,
        order: 3,
        active: true
      }
    })
    console.log("✅ Hydro'Cleaning activé")
  }

  // 4. BB Glow
  const bbGlow = await prisma.service.findFirst({
    where: { slug: 'bb-glow' }
  })
  if (bbGlow) {
    await prisma.service.update({
      where: { id: bbGlow.id },
      data: {
        name: "BB Glow",
        slug: 'bb-glow',
        price: 90,
        launchPrice: 90,
        forfaitPrice: 240,
        duration: 60,
        category: 'Soins essentiels',
        featured: false,
        order: 4,
        active: true
      }
    })
    console.log("✅ BB Glow activé")
  }

  // 5. LED Thérapie - Chercher le bon (celui à 45€)
  const ledTherapie = await prisma.service.findFirst({
    where: { 
      OR: [
        { slug: 'led-therapie' },
        { slug: 'seance-led-complete' }
      ],
      price: { lte: 50 } // Celui qui coûte 45€ ou moins
    }
  })
  
  if (ledTherapie) {
    await prisma.service.update({
      where: { id: ledTherapie.id },
      data: {
        name: "LED Thérapie",
        slug: 'led-therapie',
        price: 45,
        launchPrice: 45,
        forfaitPrice: 240,
        duration: 45,
        category: 'Soins essentiels',
        featured: false,
        order: 5,
        active: true,
        shortDescription: 'Soin complet avec nettoyage, gommage, masque et séance LED personnalisée'
      }
    })
    console.log("✅ LED Thérapie activé")
  } else {
    // Si on ne trouve pas, créer un nouveau
    await prisma.service.create({
      data: {
        name: "LED Thérapie",
        slug: 'led-therapie',
        price: 45,
        launchPrice: 45,
        forfaitPrice: 240,
        duration: 45,
        category: 'Soins essentiels',
        featured: false,
        order: 5,
        active: true,
        shortDescription: 'Soin complet avec nettoyage, gommage, masque et séance LED personnalisée',
        description: 'Séance complète de photobiomodulation avec préparation de la peau',
        benefits: ['Réduit l\'acné', 'Stimule le collagène', 'Apaise les rougeurs', 'Unifie le teint'],
        process: ['Nettoyage', 'Gommage doux', 'Séance LED personnalisée', 'Masque apaisant'],
        metaTitle: 'LED Thérapie | LAIA SKIN Institut',
        metaDescription: 'Séance LED complète avec nettoyage et masque. Traite acné, rides et rougeurs.'
      }
    })
    console.log("✅ LED Thérapie créé")
  }

  // Supprimer définitivement les services en double ou inactifs
  await prisma.service.deleteMany({
    where: { active: false }
  })
  console.log("✅ Services inactifs supprimés")

  // Afficher le résultat final
  console.log("\n📊 SERVICES FINAUX (5 services uniquement)")
  console.log("==========================================")
  
  const finalServices = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  })

  finalServices.forEach(s => {
    console.log(`${s.order}. ${s.name}`)
    console.log(`   Prix: ${s.price}€ | Durée: ${s.duration}min | Catégorie: ${s.category}`)
    if (s.forfaitPrice) {
      const sessions = s.slug === 'led-therapie' ? 6 : 3
      console.log(`   Forfait ${sessions} séances: ${s.forfaitPrice}€`)
    }
    console.log('')
  })

  console.log(`Total: ${finalServices.length} services actifs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())