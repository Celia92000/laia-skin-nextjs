/**
 * Script pour configurer la base de données
 * Peut basculer entre SQLite (local) et PostgreSQL (Supabase)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SQLITE_CONFIG = {
  provider: 'sqlite',
  url: 'file:./prisma/dev.db'
};

const POSTGRESQL_CONFIG = {
  provider: 'postgresql',
  url: 'postgresql://postgres:%23SBxrx8kVc857Ed@db.zsxweurvtsrdgehtadwa.supabase.co:5432/postgres'
};

function updateEnvFile(usePostgres = false) {
  const envPath = path.join(__dirname, '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (usePostgres) {
    // Configuration PostgreSQL
    envContent = envContent.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${POSTGRESQL_CONFIG.url}"`
    );
    envContent = envContent.replace(
      /DIRECT_URL=".*"/,
      `DIRECT_URL="${POSTGRESQL_CONFIG.url}"`
    );
  } else {
    // Configuration SQLite
    envContent = envContent.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${SQLITE_CONFIG.url}"`
    );
    envContent = envContent.replace(
      /DIRECT_URL=".*"/,
      `DIRECT_URL="${SQLITE_CONFIG.url}"`
    );
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Configuration mise à jour pour ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);
}

function updatePrismaSchema(usePostgres = false) {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  if (usePostgres) {
    schemaContent = schemaContent.replace(
      /provider = "sqlite"/,
      'provider = "postgresql"'
    );
    // Ajouter directUrl si nécessaire
    if (!schemaContent.includes('directUrl')) {
      schemaContent = schemaContent.replace(
        /url      = env\("DATABASE_URL"\)/,
        'url      = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
      );
    }
  } else {
    schemaContent = schemaContent.replace(
      /provider = "postgresql"/,
      'provider = "sqlite"'
    );
    // Retirer directUrl pour SQLite
    schemaContent = schemaContent.replace(
      /\n  directUrl = env\("DIRECT_URL"\)/,
      ''
    );
  }
  
  fs.writeFileSync(schemaPath, schemaContent);
  console.log(`✅ Schema Prisma mis à jour pour ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);
}

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    execSync('npx dotenv -e .env.local -- npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Connexion réussie!');
    return true;
  } catch (error) {
    console.error('❌ Connexion échouée');
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const usePostgres = args[0] === 'postgres';
  
  console.log(`\n🚀 Configuration de la base de données: ${usePostgres ? 'PostgreSQL (Supabase)' : 'SQLite (Local)'}\n`);
  
  // Mettre à jour les configurations
  updateEnvFile(usePostgres);
  updatePrismaSchema(usePostgres);
  
  // Générer le client Prisma
  console.log('🔄 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Tester la connexion
  const isConnected = await testConnection();
  
  if (!isConnected && usePostgres) {
    console.log('\n⚠️  PostgreSQL inaccessible, retour à SQLite...\n');
    updateEnvFile(false);
    updatePrismaSchema(false);
    execSync('npx prisma generate', { stdio: 'inherit' });
    await testConnection();
  }
  
  console.log('\n✨ Configuration terminée!');
  console.log('Pour basculer entre les bases de données:');
  console.log('  - SQLite (local): node setup-database.js');
  console.log('  - PostgreSQL (Supabase): node setup-database.js postgres\n');
}

main().catch(console.error);