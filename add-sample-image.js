// Script pour ajouter une image d'exemple au BB Glow
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleImage() {
  console.log('🎨 Ajout d\'une image exemple pour BB Glow...\n');
  
  try {
    // Belle image de soin esthétique pour BB Glow
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        mainImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop'
        ])
      }
    });
    console.log('✅ Image ajoutée pour BB Glow');
    
    // Image pour Hydrocleaning
    await prisma.service.update({
      where: { slug: 'hydrocleaning' },
      data: {
        mainImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&h=800&fit=crop'
      }
    });
    console.log('✅ Image ajoutée pour Hydrocleaning');
    
    // Image pour Renaissance
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        mainImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop'
      }
    });
    console.log('✅ Image ajoutée pour Renaissance');
    
    // Image pour LED Thérapie
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        mainImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=1200&h=800&fit=crop'
      }
    });
    console.log('✅ Image ajoutée pour LED Thérapie');
    
    console.log('\n📸 Images ajoutées avec succès !');
    console.log('👉 Allez voir sur : http://localhost:3001/services/bb-glow');
    console.log('👉 Ou sur la page des prestations : http://localhost:3001/prestations');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleImage();