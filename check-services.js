const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServices() {
  try {
    const services = await prisma.service.findMany({
      select: { slug: true, name: true, mainImage: true }
    });
    
    console.log('Services dans la base de données :');
    services.forEach(s => {
      console.log(`- slug: "${s.slug}" => ${s.name} (image: ${s.mainImage || 'aucune'})`);
    });
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();