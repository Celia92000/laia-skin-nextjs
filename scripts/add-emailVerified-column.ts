import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEmailVerifiedColumn() {
  try {
    console.log('🔧 Ajout du champ emailVerified à la table User...\n');

    // Ajouter la colonne emailVerified si elle n'existe pas
    await prisma.$executeRaw`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP;
    `;

    console.log('✅ Colonne emailVerified ajoutée avec succès !');
    console.log('\n📝 Note : Redémarrez le serveur Next.js pour prendre en compte les changements.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmailVerifiedColumn();
