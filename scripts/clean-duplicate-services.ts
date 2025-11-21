import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanServices() {
  console.log('🧹 Nettoyage des services en double...');

  // Supprimer les doublons
  const toDelete = await prisma.service.findMany({
    where: {
      OR: [
        { name: "Hydro'Cleaning" }, // Version avec apostrophe
      ]
    }
  });

  for (const service of toDelete) {
    try {
      // Vérifier s'il y a des réservations liées
      const reservationCount = await prisma.reservation.count({
        where: { serviceId: service.id }
      });

      if (reservationCount === 0) {
        await prisma.service.delete({
          where: { id: service.id }
        });
        console.log(`❌ Supprimé: ${service.name}`);
      } else {
        console.log(`⚠️  ${service.name} a ${reservationCount} réservations, non supprimé`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${service.name}:`, error);
    }
  }

  // Afficher les services finaux
  console.log('\n✅ Services finaux:');
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { price: 'asc' }
  });

  services.forEach(s => {
    console.log(`- ${s.name}: ${s.price}€ (${s.duration} min)`);
  });

  await prisma.$disconnect();
}

cleanServices().catch(console.error);