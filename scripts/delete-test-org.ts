import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestOrg() {
  try {
    // Lister les organisations récentes
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        status: true
      }
    })

    console.log('📋 Dernières organisations créées:\n')
    orgs.forEach((org, idx) => {
      console.log(`${idx + 1}. ${org.name} (${org.slug})`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Status: ${org.status}`)
      console.log(`   Créée: ${org.createdAt}`)
      console.log('')
    })

    if (orgs.length === 0) {
      console.log('❌ Aucune organisation trouvée')
      return
    }

    // Supprimer la plus récente
    const latest = orgs[0]
    console.log(`🗑️  Suppression de: ${latest.name} (${latest.slug})...`)

    // Supprimer l'organisation (cascade automatique sur toutes les relations)
    await prisma.organization.delete({
      where: { id: latest.id }
    })

    console.log('✅ Organisation supprimée avec succès (avec toutes ses données)!')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestOrg()
