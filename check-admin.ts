import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('=== COMPTES ADMIN ===\n')

  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['ORG_ADMIN', 'SUPER_ADMIN', 'ORG_OWNER'] }
    },
    select: {
      id: true,
      email: true,
      role: true,
      organizationId: true
    },
    orderBy: { email: 'asc' },
    take: 10
  })

  console.log(`Trouvé ${admins.length} comptes admin:\n`)

  for (const admin of admins) {
    console.log(`📧 ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Org ID: ${admin.organizationId || 'N/A'}`)
    console.log('')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
