/**
 * Vérifier les champs NULL avant de les rendre obligatoires
 */

import { prisma } from '../src/lib/prisma'

async function checkNullFields() {
  console.log('\n🔍 VÉRIFICATION DES CHAMPS NULL AVANT NETTOYAGE\n')
  console.log('='.repeat(60))

  const issues: string[] = []

  // 1. Reservation.organizationId
  const reservationsWithoutOrg = await prisma.reservation.count({
    where: { organizationId: null }
  })
  console.log(`\n📅 Reservation.organizationId null: ${reservationsWithoutOrg}`)
  if (reservationsWithoutOrg > 0) {
    issues.push(`${reservationsWithoutOrg} Reservations sans organizationId`)
  }

  // 2. Service.organizationId
  const servicesWithoutOrg = await prisma.service.count({
    where: { organizationId: null }
  })
  console.log(`🛍️  Service.organizationId null: ${servicesWithoutOrg}`)
  if (servicesWithoutOrg > 0) {
    issues.push(`${servicesWithoutOrg} Services sans organizationId`)
  }

  // 3. BlogPost.organizationId
  const postsWithoutOrg = await prisma.blogPost.count({
    where: { organizationId: null }
  })
  console.log(`📝 BlogPost.organizationId null: ${postsWithoutOrg}`)
  if (postsWithoutOrg > 0) {
    issues.push(`${postsWithoutOrg} BlogPosts sans organizationId`)
  }

  // 4. WorkingHours.locationId
  const workingHoursWithoutLocation = await prisma.workingHours.count({
    where: { locationId: null }
  })
  console.log(`⏰ WorkingHours.locationId null: ${workingHoursWithoutLocation}`)
  if (workingHoursWithoutLocation > 0) {
    issues.push(`${workingHoursWithoutLocation} WorkingHours sans locationId`)
  }

  // 5. Product.organizationId
  const productsWithoutOrg = await prisma.product.count({
    where: { organizationId: null }
  })
  console.log(`🎁 Product.organizationId null: ${productsWithoutOrg}`)
  if (productsWithoutOrg > 0) {
    issues.push(`${productsWithoutOrg} Products sans organizationId`)
  }

  console.log('\n' + '='.repeat(60))

  if (issues.length === 0) {
    console.log('\n✅ AUCUN PROBLÈME DÉTECTÉ !')
    console.log('✅ Tous les champs "nullable temporairement" sont remplis')
    console.log('✅ On peut les rendre obligatoires en toute sécurité\n')
    return true
  } else {
    console.log('\n⚠️  PROBLÈMES DÉTECTÉS :\n')
    issues.forEach(issue => console.log(`   ❌ ${issue}`))
    console.log('\n🚨 NE PAS RENDRE CES CHAMPS OBLIGATOIRES AVANT DE CORRIGER')
    console.log('💡 Solution : Remplir les champs NULL avec des valeurs par défaut\n')
    return false
  }

  await prisma.$disconnect()
}

checkNullFields().then((success) => {
  process.exit(success ? 0 : 1)
})
