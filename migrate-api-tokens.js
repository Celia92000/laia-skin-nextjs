#!/usr/bin/env node
/**
 * Script temporaire pour exécuter la migration des API Tokens
 * Utilise DIRECT_URL au lieu de DATABASE_URL pour éviter le pooler
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lire le .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extraire DIRECT_URL
const directUrlMatch = envContent.match(/^DIRECT_URL="(.+)"$/m);
if (!directUrlMatch) {
  console.error('❌ DIRECT_URL non trouvée dans .env.local');
  process.exit(1);
}

const directUrl = directUrlMatch[1];
console.log('✅ DIRECT_URL trouvée');

// Exécuter la migration avec DIRECT_URL
console.log('\n🔄 Exécution de la migration...\n');

try {
  execSync(
    `DATABASE_URL="${directUrl}" npx prisma migrate dev --name add_organization_to_api_tokens`,
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: directUrl
      }
    }
  );

  console.log('\n✅ Migration terminée avec succès !');
} catch (error) {
  console.error('\n❌ Erreur lors de la migration:', error.message);
  process.exit(1);
}
