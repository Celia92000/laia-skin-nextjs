import fs from 'fs';

const files = [
  'src/components/OtherServices.tsx',
  'src/components/ProductCard.tsx',
  'src/components/ServicesList.tsx',
];

console.log('🎨 Remplacement des couleurs dans les composants publics...\n');

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let fileReplacements = 0;

  // Remplacements texte
  const replacements = [
    [/text-\[#d4b5a0\]/g, 'text-primary'],
    [/text-\[#c9a084\]/g, 'text-secondary'],
    [/text-\[#2c3e50\]/g, 'text-accent'],

    [/bg-\[#d4b5a0\]/g, 'bg-primary'],
    [/bg-\[#c9a084\]/g, 'bg-secondary'],
    [/bg-\[#2c3e50\]/g, 'bg-accent'],

    // Gradients
    [/bg-gradient-to-br from-\[#d4b5a0\]\/20 to-\[#c9a084\]\/20/g, 'bg-gradient-to-br from-primary/20 to-secondary/20'],
    [/bg-gradient-to-br from-\[#d4b5a0\]\/30 to-\[#c9a084\]\/30/g, 'bg-gradient-to-br from-primary/30 to-secondary/30'],
    [/bg-gradient-to-r from-\[#d4b5a0\] to-\[#c9a084\]/g, 'bg-gradient-to-r from-primary to-secondary'],
    [/bg-gradient-to-t from-\[#2c3e50\]\/80 to-transparent/g, 'bg-gradient-to-t from-accent/80 to-transparent'],
  ];

  replacements.forEach(([pattern, replacement]) => {
    const matches = content.match(pattern);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(pattern, replacement as string);
    }
  });

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`✓ ${file}: ${fileReplacements} remplacements`);
  totalReplacements += fileReplacements;
});

console.log(`\n✅ Total: ${totalReplacements} remplacements effectués !`);
