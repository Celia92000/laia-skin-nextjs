import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addQualificationColumn() {
  try {
    console.log('🚀 Ajout de la colonne qualification aux leads...')

    // Créer l'enum LeadQualification
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "LeadQualification" AS ENUM ('COLD', 'WARM', 'HOT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✅ Enum LeadQualification créé')

    // Ajouter la colonne qualification
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Lead"
      ADD COLUMN IF NOT EXISTS "qualification" "LeadQualification";
    `)
    console.log('✅ Colonne qualification ajoutée')

    // Vérifier la colonne
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Lead' AND column_name = 'qualification';
    `) as any[]

    if (result.length > 0) {
      console.log(`\n✅ Verification: colonne 'qualification' ajoutée avec type ${result[0].data_type}`)
    } else {
      console.log('\n❌ La colonne qualification n\'a pas été trouvée')
    }

    console.log('\n✨ Migration terminée avec succès!')

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addQualificationColumn()
