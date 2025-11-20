import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('=== AUDIT COMPLET - TOUTES LES ORGANISATIONS ===\n')
  
  const orgs = await prisma.organization.findMany({
    where: {
      OR: [
        { slug: 'laia-skin-institut' },
        { slug: { contains: 'laia' } },
        { name: { contains: 'LAIA', mode: 'insensitive' } }
      ]
    },
    include: { OrganizationConfig: true }
  })
  
  console.log(`Organisations trouvées: ${orgs.length}\n`)
  
  for (const org of orgs) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📋 ${org.name.toUpperCase()}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`   ID: ${org.id}`)
    console.log(`   Slug: ${org.slug}`)
    console.log(`   Subdomain: ${org.subdomain}`)
    console.log(`   Plan: ${org.plan}`)
    console.log(`   Actif: ${org.active ? 'OUI' : 'NON'}`)
    
    if (org.OrganizationConfig) {
      const c = org.OrganizationConfig
      console.log(`\n   Configuration:`)
      console.log(`   - Site: ${c.siteName}`)
      console.log(`   - Logo: ${c.logoUrl || 'MANQUANT'}`)
      console.log(`   - Couleurs: ${c.primaryColor}`)
      console.log(`   - Email: ${c.contactEmail || 'MANQUANT'}`)
      console.log(`   - Téléphone: ${c.phone || 'MANQUANT'}`)
    } else {
      console.log(`   ⚠️  Configuration MANQUANTE`)
    }
    
    const services = await prisma.service.count({ where: { organizationId: org.id } })
    const products = await prisma.product.count({ where: { organizationId: org.id } })
    const users = await prisma.user.count({ where: { organizationId: org.id } })
    const reservations = await prisma.reservation.count({ where: { organizationId: org.id } })
    
    console.log(`\n   Données:`)
    console.log(`   - Services: ${services}`)
    console.log(`   - Produits: ${products}`)
    console.log(`   - Utilisateurs: ${users}`)
    console.log(`   - Réservations: ${reservations}`)
  }
  
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log('FIN AUDIT')
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
