import { getPrismaClient } from './src/lib/prisma';

async function fixOrderOrganizationId() {
  const prisma = await getPrismaClient();
  console.log('🔄 Ajout de la colonne organizationId à la table Order...\n');

  try {
    // Vérifier si la colonne existe déjà
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        -- Ajouter la colonne organizationId si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Order' AND column_name = 'organizationId'
        ) THEN
          ALTER TABLE "Order" ADD COLUMN "organizationId" TEXT;
          RAISE NOTICE 'Colonne organizationId ajoutée à Order';
        ELSE
          RAISE NOTICE 'Colonne organizationId existe déjà dans Order';
        END IF;

        -- Créer l'index si il n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = 'Order' AND indexname = 'Order_organizationId_idx'
        ) THEN
          CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");
          RAISE NOTICE 'Index Order_organizationId_idx créé';
        END IF;
      END $$;
    `);

    console.log('✅ Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

fixOrderOrganizationId();
