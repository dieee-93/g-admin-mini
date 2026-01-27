#!/usr/bin/env node
/**
 * MANIFEST MIGRATION SCRIPT
 * 
 * Migrates all module manifests from:
 *   requiredFeatures/optionalFeatures (old)
 * To:
 *   activatedBy/enhancedBy (new)
 * 
 * MAPPING LOGIC:
 * - requiredFeatures[0] → activatedBy (single feature)
 * - requiredFeatures[1..n] → enhancedBy (if multiple required, merge)
 * - optionalFeatures → enhancedBy (additional enhancements)
 * 
 * USAGE:
 *   node scripts/migrate-manifests.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔧 Starting manifest migration...\n');

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

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const fullPath of manifestPaths) {
  const relativePath = path.relative(rootDir, fullPath);
  const moduleName = relativePath.split(path.sep)[2] || 'unknown'; // Extract module name
  
  try {
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already migrated
    if (content.includes('activatedBy:') || content.includes('enhancedBy:')) {
      console.log(`⏭️  ${moduleName.padEnd(25)} - already migrated`);
      skipCount++;
      continue;
    }
    
    // Extract requiredFeatures
    const requiredMatch = content.match(/requiredFeatures:\s*\[([\s\S]*?)\]/);
    const optionalMatch = content.match(/optionalFeatures:\s*\[([\s\S]*?)\]/);
    
    if (!requiredMatch && !optionalMatch) {
      console.log(`⏭️  ${moduleName.padEnd(25)} - no features found`);
      skipCount++;
      continue;
    }
    
    // Parse required features
    let requiredFeatures = [];
    if (requiredMatch) {
      const featuresStr = requiredMatch[1];
      requiredFeatures = featuresStr
        .split(',')
        .map(f => f.trim())
        .filter(f => f && f !== '' && !f.startsWith('//'))
        .map(f => f.replace(/['"`]/g, '').replace(/\s*as\s+FeatureId.*/, ''));
    }
    
    // Parse optional features
    let optionalFeatures = [];
    if (optionalMatch) {
      const featuresStr = optionalMatch[1];
      optionalFeatures = featuresStr
        .split(',')
        .map(f => f.trim())
        .filter(f => f && f !== '' && !f.startsWith('//'))
        .map(f => f.replace(/['"`]/g, '').replace(/\s*as\s+FeatureId.*/, ''));
    }
    
    // Determine activatedBy and enhancedBy
    let activatedBy = null;
    let enhancedBy = [];
    
    if (requiredFeatures.length > 0) {
      activatedBy = requiredFeatures[0];
      // If multiple required features, merge extras into enhancedBy
      if (requiredFeatures.length > 1) {
        enhancedBy.push(...requiredFeatures.slice(1));
      }
    }
    
    // Add optional features to enhancedBy
    enhancedBy.push(...optionalFeatures);
    
    // Build new feature section
    let newFeaturesSection = '';
    
    if (activatedBy) {
      newFeaturesSection += `  activatedBy: '${activatedBy}',\n\n`;
    }
    
    if (enhancedBy.length > 0) {
      newFeaturesSection += `  enhancedBy: [\n`;
      enhancedBy.forEach((feature, index) => {
        newFeaturesSection += `    '${feature}'${index < enhancedBy.length - 1 ? ',' : ''}\n`;
      });
      newFeaturesSection += `  ],\n`;
    }
    
    // Replace old pattern with new pattern
    // This regex matches both requiredFeatures and optionalFeatures blocks
    const oldPattern = /(\s*)requiredFeatures:\s*\[[\s\S]*?\](\s*as\s+FeatureId\[\])?,?(\s*\/\/[^\n]*)?\s*(\r?\n\s*\/\/[^\n]*)*\s*(\r?\n\s*optionalFeatures:\s*\[[\s\S]*?\](\s*as\s+FeatureId\[\])?)?,?/;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newFeaturesSection);
      
      // Write back to file
      fs.writeFileSync(fullPath, content, 'utf8');
      
      const enhancedCount = enhancedBy.length;
      console.log(`✅ ${moduleName.padEnd(25)} - migrated (${activatedBy ? `activatedBy: ${activatedBy}` : 'autoInstall'}, ${enhancedCount} enhanced)`);
      successCount++;
    } else {
      console.log(`⚠️  ${moduleName.padEnd(25)} - pattern not found, skipping`);
      skipCount++;
    }
    
  } catch (error) {
    console.error(`❌ ${moduleName.padEnd(25)} - ERROR: ${error.message}`);
    errorCount++;
  }
}

console.log(`\n📊 Migration Summary:`);
console.log(`   ✅ Migrated: ${successCount}`);
console.log(`   ⏭️  Skipped: ${skipCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`   📁 Total: ${manifestPaths.length}`);

if (errorCount > 0) {
  console.log(`\n⚠️  ${errorCount} errors occurred. Please review manually.`);
  process.exit(1);
} else {
  console.log(`\n✅ Migration complete!`);
  process.exit(0);
}
