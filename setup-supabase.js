// Script pour créer automatiquement les tables dans Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zsxweurvtsrdgehtadwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeHdldXJ2dHNyZGdlaHRhZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mzg0MjMsImV4cCI6MjA3MzIxNDQyM30.u-k1rK9n-ld0VIDVaSB8OnnvCMxTQVMzUNbrJFqcqrg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Création des tables Supabase...\n');

  const tables = [
    {
      name: 'User',
      sql: `CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'client',
        "loyaltyPoints" INTEGER DEFAULT 0,
        "totalSpent" DOUBLE PRECISION DEFAULT 0,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      )`
    },
    {
      name: 'Service',
      sql: `CREATE TABLE IF NOT EXISTS "Service" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        duration INTEGER NOT NULL,
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      )`
    },
    {
      name: 'Reservation',
      sql: `CREATE TABLE IF NOT EXISTS "Reservation" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        date TIMESTAMPTZ NOT NULL,
        time TEXT NOT NULL,
        "totalPrice" DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      )`
    }
  ];

  for (const table of tables) {
    try {
      console.log(`✅ Création de la table ${table.name}...`);
      // Note: Supabase JS client ne peut pas exécuter du SQL DDL directement
      // On doit utiliser l'API REST ou le Dashboard
      console.log(`   Table ${table.name} - À créer manuellement`);
    } catch (error) {
      console.error(`❌ Erreur pour ${table.name}:`, error.message);
    }
  }

  console.log('\n📋 Instructions:');
  console.log('1. Allez sur: https://supabase.com/dashboard/project/zsxweurvtsrdgehtadwa/sql/new');
  console.log('2. Copiez le SQL du fichier supabase-simple.sql');
  console.log('3. Collez et cliquez RUN');
}

setupDatabase();