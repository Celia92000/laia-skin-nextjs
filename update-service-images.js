const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateServiceImages() {
  const imageMapping = {
    'hydro-naissance': '/services/hydro-naissance.jpg',
    'hydro-cleaning': '/services/hydro-cleaning.jpg',
    'renaissance': '/services/renaissance.jpg',
    'bb-glow': '/services/bb-glow.jpg',
    'led-therapie': '/services/led-therapie.jpg'
  };

  for (const [slug, imagePath] of Object.entries(imageMapping)) {
    try {
      const service = await prisma.service.update({
        where: { slug },
        data: { 
          mainImage: imagePath,
          gallery: JSON.stringify([imagePath])
        }
      });
      console.log(`✅ Image mise à jour pour ${service.name}: ${imagePath}`);
    } catch (error) {
      console.error(`Erreur pour ${slug}:`, error.message);
    }
  }

  console.log('\n✨ Toutes les images ont été mises à jour !');
}

updateServiceImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());