import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️ Suppression de tous les services...")
  await prisma.service.deleteMany({})
  console.log("✅ Base nettoyée")

  console.log("\n✨ Création des 5 services finaux...")

  // 1. Hydro'Naissance = Hydro'Cleaning + Renaissance
  await prisma.service.create({
    data: {
      name: "Hydro'Naissance",
      slug: 'hydro-naissance',
      shortDescription: "Soin signature : Hydro'Cleaning + Renaissance combinés",
      description: "Notre soin signature combine l'Hydro'Cleaning (notre HydraFacial) avec Renaissance (Dermapen). Une synergie parfaite pour des résultats exceptionnels.",
      price: 180,
      launchPrice: 150,
      forfaitPrice: 400,
      duration: 90,
      category: 'Soin signature',
      featured: true,
      order: 1,
      active: true,
      metaTitle: "Hydro'Naissance : Soin Signature | LAIA SKIN",
      metaDescription: "Soin signature combinant Hydro'Cleaning et Renaissance. 150€ au lieu de 180€."
    }
  })
  console.log("✅ Hydro'Naissance créé (Hydro'Cleaning + Renaissance)")

  // 2. Renaissance (Dermapen)
  await prisma.service.create({
    data: {
      name: "Renaissance (Dermapen)",
      slug: 'renaissance',
      shortDescription: "Régénération cellulaire par Dermapen",
      description: "Traitement Dermapen pour stimuler le collagène et régénérer la peau.",
      price: 120,
      launchPrice: 120,
      forfaitPrice: 320,
      duration: 60,
      category: 'Soins essentiels',
      featured: false,
      order: 2,
      active: true,
      metaTitle: "Renaissance Dermapen | LAIA SKIN",
      metaDescription: "Traitement Dermapen pour régénération cellulaire. 120€ la séance."
    }
  })
  console.log("✅ Renaissance créé")

  // 3. Hydro'Cleaning (notre HydraFacial)
  await prisma.service.create({
    data: {
      name: "Hydro'Cleaning",
      slug: 'hydro-cleaning',
      shortDescription: "Notre HydraFacial - Hydradermabrasion professionnelle",
      description: "Technique d'hydradermabrasion identique à l'HydraFacial. Nettoyage et hydratation en profondeur.",
      price: 80,
      launchPrice: 80,
      forfaitPrice: 210,
      duration: 60,
      category: 'Soins essentiels',
      featured: false,
      order: 3,
      active: true,
      metaTitle: "Hydro'Cleaning : Notre HydraFacial | LAIA SKIN",
      metaDescription: "Hydradermabrasion professionnelle équivalente à l'HydraFacial. 80€ la séance."
    }
  })
  console.log("✅ Hydro'Cleaning créé (notre HydraFacial)")

  // 4. BB Glow
  await prisma.service.create({
    data: {
      name: "BB Glow",
      slug: 'bb-glow',
      shortDescription: "Teint parfait semi-permanent",
      description: "Technique coréenne pour un teint unifié qui dure 4-8 semaines.",
      price: 90,
      launchPrice: 90,
      forfaitPrice: 240,
      duration: 60,
      category: 'Soins essentiels',
      featured: false,
      order: 4,
      active: true,
      metaTitle: "BB Glow | LAIA SKIN",
      metaDescription: "BB Glow pour un teint parfait semi-permanent. 90€ la séance."
    }
  })
  console.log("✅ BB Glow créé")

  // 5. LED Thérapie
  await prisma.service.create({
    data: {
      name: "LED Thérapie",
      slug: 'led-therapie',
      shortDescription: "Photobiomodulation complète",
      description: "Séance LED complète avec nettoyage, gommage et masque.",
      price: 45,
      launchPrice: 45,
      forfaitPrice: 240,
      duration: 45,
      category: 'Soins essentiels',
      featured: false,
      order: 5,
      active: true,
      metaTitle: "LED Thérapie | LAIA SKIN",
      metaDescription: "LED thérapie complète. 45€ la séance, forfait 6 séances 240€."
    }
  })
  console.log("✅ LED Thérapie créé")

  // Affichage final
  console.log("\n🎉 5 SERVICES CRÉÉS AVEC SUCCÈS")
  console.log("==================================")
  
  const services = await prisma.service.findMany({
    orderBy: { order: 'asc' }
  })

  console.log("\n🌟 SOIN SIGNATURE")
  console.log("• Hydro'Naissance = Hydro'Cleaning + Renaissance")
  console.log("  180€ (promo 150€) - 1h30")
  console.log("  Forfait 3 séances : 400€")

  console.log("\n✨ SOINS ESSENTIELS")
  console.log("• Renaissance (Dermapen) : 120€ - 1h")
  console.log("  Forfait 3 séances : 320€")
  console.log("• Hydro'Cleaning (notre HydraFacial) : 80€ - 1h")
  console.log("  Forfait 3 séances : 210€")
  console.log("• BB Glow : 90€ - 1h")
  console.log("  Forfait 3 séances : 240€")
  console.log("• LED Thérapie : 45€ - 45min")
  console.log("  Forfait 6 séances : 240€")

  console.log("\n📝 À retenir :")
  console.log("• Hydro'Naissance = combinaison Hydro'Cleaning + Renaissance")
  console.log("• Hydro'Cleaning = notre version de l'HydraFacial")
  console.log("• Renaissance = traitement Dermapen")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())