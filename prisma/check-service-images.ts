import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const services = await prisma.service.findMany({
    select: {
      name: true,
      slug: true,
      mainImage: true,
      gallery: true
    },
    orderBy: { order: 'asc' }
  })
  
  console.log('🖼️ Images des services:')
  console.log('======================')
  services.forEach(s => {
    console.log(`\n${s.name} (${s.slug}):`)
    console.log(`  Image principale: ${s.mainImage || 'Aucune'}`)
    if (s.gallery) {
      const galleryImages = JSON.parse(s.gallery)
      if (galleryImages.length > 0) {
        console.log(`  Galerie: ${galleryImages.join(', ')}`)
      }
    }
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())