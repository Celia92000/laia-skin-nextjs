const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(platform)/onboarding/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Line ranges to remove (1-indexed, inclusive)
// We need to find the exact end of each block first
const blocksToRemove = [];

// Function to find the closing of a block starting at a given line
function findBlockEnd(startLine, lines) {
  let braceCount = 0;
  let foundStart = false;

  for (let i = startLine - 1; i < lines.length; i++) {
    const line = lines[i];

    // Count braces
    for (const char of line) {
      if (char === '{') {
        braceCount++;
        foundStart = true;
      }
      if (char === '}') braceCount--;
    }

    // If we've closed all braces, this is the end
    if (foundStart && braceCount === 0 && line.trim().match(/}\s*\)\s*$/)) {
      return i + 1; // Return 1-indexed
    }
  }

  return -1;
}

// Find service block
console.log('Finding service block...');
let serviceComment = 1778;
let serviceStart = 1779;
let serviceEnd = findBlockEnd(serviceStart, lines);
console.log(`Service: lines ${serviceComment}-${serviceEnd}`);
blocksToRemove.push({ start: serviceComment, end: serviceEnd });

// Find website-colors block - need to find comment first
console.log('\nFinding website-colors block...');
for (let i = 2520; i < 2540; i++) {
  if (lines[i - 1].includes('website-colors') || lines[i - 1].includes('couleurs')) {
    let colorComment = i;
    let colorStart = i + 1; // Next line should have currentStep
    // Verify
    if (lines[colorStart - 1].includes("currentStep === 'website-colors'")) {
      let colorEnd = findBlockEnd(colorStart, lines);
      console.log(`Colors: lines ${colorComment}-${colorEnd}`);
      blocksToRemove.push({ start: colorComment, end: colorEnd });
      break;
    }
  }
}
// Fallback: start directly at 2530
if (blocksToRemove.length === 1) {
  let colorStart = 2530;
  let colorEnd = findBlockEnd(colorStart, lines);
  // Look for comment before
  let colorComment = colorStart - 1;
  while (colorComment > 2520 && lines[colorComment - 1].trim() === '') {
    colorComment--;
  }
  if (lines[colorComment - 1].includes('/*')) {
    colorComment--;
  }
  console.log(`Colors: lines ${colorComment}-${colorEnd}`);
  blocksToRemove.push({ start: colorComment, end: colorEnd });
}

// Find site-content block
console.log('\nFinding site-content block...');
for (let i = 2710; i < 2730; i++) {
  if (lines[i - 1].includes("currentStep === 'site-content'")) {
    let contentStart = i;
    let contentEnd = findBlockEnd(contentStart, lines);
    let contentComment = contentStart - 1;
    while (contentComment > 2700 && lines[contentComment - 1].trim() === '') {
      contentComment--;
    }
    if (lines[contentComment - 1].includes('/*')) {
      contentComment--;
    }
    console.log(`Site-content: lines ${contentComment}-${contentEnd}`);
    blocksToRemove.push({ start: contentComment, end: contentEnd });
    break;
  }
}

// Find hours block
console.log('\nFinding hours block...');
for (let i = 2930; i < 2950; i++) {
  if (lines[i - 1].includes("currentStep === 'hours'")) {
    let hoursStart = i;
    let hoursEnd = findBlockEnd(hoursStart, lines);
    let hoursComment = hoursStart - 1;
    while (hoursComment > 2920 && lines[hoursComment - 1].trim() === '') {
      hoursComment--;
    }
    if (lines[hoursComment - 1].includes('/*')) {
      hoursComment--;
    }
    console.log(`Hours: lines ${hoursComment}-${hoursEnd}`);
    blocksToRemove.push({ start: hoursComment, end: hoursEnd });
    break;
  }
}

// Sort blocks in reverse order to remove from end to start
blocksToRemove.sort((a, b) => b.start - a.start);

console.log('\n=== Blocks to remove ===');
blocksToRemove.forEach(block => {
  console.log(`Lines ${block.start}-${block.end} (${block.end - block.start + 1} lines)`);
});

// Create set of lines to remove
const linesToRemove = new Set();
for (const block of blocksToRemove) {
  for (let i = block.start - 1; i < block.end; i++) {
    linesToRemove.add(i);
  }
  // Also remove empty line before if exists
  if (block.start > 2 && lines[block.start - 2].trim() === '') {
    linesToRemove.add(block.start - 2);
  }
  // Also remove empty line after if exists
  if (block.end < lines.length && lines[block.end].trim() === '') {
    linesToRemove.add(block.end);
  }
}

// Create new content
const newLines = lines.filter((_, index) => !linesToRemove.has(index));
const newContent = newLines.join('\n');

// Write back
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`\n=== Done ===`);
console.log(`Removed ${linesToRemove.size} lines total`);
console.log(`File reduced from ${lines.length} to ${newLines.length} lines`);
