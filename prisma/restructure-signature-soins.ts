import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. HYDRO'CLEANING - Focus Nettoyage & Hydratation
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      name: "Hydro'Cleaning", 
      shortDescription: 'Le nettoyage profond nouvelle génération avec masque purifiant',
      description: `L'Hydro'Cleaning est notre soin de nettoyage en profondeur utilisant la technologie d'hydradermabrasion. Idéal pour purifier, désincruster et hydrater, ce soin se termine par un masque purifiant adapté. Parfait pour les peaux mixtes à grasses ou congestionnées.`,
      duration: 60,
      price: 150,
      category: 'Soins essentiels',
      process: JSON.stringify([
        {
          step: 1,
          title: 'Diagnostic',
          description: 'Analyse de peau',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Double nettoyage',
          description: 'Démaquillage et nettoyage profond',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Hydradermabrasion',
          description: 'Technologie vortex pour nettoyer et hydrater',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'Extraction',
          description: 'Extraction manuelle si nécessaire',
          duration: '5 min'
        },
        {
          step: 5,
          title: 'Masque Purifiant',
          description: 'Masque argile ou charbon selon le type de peau',
          duration: '15 min'
        }
      ])
    }
  })

  // 2. RENAISSANCE - Focus Anti-âge & Fermeté
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      name: 'Renaissance',
      shortDescription: 'Le soin anti-âge avec Dermapen et masque bio-cellulose',
      description: `Le soin Renaissance est notre protocole anti-âge utilisant le Dermapen pour stimuler le renouvellement cellulaire. Enrichi d'un masque bio-cellulose aux peptides, ce soin cible les rides, le relâchement et le manque d'éclat. Idéal à partir de 35 ans.`,
      duration: 75,
      price: 220,
      category: 'Soins anti-âge',
      process: JSON.stringify([
        {
          step: 1,
          title: 'Préparation',
          description: 'Nettoyage et préparation de la peau',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Dermapen',
          description: 'Micro-perforation avec sérums anti-âge',
          duration: '30 min'
        },
        {
          step: 3,
          title: 'LED Rouge',
          description: 'Stimulation du collagène',
          duration: '15 min'
        },
        {
          step: 4,
          title: 'Masque Bio-cellulose',
          description: 'Masque premium aux peptides et acide hyaluronique',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'Massage & Finition',
          description: 'Massage lifting et protection',
          duration: '5 min'
        }
      ])
    }
  })

  // 3. HYDRO'NAISSANCE - Le Soin Signature Ultime
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      name: "Hydro'Naissance",
      shortDescription: 'Le soin signature complet : Hydro\'Cleaning + Dermapen + Masque Gold',
      description: `L'Hydro'Naissance est notre soin le plus complet combinant tous nos savoir-faire. Ce protocole d'exception associe l'hydradermabrasion de l'Hydro'Cleaning, la stimulation du Dermapen et se termine par un luxueux masque à l'or 24 carats. Une véritable renaissance pour votre peau.`,
      duration: 90,
      price: 350,
      launchPrice: 290,
      category: 'Soins signature',
      featured: true,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Rituel d\'accueil',
          description: 'Diagnostic complet et préparation',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Hydro\'Cleaning Express',
          description: 'Nettoyage profond par hydradermabrasion',
          duration: '25 min'
        },
        {
          step: 3,
          title: 'Dermapen Ciblé',
          description: 'Traitement des zones spécifiques',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'LED Thérapie',
          description: 'Photobiomodulation personnalisée',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'Masque Gold 24K',
          description: 'Masque à l\'or luxueux pour un effet lifting immédiat',
          duration: '15 min'
        }
      ])
    }
  })

  // Ajouter aussi le BB Glow qui a son propre masque
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      process: JSON.stringify([
        {
          step: 1,
          title: 'Consultation',
          description: 'Choix de la teinte BB Glow',
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
          title: 'Application BB Sérum',
          description: 'Dermapen avec sérum teinté',
          duration: '30 min'
        },
        {
          step: 4,
          title: 'Masque Apaisant',
          description: 'Masque hydrogel pour calmer la peau',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Protection',
          description: 'Sérum et SPF',
          duration: '5 min'
        }
      ])
    }
  })

  console.log("✅ Soins signature restructurés avec différenciation claire :")
  console.log("")
  console.log("1. HYDRO'CLEANING (60min - 150€)")
  console.log("   → Focus: Nettoyage profond")
  console.log("   → Masque: Purifiant (argile/charbon)")
  console.log("")
  console.log("2. RENAISSANCE (75min - 220€)")
  console.log("   → Focus: Anti-âge avec Dermapen")
  console.log("   → Masque: Bio-cellulose peptides")
  console.log("")
  console.log("3. HYDRO'NAISSANCE (90min - 350€)")
  console.log("   → Focus: Combinaison ultime")
  console.log("   → Masque: Gold 24K luxe")
  console.log("")
  console.log("Chaque soin a maintenant son identité propre et son masque spécifique !")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })