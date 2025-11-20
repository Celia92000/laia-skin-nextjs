import fs from 'fs';

const file = 'src/app/(site)/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

console.log('🎨 Remplacement de toutes les couleurs hardcodées...\n');

// Compteurs
let replacements = 0;

// Remplacements simples
const simpleReplacements = [
  // text-[#couleur]
  [/text-\[#d4b5a0\]/g, 'text-primary'],
  [/text-\[#c9a084\]/g, 'text-secondary'],
  [/text-\[#2c3e50\]/g, 'text-accent'],

  // bg-[#couleur]
  [/bg-\[#d4b5a0\]/g, 'bg-primary'],
  [/bg-\[#c9a084\]/g, 'bg-secondary'],
  [/bg-\[#2c3e50\]/g, 'bg-accent'],

  // border-[#couleur]
  [/border-\[#d4b5a0\]/g, 'border-primary'],
  [/border-\[#c9a084\]/g, 'border-secondary'],
  [/border-\[#2c3e50\]/g, 'border-accent'],
];

simpleReplacements.forEach(([pattern, replacement]) => {
  const matches = content.match(pattern);
  if (matches) {
    replacements += matches.length;
    content = content.replace(pattern, replacement as string);
    console.log(`✓ ${matches.length}x ${pattern} → ${replacement}`);
  }
});

// Remplacements avec opacité
const opacityReplacements = [
  [/text-\[#d4b5a0\]\/(\d+)/g, (match: string, opacity: string) => `text-primary/${opacity}`],
  [/text-\[#c9a084\]\/(\d+)/g, (match: string, opacity: string) => `text-secondary/${opacity}`],
  [/text-\[#2c3e50\]\/(\d+)/g, (match: string, opacity: string) => `text-accent/${opacity}`],

  [/bg-\[#d4b5a0\]\/(\d+)/g, (match: string, opacity: string) => `bg-primary/${opacity}`],
  [/bg-\[#c9a084\]\/(\d+)/g, (match: string, opacity: string) => `bg-secondary/${opacity}`],
  [/bg-\[#2c3e50\]\/(\d+)/g, (match: string, opacity: string) => `bg-accent/${opacity}`],
];

opacityReplacements.forEach(([pattern, replacer]) => {
  const matches = content.match(pattern as RegExp);
  if (matches) {
    replacements += matches.length;
    content = content.replace(pattern as RegExp, replacer as any);
    console.log(`✓ ${matches.length}x ${pattern} avec opacité`);
  }
});

// Sauvegarder
fs.writeFileSync(file, content, 'utf-8');

console.log(`\n✅ ${replacements} remplacements effectués !`);
console.log('⚠️  Les gradients doivent être remplacés manuellement avec style={...}');
