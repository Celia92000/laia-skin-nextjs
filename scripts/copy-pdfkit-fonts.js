#!/usr/bin/env node
/**
 * Script pour copier les fonts PDFKit dans le bundle Webpack
 * Nécessaire pour que PDFKit fonctionne correctement avec Next.js
 */

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../node_modules/pdfkit/js/data');
const target = path.join(__dirname, '../.next/server/vendor-chunks/data');

function copyFonts() {
  try {
    // Créer le dossier cible s'il n'existe pas
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    // Copier tous les fichiers .afm
    const files = fs.readdirSync(source);
    files.forEach(file => {
      if (file.endsWith('.afm')) {
        const srcPath = path.join(source, file);
        const destPath = path.join(target, file);
        fs.copyFileSync(srcPath, destPath);
      }
    });

    console.log('✅ Fonts PDFKit copiées avec succès dans .next/server/vendor-chunks/data/');
  } catch (error) {
    // Ne pas échouer le build si les fonts ne peuvent pas être copiées
    console.warn('⚠️  Impossible de copier les fonts PDFKit:', error.message);
  }
}

copyFonts();
