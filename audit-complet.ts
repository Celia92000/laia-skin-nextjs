import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgId = '9739c909-c945-4548-bf53-4d226457f630'
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   AUDIT COMPLET - LAIA SKIN INSTITUT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // 1. Organisation
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { OrganizationConfig: true }
  })
  console.log('📋 ORGANISATION')
  console.log(`   Nom: ${org?.name}`)
  console.log(`   Slug: ${org?.slug}`)
  console.log(`   Subdomain: ${org?.subdomain}`)
  console.log(`   Plan: ${org?.plan}`)
  console.log(`   Domaine custom: ${org?.domain || 'Non configuré'}`)
  console.log(`   Créée le: ${org?.createdAt}\n`)
  
  // 2. Configuration
  if (org?.OrganizationConfig) {
    const config = org.OrganizationConfig
    console.log('⚙️  CONFIGURATION')
    console.log(`   Nom du site: ${config.siteName}`)
    console.log(`   Logo: ${config.logoUrl}`)
    console.log(`   Couleur primaire: ${config.primaryColor}`)
    console.log(`   Couleur secondaire: ${config.secondaryColor}`)
    console.log(`   Couleur accent: ${config.accentColor}`)
    console.log(`   Téléphone: ${config.phone}`)
    console.log(`   Email: ${config.contactEmail}`)
    console.log(`   Instagram: ${config.instagram ? '✅' : '❌'}`)
    console.log(`   Facebook: ${config.facebook ? '✅' : '❌'}`)
    console.log(`   TikTok: ${config.tiktok ? '✅' : '❌'}\n`)
  }
  
  // 3. Services
  const services = await prisma.service.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, slug: true, mainImage: true, active: true, price: true, order: true }
  })
  console.log(`💆 SERVICES (${services.length} total)`)
  services.forEach(s => {
    console.log(`   ${s.active ? '✅' : '❌'} ${s.name} - ${s.price}€`)
    console.log(`      Image: ${s.mainImage || 'Pas d\'image'}`)
    console.log(`      Slug: ${s.slug}`)
    console.log(`      Ordre: ${s.order}`)
  })
  console.log('')
  
  // 4. Produits
  const products = await prisma.product.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, price: true, stock: true, active: true }
  })
  console.log(`🛍️  PRODUITS (${products.length} total)`)
  products.forEach(p => {
    console.log(`   ${p.active ? '✅' : '❌'} ${p.name} - ${p.price}€ (Stock: ${p.stock})`)
  })
  console.log('')
  
  // 5. Articles de blog
  const blogPosts = await prisma.blogPost.findMany({
    where: { organizationId: orgId },
    select: { id: true, title: true, published: true, createdAt: true }
  })
  console.log(`📝 BLOG (${blogPosts.length} articles)`)
  blogPosts.forEach(b => {
    console.log(`   ${b.published ? '✅' : '❌'} ${b.title} (${b.createdAt.toLocaleDateString()})`)
  })
  console.log('')
  
  // 6. Utilisateurs
  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })
  console.log(`👥 UTILISATEURS (${users.length} total)`)
  users.forEach(u => {
    console.log(`   ${u.role === 'ADMIN' ? '👑' : u.role === 'EMPLOYEE' ? '👔' : '👤'} ${u.name} (${u.email}) - ${u.role}`)
  })
  console.log('')
  
  // 7. Réservations
  const reservations = await prisma.reservation.findMany({
    where: { organizationId: orgId },
    select: { id: true, date: true, status: true, totalPrice: true }
  })
  const reservationsByStatus = {
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  }
  console.log(`📅 RÉSERVATIONS (${reservations.length} total)`)
  console.log(`   En attente: ${reservationsByStatus.pending}`)
  console.log(`   Confirmées: ${reservationsByStatus.confirmed}`)
  console.log(`   Complétées: ${reservationsByStatus.completed}`)
  console.log(`   Annulées: ${reservationsByStatus.cancelled}`)
  console.log('')
  
  // 8. Avis clients
  const reviews = await prisma.review.findMany({
    where: { organizationId: orgId },
    select: { id: true, rating: true, approved: true }
  })
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A'
  console.log(`⭐ AVIS CLIENTS (${reviews.length} total)`)
  console.log(`   Note moyenne: ${avgRating}/5`)
  console.log(`   Approuvés: ${reviews.filter(r => r.approved).length}`)
  console.log(`   En attente: ${reviews.filter(r => !r.approved).length}`)
  console.log('')
  
  // 9. Cartes cadeaux
  const giftCards = await prisma.giftCard.findMany({
    where: { organizationId: orgId },
    select: { id: true, code: true, initialAmount: true, remainingAmount: true, expiresAt: true }
  })
  console.log(`🎁 CARTES CADEAUX (${giftCards.length} total)`)
  const activeCards = giftCards.filter(g => g.remainingAmount > 0 && (!g.expiresAt || g.expiresAt > new Date())).length
  console.log(`   Actives: ${activeCards}`)
  console.log(`   Épuisées: ${giftCards.filter(g => g.remainingAmount === 0).length}`)
  console.log('')
  
  // 10. Galerie photos
  const galleryPhotos = await prisma.galleryPhoto.findMany({
    where: { organizationId: orgId },
    select: { id: true, url: true, title: true, active: true }
  })
  console.log(`📸 GALERIE PHOTOS (${galleryPhotos.length} total)`)
  galleryPhotos.forEach(p => {
    console.log(`   ${p.active ? '✅' : '❌'} ${p.title || 'Sans titre'}`)
  })
  console.log('')
  
  // 11. Factures
  const invoices = await prisma.invoice.findMany({
    where: { organizationId: orgId },
    select: { id: true, amount: true, status: true }
  })
  console.log(`💰 FACTURES (${invoices.length} total)`)
  console.log(`   Payées: ${invoices.filter(i => i.status === 'paid').length}`)
  console.log(`   En attente: ${invoices.filter(i => i.status === 'pending').length}`)
  console.log('')
  
  // 12. Templates personnalisés
  const template = await prisma.websiteTemplate.findFirst({
    where: { organizationId: orgId },
    select: { id: true, name: true }
  })
  console.log(`🎨 TEMPLATE SITE WEB`)
  console.log(`   ${template ? `✅ ${template.name}` : '❌ Template par défaut'}`)
  console.log('')
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   FIN DE L\'AUDIT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
