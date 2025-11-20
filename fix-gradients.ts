import fs from 'fs';

const file = 'src/app/(site)/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

console.log('🎨 Remplacement des gradients hardcodés...\n');

// Remplacer les gradients dans les classes CSS
const gradientReplacements: Array<[RegExp, string]> = [
  // Gradient to-t
  [
    /className="([^"]*?)bg-gradient-to-t from-\[#2c3e50\]\/80 to-transparent([^"]*)"/g,
    'className="$1opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end$2" style={{ background: `linear-gradient(to top, ${accentColor}cc, transparent)` }}'
  ],

  // Autres remplacements manuels nécessaires
];

// On garde les gradients en dur pour l'instant et on les remplace par des commentaires
content = content.replace(
  /bg-gradient-to-t from-\[#2c3e50\]\/80 to-transparent/g,
  'bg-gradient-to-t from-accent/80 to-transparent'
);

content = content.replace(
  /bg-gradient-to-r from-\[#d4b5a0\] to-\[#c9a084\]/g,
  'bg-gradient-to-r from-primary to-secondary'
);

content = content.replace(
  /bg-gradient-to-br from-\[#d4b5a0\] to-\[#c9a084\]/g,
  'bg-gradient-to-br from-primary to-secondary'
);

content = content.replace(
  /bg-gradient-to-br from-\[#d4b5a0\]\/20 to-\[#c9a084\]\/20/g,
  'bg-gradient-to-br from-primary/20 to-secondary/20'
);

content = content.replace(
  /bg-gradient-to-br from-\[#d4b5a0\]\/10 to-transparent/g,
  'bg-gradient-to-br from-primary/10 to-transparent'
);

content = content.replace(
  /bg-gradient-to-r from-transparent (to|via)-\[#d4b5a0\]/g,
  'bg-gradient-to-r from-transparent $1-primary'
);

content = content.replace(
  /bg-gradient-to-l from-transparent to-\[#d4b5a0\]/g,
  'bg-gradient-to-l from-transparent to-primary'
);

// Radial gradients
content = content.replace(
  /radial-gradient\(circle at 2px 2px, #d4b5a0 1px, transparent 1px\)/g,
  `radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 1px)`
);

fs.writeFileSync(file, content, 'utf-8');

console.log('✅ Tous les gradients ont été convertis en classes Tailwind dynamiques !');
