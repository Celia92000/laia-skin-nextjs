/**
 * Script de migration complète des tokens depuis .env vers la base de données chiffrée
 *
 * Usage: npx tsx scripts/migrate-all-tokens.ts
 */

import { migrateTokensFromEnv, checkExpiringTokens } from '../src/lib/api-token-manager';

async function main() {
  console.log('🔐 MIGRATION DES TOKENS API VERS LA BASE DE DONNÉES CHIFFRÉE\n');
  console.log('============================================================\n');

  try {
    // Migrer tous les tokens depuis .env
    await migrateTokensFromEnv();

    console.log('\n📊 VÉRIFICATION DES TOKENS EXPIRANTS...\n');

    // Vérifier les tokens qui expirent bientôt
    const expiringTokens = await checkExpiringTokens(30);

    if (expiringTokens.length === 0) {
      console.log('✅ Aucun token n\'expire dans les 30 prochains jours\n');
    }

    console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('\n📝 PROCHAINES ÉTAPES :');
    console.log('   1. Vérifiez vos tokens dans l\'admin : Paramètres → Sécurité API');
    console.log('   2. Renouvelez les tokens qui vont expirer bientôt');
    console.log('   3. Supprimez les tokens du fichier .env pour plus de sécurité');
    console.log('\n⚠️  IMPORTANT : Ne commitez jamais le fichier .env avec vos tokens !');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DE LA MIGRATION:', error);
    process.exit(1);
  }
}

main();
