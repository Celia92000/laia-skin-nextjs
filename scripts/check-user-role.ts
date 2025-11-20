import { prisma } from '../src/lib/prisma'

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@laiaskin.com' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true
    }
  })
  
  console.log('Utilisateur admin@laiaskin.com:', JSON.stringify(user, null, 2))
  
  // Vérifier aussi celia@laiaskin.com
  const user2 = await prisma.user.findFirst({
    where: { email: 'celia@laiaskin.com' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true
    }
  })
  
  console.log('\nUtilisateur celia@laiaskin.com:', JSON.stringify(user2, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
