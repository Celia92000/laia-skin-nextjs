import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgId = '9739c909-c945-4548-bf53-4d226457f630'
  
  console.log('=== AUDIT DES DONNÉES - LAIA SKIN INSTITUT ===\n')
  
  // Services
  const services = await prisma.service.count({ where: { organizationId: orgId, active: true } })
  console.log(`✅ Services actifs: ${services}`)
  
  // Products
  const products = await prisma.product.count({ where: { organizationId: orgId, active: true } })
  console.log(`✅ Produits actifs: ${products}`)
  
  // Blog posts
  const blogPosts = await prisma.blogPost.count({ where: { organizationId: orgId, published: true } })
  console.log(`✅ Articles de blog: ${blogPosts}`)
  
  // Reviews
  const reviews = await prisma.review.count({ where: { organizationId: orgId, approved: true } })
  console.log(`✅ Avis clients: ${reviews}`)
  
  // Users/Clients
  const users = await prisma.user.count({ where: { organizationId: orgId } })
  console.log(`✅ Utilisateurs: ${users}`)
  
  // Reservations
  const reservations = await prisma.reservation.count({ where: { organizationId: orgId } })
  console.log(`✅ Réservations: ${reservations}`)
  
  // Gift cards
  const giftCards = await prisma.giftCard.count({ where: { organizationId: orgId } })
  console.log(`✅ Cartes cadeaux: ${giftCards}`)
  
  // Gallery photos
  const galleryPhotos = await prisma.galleryPhoto.count({ where: { organizationId: orgId, active: true } })
  console.log(`✅ Photos de galerie: ${galleryPhotos}`)
  
  // Configuration
  const config = await prisma.organizationConfig.findUnique({ 
    where: { organizationId: orgId },
    select: { siteName: true, logoUrl: true, primaryColor: true }
  })
  console.log(`✅ Configuration: ${config ? 'OK' : 'MANQUANTE'}`)
  if (config) {
    console.log(`   - Nom du site: ${config.siteName}`)
    console.log(`   - Logo: ${config.logoUrl}`)
    console.log(`   - Couleur primaire: ${config.primaryColor}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
