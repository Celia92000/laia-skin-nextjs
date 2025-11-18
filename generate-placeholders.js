const fs = require('fs');
const path = require('path');

// Créer des SVG placeholders pour chaque service
const services = [
    { name: 'hydro-naissance', title: "Hydro'Naissance", color1: '#d4b5a0', color2: '#c9a084', icon: '💧' },
    { name: 'hydro-cleaning', title: "Hydro'Cleaning", color1: '#7dd3c0', color2: '#5eaaa8', icon: '✨' },
    { name: 'renaissance', title: 'Renaissance', color1: '#f9a8d4', color2: '#ec8ccd', icon: '🌟' },
    { name: 'bb-glow', title: 'BB Glow', color1: '#fbbf24', color2: '#f59e0b', icon: '✨' },
    { name: 'led-therapie', title: 'LED Thérapie', color1: '#a78bfa', color2: '#8b5cf6', icon: '💡' },
    { name: 'hydro', title: "Hydro'Cleaning", color1: '#7dd3c0', color2: '#5eaaa8', icon: '💦' },
    { name: 'led', title: 'LED Thérapie', color1: '#a78bfa', color2: '#8b5cf6', icon: '💡' }
];

// Créer le dossier images s'il n'existe pas
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

services.forEach(service => {
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${service.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${service.color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${service.color2};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/> 
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="url(#grad-${service.name})"/>
  
  <!-- Pattern overlay -->
  <rect width="800" height="600" fill="white" opacity="0.05"/>
  
  <!-- Center circle -->
  <circle cx="400" cy="250" r="100" fill="white" opacity="0.2"/>
  <circle cx="400" cy="250" r="80" fill="white" opacity="0.15"/>
  
  <!-- Logo Text -->
  <text x="400" y="250" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle" filter="url(#shadow)">
    LAIA SKIN
  </text>
  
  <!-- Service Name -->
  <text x="400" y="350" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" opacity="0.95">
    ${service.title}
  </text>
  
  <!-- Tagline -->
  <text x="400" y="400" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.7">
    Excellence & Innovation
  </text>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="50" fill="white" opacity="0.1"/>
  <circle cx="700" cy="500" r="70" fill="white" opacity="0.08"/>
  <circle cx="150" cy="450" r="40" fill="white" opacity="0.06"/>
  <circle cx="650" cy="150" r="60" fill="white" opacity="0.07"/>
</svg>`;

    // Sauvegarder le fichier SVG
    const filePath = path.join(imagesDir, `${service.name}.svg`);
    fs.writeFileSync(filePath, svg);
    console.log(`✅ Image créée : ${service.name}.svg`);
});

// Créer aussi un placeholder générique
const genericSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-generic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d4b5a0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c9a084;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad-generic)"/>
  <rect width="800" height="600" fill="white" opacity="0.05"/>
  <circle cx="400" cy="300" r="100" fill="white" opacity="0.2"/>
  <text x="400" y="300" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">
    LAIA SKIN
  </text>
  <text x="400" y="350" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.8">
    Institut de Beauté
  </text>
</svg>`;

fs.writeFileSync(path.join(imagesDir, 'placeholder.svg'), genericSvg);
console.log(`✅ Image créée : placeholder.svg`);

console.log('\n✨ Toutes les images placeholder ont été créées avec succès !');