const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImage() {
  const inputPath = path.join(__dirname, 'public/images/led-therapie.jpg');
  const outputPath = path.join(__dirname, 'public/images/led-therapie-compressed.jpg');
  
  try {
    // Vérifier si sharp est installé
    await sharp(inputPath)
      .resize(1200, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    
    console.log(`✅ Image compressée:`);
    console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Compressée: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Réduction: ${(100 - (compressedSize / originalSize * 100)).toFixed(1)}%`);
    
    // Remplacer l'original par la version compressée
    fs.renameSync(outputPath, inputPath);
    console.log(`✅ Image LED thérapie optimisée!`);
    
  } catch (error) {
    console.error('Erreur:', error);
    console.log('\n💡 Si sharp n\'est pas installé, utilisez: npm install sharp');
  }
}

compressImage();