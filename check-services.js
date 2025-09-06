const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServices() {
  try {
    const services = await prisma.service.findMany();
    console.log('Nombre de services dans la base:', services.length);
    
    if (services.length === 0) {
      console.log('Aucun service trouvé. Les services existants vont être affichés statiquement dans l\'interface.');
    } else {
      console.log('\nServices trouvés:');
      services.forEach(service => {
        console.log(`- ${service.name}: ${service.shortDescription}`);
      });
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();