const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPayments() {
  try {
    // Trouver l'utilisateur admin
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('Aucun admin trouvé. Veuillez vous connecter d\'abord.');
      return;
    }

    // Créer ou trouver quelques clients de test
    const client1 = await prisma.user.upsert({
      where: { email: 'sophie.martin@test.com' },
      update: {},
      create: {
        name: 'Sophie Martin',
        email: 'sophie.martin@test.com',
        phone: '06 12 34 56 78',
        password: 'test123',
        role: 'client'
      }
    });

    const client2 = await prisma.user.upsert({
      where: { email: 'julie.bernard@test.com' },
      update: {},
      create: {
        name: 'Julie Bernard',
        email: 'julie.bernard@test.com',
        phone: '06 98 76 54 32',
        password: 'test123',
        role: 'client'
      }
    });

    const client3 = await prisma.user.upsert({
      where: { email: 'emma.dubois@test.com' },
      update: {},
      create: {
        name: 'Emma Dubois',
        email: 'emma.dubois@test.com',
        phone: '06 55 44 33 22',
        password: 'test123',
        role: 'client'
      }
    });

    // Créer des réservations de test avec différents statuts de paiement
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Réservation 1 - Payée aujourd'hui
    await prisma.reservation.create({
      data: {
        userId: client1.id,
        services: JSON.stringify(['hydro-naissance']),
        packages: JSON.stringify({}),
        date: today,
        time: '10:00',
        totalPrice: 190,
        status: 'completed',
        paymentStatus: 'paid',
        paymentDate: today,
        paymentAmount: 190,
        paymentMethod: 'card',
        invoiceNumber: 'INV-2024-001',
        notes: 'Excellente séance, cliente très satisfaite'
      }
    });

    // Réservation 2 - Payée hier
    await prisma.reservation.create({
      data: {
        userId: client2.id,
        services: JSON.stringify(['hydro', 'led']),
        packages: JSON.stringify({}),
        date: yesterday,
        time: '14:00',
        totalPrice: 159,
        status: 'completed',
        paymentStatus: 'paid',
        paymentDate: yesterday,
        paymentAmount: 159,
        paymentMethod: 'cash',
        invoiceNumber: 'INV-2024-002',
        notes: 'Cliente régulière'
      }
    });

    // Réservation 3 - En attente de paiement
    await prisma.reservation.create({
      data: {
        userId: client3.id,
        services: JSON.stringify(['renaissance']),
        packages: JSON.stringify({}),
        date: lastWeek,
        time: '11:00',
        totalPrice: 120,
        status: 'completed',
        paymentStatus: 'unpaid',
        notes: 'En attente de paiement'
      }
    });

    // Réservation 4 - Partiellement payée
    await prisma.reservation.create({
      data: {
        userId: client1.id,
        services: JSON.stringify(['bbglow']),
        packages: JSON.stringify({}),
        date: lastWeek,
        time: '15:00',
        totalPrice: 150,
        status: 'completed',
        paymentStatus: 'partial',
        paymentDate: lastWeek,
        paymentAmount: 100,
        paymentMethod: 'card',
        paymentNotes: 'Acompte de 100€, reste 50€ à payer'
      }
    });

    // Réservation 5 - Payée le mois dernier
    await prisma.reservation.create({
      data: {
        userId: client2.id,
        services: JSON.stringify(['hydro-naissance', 'bbglow']),
        packages: JSON.stringify({}),
        date: lastMonth,
        time: '09:00',
        totalPrice: 340,
        status: 'completed',
        paymentStatus: 'paid',
        paymentDate: lastMonth,
        paymentAmount: 340,
        paymentMethod: 'card',
        invoiceNumber: 'INV-2024-003',
        notes: 'Forfait spécial'
      }
    });

    // Réservation 6 - Nouvelle réservation en attente (pour tester l'alerte)
    await prisma.reservation.create({
      data: {
        userId: client3.id,
        services: JSON.stringify(['hydro']),
        packages: JSON.stringify({}),
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        time: '16:00',
        totalPrice: 89,
        status: 'pending',
        notes: 'Nouvelle cliente recommandée par Sophie Martin'
      }
    });

    console.log('✅ Données de test créées avec succès !');
    console.log('📊 Résumé :');
    console.log('- 2 paiements effectués (aujourd\'hui et hier)');
    console.log('- 1 paiement en attente');
    console.log('- 1 paiement partiel');
    console.log('- 1 paiement du mois dernier');
    console.log('- 1 nouvelle réservation en attente de validation');
    
  } catch (error) {
    console.error('Erreur lors de la création des données de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPayments();