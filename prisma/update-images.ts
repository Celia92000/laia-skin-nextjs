import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Mettre à jour les images des services
  await prisma.service.update({
    where: { slug: 'hydrafacial' },
    data: { 
      mainImage: '/services/hydro-cleaning.jpg',
      gallery: JSON.stringify(['/services/hydro-cleaning.jpg', '/services/hydro-naissance.jpg'])
    }
  })

  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: { 
      mainImage: '/services/bb-glow.jpg',
      gallery: JSON.stringify(['/services/bb-glow.jpg'])
    }
  })

  await prisma.service.update({
    where: { slug: 'microneedling' },
    data: { 
      mainImage: '/services/renaissance.jpg',
      gallery: JSON.stringify(['/services/renaissance.jpg'])
    }
  })

  await prisma.service.update({
    where: { slug: 'led-therapie' },
    data: { 
      mainImage: '/services/led-therapie.jpg',
      gallery: JSON.stringify(['/services/led-therapie.jpg'])
    }
  })

  console.log('✅ Images mises à jour pour tous les services')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })