const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(platform)/onboarding/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Dead code patterns to remove
const deadCodeSteps = [
  { name: 'service', start: /currentStep === 'service'/, comment: /Étape 2 - Premier service/ },
  { name: 'website-colors', start: /currentStep === 'website-colors'/, comment: /Choix des couleurs/ },
  { name: 'site-content', start: /currentStep === 'site-content'/, comment: /Contenu du site/ },
  { name: 'hours', start: /currentStep === 'hours'/, comment: /Horaires/ }
];

const linesToRemove = new Set();

// Find blocks to remove
for (const step of deadCodeSteps) {
  let inBlock = false;
  let blockStart = -1;
  let commentLine = -1;
  let braceCount = 0;
  let startBraceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for comment line first
    if (!inBlock && step.comment && step.comment.test(line)) {
      commentLine = i;
    }

    // Found start of the block
    if (!inBlock && step.start.test(line)) {
      inBlock = true;
      blockStart = commentLine !== -1 && commentLine > i - 5 ? commentLine : i;
      braceCount = 0;
      startBraceCount = 0;

      // Count opening braces on this line
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      startBraceCount = braceCount;
    } else if (inBlock) {
      // Count braces to find the end
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

      // Found the end of the block
      if (braceCount < startBraceCount && line.trim().match(/^\s*}\s*\)\s*$/)) {
        // Mark lines for removal (including the comment line before if any)
        let startLine = blockStart;

        // Include empty line before comment if exists
        if (startLine > 0 && lines[startLine - 1].trim() === '') {
          startLine--;
        }

        // Include empty line after closing if exists
        let endLine = i;
        if (endLine < lines.length - 1 && lines[endLine + 1].trim() === '') {
          endLine++;
        }

        console.log(`Removing ${step.name}: lines ${startLine + 1} to ${endLine + 1}`);

        for (let j = startLine; j <= endLine; j++) {
          linesToRemove.add(j);
        }

        inBlock = false;
        commentLine = -1;
        break;
      }
    }
  }
}

// Create new content without removed lines
const newLines = lines.filter((_, index) => !linesToRemove.has(index));
const newContent = newLines.join('\n');

// Write back
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`\nDone! Removed ${linesToRemove.size} lines.`);
console.log(`File reduced from ${lines.length} to ${newLines.length} lines.`);
