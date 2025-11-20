import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const services = await prisma.service.findMany({
    where: { organizationId: '9739c909-c945-4548-bf53-4d226457f630' },
    select: { name: true, mainImage: true }
  })
  console.log('Images des services:')
  services.forEach(s => console.log(`${s.name}: ${s.mainImage}`))
}
main().catch(console.error).finally(() => prisma.$disconnect())
