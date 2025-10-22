import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkServices() {
  try {
    console.log('🔍 Vérification des services...\n');

    const allServices = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        price: true
      }
    });

    console.log(`📊 Total de services : ${allServices.length}\n`);

    if (allServices.length === 0) {
      console.log('❌ Aucun service trouvé dans la base de données');
    } else {
      console.log('Services trouvés :');
      allServices.forEach((service, index) => {
        const status = service.active ? '✅ Actif' : '❌ Inactif';
        console.log(`${index + 1}. ${service.name} (${service.slug}) - ${status} - ${service.price}€`);
      });

      const activeCount = allServices.filter(s => s.active).length;
      const inactiveCount = allServices.filter(s => !s.active).length;

      console.log(`\n📈 Résumé :`);
      console.log(`- Services actifs : ${activeCount}`);
      console.log(`- Services inactifs : ${inactiveCount}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();
