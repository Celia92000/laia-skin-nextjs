import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDashboardSync() {
  try {
    console.log('🧪 Test de synchronisation des données du dashboard...\n')

    // 1. Compter les organisations
    const orgs = await prisma.organization.findMany()
    const activeOrgs = orgs.filter(o => o.status === 'ACTIVE')
    const trialOrgs = orgs.filter(o => o.status === 'TRIAL')
    const suspendedOrgs = orgs.filter(o => o.status === 'SUSPENDED')
    const cancelledOrgs = orgs.filter(o => o.status === 'CANCELLED')

    console.log('📊 ORGANISATIONS:')
    console.log(`   Total: ${orgs.length}`)
    console.log(`   ✅ ACTIVE: ${activeOrgs.length}`)
    console.log(`   🔄 TRIAL: ${trialOrgs.length}`)
    console.log(`   ⏸️  SUSPENDED: ${suspendedOrgs.length}`)
    console.log(`   ❌ CANCELLED: ${cancelledOrgs.length}`)

    // 2. Compter les utilisateurs
    const users = await prisma.user.findMany({
      select: { role: true, organizationId: true }
    })
    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN')
    const clients = users.filter(u => u.role === 'CLIENT')
    const admins = users.filter(u => u.role !== 'SUPER_ADMIN' && u.role !== 'CLIENT')

    console.log('\n👥 UTILISATEURS:')
    console.log(`   Total: ${users.length}`)
    console.log(`   🔑 Super Admins: ${superAdmins.length}`)
    console.log(`   👔 Admins/Staff: ${admins.length}`)
    console.log(`   👤 Clients: ${clients.length}`)

    // 3. Compter les réservations
    const reservations = await prisma.reservation.findMany({
      select: { status: true, organizationId: true }
    })
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed')
    const pendingReservations = reservations.filter(r => r.status === 'pending')
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled')

    console.log('\n📅 RÉSERVATIONS:')
    console.log(`   Total: ${reservations.length}`)
    console.log(`   ✅ Confirmées: ${confirmedReservations.length}`)
    console.log(`   ⏳ En attente: ${pendingReservations.length}`)
    console.log(`   ❌ Annulées: ${cancelledReservations.length}`)

    // 4. Vérifier les Reviews
    const reviews = await prisma.review.findMany({
      select: { organizationId: true, approved: true }
    })
    const reviewsWithOrg = reviews.filter(r => r.organizationId !== null)
    const reviewsApproved = reviews.filter(r => r.approved)

    console.log('\n⭐ AVIS:')
    console.log(`   Total: ${reviews.length}`)
    console.log(`   📋 Avec organizationId: ${reviewsWithOrg.length}`)
    console.log(`   ✅ Approuvés: ${reviewsApproved.length}`)

    // 5. Vérifier les colonnes OAuth
    const orgWithOAuth = await prisma.organization.findFirst({
      select: {
        planityConnected: true,
        treatwellConnected: true,
        paypalConnected: true,
        sumupConnected: true,
        googleCalendarConnected: true
      }
    })

    console.log('\n🔗 COLONNES OAUTH (test sur 1ère org):')
    console.log(`   ✅ planityConnected: ${typeof orgWithOAuth?.planityConnected}`)
    console.log(`   ✅ treatwellConnected: ${typeof orgWithOAuth?.treatwellConnected}`)
    console.log(`   ✅ paypalConnected: ${typeof orgWithOAuth?.paypalConnected}`)
    console.log(`   ✅ sumupConnected: ${typeof orgWithOAuth?.sumupConnected}`)
    console.log(`   ✅ googleCalendarConnected: ${typeof orgWithOAuth?.googleCalendarConnected}`)

    // 6. Vérifier la cohérence : réservations appartiennent à des orgs existantes
    const orgIds = new Set(orgs.map(o => o.id))
    const orphanReservations = reservations.filter(r => r.organizationId && !orgIds.has(r.organizationId))

    console.log('\n🔍 COHÉRENCE DES DONNÉES:')
    console.log(`   ${orphanReservations.length === 0 ? '✅' : '❌'} Réservations orphelines: ${orphanReservations.length}`)

    // Vérifier users appartiennent à des orgs
    const usersWithOrg = users.filter(u => u.organizationId !== null)
    const orphanUsers = usersWithOrg.filter(u => u.organizationId && !orgIds.has(u.organizationId))
    console.log(`   ${orphanUsers.length === 0 ? '✅' : '❌'} Utilisateurs orphelins: ${orphanUsers.length}`)

    // 7. Résumé
    console.log('\n✨ RÉSULTAT:')
    if (orphanReservations.length === 0 && orphanUsers.length === 0) {
      console.log('   ✅ Toutes les données sont synchronisées et cohérentes !')
      console.log('   ✅ Le dashboard Super Admin affichera des données correctes')
    } else {
      console.log('   ⚠️  Problèmes de cohérence détectés')
      console.log('   ⚠️  Certaines relations sont cassées')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDashboardSync()
