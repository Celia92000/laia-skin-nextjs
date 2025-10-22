#!/usr/bin/env tsx
/**
 * Script de migration des tokens API depuis .env vers la base de données (chiffrés)
 * IMPORTANT : Exécuter UNE SEULE FOIS après avoir créé la table ApiToken
 */

import { migrateTokensFromEnv, checkExpiringTokens, listApiTokens } from '../src/lib/api-token-manager';

async function main() {
  console.log('\n🔐 MIGRATION DES TOKENS API VERS LA BASE DE DONNÉES');
  console.log('═'.repeat(80) + '\n');

  console.log('⚠️  IMPORTANT : Ce script va :');
  console.log('   1. Lire les tokens depuis .env.local');
  console.log('   2. Les chiffrer avec ENCRYPTION_KEY');
  console.log('   3. Les stocker dans la table ApiToken');
  console.log('   4. Vérifier les dates d\'expiration\n');

  console.log('📋 Prérequis :');
  console.log('   - Table ApiToken créée (npx prisma migrate dev)');
  console.log('   - ENCRYPTION_KEY configuré dans .env.local');
  console.log('   - Tokens présents dans .env.local\n');

  console.log('═'.repeat(80) + '\n');

  try {
    // Migration
    await migrateTokensFromEnv();

    // Liste des tokens migrés
    console.log('═'.repeat(80));
    console.log('📊 TOKENS STOCKÉS EN BASE DE DONNÉES\n');

    const tokens = await listApiTokens();

    if (tokens.length === 0) {
      console.log('⚠️  Aucun token trouvé en base de données\n');
    } else {
      tokens.forEach((token, i) => {
        console.log(`${i + 1}. ${token.service}:${token.name}`);
        console.log(`   ID: ${token.id}`);
        console.log(`   Organisation: ${token.organizationId || 'Global (plateforme)'}`);
        console.log(`   Token chiffré: ${token.tokenEncrypted.substring(0, 40)}...`);

        if (token.expiresAt) {
          const now = new Date();
          const daysLeft = Math.ceil(
            (token.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysLeft < 0) {
            console.log(`   ⚠️  EXPIRÉ depuis ${Math.abs(daysLeft)} jours`);
          } else if (daysLeft < 7) {
            console.log(`   ⚠️  Expire dans ${daysLeft} jours`);
          } else {
            console.log(`   ✅ Expire dans ${daysLeft} jours`);
          }
        } else {
          console.log(`   ✅ Pas d'expiration`);
        }

        console.log(`   Créé le: ${token.createdAt.toLocaleDateString('fr-FR')}\n`);
      });
    }

    // Vérification des expirations
    console.log('═'.repeat(80));
    console.log('⏰ VÉRIFICATION DES EXPIRATIONS\n');

    const expiring = await checkExpiringTokens(7);

    if (expiring.length === 0) {
      console.log('✅ Aucun token n\'expire dans les 7 prochains jours\n');
    }

    // Recommandations
    console.log('═'.repeat(80));
    console.log('📝 PROCHAINES ÉTAPES\n');

    console.log('1. ✅ Tokens migrés en base de données (chiffrés)');
    console.log('2. 🔄 Modifier le code pour utiliser les tokens depuis la DB :');
    console.log('   - Utiliser getWhatsAppToken() au lieu de process.env.WHATSAPP_ACCESS_TOKEN');
    console.log('   - Utiliser getInstagramToken() au lieu de process.env.INSTAGRAM_ACCESS_TOKEN');
    console.log('   - Utiliser getFacebookToken() au lieu de process.env.FACEBOOK_PAGE_ACCESS_TOKEN');
    console.log('   - Utiliser getStripeKey() au lieu de process.env.STRIPE_SECRET_KEY');
    console.log('\n3. ⚠️  OPTIONNEL : Supprimer les tokens de .env.local');
    console.log('   (Garder les en fallback pour le moment)');
    console.log('\n4. 🔔 Configurer les alertes d\'expiration (cron job)');
    console.log('   → /api/cron/check-token-expiration\n');

    console.log('═'.repeat(80) + '\n');

    console.log('✅ Migration terminée avec succès !\n');

  } catch (error) {
    console.error('\n❌ Erreur durant la migration:\n');
    console.error(error);
    console.error('\n💡 Vérifiez que :');
    console.error('   - La table ApiToken existe (npx prisma migrate dev)');
    console.error('   - ENCRYPTION_KEY est configuré dans .env.local');
    console.error('   - Les tokens sont présents dans .env.local\n');
    process.exit(1);
  }
}

main().catch(console.error);
