#!/usr/bin/env node

/**
 * Script pour remplacer console.log dans les fichiers API UNIQUEMENT
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}\n`);

function hasLoggerImport(content) {
  return content.includes("from '@/lib/logger'") || content.includes('from "@/lib/logger"');
}

function addLoggerImport(content) {
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, "import { log } from '@/lib/logger';");
    return lines.join('\n');
  }

  return "import { log } from '@/lib/logger';\n\n" + content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const consoleBefore = (content.match(/console\.(log|error|warn|debug|info)/g) || []).length;

  if (consoleBefore === 0) return { modified: false, changes: 0 };

  let newContent = content;
  let modified = false;

  // Remplacements simples
  const simpleReplacements = [
    { pattern: /console\.log\(/g, replacement: 'log.info(' },
    { pattern: /console\.error\(/g, replacement: 'log.error(' },
    { pattern: /console\.warn\(/g, replacement: 'log.warn(' },
    { pattern: /console\.debug\(/g, replacement: 'log.debug(' },
    { pattern: /console\.info\(/g, replacement: 'log.info(' }
  ];

  simpleReplacements.forEach(({ pattern, replacement }) => {
    if (newContent.match(pattern)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified && !hasLoggerImport(newContent)) {
    newContent = addLoggerImport(newContent);
  }

  const consoleAfter = (newContent.match(/console\.(log|error|warn|debug|info)/g) || []).length;

  if (!DRY_RUN && modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }

  return { modified, consoleBefore, consoleAfter };
}

function processDirectory(dir, stats = { total: 0, modified: 0 }) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath, stats);
    } else if (file.endsWith('.ts') && file === 'route.ts') {
      const result = processFile(filePath);

      if (result.consoleBefore > 0) {
        stats.total++;

        if (result.modified) {
          stats.modified++;
          const status = DRY_RUN ? '📝 [DRY RUN]' : '✅';
          console.log(`${status} ${filePath.replace(process.cwd(), '')}`);
          console.log(`   ${result.consoleBefore} console → ${result.consoleAfter} restants`);
        }
      }
    }
  });

  return stats;
}

console.log('🚀 Remplacement console.log dans les API routes...\n');

const startTime = Date.now();
const apiPath = path.join(__dirname, '..', 'src', 'app', 'api');

const stats = processDirectory(apiPath);

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n📊 Résumé:');
console.log(`   Fichiers modifiés: ${stats.modified}/${stats.total}`);
console.log(`   Durée: ${duration}s`);

if (!DRY_RUN) {
  console.log('\n✅ Remplacement terminé !');
}
