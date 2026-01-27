#!/usr/bin/env node
/**
 * CLEANUP SCRIPT - Removes leftover optionalFeatures/requiredFeatures
 * 
 * After migration, some files may have leftover old code.
 * This script does a cleanup pass to remove all remaining references.
 * 
 * USAGE:
 *   node scripts/cleanup-manifests.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧹 Starting manifest cleanup...\n');

// Find all manifest files recursively
function findManifests(dir, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      findManifests(fullPath, results);
    } else if (file.name === 'manifest.tsx') {
      results.push(fullPath);
    }
  }
  
  return results;
}

const modulesDir = path.resolve(rootDir, 'src/modules');
const manifestPaths = findManifests(modulesDir);

console.log(`📊 Found ${manifestPaths.length} manifest files\n`);

let cleanCount = 0;
let skipCount = 0;

for (const fullPath of manifestPaths) {
  const relativePath = path.relative(rootDir, fullPath);
  const moduleName = relativePath.split(path.sep)[2] || 'unknown';
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Remove leftover requiredFeatures lines
    if (content.match(/^\s*requiredFeatures:/m)) {
      content = content.replace(/^\s*requiredFeatures:\s*\[[\s\S]*?\](\s*as\s+FeatureId\[\])?,?\s*$/gm, '');
      modified = true;
    }
    
    // Remove leftover optionalFeatures lines
    if (content.match(/^\s*optionalFeatures:/m)) {
      content = content.replace(/^\s*optionalFeatures:\s*\[[\s\S]*?\](\s*as\s+FeatureId\[\])?,?\s*$/gm, '');
      modified = true;
    }
    
    // Fix malformed lines like: "autoInstall: true, // Commentenhanced"
    content = content.replace(/(autoInstall:\s*(?:true|false),?\s*\/\/[^\n]*?)(enhancedBy:)/g, '$1\n\n  $2');
    content = content.replace(/(autoInstall:\s*(?:true|false),?\s*\/\/[^\n]*?)(optionalFeatures:)/g, '$1\n\n');
    
    // Remove multiple consecutive blank lines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${moduleName.padEnd(25)} - cleaned`);
      cleanCount++;
    } else {
      console.log(`⏭️  ${moduleName.padEnd(25)} - no changes needed`);
      skipCount++;
    }
    
  } catch (error) {
    console.error(`❌ ${moduleName.padEnd(25)} - ERROR: ${error.message}`);
  }
}

console.log(`\n📊 Cleanup Summary:`);
console.log(`   ✅ Cleaned: ${cleanCount}`);
console.log(`   ⏭️  Skipped: ${skipCount}`);
console.log(`   📁 Total: ${manifestPaths.length}`);

console.log(`\n✅ Cleanup complete!`);
