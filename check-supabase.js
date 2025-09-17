const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkSupabase() {
  try {
    console.log('🔍 Vérification de la base de données Supabase PostgreSQL...\n');
    console.log('📍 Connexion à:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] + '\n');
    
    // Compter les enregistrements
    const services = await prisma.service.count();
    const users = await prisma.user.count();
    const reservations = await prisma.reservation.count();
    
    console.log('📊 Résumé de la base Supabase:');
    console.log('================================');
    console.log(`✅ Services (prestations): ${services}`);
    console.log(`✅ Utilisateurs: ${users}`);
    console.log(`✅ Réservations: ${reservations}`);
    
    // Lister les services
    if (services > 0) {
      const servicesList = await prisma.service.findMany({
        select: { 
          name: true, 
          price: true, 
          duration: true,
          active: true 
        }
      });
      
      console.log('\n✨ Vos prestations dans Supabase:');
      console.log('==================================');
      servicesList.forEach(s => {
        const status = s.active ? '✅' : '❌';
        console.log(`  ${status} ${s.name}: ${s.price}€ (${s.duration} min)`);
      });
    } else {
      console.log('\n⚠️  Aucune prestation trouvée dans Supabase');
    }
    
    // Lister les utilisateurs
    if (users > 0) {
      const usersList = await prisma.user.findMany({
        select: { 
          email: true, 
          name: true, 
          role: true 
        }
      });
      
      console.log('\n👥 Utilisateurs dans Supabase:');
      console.log('==============================');
      usersList.forEach(u => {
        const roleIcon = u.role === 'admin' ? '👑' : '👤';
        console.log(`  ${roleIcon} ${u.name} (${u.email})`);
      });
    } else {
      console.log('\n⚠️  Aucun utilisateur trouvé dans Supabase');
    }
    
    console.log('\n✅ Connexion à Supabase PostgreSQL réussie!');
    console.log('🌐 Toutes vos données sont maintenant sur Supabase');
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabase();