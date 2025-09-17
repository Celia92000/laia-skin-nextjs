// Test de connexion PostgreSQL directe
const postgres = require('postgres')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Test de connexion PostgreSQL...\n')
  
  // URLs à tester
  const urls = [
    {
      name: 'SQLite (actuel)',
      url: process.env.DATABASE_URL
    },
    {
      name: 'Supabase AWS Direct (port 5432)',
      url: 'postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
    },
    {
      name: 'Supabase AWS Pooler (port 6543)',
      url: 'postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres'
    }
  ]
  
  for (const config of urls) {
    console.log(`Test: ${config.name}`)
    console.log(`URL: ${config.url?.substring(0, 50)}...`)
    
    if (config.url?.startsWith('file:')) {
      console.log('❌ SQLite URL - pas compatible avec postgres\n')
      continue
    }
    
    try {
      const sql = postgres(config.url, {
        connect_timeout: 5,
        max: 1
      })
      
      const result = await sql`SELECT NOW() as time`
      console.log(`✅ Connexion réussie! Heure serveur: ${result[0].time}`)
      
      // Tester les tables
      try {
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `
        console.log(`Tables trouvées: ${tables.map(t => t.table_name).join(', ') || 'Aucune table'}`)
      } catch (e) {
        console.log('Pas de tables ou erreur de permission')
      }
      
      await sql.end()
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`)
    }
    
    console.log('---\n')
  }
}

testConnection().catch(console.error)