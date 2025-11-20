import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const services = await prisma.service.findMany({
    where: { organizationId: 'cmgy2fp4m0000bllzf8zwidq8' },
    select: { 
      id: true,
      name: true, 
      mainImage: true,
      gallery: true,
      active: true, 
      order: true,
      slug: true
    },
    orderBy: { order: 'asc' }
  })
  
  console.log(`Total services pour Laia Skin Institut: ${services.length}`)
  console.log(JSON.stringify(services, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
