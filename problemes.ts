import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: 'laia-skin-institut' },
    include: { OrganizationConfig: true }
  })
  
  console.log('=== PROBLEMES DETECTES ===\n')
  let count = 0
  
  if (!org) {
    console.log('ERREUR CRITIQUE: Organisation introuvable!')
    return
  }
  
  if (!org.active) {
    count++
    console.log(`${count}. Organisation INACTIVE`)
    console.log('   Solution: Activer l organisation\n')
  }
  
  if (!org.OrganizationConfig?.logoUrl) {
    count++
    console.log(`${count}. Logo manquant`)
    console.log('   Solution: Configurer logoUrl\n')
  }
  
  if (!org.OrganizationConfig?.contactEmail) {
    count++
    console.log(`${count}. Email de contact manquant`)
    console.log('   Solution: Configurer contactEmail\n')
  }
  
  const servicesWithoutImages = await prisma.service.count({
    where: { 
      organizationId: org.id,
      mainImage: null,
      active: true
    }
  })
  
  if (servicesWithoutImages > 0) {
    count++
    console.log(`${count}. ${servicesWithoutImages} service(s) actif(s) sans image\n`)
  }
  
  const galleryPhotos = await prisma.galleryPhoto.count({
    where: { organizationId: org.id, active: true }
  })
  
  if (galleryPhotos === 0) {
    count++
    console.log(`${count}. Aucune photo dans la galerie`)
    console.log('   Info: Fonctionnalite nouvelle, normal si pas configure\n')
  }
  
  if (count === 0) {
    console.log('AUCUN PROBLEME DETECTE! Tout est OK.\n')
  } else {
    console.log(`\n=== TOTAL: ${count} probleme(s) trouve(s) ===`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
