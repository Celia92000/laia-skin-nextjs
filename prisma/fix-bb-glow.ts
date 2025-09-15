import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: { duration: 60 }
  })
  
  console.log('✅ Durée du BB Glow corrigée : 60 minutes (1h)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })