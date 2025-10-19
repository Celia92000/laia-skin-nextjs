import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePlanNames() {
  console.log('🔄 Mise à jour des noms de plans...\n')

  try {
    // Mettre à jour toutes les organisations avec l'ancien plan ENTERPRISE vers PREMIUM
    await prisma.$executeRawUnsafe(`
      UPDATE "Organization"
      SET plan = 'PREMIUM'
      WHERE plan = 'ENTERPRISE'
    `)

    console.log('✅ Plans mis à jour avec succès')
    console.log('\nVous pouvez maintenant exécuter: npx prisma db push')

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updatePlanNames()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
