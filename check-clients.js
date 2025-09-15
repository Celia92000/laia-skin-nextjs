const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClients() {
  try {
    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    console.log('\n📋 TOUS LES UTILISATEURS DANS LA BASE:');
    console.log('=====================================\n');
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Téléphone: ${user.phone || 'Non renseigné'}`);
      console.log(`   Réservations: ${user._count.reservations}`);
      console.log(`   Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
      console.log('   ---');
    });

    // Compter par rôle
    const admins = allUsers.filter(u => u.role === 'admin');
    const clients = allUsers.filter(u => u.role === 'client');

    console.log('\n📊 RÉSUMÉ:');
    console.log(`Total utilisateurs: ${allUsers.length}`);
    console.log(`Admins: ${admins.length}`);
    console.log(`Clients: ${clients.length}`);

    // Afficher les réservations récentes
    const recentReservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('\n📅 RÉSERVATIONS RÉCENTES:');
    console.log('========================\n');
    
    recentReservations.forEach(res => {
      console.log(`- ${res.user.name} (${res.user.email})`);
      console.log(`  Date: ${res.date.toLocaleDateString('fr-FR')} à ${res.time}`);
      console.log(`  Statut: ${res.status}`);
      console.log(`  Prix: ${res.totalPrice}€`);
      console.log('');
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClients();