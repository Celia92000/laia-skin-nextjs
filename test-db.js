const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🔍 Test de connexion à la base de données...\n');
  
  try {
    // Tester la connexion
    await prisma.$connect();
    console.log('✅ Connexion réussie!\n');
    
    // Récupérer tous les services
    const services = await prisma.service.findMany({
      where: { active: true }
    });
    
    console.log(`📋 Services actifs (${services.length}):`);
    services.forEach(s => {
      console.log(`   - ${s.name} (slug: ${s.slug}, id: ${s.id})`);
    });
    
    // Tester la récupération par slug
    console.log('\n🔍 Test de récupération par slug:');
    const bbGlow = await prisma.service.findUnique({
      where: { slug: 'bb-glow' }
    });
    
    if (bbGlow) {
      console.log(`✅ BB Glow trouvé: ${bbGlow.name} (prix: ${bbGlow.price}€)`);
    } else {
      console.log('❌ BB Glow non trouvé avec le slug "bb-glow"');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();