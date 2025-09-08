// Script pour ajouter des images d'exemple aux services
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addImages() {
  console.log('🎨 Ajout d\'images aux services...\n');
  
  try {
    // Ajouter une image principale au BB Glow
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        mainImage: '/images/bb-glow.jpg',
        gallery: JSON.stringify([
          '/images/bb-glow.jpg',
          '/images/placeholder.jpg'
        ])
      }
    });
    console.log('✅ Images ajoutées pour BB Glow');
    
    // Ajouter une image principale à Hydrocleaning
    await prisma.service.update({
      where: { slug: 'hydrocleaning' },
      data: {
        mainImage: '/images/hydro-cleaning.jpg',
        gallery: JSON.stringify([
          '/images/hydro-cleaning.jpg',
          '/images/hydro.jpg'
        ])
      }
    });
    console.log('✅ Images ajoutées pour Hydrocleaning');
    
    // Ajouter une image principale à Renaissance
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        mainImage: '/images/renaissance.jpg'
      }
    });
    console.log('✅ Image ajoutée pour Renaissance');
    
    // Ajouter une image principale à LED Thérapie
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        mainImage: '/images/led-therapie.jpg'
      }
    });
    console.log('✅ Image ajoutée pour LED Thérapie');
    
    console.log('\n📸 Images ajoutées avec succès !');
    console.log('💡 Vous pouvez maintenant voir les images sur les pages de services');
    console.log('✏️ Pour modifier les images, allez dans Admin > Services');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addImages();