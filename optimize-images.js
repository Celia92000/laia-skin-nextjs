const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const imagesDir = path.join(__dirname, 'public/images');
  const images = [
    'hydro-naissance.jpg',
    'hydro-cleaning.jpg',
    'renaissance.jpg',
    'bb-glow.jpg',
    'led-therapie.jpg'
  ];

  for (const image of images) {
    const inputPath = path.join(imagesDir, image);
    const outputPath = path.join(imagesDir, image);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${image} n'existe pas`);
      continue;
    }

    const stats = fs.statSync(inputPath);
    const sizeMB = stats.size / (1024 * 1024);
    
    console.log(`📸 Traitement de ${image} (${sizeMB.toFixed(2)} MB)...`);
    
    try {
      await sharp(inputPath)
        .resize(800, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 85 })
        .toFile(inputPath + '.tmp');
      
      // Remplacer l'original
      fs.renameSync(inputPath + '.tmp', inputPath);
      
      const newStats = fs.statSync(inputPath);
      const newSizeMB = newStats.size / (1024 * 1024);
      
      console.log(`✅ ${image} optimisé: ${sizeMB.toFixed(2)} MB → ${newSizeMB.toFixed(2)} MB`);
    } catch (err) {
      console.error(`❌ Erreur pour ${image}:`, err.message);
    }
  }

  // Copier aussi dans public/services
  console.log('\n📁 Copie dans public/services...');
  const servicesDir = path.join(__dirname, 'public/services');
  for (const image of images) {
    const sourcePath = path.join(imagesDir, image);
    const destPath = path.join(servicesDir, image);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ ${image} copié`);
    }
  }
}

optimizeImages().catch(console.error);