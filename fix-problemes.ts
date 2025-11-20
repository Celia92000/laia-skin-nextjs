import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('=== CORRECTION DES PROBLEMES ===\n')
  
  const org = await prisma.organization.findFirst({
    where: { slug: 'laia-skin-institut' }
  })
  
  if (!org) {
    console.log('Erreur: Organisation introuvable')
    return
  }
  
  // 1. Activer l'organisation
  console.log('1. Activation de l organisation...')
  await prisma.organization.update({
    where: { id: org.id },
    data: { active: true }
  })
  console.log('   ✅ Organisation activee\n')
  
  // 2. Configurer le logo
  console.log('2. Configuration du logo...')
  await prisma.organizationConfig.update({
    where: { organizationId: org.id },
    data: { 
      logoUrl: '/logo-laia-skin.png'
    }
  })
  console.log('   ✅ Logo configure: /logo-laia-skin.png\n')
  
  // 3. Configurer l'email de contact
  console.log('3. Configuration de l email de contact...')
  await prisma.organizationConfig.update({
    where: { organizationId: org.id },
    data: { 
      contactEmail: 'contact@laiaskininstitut.fr'
    }
  })
  console.log('   ✅ Email configure: contact@laiaskininstitut.fr\n')
  
  console.log('=== VERIFICATION ===\n')
  
  const updated = await prisma.organization.findFirst({
    where: { id: org.id },
    include: { OrganizationConfig: true }
  })
  
  console.log('Organisation:', updated?.name)
  console.log('  Statut:', updated?.active ? '✅ ACTIVE' : '❌ INACTIVE')
  console.log('  Logo:', updated?.OrganizationConfig?.logoUrl || '❌ MANQUANT')
  console.log('  Email:', updated?.OrganizationConfig?.contactEmail || '❌ MANQUANT')
  console.log('\n✨ Tous les problemes ont ete corriges!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
