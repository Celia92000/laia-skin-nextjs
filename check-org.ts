import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: 'laia-skin-institut' },
    select: { 
      id: true,
      name: true,
      slug: true,
      subdomain: true
    }
  })
  
  console.log('Organisation Laia Skin Institut:')
  console.log(JSON.stringify(org, null, 2))
  
  if (org) {
    const services = await prisma.service.findMany({
      where: { organizationId: org.id },
      select: { 
        id: true,
        name: true, 
        mainImage: true,
        gallery: true,
        active: true, 
        order: true
      },
      orderBy: { order: 'asc' }
    })
    
    console.log(`\nServices trouvés: ${services.length}`)
    console.log(JSON.stringify(services, null, 2))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
