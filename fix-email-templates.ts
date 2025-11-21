import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmailTemplates() {
  console.log('🔄 Ajout de la colonne slug à email_templates...\n');

  try {
    // Vérifier si la colonne slug existe
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        -- Ajouter la colonne slug si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'email_templates' AND column_name = 'slug'
        ) THEN
          ALTER TABLE "email_templates" ADD COLUMN "slug" TEXT;
          RAISE NOTICE 'Colonne slug ajoutée';
        ELSE
          RAISE NOTICE 'Colonne slug existe déjà';
        END IF;

        -- Générer des slugs pour les templates existants sans slug
        UPDATE "email_templates"
        SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'))
        WHERE "slug" IS NULL OR "slug" = '';

        -- Rendre la colonne NOT NULL après avoir rempli les valeurs
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'email_templates' AND column_name = 'slug' AND is_nullable = 'YES'
        ) THEN
          ALTER TABLE "email_templates" ALTER COLUMN "slug" SET NOT NULL;
          RAISE NOTICE 'Colonne slug définie comme NOT NULL';
        END IF;

        -- Créer l'index unique si il n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = 'email_templates' AND indexname = 'email_templates_slug_organizationId_key'
        ) THEN
          CREATE UNIQUE INDEX "email_templates_slug_organizationId_key"
          ON "email_templates"("slug", "organizationId");
          RAISE NOTICE 'Index unique créé';
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

fixEmailTemplates();
