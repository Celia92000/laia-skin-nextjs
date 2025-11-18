import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // SOIN SIGNATURE (1 seul)
  // Hydro'Naissance - LE soin signature
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      category: 'Soin signature',
      featured: true,
      order: 1,
      price: 350,
      name: "Hydro'Naissance",
      shortDescription: 'Le soin signature ultime combinant toutes nos expertises'
    }
  })

  // SOINS ESSENTIELS (4 soins)
  
  // 1. Renaissance
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      category: 'Soins essentiels',
      featured: false,
      order: 2,
      price: 220,
      name: 'Renaissance'
    }
  })

  // 2. Hydro'Cleaning  
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      category: 'Soins essentiels',
      featured: false,
      order: 3,
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
      price: 150,
      canBeOption: false, // Plus une option, c'est un soin essentiel
      name: 'BB Glow'
    }
  })

  // 4. LED Thérapie (la séance complète)
  await prisma.service.update({
    where: { slug: 'seance-led-complete' },
    data: {
      slug: 'led-therapie',
      category: 'Soins essentiels',
      featured: false,
      order: 5,
      price: 120,
      name: 'LED Thérapie',
      shortDescription: 'Soin complet avec nettoyage, gommage, masque et LED'
    }
  })

  // Désactiver les anciens soins non utilisés
  await prisma.service.updateMany({
    where: {
      slug: {
        in: ['led-therapie-old', 'bb-glow-express', 'hydrafacial', 'microneedling', 'dermapen']
      }
    },
    data: {
      active: false
    }
  })

  // Supprimer l'ancienne LED Express si elle existe
  try {
    await prisma.service.delete({
      where: { slug: 'led-therapie' }
    })
  } catch (e) {
    // Si elle n'existe pas, pas de problème
  }

  console.log("✅ Gamme réorganisée avec succès !")
  console.log("")
  console.log("🌟 SOIN SIGNATURE (1)")
  console.log("   • Hydro'Naissance - 350€")
  console.log("")
  console.log("✨ SOINS ESSENTIELS (4)")
  console.log("   • Renaissance - 220€")
  console.log("   • Hydro'Cleaning - 150€") 
  console.log("   • BB Glow - 150€")
  console.log("   • LED Thérapie - 120€")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })