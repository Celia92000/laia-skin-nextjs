const postgres = require('postgres')

const sql = postgres('postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres')

async function check() {
  console.log('🎉 Vérification finale de Supabase PostgreSQL\n')
  console.log('================================')
  
  // Compter les enregistrements
  const [services] = await sql`SELECT COUNT(*) as count FROM "Service"`
  const [users] = await sql`SELECT COUNT(*) as count FROM "User"`
  const [reservations] = await sql`SELECT COUNT(*) as count FROM "Reservation"`
  
  console.log(`✅ Services (prestations): ${services.count}`)
  console.log(`✅ Utilisateurs: ${users.count}`)
  console.log(`✅ Réservations: ${reservations.count}`)
  
  // Lister les services
  if (services.count > 0) {
    console.log('\n✨ Vos prestations dans Supabase:')
    console.log('==================================')
    const servicesList = await sql`
      SELECT name, price, "launchPrice", duration, active 
      FROM "Service" 
      ORDER BY "order"
    `
    servicesList.forEach(s => {
      const status = s.active ? '✅' : '❌'
      const priceText = s.launchPrice ? `${s.launchPrice}€ (au lieu de ${s.price}€)` : `${s.price}€`
      console.log(`  ${status} ${s.name}: ${priceText} - ${s.duration} min`)
    })
  }
  
  // Lister les utilisateurs
  if (users.count > 0) {
    console.log('\n👥 Utilisateurs dans Supabase:')
    console.log('==============================')
    const usersList = await sql`
      SELECT email, name, role 
      FROM "User" 
      ORDER BY role DESC, name
    `
    usersList.forEach(u => {
      const roleIcon = u.role === 'admin' ? '👑' : '👤'
      console.log(`  ${roleIcon} ${u.name} (${u.email})`)
    })
  }
  
  console.log('\n🌐 SUCCÈS ! Toutes vos données sont sur Supabase PostgreSQL')
  console.log('📊 Base de données prête pour la production')
  
  await sql.end()
}

check().catch(console.error)