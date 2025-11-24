#!/usr/bin/env node

/**
 * Cleanup Temporary Files Script
 *
 * This script removes old temporary files from the public/temp directory
 * that are older than 24 hours. It's designed to run as a scheduled job
 * (e.g., via cron or a task scheduler).
 *
 * Usage:
 *   npx tsx scripts/cleanup-temp-files.ts
 *
 * Or add to package.json scripts:
 *   "cleanup:temp": "tsx scripts/cleanup-temp-files.ts"
 */

import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface CleanupStats {
  filesScanned: number;
  filesDeleted: number;
  bytesFreed: number;
  errors: number;
}

async function cleanupTempFiles(): Promise<CleanupStats> {
  const stats: CleanupStats = {
    filesScanned: 0,
    filesDeleted: 0,
    bytesFreed: 0,
    errors: 0
  };

  try {
    const tempDir = join(process.cwd(), 'public', 'temp');

    // Check if temp directory exists
    if (!existsSync(tempDir)) {
      console.log('ℹ️  Temp directory does not exist:', tempDir);
      return stats;
    }

    console.log('🔍 Scanning temp directory:', tempDir);

    // Read all files in temp directory
    const files = await readdir(tempDir);
    stats.filesScanned = files.length;

    if (files.length === 0) {
      console.log('✅ No files to clean up');
      return stats;
    }

    console.log(`📁 Found ${files.length} file(s) to scan`);

    // Current time in milliseconds
    const now = Date.now();

    // Maximum age: 24 hours in milliseconds
    const maxAge = 24 * 60 * 60 * 1000;

    // Process each file
    for (const file of files) {
      try {
        const filepath = join(tempDir, file);
        const fileStats = await stat(filepath);

        // Calculate file age
        const fileAge = now - fileStats.mtimeMs;

        // Delete if older than 24 hours
        if (fileAge > maxAge) {
          await unlink(filepath);
          stats.filesDeleted++;
          stats.bytesFreed += fileStats.size;

          const ageHours = Math.floor(fileAge / (60 * 60 * 1000));
          const sizeKB = (fileStats.size / 1024).toFixed(2);
          console.log(`🗑️  Deleted: ${file} (${ageHours}h old, ${sizeKB} KB)`);
        } else {
          const ageHours = Math.floor(fileAge / (60 * 60 * 1000));
          const ageMinutes = Math.floor((fileAge % (60 * 60 * 1000)) / (60 * 1000));
          console.log(`⏭️  Kept: ${file} (${ageHours}h ${ageMinutes}m old)`);
        }
      } catch (error) {
        stats.errors++;
        console.error(`❌ Error processing file ${file}:`, error);
      }
    }

    return stats;

  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    throw error;
  }
}

// Format bytes to human-readable string
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Main execution
async function main() {
  console.log('🧹 Starting temp files cleanup...\n');

  const startTime = Date.now();

  try {
    const stats = await cleanupTempFiles();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n📊 Cleanup Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`📁 Files scanned:    ${stats.filesScanned}`);
    console.log(`🗑️  Files deleted:    ${stats.filesDeleted}`);
    console.log(`💾 Space freed:      ${formatBytes(stats.bytesFreed)}`);
    console.log(`❌ Errors:           ${stats.errors}`);
    console.log(`⏱️  Duration:         ${duration}s`);
    console.log('═══════════════════════════════════════');

    if (stats.filesDeleted > 0) {
      console.log('✅ Cleanup completed successfully!');
    } else {
      console.log('ℹ️  No old files to delete');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { cleanupTempFiles, CleanupStats };
