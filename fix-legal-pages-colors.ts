import fs from 'fs';

const file = 'src/app/(site)/mentions-legales/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

console.log('🎨 Correction de la page mentions-legales...\n');

// Remplacer toutes les classes de couleur hardcodées
content = content.replace(
  /className="text-xl font-medium text-\[#2c3e50\] mb-4 uppercase tracking-wide"/g,
  'className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}'
);

content = content.replace(
  /className="text-sm text-\[#2c3e50\]\/70 space-y-2 font-light"/g,
  'className="text-sm space-y-2 font-light" style={{ color: `${accentColor}B3` }}'
);

content = content.replace(
  /className="text-sm text-\[#2c3e50\]\/70 font-light leading-relaxed"/g,
  'className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}'
);

content = content.replace(
  /className="text-sm text-\[#2c3e50\]\/70 font-light leading-relaxed mt-3"/g,
  'className="text-sm font-light leading-relaxed mt-3" style={{ color: `${accentColor}B3` }}'
);

content = content.replace(
  /className="text-xs text-\[#2c3e50\]\/50 text-center font-light"/g,
  'className="text-xs text-center font-light" style={{ color: `${accentColor}80` }}'
);

// Ajouter mention LAIA Connect
content = content.replace(
  `          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-center font-light" style={{ color: \`\${accentColor}80\` }}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>`,
  `          <div className="pt-6 border-t border-gray-200 space-y-3">
            <p className="text-xs text-center font-light" style={{ color: \`\${accentColor}80\` }}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-center font-light" style={{ color: \`\${accentColor}60\` }}>
              Plateforme éditée par <strong>LAIA Connect</strong> - Solution de gestion pour instituts de beauté
            </p>
          </div>`
);

fs.writeFileSync(file, content, 'utf-8');

console.log('✅ Page mentions-legales mise à jour !');
console.log('  - Couleurs dynamiques : ✓');
console.log('  - Mention LAIA Connect : ✓');
console.log('  - Données par organisation : ✓');
