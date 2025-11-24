import { getPrismaClient } from '../src/lib/prisma';

async function main() {
  const prisma = await getPrismaClient();

  try {
    // Ajouter la colonne legalName à OrganizationConfig
    await prisma.$executeRaw`
      ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "legalName" TEXT;
    `;

    console.log('✅ Colonne legalName ajoutée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
