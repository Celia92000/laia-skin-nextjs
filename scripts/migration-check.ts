import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExistingData() {
  try {
    console.log('📊 Vérification des données existantes...\n')

    // Compter les utilisateurs par rôle
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    })

    console.log('👥 Utilisateurs trouvés:', users.length)
    const roleCount: Record<string, number> = {}
    users.forEach(user => {
      const role = user.role || 'undefined'
      roleCount[role] = (roleCount[role] || 0) + 1
    })
    console.log('Rôles:', roleCount)

    // Services
    const servicesCount = await prisma.service.count()
    console.log('\n💆 Services:', servicesCount)

    // Produits
    const productsCount = await prisma.product.count()
    console.log('🛍️ Produits:', productsCount)

    // Blog posts
    const blogPostsCount = await prisma.blogPost.count()
    console.log('📝 Articles de blog:', blogPostsCount)

    // Réservations
    const reservationsCount = await prisma.reservation.count()
    console.log('📅 Réservations:', reservationsCount)

    // Working hours
    const workingHoursCount = await prisma.workingHours.count()
    console.log('🕒 Horaires:', workingHoursCount)

    // Blocked slots
    const blockedSlotsCount = await prisma.blockedSlot.count()
    console.log('🚫 Créneaux bloqués:', blockedSlotsCount)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingData()
