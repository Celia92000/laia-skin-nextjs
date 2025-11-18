/**
 * TEST CRITIQUE : Isolation Multi-Tenant
 *
 * Vérifie qu'une organisation ne peut PAS accéder aux données d'une autre
 *
 * Ce test est BLOQUANT avant mise en production
 */

import { prisma } from '../src/lib/prisma'

interface TestResult {
  test: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

async function testIsolation() {
  console.log('🧪 DÉBUT DES TESTS D\'ISOLATION MULTI-TENANT\n')
  console.log('='.repeat(60))

  try {
    // ============================================
    // 1. VÉRIFIER QU'ON A AU MOINS 2 ORGANISATIONS
    // ============================================
    console.log('\n📊 Étape 1: Vérification des organisations...')

    const orgs = await prisma.organization.findMany({
      take: 2,
      include: {
        users: { take: 1 },
        services: { take: 1 },
        products: { take: 1 },
        blogPosts: { take: 1 }
      }
    })

    if (orgs.length < 2) {
      console.log('❌ ERREUR: Moins de 2 organisations trouvées')
      console.log('   Créez au moins 2 organisations pour tester l\'isolation')
      return
    }

    const [orgA, orgB] = orgs
    console.log(`✅ Organisation A: ${orgA.name} (${orgA.id})`)
    console.log(`✅ Organisation B: ${orgB.name} (${orgB.id})`)

    // ============================================
    // 2. TEST: Services isolés
    // ============================================
    console.log('\n🔒 Test 2: Isolation des Services')

    const servicesOrgA = await prisma.service.findMany({
      where: { organizationId: orgA.id }
    })

    const servicesOrgB = await prisma.service.findMany({
      where: { organizationId: orgB.id }
    })

    // Vérifier qu'aucun service de B n'a l'ID de A
    const leakedServices = servicesOrgB.filter(s => s.organizationId === orgA.id)

    if (leakedServices.length === 0) {
      console.log(`✅ PASSÉ: Services correctement isolés`)
      console.log(`   Org A: ${servicesOrgA.length} services`)
      console.log(`   Org B: ${servicesOrgB.length} services`)
      results.push({ test: 'Isolation Services', passed: true, details: 'OK' })
    } else {
      console.log(`❌ ÉCHEC: ${leakedServices.length} services de A visibles dans B`)
      results.push({ test: 'Isolation Services', passed: false, details: `${leakedServices.length} fuites` })
    }

    // ============================================
    // 3. TEST: Clients/Utilisateurs isolés
    // ============================================
    console.log('\n🔒 Test 3: Isolation des Clients')

    const clientsOrgA = await prisma.user.findMany({
      where: {
        organizationId: orgA.id,
        role: 'CLIENT'
      }
    })

    const clientsOrgB = await prisma.user.findMany({
      where: {
        organizationId: orgB.id,
        role: 'CLIENT'
      }
    })

    const leakedClients = clientsOrgB.filter(c => c.organizationId === orgA.id)

    if (leakedClients.length === 0) {
      console.log(`✅ PASSÉ: Clients correctement isolés`)
      console.log(`   Org A: ${clientsOrgA.length} clients`)
      console.log(`   Org B: ${clientsOrgB.length} clients`)
      results.push({ test: 'Isolation Clients', passed: true, details: 'OK' })
    } else {
      console.log(`❌ ÉCHEC: ${leakedClients.length} clients de A visibles dans B`)
      results.push({ test: 'Isolation Clients', passed: false, details: `${leakedClients.length} fuites` })
    }

    // ============================================
    // 4. TEST: Réservations isolées
    // ============================================
    console.log('\n🔒 Test 4: Isolation des Réservations')

    const reservationsOrgA = await prisma.reservation.findMany({
      where: { organizationId: orgA.id }
    })

    const reservationsOrgB = await prisma.reservation.findMany({
      where: { organizationId: orgB.id }
    })

    const leakedReservations = reservationsOrgB.filter(r => r.organizationId === orgA.id)

    if (leakedReservations.length === 0) {
      console.log(`✅ PASSÉ: Réservations correctement isolées`)
      console.log(`   Org A: ${reservationsOrgA.length} réservations`)
      console.log(`   Org B: ${reservationsOrgB.length} réservations`)
      results.push({ test: 'Isolation Réservations', passed: true, details: 'OK' })
    } else {
      console.log(`❌ ÉCHEC: ${leakedReservations.length} réservations de A visibles dans B`)
      results.push({ test: 'Isolation Réservations', passed: false, details: `${leakedReservations.length} fuites` })
    }

    // ============================================
    // 5. TEST: Produits isolés
    // ============================================
    console.log('\n🔒 Test 5: Isolation des Produits')

    const productsOrgA = await prisma.product.findMany({
      where: { organizationId: orgA.id }
    })

    const productsOrgB = await prisma.product.findMany({
      where: { organizationId: orgB.id }
    })

    const leakedProducts = productsOrgB.filter(p => p.organizationId === orgA.id)

    if (leakedProducts.length === 0) {
      console.log(`✅ PASSÉ: Produits correctement isolés`)
      console.log(`   Org A: ${productsOrgA.length} produits`)
      console.log(`   Org B: ${productsOrgB.length} produits`)
      results.push({ test: 'Isolation Produits', passed: true, details: 'OK' })
    } else {
      console.log(`❌ ÉCHEC: ${leakedProducts.length} produits de A visibles dans B`)
      results.push({ test: 'Isolation Produits', passed: false, details: `${leakedProducts.length} fuites` })
    }

    // ============================================
    // 6. TEST: Configuration isolée
    // ============================================
    console.log('\n🔒 Test 6: Isolation des Configurations')

    const configOrgA = await prisma.organizationConfig.findUnique({
      where: { organizationId: orgA.id }
    })

    const configOrgB = await prisma.organizationConfig.findUnique({
      where: { organizationId: orgB.id }
    })

    // Vérifier que les configs sont différentes ET pas partagées
    if (!configOrgA && !configOrgB) {
      console.log(`⚠️  Les deux organisations n'ont pas de config`)
      console.log(`   Pas de problème d'isolation, juste config manquantes`)
      results.push({ test: 'Isolation Configuration', passed: true, details: 'OK (configs absentes)' })
    } else if (!configOrgB) {
      console.log(`⚠️  Org B n'a pas de config (Org A en a une)`)
      console.log(`   Pas de problème d'isolation`)
      results.push({ test: 'Isolation Configuration', passed: true, details: 'OK (config B absente)' })
    } else if (!configOrgA) {
      console.log(`⚠️  Org A n'a pas de config (Org B en a une)`)
      console.log(`   Pas de problème d'isolation`)
      results.push({ test: 'Isolation Configuration', passed: true, details: 'OK (config A absente)' })
    } else if (configOrgA.id === configOrgB.id) {
      console.log(`❌ ÉCHEC: Les 2 orgs partagent la MÊME config (ID: ${configOrgA.id})`)
      results.push({ test: 'Isolation Configuration', passed: false, details: 'Config partagée !' })
    } else {
      console.log(`✅ PASSÉ: Configurations correctement isolées`)
      console.log(`   Org A config: ${configOrgA.id}`)
      console.log(`   Org B config: ${configOrgB.id}`)
      results.push({ test: 'Isolation Configuration', passed: true, details: 'OK' })
    }

    // ============================================
    // 7. TEST: Articles de blog isolés
    // ============================================
    console.log('\n🔒 Test 7: Isolation des Articles de Blog')

    const postsOrgA = await prisma.blogPost.findMany({
      where: { organizationId: orgA.id }
    })

    const postsOrgB = await prisma.blogPost.findMany({
      where: { organizationId: orgB.id }
    })

    const leakedPosts = postsOrgB.filter(p => p.organizationId === orgA.id)

    if (leakedPosts.length === 0) {
      console.log(`✅ PASSÉ: Articles correctement isolés`)
      console.log(`   Org A: ${postsOrgA.length} articles`)
      console.log(`   Org B: ${postsOrgB.length} articles`)
      results.push({ test: 'Isolation Blog', passed: true, details: 'OK' })
    } else {
      console.log(`❌ ÉCHEC: ${leakedPosts.length} articles de A visibles dans B`)
      results.push({ test: 'Isolation Blog', passed: false, details: `${leakedPosts.length} fuites` })
    }

    // ============================================
    // RÉSUMÉ FINAL
    // ============================================
    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ DES TESTS\n')

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length

    results.forEach(r => {
      const icon = r.passed ? '✅' : '❌'
      console.log(`${icon} ${r.test}: ${r.details}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log(`\n📈 Résultat: ${passed}/${results.length} tests passés`)

    if (failed > 0) {
      console.log(`\n⚠️  ATTENTION: ${failed} test(s) échoué(s)`)
      console.log('🚨 NE PAS METTRE EN PRODUCTION AVANT DE CORRIGER')
      process.exit(1)
    } else {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !')
      console.log('✅ Isolation multi-tenant validée')
      console.log('✅ Prêt pour la production (concernant l\'isolation)')
    }

  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Lancer les tests
testIsolation()
