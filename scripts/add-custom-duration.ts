import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCustomDuration() {
  try {
    console.log('🚀 Ajout de la colonne customDuration à DemoBooking...')

    // Ajouter la colonne customDuration
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "DemoBooking"
      ADD COLUMN IF NOT EXISTS "customDuration" INTEGER;
    `)
    console.log('✅ Colonne customDuration ajoutée')

    // Vérifier la colonne
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'DemoBooking' AND column_name = 'customDuration';
    `) as any[]

    if (result.length > 0) {
      console.log(`\n✅ Verification: colonne 'customDuration' ajoutée avec type ${result[0].data_type}`)
    } else {
      console.log('\n❌ La colonne customDuration n\'a pas été trouvée')
    }

    console.log('\n✨ Migration terminée avec succès!')

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addCustomDuration()
