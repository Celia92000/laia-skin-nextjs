import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      plan: true,
      status: true,
      addons: true,
      trialEndsAt: true
    }
  })

  console.log('📊 Organisations trouvées:', orgs.length)
  console.log('')
  
  orgs.forEach(org => {
    console.log(`- ${org.name}`)
    console.log(`  Plan: ${org.plan}`)
    console.log(`  Statut: ${org.status}`)
    console.log(`  Add-ons: ${org.addons || 'null'}`)
    console.log(`  Essai jusqu'au: ${org.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString('fr-FR') : 'N/A'}`)
    console.log('')
  })

  // Compter par plan
  const counts = {
    SOLO: 0,
    DUO: 0,
    TEAM: 0,
    PREMIUM: 0
  }

  orgs.forEach(org => {
    if (org.plan === 'SOLO') counts.SOLO++
    if (org.plan === 'DUO') counts.DUO++
    if (org.plan === 'TEAM') counts.TEAM++
    if (org.plan === 'PREMIUM') counts.PREMIUM++
  })

  console.log('📈 Répartition par plan:')
  console.log(`  SOLO: ${counts.SOLO}`)
  console.log(`  DUO: ${counts.DUO}`)
  console.log(`  TEAM: ${counts.TEAM}`)
  console.log(`  PREMIUM: ${counts.PREMIUM}`)

  await prisma.$disconnect()
}

main()
