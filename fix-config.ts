import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('=== CORRECTION DE LA CONFIGURATION ===\n')
  
  const org = await prisma.organization.findFirst({
    where: { slug: 'laia-skin-institut' }
  })
  
  if (!org) {
    console.log('Erreur: Organisation introuvable')
    return
  }
  
  // Configurer le logo et l'email
  console.log('Configuration du logo et de l email...')
  await prisma.organizationConfig.update({
    where: { organizationId: org.id },
    data: { 
      logoUrl: '/logo-laia-skin.png',
      contactEmail: 'contact@laiaskininstitut.fr'
    }
  })
  console.log('✅ Logo: /logo-laia-skin.png')
  console.log('✅ Email: contact@laiaskininstitut.fr\n')
  
  console.log('=== VERIFICATION ===\n')
  
  const updated = await prisma.organization.findFirst({
    where: { id: org.id },
    include: { OrganizationConfig: true }
  })
  
  console.log('Organisation:', updated?.name)
  console.log('  Logo:', updated?.OrganizationConfig?.logoUrl || 'MANQUANT')
  console.log('  Email:', updated?.OrganizationConfig?.contactEmail || 'MANQUANT')
  console.log('  Telephone:', updated?.OrganizationConfig?.phone || 'MANQUANT')
  console.log('\n✨ Configuration corrigee!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
