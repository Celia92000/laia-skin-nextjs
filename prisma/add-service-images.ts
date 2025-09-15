import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🖼️ Ajout des images aux services...")

  // 1. Hydro'Naissance
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      mainImage: '/services/hydro-naissance.jpg',
      gallery: JSON.stringify([
        '/services/hydro-naissance.jpg',
        '/images/hydro-naissance.jpg'
      ])
    }
  })
  console.log("✅ Image ajoutée pour Hydro'Naissance")

  // 2. Renaissance (Dermapen)
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      mainImage: '/services/renaissance.jpg',
      gallery: JSON.stringify([
        '/services/renaissance.jpg',
        '/images/renaissance.jpg'
      ])
    }
  })
  console.log("✅ Image ajoutée pour Renaissance")

  // 3. Hydro'Cleaning
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      mainImage: '/services/hydro-cleaning.jpg',
      gallery: JSON.stringify([
        '/services/hydro-cleaning.jpg',
        '/images/hydro-cleaning.jpg'
      ])
    }
  })
  console.log("✅ Image ajoutée pour Hydro'Cleaning")

  // 4. BB Glow
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      mainImage: '/services/bb-glow.jpg',
      gallery: JSON.stringify([
        '/services/bb-glow.jpg',
        '/images/bb-glow.jpg'
      ])
    }
  })
  console.log("✅ Image ajoutée pour BB Glow")

  // 5. LED Thérapie
  await prisma.service.update({
    where: { slug: 'led-therapie' },
    data: {
      mainImage: '/services/led-therapie.jpg',
      gallery: JSON.stringify([
        '/services/led-therapie.jpg',
        '/images/led-therapie.jpg'
      ])
    }
  })
  console.log("✅ Image ajoutée pour LED Thérapie")

  console.log("\n✅ Toutes les images ont été ajoutées aux services !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())