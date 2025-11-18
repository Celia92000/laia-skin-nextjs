const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateServiceOptions() {
  try {
    // Marquer BB Glow et LED Thérapie comme pouvant être des options
    const optionServices = ['bb-glow', 'led-therapie'];
    
    for (const slug of optionServices) {
      await prisma.service.updateMany({
        where: { slug },
        data: { canBeOption: true }
      });
      console.log(`✅ ${slug} peut maintenant être ajouté en option`);
    }

    // Vérifier le résultat
    const services = await prisma.service.findMany({
      select: { 
        name: true, 
        slug: true, 
        canBeOption: true,
        price: true,
        promoPrice: true
      },
      orderBy: { order: 'asc' }
    });

    console.log('\n📋 Services disponibles :');
    services.forEach(s => {
      const option = s.canBeOption ? '✅ Peut être ajouté en option' : '❌ Service principal';
      const price = s.promoPrice ? `${s.promoPrice}€ (au lieu de ${s.price}€)` : `${s.price}€`;
      console.log(`- ${s.name}: ${price} - ${option}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServiceOptions();