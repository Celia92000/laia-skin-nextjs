import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCRMFields() {
  console.log('🔄 Ajout des champs CRM...')

  try {
    // Ajouter l'enum LeadSource et les champs dans Organization
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "LeadSource" AS ENUM (
          'WEBSITE',
          'DEMO_FORM',
          'REFERRAL',
          'MARKETING',
          'SOCIAL_MEDIA',
          'EVENT',
          'PARTNER',
          'DIRECT',
          'OTHER'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // Ajouter PENDING au OrgStatus enum si pas déjà présent
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TYPE "OrgStatus" ADD VALUE IF NOT EXISTS 'PENDING';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // Ajouter les champs à Organization
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "leadSource" "LeadSource" DEFAULT 'WEBSITE',
      ADD COLUMN IF NOT EXISTS "activatedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);
    `)

    // Ajouter le champ leadSource à DemoBooking
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "DemoBooking"
      ADD COLUMN IF NOT EXISTS "leadSource" "LeadSource" DEFAULT 'DEMO_FORM';
    `)

    console.log('✅ Champs CRM ajoutés avec succès!')

    // Vérification
    const orgCount = await prisma.organization.count()
    const demoCount = await prisma.demoBooking.count()

    console.log(`📊 ${orgCount} organisations dans la base`)
    console.log(`📊 ${demoCount} réservations de démo dans la base`)

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addCRMFields()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
