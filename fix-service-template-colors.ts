import fs from 'fs';

const file = 'src/components/ServicePageTemplate.tsx';
let content = fs.readFileSync(file, 'utf-8');

console.log('🎨 Remplacement des couleurs UI dans ServicePageTemplate...\n');

let replacements = 0;

// Remplacer les couleurs de texte générales (pas les couleurs spécifiques des services)
const textReplacements = [
  [/text-\[#2c3e50\]/g, 'text-accent'],
];

textReplacements.forEach(([pattern, replacement]) => {
  const matches = content.match(pattern);
  if (matches) {
    replacements += matches.length;
    content = content.replace(pattern, replacement as string);
    console.log(`✓ ${matches.length}x ${pattern} → ${replacement}`);
  }
});

// Remplacer le spinner de chargement
content = content.replace(
  /border-\[#d4b5a0\]/g,
  'border-primary'
);
replacements++;
console.log('✓ Loading spinner border → border-primary');

// Remplacer les gradients de fond généraux
content = content.replace(
  /bg-gradient-to-br from-\[#d4b5a0\]\/5 via-transparent to-\[#c9a084\]\/5/g,
  'bg-gradient-to-br from-primary/5 via-transparent to-secondary/5'
);
replacements++;
console.log('✓ Background gradient 1 → primary/secondary');

content = content.replace(
  /bg-gradient-to-br from-\[#d4b5a0\]\/10 to-transparent/g,
  'bg-gradient-to-br from-primary/10 to-transparent'
);
replacements++;
console.log('✓ Background gradient 2 → primary');

content = content.replace(
  /bg-gradient-to-tl from-\[#c9a084\]\/10 to-transparent/g,
  'bg-gradient-to-tl from-secondary/10 to-transparent'
);
replacements++;
console.log('✓ Background gradient 3 → secondary');

// Remplacer les gradients overlay
content = content.replace(
  /bg-gradient-to-t from-\[#2c3e50\]\/40 via-transparent to-transparent/g,
  'bg-gradient-to-t from-accent/40 via-transparent to-transparent'
);
replacements++;
console.log('✓ Image overlay gradient → accent');

// Sauvegarder
fs.writeFileSync(file, content, 'utf-8');

console.log(`\n✅ ${replacements} remplacements effectués !`);
console.log('Note: Les couleurs spécifiques des services (enrichmentData) sont conservées pour différencier visuellement chaque service.');
