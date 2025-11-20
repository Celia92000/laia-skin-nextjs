import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const orgId = '9739c909-c945-4548-bf53-4d226457f630'
  console.log('=== AUDIT COMPLET - LAIA SKIN INSTITUT ===\n')
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { OrganizationConfig: true }
  })
  console.log('ORGANISATION:')
  console.log('  Nom:', org?.name)
  console.log('  Slug:', org?.slug)
  console.log('  Plan:', org?.plan)
  console.log('  Domain:', org?.domain || 'Non configure')
  console.log('')
  if (org?.OrganizationConfig) {
    const config = org.OrganizationConfig
    console.log('CONFIGURATION:')
    console.log('  Site:', config.siteName)
    console.log('  Logo:', config.logoUrl)
    console.log('  Couleurs:', config.primaryColor, config.secondaryColor, config.accentColor)
    console.log('  Contact:', config.phone, config.contactEmail)
    console.log('')
  }
  const services = await prisma.service.findMany({
    where: { organizationId: orgId },
    select: { name: true, mainImage: true, active: true, price: true }
  })
  console.log('SERVICES:', services.length)
  services.forEach(s => console.log('  -', s.name, '-', s.price+'€', s.active ? 'ACTIF' : 'INACTIF', '| Image:', s.mainImage || 'MANQUANTE'))
  console.log('')
  const products = await prisma.product.findMany({
    where: { organizationId: orgId },
    select: { name: true, price: true, active: true }
  })
  console.log('PRODUITS:', products.length)
  products.forEach(p => console.log('  -', p.name, '-', p.price+'€', p.active ? 'ACTIF' : 'INACTIF'))
  console.log('')
  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { name: true, email: true, role: true }
  })
  console.log('UTILISATEURS:', users.length)
  users.forEach(u => console.log('  -', u.name, '('+u.email+')', '-', u.role))
  console.log('')
  const reservations = await prisma.reservation.count({ where: { organizationId: orgId } })
  console.log('RESERVATIONS:', reservations)
  const reviews = await prisma.review.count({ where: { organizationId: orgId } })
  console.log('AVIS:', reviews)
  const giftCards = await prisma.giftCard.count({ where: { organizationId: orgId } })
  console.log('CARTES CADEAUX:', giftCards)
  const galleryPhotos = await prisma.galleryPhoto.count({ where: { organizationId: orgId } })
  console.log('PHOTOS GALERIE:', galleryPhotos)
  const blogPosts = await prisma.blogPost.count({ where: { organizationId: orgId } })
  console.log('ARTICLES BLOG:', blogPosts)
}
main().catch(console.error).finally(() => prisma.$disconnect())
