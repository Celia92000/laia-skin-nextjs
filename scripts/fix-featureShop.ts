import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFeatureShop() {
  console.log('🔧 AJOUT DE LA COLONNE MANQUANTE featureShop\n');
  console.log('='.repeat(70));

  try {
    // Ajouter la colonne featureShop
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "featureShop" BOOLEAN DEFAULT false;`
    );
    console.log('✅ Colonne featureShop ajoutée avec succès');

    // Vérifier que la colonne existe maintenant
    const testQuery = `SELECT "featureShop" FROM "Organization" LIMIT 1`;
    await prisma.$queryRawUnsafe(testQuery);
    console.log('✅ Vérification : colonne accessible');

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 SUCCÈS ! La colonne featureShop a été ajoutée.\n');
    console.log('🔄 Redémarrez le serveur Next.js :');
    console.log('   npx kill-port 3001 && npm run dev\n');
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixFeatureShop();
