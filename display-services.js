const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function displayServices() {
  try {
    const services = await prisma.service.findMany();
    
    console.log('=== VOS SERVICES DANS L\'INTERFACE ADMIN ===\n');
    
    services.forEach(service => {
      console.log(`📋 ${service.name}`);
      console.log(`   ${service.shortDescription}\n`);
      console.log(`   💰 Prix: ${service.promoPrice}€ (promo) / ${service.price}€ (normal)`);
      console.log(`   ⏱️  Durée: ${service.duration} minutes`);
      
      if (service.benefits) {
        const benefits = JSON.parse(service.benefits);
        console.log(`   ✅ ${benefits.length} bénéfices définis`);
      }
      
      if (service.process) {
        const process = JSON.parse(service.process);
        console.log(`   📝 ${process.length} étapes du protocole`);
      }
      
      if (service.metaTitle) {
        console.log(`   🔍 SEO optimisé`);
      }
      
      console.log(`   🌐 Page: /services/${service.slug}`);
      console.log('\n---\n');
    });
    
    console.log('✨ Tous ces contenus sont modifiables dans l\'onglet "Gestion Services" !');
    console.log('📝 Cliquez sur le bouton "Modifier" pour personnaliser chaque texte.');
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

displayServices();