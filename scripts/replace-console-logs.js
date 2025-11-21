#!/usr/bin/env node

/**
 * Script pour remplacer tous les console.log/error/warn par le système de logging
 * Usage: node scripts/replace-console-logs.js [dryRun]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('dryRun') || process.argv.includes('--dry-run');

console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN (simulation)' : 'PRODUCTION (modification réelle)'}\n`);

// Patterns de remplacement
const replacements = [
  // console.log simple
  {
    pattern: /console\.log\((.*?)\);?$/gm,
    replace: (match, content) => {
      // Si c'est un template literal avec variables
      if (content.includes('${')) {
        return `log.info(${content});`;
      }
      return `log.info(${content});`;
    }
  },

  // console.error
  {
    pattern: /console\.error\((.*?)\);?$/gm,
    replace: (match, content) => {
      // Si le premier argument ressemble à une erreur
      if (content.includes('error') || content.includes('err')) {
        const parts = content.split(',').map(s => s.trim());
        if (parts.length > 1) {
          return `log.error(${parts[0]}, ${parts[1]});`;
        }
      }
      return `log.error(${content});`;
    }
  },

  // console.warn
  {
    pattern: /console\.warn\((.*?)\);?$/gm,
    replace: (match, content) => `log.warn(${content});`
  },

  // console.debug
  {
    pattern: /console\.debug\((.*?)\);?$/gm,
    replace: (match, content) => `log.debug(${content});`
  }
];

// Fonction pour vérifier si le fichier a déjà l'import logger
function hasLoggerImport(content) {
  return content.includes("from '@/lib/logger'") || content.includes('from "@/lib/logger"');
}

// Fonction pour ajouter l'import logger
function addLoggerImport(content) {
  // Trouver la dernière ligne d'import
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
    // Si on trouve une ligne qui n'est pas import/commentaire/vide, on arrête
    if (lines[i].trim() &&
        !lines[i].trim().startsWith('import ') &&
        !lines[i].trim().startsWith('//') &&
        !lines[i].trim().startsWith('/*') &&
        !lines[i].trim().startsWith('*')) {
      break;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, "import { log } from '@/lib/logger';");
    return lines.join('\n');
  }

  // Si pas d'import trouvé, ajouter au début
  return "import { log } from '@/lib/logger';\n\n" + content;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = 0;

  // Compter les console avant
  const consoleBefore = (content.match(/console\.(log|error|warn|debug)/g) || []).length;

  if (consoleBefore === 0) {
    return { modified: false, changes: 0 };
  }

  // Appliquer les remplacements
  let newContent = content;

  // Remplacer les console
  replacements.forEach(({ pattern, replace }) => {
    const matches = newContent.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replace);
      changes += matches.length;
      modified = true;
    }
  });

  // Ajouter l'import si nécessaire
  if (modified && !hasLoggerImport(newContent)) {
    newContent = addLoggerImport(newContent);
  }

  // Compter les console après
  const consoleAfter = (newContent.match(/console\.(log|error|warn|debug)/g) || []).length;

  if (!DRY_RUN && modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }

  return { modified, changes, consoleBefore, consoleAfter };
}

// Fonction pour parcourir récursivement les fichiers
function processDirectory(dir, stats = { total: 0, modified: 0, changes: 0 }) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules, .next, etc.
      if (!['node_modules', '.next', 'dist', 'build'].includes(file)) {
        processDirectory(filePath, stats);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const result = processFile(filePath);

      if (result.consoleBefore > 0) {
        stats.total++;

        if (result.modified) {
          stats.modified++;
          stats.changes += result.changes;

          const status = DRY_RUN ? '📝 [DRY RUN]' : '✅';
          console.log(`${status} ${filePath}`);
          console.log(`   ${result.consoleBefore} console → ${result.consoleAfter} après remplacement`);
        }
      }
    }
  });

  return stats;
}

// Point d'entrée
console.log('🚀 Démarrage du remplacement des console.log...\n');

const startTime = Date.now();
const srcPath = path.join(__dirname, '..', 'src');

const stats = processDirectory(srcPath);

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n📊 Résumé:');
console.log(`   Fichiers analysés: ${stats.total}`);
console.log(`   Fichiers modifiés: ${stats.modified}`);
console.log(`   Remplacements: ${stats.changes}`);
console.log(`   Durée: ${duration}s`);

if (DRY_RUN) {
  console.log('\n💡 Pour appliquer les modifications, relancez sans l\'option dryRun:');
  console.log('   node scripts/replace-console-logs.js');
} else {
  console.log('\n✅ Remplacement terminé avec succès!');
  console.log('\n⚠️  Vérifiez que le projet compile toujours:');
  console.log('   npm run build');
}
