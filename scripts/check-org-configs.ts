/**
 * Vérifier les configurations des organisations
 */

import { prisma } from '../src/lib/prisma'

async function checkConfigs() {
  const orgs = await prisma.organization.findMany({
    include: {
      config: true
    }
  })

  console.log('\n📊 CONFIGURATIONS DES ORGANISATIONS\n')
  console.log('='.repeat(60))

  for (const org of orgs) {
    console.log(`\n🏢 ${org.name} (${org.id})`)
    console.log(`   Statut: ${org.status}`)
    console.log(`   Config: ${org.config ? '✅ Présente (ID: ' + org.config.id + ')' : '❌ Absente'}`)

    if (org.config) {
      console.log(`   - Site Name: ${org.config.siteName}`)
      console.log(`   - Primary Color: ${org.config.primaryColor}`)
    } else {
      console.log(`   ⚠️ Cette organisation n'a pas de configuration`)
      console.log(`   → Cela peut causer des problèmes`)
    }
  }

  console.log('\n' + '='.repeat(60))

  // Vérifier s'il y a des configs orphelines
  const configs = await prisma.organizationConfig.findMany({
    include: { organization: true }
  })

  const orphanConfigs = configs.filter(c => !c.organization)

  if (orphanConfigs.length > 0) {
    console.log(`\n⚠️ ${orphanConfigs.length} configuration(s) orpheline(s) détectée(s) !`)
    orphanConfigs.forEach(c => {
      console.log(`   - Config ID: ${c.id} (organizationId: ${c.organizationId})`)
    })
  } else {
    console.log('\n✅ Aucune configuration orpheline')
  }

  await prisma.$disconnect()
}

checkConfigs()
