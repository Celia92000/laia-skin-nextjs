import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️ Suppression de tous les services...")
  await prisma.service.deleteMany({})
  console.log("✅ Base nettoyée")

  console.log("\n✨ Création des 5 services finaux...")

  // 1. Hydro'Naissance - Soin signature
  await prisma.service.create({
    data: {
      name: "Hydro'Naissance",
      slug: 'hydro-naissance',
      shortDescription: "Soin signature exclusif : Hydro'Cleaning + Renaissance combinés",
      description: "Notre soin signature qui combine l'Hydro'Cleaning (notre version de l'HydraFacial®) avec Renaissance (traitement Dermapen). Une synergie parfaite d'hydradermabrasion et de stimulation cellulaire pour des résultats anti-âge exceptionnels.",
      price: 180,
      launchPrice: 150,
      forfaitPrice: 400,
      forfaitPromo: 140,
      duration: 90,
      category: 'Soin signature',
      featured: true,
      order: 1,
      active: true,
      benefits: JSON.stringify([
        "Hydratation intense jusqu'à 72h",
        "Stimulation du collagène naturel",
        "Réduction visible des rides",
        "Teint éclatant immédiat",
        "Effet liftant naturel"
      ]),
      process: JSON.stringify([
        { title: "Diagnostic personnalisé", description: "Analyse de votre peau", duration: "10 min" },
        { title: "Double nettoyage", description: "Préparation professionnelle", duration: "10 min" },
        { title: "Hydradermabrasion", description: "Nettoyage et hydratation profonde", duration: "30 min" },
        { title: "Stimulation cellulaire", description: "Micro-perforation contrôlée 0.5mm", duration: "20 min" },
        { title: "Masque sur-mesure", description: "Apaisement et nutrition", duration: "15 min" },
        { title: "Protection finale", description: "Sérum et SPF", duration: "5 min" }
      ]),
      metaTitle: "Hydro'Naissance : Soin Signature Anti-Âge | LAIA SKIN",
      metaDescription: "Soin signature combinant hydratation profonde et stimulation cellulaire. 150€ au lieu de 180€.",
      keywords: ["soin signature", "anti-âge", "hydratation", "collagène", "rajeunissement"]
    }
  })
  console.log("✅ 1. Hydro'Naissance créé")

  // 2. Renaissance (Dermapen)
  await prisma.service.create({
    data: {
      name: "Renaissance (Dermapen)",
      slug: 'renaissance',
      shortDescription: "Régénération cellulaire par micro-perforation contrôlée Dermapen",
      description: "Traitement de régénération cutanée utilisant la technologie Dermapen pour stimuler naturellement le renouvellement cellulaire.",
      price: 120,
      launchPrice: 120,
      forfaitPrice: 320,
      forfaitPromo: 40,
      duration: 60,
      category: 'Soins essentiels',
      featured: false,
      order: 2,
      active: true,
      benefits: [
        "Stimulation du collagène",
        "Réduction des cicatrices",
        "Pores resserrés",
        "Texture affinée",
        "Rides atténuées"
      ],
      process: [
        { title: "Préparation", description: "Nettoyage et anesthésiant léger", duration: "15 min" },
        { title: "Traitement Dermapen", description: "Micro-perforation 0.5mm", duration: "30 min" },
        { title: "Apaisement", description: "Masque calmant et LED", duration: "15 min" }
      ],
      metaTitle: "Renaissance Dermapen : Régénération Cellulaire | LAIA SKIN",
      metaDescription: "Traitement Dermapen pour stimuler le collagène et réduire cicatrices et rides. 120€ la séance.",
      keywords: ["dermapen", "régénération", "collagène", "cicatrices", "anti-âge"]
    }
  })
  console.log("✅ 2. Renaissance créé")

  // 3. Hydro'Cleaning (notre HydraFacial)
  await prisma.service.create({
    data: {
      name: "Hydro'Cleaning",
      slug: 'hydro-cleaning',
      shortDescription: "Notre version de l'HydraFacial® - Hydradermabrasion professionnelle",
      description: "Technique d'hydradermabrasion comparable à l'HydraFacial®. Nettoyage, exfoliation et hydratation en profondeur pour un teint éclatant immédiat.",
      price: 80,
      launchPrice: 80,
      forfaitPrice: 210,
      forfaitPromo: 30,
      duration: 60,
      category: 'Soins essentiels',
      featured: false,
      order: 3,
      active: true,
      benefits: [
        "Nettoyage profond des pores",
        "Exfoliation douce",
        "Hydratation intense",
        "Éclat immédiat",
        "Extraction des impuretés"
      ],
      process: [
        { title: "Analyse", description: "Diagnostic de peau", duration: "5 min" },
        { title: "Nettoyage", description: "Double nettoyage", duration: "10 min" },
        { title: "Hydradermabrasion", description: "Exfoliation aqua", duration: "15 min" },
        { title: "Extraction", description: "Aspiration douce", duration: "10 min" },
        { title: "Infusion", description: "Sérums actifs", duration: "15 min" },
        { title: "Protection", description: "SPF et conseils", duration: "5 min" }
      ],
      metaTitle: "Hydro'Cleaning : Alternative HydraFacial Paris | LAIA SKIN",
      metaDescription: "Hydradermabrasion professionnelle, alternative française à l'HydraFacial. Seulement 80€ pour un teint éclatant.",
      keywords: ["hydrafacial", "hydradermabrasion", "nettoyage", "pores", "éclat", "alternative hydrafacial"]
    }
  })
  console.log("✅ 3. Hydro'Cleaning créé")

  // 4. BB Glow
  await prisma.service.create({
    data: {
      name: "BB Glow",
      slug: 'bb-glow',
      shortDescription: "Teint parfait semi-permanent façon BB crème coréenne",
      description: "Technique coréenne pour un teint unifié et lumineux qui dure 4-8 semaines. Effet 'no makeup' naturel.",
      price: 90,
      launchPrice: 90,
      forfaitPrice: 240,
      forfaitPromo: 30,
      duration: 60,
      category: 'Soins essentiels',
      featured: false,
      order: 4,
      active: true,
      benefits: [
        "Teint unifié 4-8 semaines",
        "Effet bonne mine permanent",
        "Camouflage des imperfections",
        "Hydratation profonde",
        "Gain de temps maquillage"
      ],
      process: [
        { title: "Consultation teint", description: "Choix de la teinte", duration: "10 min" },
        { title: "Préparation", description: "Nettoyage et exfoliation", duration: "15 min" },
        { title: "Application BB", description: "Micro-perforation 0.5mm", duration: "25 min" },
        { title: "Finalisation", description: "Masque et protection", duration: "10 min" }
      ],
      metaTitle: "BB Glow : Teint Parfait Semi-Permanent | LAIA SKIN",
      metaDescription: "BB Glow pour un teint unifié pendant 4-8 semaines. Technique coréenne à 90€.",
      keywords: ["bb glow", "teint parfait", "semi-permanent", "no makeup", "coréen"]
    }
  })
  console.log("✅ 4. BB Glow créé")

  // 5. LED Thérapie
  await prisma.service.create({
    data: {
      name: "LED Thérapie",
      slug: 'led-therapie',
      shortDescription: "Photobiomodulation complète avec nettoyage, gommage et masque",
      description: "Séance complète de LED thérapie incluant préparation de la peau pour maximiser les résultats de la photobiomodulation.",
      price: 45,
      launchPrice: 45,
      forfaitPrice: 240,
      forfaitPromo: 30,
      duration: 45,
      category: 'Soins essentiels',
      featured: false,
      order: 5,
      active: true,
      benefits: [
        "Réduit l'acné",
        "Stimule le collagène",
        "Apaise les rougeurs",
        "Unifie le teint",
        "Régénère les cellules"
      ],
      process: [
        { title: "Diagnostic", description: "Choix des longueurs d'onde", duration: "5 min" },
        { title: "Préparation", description: "Nettoyage et gommage", duration: "10 min" },
        { title: "Séance LED", description: "Exposition personnalisée", duration: "20 min" },
        { title: "Masque booster", description: "Masque sous LED", duration: "10 min" }
      ],
      metaTitle: "LED Thérapie : Photobiomodulation | LAIA SKIN",
      metaDescription: "LED thérapie complète avec préparation. Traite acné, rides et rougeurs. 45€ la séance.",
      keywords: ["LED thérapie", "photothérapie", "anti-acné", "anti-âge", "lumière"]
    }
  })
  console.log("✅ 5. LED Thérapie créé")

  // Récapitulatif final
  console.log("\n🎉 SERVICES CRÉÉS AVEC SUCCÈS")
  console.log("================================")
  
  const services = await prisma.service.findMany({
    orderBy: { order: 'asc' }
  })

  console.log("\n🌟 SOIN SIGNATURE (1)")
  services.filter(s => s.category === 'Soin signature').forEach(s => {
    console.log(`• ${s.name} : ${s.price}€ (promo ${s.launchPrice}€) - ${s.duration}min`)
    console.log(`  Forfait 3 séances : ${s.forfaitPrice}€`)
  })

  console.log("\n✨ SOINS ESSENTIELS (4)")
  services.filter(s => s.category === 'Soins essentiels').forEach(s => {
    console.log(`• ${s.name} : ${s.price}€ - ${s.duration}min`)
    if (s.forfaitPrice) {
      const sessions = s.slug === 'led-therapie' ? 6 : 3
      console.log(`  Forfait ${sessions} séances : ${s.forfaitPrice}€`)
    }
  })

  console.log("\n📝 Notes importantes :")
  console.log("• Hydro'Naissance = Hydro'Cleaning + Renaissance (soin combiné)")
  console.log("• Hydro'Cleaning = Notre version de l'HydraFacial®")
  console.log("• Renaissance = Traitement Dermapen")
  console.log("• Tous les traitements respectent la limite légale de 0.5mm")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())