import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("💰 Mise à jour des prix corrects des prestations...")

  // 1. Hydro'Naissance - Soin signature
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      price: 180,
      launchPrice: 150,
      forfaitPrice: 400, // 3 séances
      forfaitPromo: 140, // économie sur le forfait
      duration: 90, // 1h30
      category: 'Soin signature',
      featured: true,
      order: 1,
      active: true
    }
  })
  console.log("✅ Hydro'Naissance : 180€ (promo 150€), forfait 3 séances : 400€")

  // 2. Renaissance (Dermapen)
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      price: 120,
      launchPrice: 120, // pas de promo
      forfaitPrice: 320, // 3 séances
      forfaitPromo: 40, // économie
      duration: 60, // 1h
      category: 'Soins essentiels',
      featured: false,
      order: 2,
      active: true
    }
  })
  console.log("✅ Renaissance : 120€, forfait 3 séances : 320€")

  // 3. Hydro'Cleaning
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      price: 80,
      launchPrice: 80, // pas de promo
      forfaitPrice: 210, // 3 séances (70€/séance)
      forfaitPromo: 30, // économie
      duration: 60, // 1h
      category: 'Soins essentiels',
      featured: false,
      order: 3,
      active: true
    }
  })
  console.log("✅ Hydro'Cleaning : 80€, forfait 3 séances : 210€")

  // 4. BB Glow
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      price: 90,
      launchPrice: 90, // pas de promo
      forfaitPrice: 240, // 3 séances (80€/séance)
      forfaitPromo: 30, // économie
      duration: 60, // 1h
      category: 'Soins essentiels',
      featured: false,
      order: 4,
      active: true
    }
  })
  console.log("✅ BB Glow : 90€, forfait 3 séances : 240€")

  // 5. LED Thérapie (séance complète)
  const ledService = await prisma.service.findFirst({
    where: { 
      OR: [
        { slug: 'led-therapie' },
        { slug: 'seance-led-complete' }
      ]
    }
  })

  if (ledService) {
    await prisma.service.update({
      where: { id: ledService.id },
      data: {
        slug: 'led-therapie',
        name: 'LED Thérapie',
        price: 45,
        launchPrice: 45, // pas de promo
        forfaitPrice: 240, // 6 séances (40€/séance)
        forfaitPromo: 30, // économie
        duration: 45, // 45 min
        category: 'Soins essentiels',
        featured: false,
        order: 5,
        active: true,
        shortDescription: 'Soin complet avec nettoyage, gommage, masque et séance LED personnalisée'
      }
    })
    console.log("✅ LED Thérapie : 45€, forfait 6 séances : 240€")
  }

  // Vérifier et afficher le récapitulatif
  console.log("\n📊 RÉCAPITULATIF DES TARIFS")
  console.log("==============================")
  
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  })

  console.log("\n🌟 SOIN SIGNATURE")
  services.filter(s => s.category === 'Soin signature').forEach(s => {
    console.log(`• ${s.name} : ${s.price}€ (promo ${s.launchPrice}€) - Durée: ${s.duration}min`)
    if (s.forfaitPrice) console.log(`  Forfait 3 séances : ${s.forfaitPrice}€`)
  })

  console.log("\n✨ SOINS ESSENTIELS")
  services.filter(s => s.category === 'Soins essentiels').forEach(s => {
    console.log(`• ${s.name} : ${s.price}€ - Durée: ${s.duration}min`)
    if (s.forfaitPrice) {
      const sessions = s.name === 'LED Thérapie' ? 6 : 3
      console.log(`  Forfait ${sessions} séances : ${s.forfaitPrice}€`)
    }
  })

  console.log("\n✅ Tous les prix ont été mis à jour !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())