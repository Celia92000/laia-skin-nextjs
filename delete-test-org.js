/**
 * Script pour supprimer l'organisation de test
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteOrg() {
  console.log('🗑️  Suppression organisation de test...\n')

  try {
    const organization = await prisma.organization.findFirst({
      where: {
        slug: 'institut-beaute-celia'
      },
      include: {
        users: true
      }
    })

    if (!organization) {
      console.log('❌ Organisation non trouvée')
      return
    }

    console.log(`Trouvée: ${organization.name} (${organization.id})`)
    console.log(`  - ${organization.users.length} utilisateurs`)

    // Supprimer les utilisateurs d'abord
    await prisma.user.deleteMany({
      where: {
        organizationId: organization.id
      }
    })
    console.log('✅ Utilisateurs supprimés')

    // Supprimer l'organisation
    await prisma.organization.delete({
      where: {
        id: organization.id
      }
    })
    console.log('✅ Organisation supprimée')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

deleteOrg()
