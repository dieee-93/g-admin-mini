/**
 * Feature Implementation Validator
 * 
 * Mapea las 110 features en FeatureRegistry.ts contra el código real
 * para determinar cuáles están implementadas, parcialmente implementadas,
 * o pendientes.
 * 
 * Usage: npx tsx scripts/architecture-analysis/validate-features.ts
 */

import fs from 'fs';
import path from 'path';

interface Feature {
  id: string;
  name: string;
  domain: string;
  category: string;
}

interface FeatureValidation {
  feature: Feature;
  status: 'IMPLEMENTED' | 'PARTIAL' | 'MISSING' | 'UNKNOWN';
  confidence: number;
  evidence: string[];
  relatedFiles: string[];
}

function getAllFiles(dir: string, ext: string[] = ['.ts', '.tsx'], files: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, build, etc.
        if (!['node_modules', 'dist', 'build', '.next', '.git'].includes(entry.name)) {
          getAllFiles(fullPath, ext, files);
        }
      } else if (entry.isFile()) {
        const fileExt = path.extname(entry.name);
        if (ext.includes(fileExt) && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  
  return files;
}

function extractFeaturesFromRegistry(): Feature[] {
  const registryPath = path.join(process.cwd(), 'src', 'config', 'FeatureRegistry.ts');
  const content = fs.readFileSync(registryPath, 'utf-8');
  
  // Extract feature IDs using regex
  const featurePattern = /['"](\w+)['"]\s*:\s*\{[^}]*id:\s*['"](\w+)['"]/g;
  const features: Feature[] = [];
  
  let match;
  while ((match = featurePattern.exec(content)) !== null) {
    const id = match[1];
    
    // Extract name, domain, category
    const featureBlockStart = match.index;
    const featureBlockEnd = content.indexOf('},', featureBlockStart);
    const featureBlock = content.substring(featureBlockStart, featureBlockEnd);
    
    const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(featureBlock);
    const domainMatch = /domain:\s*['"]([^'"]+)['"]/.exec(featureBlock);
    const categoryMatch = /category:\s*['"]([^'"]+)['"]/.exec(featureBlock);
    
    features.push({
      id,
      name: nameMatch?.[1] || id,
      domain: domainMatch?.[1] || 'UNKNOWN',
      category: categoryMatch?.[1] || 'conditional',
    });
  }
  
  return features;
}

function findImplementationEvidence(featureId: string, allFiles: string[]): { files: string[]; keywords: string[] } {
  const relatedFiles: string[] = [];
  const keywords: string[] = [];
  
  // Extract keywords from feature ID
  const parts = featureId.split('_');
  const domain = parts[0]; // e.g., "sales"
  const feature = parts.slice(1).join('_'); // e.g., "order_management"
  
  // Search for direct feature usage
  const featureUsagePattern = new RegExp(`['"]${featureId}['"]`, 'i');
  
  // Search for related components/pages
  const relatedPatterns = [
    new RegExp(feature.replace(/_/g, ''), 'i'), // e.g., "ordermanagement"
    new RegExp(parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(''), 'i'), // e.g., "OrderManagement"
  ];
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for direct feature usage
      if (featureUsagePattern.test(content)) {
        relatedFiles.push(file);
        keywords.push(`feature_id: ${featureId}`);
        continue;
      }
      
      // Check for related implementations (less confident)
      // Only in relevant module folders
      const normalizedPath = file.replace(/\\/g, '/');
      if (normalizedPath.includes(`/modules/${domain}/`) || normalizedPath.includes(`/pages/admin/${domain}/`)) {
        for (const pattern of relatedPatterns) {
          if (pattern.test(content)) {
            if (!relatedFiles.includes(file)) {
              relatedFiles.push(file);
            }
            break;
          }
        }
      }
    } catch (err) {
      // Skip files we can't read
    }
  }
  
  return { files: relatedFiles, keywords };
}

function determineImplementationStatus(evidence: { files: string[]; keywords: string[] }): {
  status: 'IMPLEMENTED' | 'PARTIAL' | 'MISSING' | 'UNKNOWN';
  confidence: number;
} {
  const { files, keywords } = evidence;
  
  // High confidence: Feature ID explicitly used + implementation files
  if (keywords.length > 0 && files.length >= 3) {
    return { status: 'IMPLEMENTED', confidence: 0.9 };
  }
  
  // Medium confidence: Feature ID used but limited implementation
  if (keywords.length > 0 && files.length > 0) {
    return { status: 'PARTIAL', confidence: 0.7 };
  }
  
  // Low confidence: Related files found without direct feature usage
  if (files.length >= 2) {
    return { status: 'PARTIAL', confidence: 0.4 };
  }
  
  // No evidence
  if (files.length === 0) {
    return { status: 'MISSING', confidence: 0.95 };
  }
  
  return { status: 'UNKNOWN', confidence: 0.3 };
}

function validateFeatures() {
  console.log('🔍 Validating feature implementations...\n');
  
  const features = extractFeaturesFromRegistry();
  console.log(`📋 Found ${features.length} features in FeatureRegistry.ts\n`);
  
  // Get all files once
  const srcDir = path.join(process.cwd(), 'src');
  const allFiles = getAllFiles(srcDir, ['.ts', '.tsx']);
  
  const validations: FeatureValidation[] = [];
  
  // Progress tracking
  let processed = 0;
  const total = features.length;
  
  for (const feature of features) {
    processed++;
    if (processed % 10 === 0 || processed === total) {
      process.stdout.write(`\r  Progress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
    }
    
    const evidence = findImplementationEvidence(feature.id, allFiles);
    const { status, confidence } = determineImplementationStatus(evidence);
    
    validations.push({
      feature,
      status,
      confidence,
      evidence: evidence.keywords,
      relatedFiles: evidence.files.map(f => path.relative(process.cwd(), f)),
    });
  }
  
  console.log('\r  Progress: 100% ✓\n');
  
  // Generate report
  console.log('📊 FEATURE IMPLEMENTATION REPORT');
  console.log('═'.repeat(80));
  
  const byStatus = {
    IMPLEMENTED: validations.filter(v => v.status === 'IMPLEMENTED'),
    PARTIAL: validations.filter(v => v.status === 'PARTIAL'),
    MISSING: validations.filter(v => v.status === 'MISSING'),
    UNKNOWN: validations.filter(v => v.status === 'UNKNOWN'),
  };
  
  const implementedPct = Math.round((byStatus.IMPLEMENTED.length / total) * 100);
  const partialPct = Math.round((byStatus.PARTIAL.length / total) * 100);
  const missingPct = Math.round((byStatus.MISSING.length / total) * 100);
  
  console.log(`Total Features: ${total}\n`);
  console.log('Implementation Status:');
  console.log(`  ✅ IMPLEMENTED: ${byStatus.IMPLEMENTED.length} (${implementedPct}%)`);
  console.log(`  ⚠️  PARTIAL:     ${byStatus.PARTIAL.length} (${partialPct}%)`);
  console.log(`  ❌ MISSING:     ${byStatus.MISSING.length} (${missingPct}%)`);
  console.log(`  ❓ UNKNOWN:     ${byStatus.UNKNOWN.length}\n`);
  
  // By domain
  const byDomain: Record<string, { implemented: number; partial: number; missing: number; total: number }> = {};
  
  for (const validation of validations) {
    const domain = validation.feature.domain;
    if (!byDomain[domain]) {
      byDomain[domain] = { implemented: 0, partial: 0, missing: 0, total: 0 };
    }
    byDomain[domain].total++;
    if (validation.status === 'IMPLEMENTED') byDomain[domain].implemented++;
    if (validation.status === 'PARTIAL') byDomain[domain].partial++;
    if (validation.status === 'MISSING') byDomain[domain].missing++;
  }
  
  console.log('By Domain:');
  console.log('─'.repeat(80));
  Object.entries(byDomain)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([domain, stats]) => {
      const pct = Math.round((stats.implemented / stats.total) * 100);
      console.log(`  ${domain.padEnd(15)} ${stats.total} features (${pct}% implemented, ${stats.partial} partial, ${stats.missing} missing)`);
    });
  
  console.log('\n');
  
  // Show missing critical features
  const missingCritical = byStatus.MISSING
    .filter(v => v.feature.category !== 'premium' && v.feature.category !== 'enterprise')
    .slice(0, 15);
  
  if (missingCritical.length > 0) {
    console.log('❌ TOP MISSING FEATURES (Non-Premium):');
    console.log('─'.repeat(80));
    missingCritical.forEach(v => {
      console.log(`  • ${v.feature.id}`);
      console.log(`    ${v.feature.name} (${v.feature.domain})`);
    });
    if (byStatus.MISSING.length > 15) {
      console.log(`\n  ... and ${byStatus.MISSING.length - 15} more missing features`);
    }
    console.log('');
  }
  
  // Save JSON report
  const reportPath = path.join(process.cwd(), 'scripts', 'architecture-analysis', 'reports', 'feature-validation.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalFeatures: total,
      implemented: byStatus.IMPLEMENTED.length,
      partial: byStatus.PARTIAL.length,
      missing: byStatus.MISSING.length,
      unknown: byStatus.UNKNOWN.length,
      implementationRate: implementedPct,
      byDomain,
    },
    validations,
  }, null, 2));
  
  console.log(`📄 Full report saved to: ${path.relative(process.cwd(), reportPath)}`);
  console.log('═'.repeat(80));
  
  return validations;
}

// Execute
validateFeatures();

export { validateFeatures, FeatureValidation };
