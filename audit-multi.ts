import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  console.log('=== AUDIT - ORGANISATIONS LAIA ===\n')
  const orgs = await prisma.organization.findMany({
    where: {
      OR: [
        { slug: 'laia-skin-institut' },
        { slug: { contains: 'laia' } }
      ]
    },
    include: { OrganizationConfig: true }
  })
  console.log('Organisations trouvees:', orgs.length, '\n')
  for (const org of orgs) {
    console.log('---', org.name, '---')
    console.log('  Slug:', org.slug)
    console.log('  Plan:', org.plan)
    console.log('  Actif:', org.active ? 'OUI' : 'NON')
    if (org.OrganizationConfig) {
      console.log('  Site:', org.OrganizationConfig.siteName)
      console.log('  Logo:', org.OrganizationConfig.logoUrl || 'MANQUANT')
    }
    const services = await prisma.service.count({ where: { organizationId: org.id } })
    const users = await prisma.user.count({ where: { organizationId: org.id } })
    console.log('  Services:', services)
    console.log('  Utilisateurs:', users)
    console.log('')
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
