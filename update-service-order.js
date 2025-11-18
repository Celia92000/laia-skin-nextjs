const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateServiceOrder() {
  try {
    // Ordre souhaité : Hydro'Naissance, Hydro'Cleaning, Renaissance, BB Glow, LED Thérapie
    const updates = [
      { slug: 'hydro-naissance', order: 1 },
      { slug: 'hydro-cleaning', order: 2 },
      { slug: 'renaissance', order: 3 },
      { slug: 'bb-glow', order: 4 },
      { slug: 'led-therapie', order: 5 }
    ];

    for (const update of updates) {
      await prisma.service.updateMany({
        where: { slug: update.slug },
        data: { order: update.order }
      });
      console.log(`✅ ${update.slug} mis à jour avec l'ordre ${update.order}`);
    }

    // Supprimer le service Hydrocleaning en double s'il existe
    await prisma.service.deleteMany({
      where: { slug: 'hydrocleaning' }
    });
    console.log('✅ Service Hydrocleaning supprimé (doublon)');

    // Vérifier le résultat
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
      select: { name: true, slug: true, order: true }
    });

    console.log('\n📋 Ordre final des services :');
    services.forEach(s => {
      console.log(`${s.order || 0}. ${s.name} (${s.slug})`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServiceOrder();