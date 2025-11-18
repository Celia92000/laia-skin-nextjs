const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...\n');
    
    // Compter les enregistrements
    const services = await prisma.service.count();
    const users = await prisma.user.count();
    const reservations = await prisma.reservation.count();
    
    console.log('📊 Résumé de la base de données:');
    console.log('================================');
    console.log(`✅ Services: ${services}`);
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
      
      console.log('\n✨ Vos prestations:');
      console.log('==================');
      servicesList.forEach(s => {
        const status = s.active ? '✅' : '❌';
        console.log(`  ${status} ${s.name}: ${s.price}€ (${s.duration} min)`);
      });
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
      
      console.log('\n👥 Utilisateurs:');
      console.log('===============');
      usersList.forEach(u => {
        const roleIcon = u.role === 'admin' ? '👑' : '👤';
        console.log(`  ${roleIcon} ${u.name} (${u.email})`);
      });
    }
    
    console.log('\n✅ Base de données OK!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();