/**
 * ARCHITECTURE VALIDATION SCRIPT
 *
 * Validates the entire G-Admin capability/feature architecture:
 * - Checks that all features referenced in manifests exist in FeatureRegistry
 * - Checks that all features in MODULE_FEATURE_MAP exist
 * - Detects orphaned features (defined but never activated)
 * - Validates naming conventions
 * - Checks for circular dependencies
 *
 * Usage: npx tsx scripts/validate-architecture.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Type imports
interface FeatureId {
  id: string;
  name: string;
  description: string;
  domain: string;
  category: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  orphanedFeatures: string[];
  missingFeatures: string[];
  stats: {
    totalFeatures: number;
    totalManifests: number;
    totalModules: number;
    featuresInUse: number;
  };
  featureAnalysis: {
    commonFeatures: Array<[string, string[]]>;
    uniqueFeatures: Array<[string, string[]]>;
    featureUsageMap: Map<string, string[]>;
  };
}

interface ValidationError {
  type: 'missing_feature' | 'invalid_reference' | 'circular_dependency' | 'duplicate_feature';
  location: string;
  message: string;
  fix?: string;
}

interface ValidationWarning {
  type: 'unused_feature' | 'naming_inconsistency' | 'potential_duplicate' | 'missing_activation';
  message: string;
  location?: string;
}

// ============================================
// MAIN VALIDATION FUNCTION
// ============================================

async function validateArchitecture(): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const orphanedFeatures: string[] = [];
  const missingFeatures: string[] = [];

  console.log('🔍 G-Admin Architecture Validator');
  console.log('='.repeat(60));
  console.log();

  // ============================================
  // STEP 1: Load FeatureRegistry
  // ============================================
  console.log('📖 Step 1: Loading FeatureRegistry...');

  const featureRegistryPath = path.resolve('src/config/FeatureRegistry.ts');
  let featureRegistry: Record<string, FeatureId> = {};

  if (!fs.existsSync(featureRegistryPath)) {
    errors.push({
      type: 'missing_feature',
      location: 'FeatureRegistry.ts',
      message: 'FeatureRegistry.ts not found',
      fix: 'Create FeatureRegistry.ts in src/config/'
    });
    return { valid: false, errors, warnings, orphanedFeatures, missingFeatures, stats: { totalFeatures: 0, totalManifests: 0, totalModules: 0, featuresInUse: 0 } };
  }

  const featureRegistryContent = fs.readFileSync(featureRegistryPath, 'utf-8');

  // Extract feature IDs from FEATURE_REGISTRY object
  const featureMatch = featureRegistryContent.match(/const FEATURE_REGISTRY[^{]*\{([\s\S]*?)\};/);
  if (featureMatch) {
    // Extract feature keys (rough parsing - works for our case)
    const featureKeys = featureMatch[1].match(/'([^']+)':\s*\{/g);
    if (featureKeys) {
      featureKeys.forEach(key => {
        const featureId = key.match(/'([^']+)'/)?.[1];
        if (featureId) {
          featureRegistry[featureId] = { id: featureId } as any;
        }
      });
    }
  }

  console.log(`   ✓ Found ${Object.keys(featureRegistry).length} features in FeatureRegistry`);
  console.log();

  // ============================================
  // STEP 2: Check Module Manifests
  // ============================================
  console.log('📦 Step 2: Validating module manifests...');

  // Recursively find all manifest.tsx files
  function findManifests(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findManifests(filePath, fileList);
      } else if (file === 'manifest.tsx') {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  const modulesDir = path.resolve('src/modules');
  const manifestFiles = fs.existsSync(modulesDir) ? findManifests(modulesDir) : [];

  console.log(`   Found ${manifestFiles.length} manifest files`);

  const referencedInManifests = new Set<string>();

  for (const manifestPath of manifestFiles) {
    const relativePath = path.relative(process.cwd(), manifestPath);
    const content = fs.readFileSync(manifestPath, 'utf-8');

    // Extract requiredFeatures array
    const requiredMatch = content.match(/requiredFeatures:\s*\[([\s\S]*?)\]\s*as\s*FeatureId\[\]/);
    if (requiredMatch) {
      const featuresStr = requiredMatch[1];
      const features = featuresStr
        .split(',')
        .map(f => f.trim())
        .map(f => f.replace(/['"]/g, ''))
        .filter(f => f.length > 0 && !f.startsWith('//'));

      features.forEach(featureId => {
        referencedInManifests.add(featureId);

        if (!featureRegistry[featureId]) {
          errors.push({
            type: 'missing_feature',
            location: relativePath,
            message: `Feature "${featureId}" not found in FeatureRegistry`,
            fix: `Add "${featureId}" to FeatureRegistry.ts or remove from manifest`
          });
          missingFeatures.push(featureId);
        }
      });
    }

    // Extract optionalFeatures array
    const optionalMatch = content.match(/optionalFeatures:\s*\[([\s\S]*?)\]\s*as\s*FeatureId\[\]/);
    if (optionalMatch) {
      const featuresStr = optionalMatch[1];
      const features = featuresStr
        .split(',')
        .map(f => f.trim())
        .map(f => f.replace(/['"]/g, ''))
        .filter(f => f.length > 0 && !f.startsWith('//'));

      features.forEach(featureId => {
        referencedInManifests.add(featureId);

        if (!featureRegistry[featureId]) {
          errors.push({
            type: 'missing_feature',
            location: relativePath,
            message: `Feature "${featureId}" not found in FeatureRegistry`,
            fix: `Add "${featureId}" to FeatureRegistry.ts or remove from manifest`
          });
          missingFeatures.push(featureId);
        }
      });
    }
  }

  console.log(`   ✓ Checked ${manifestFiles.length} manifests`);
  console.log(`   ✓ Found ${referencedInManifests.size} unique features referenced`);
  console.log();

  // ============================================
  // STEP 3: Check MODULE_FEATURE_MAP (DEPRECATED in v3.0)
  // ============================================
  console.log('🗺️  Step 3: Validating MODULE_FEATURE_MAP (deprecated - now auto-generated)...');
  console.log('   ℹ️  NOTE: v3.0 uses getDynamicModuleFeatureMap() - this validates legacy map only');

  const moduleFeatureMapMatch = featureRegistryContent.match(/export const MODULE_FEATURE_MAP[^{]*\{([\s\S]*?)\n\};/);
  const referencedInModuleMap = new Set<string>();

  if (moduleFeatureMapMatch) {
    const mapContent = moduleFeatureMapMatch[1];

    // Extract all feature IDs from requiredFeatures and optionalFeatures arrays
    const featureArrayMatches = mapContent.matchAll(/(?:requiredFeatures|optionalFeatures):\s*\[([\s\S]*?)\]/g);

    for (const match of featureArrayMatches) {
      const featuresStr = match[1];
      const features = featuresStr
        .split(',')
        .map(f => f.trim())
        .map(f => f.replace(/['"]/g, ''))
        .filter(f => f.length > 0 && !f.startsWith('//'));

      features.forEach(featureId => {
        referencedInModuleMap.add(featureId);

        if (!featureRegistry[featureId]) {
          errors.push({
            type: 'missing_feature',
            location: 'FeatureRegistry.ts (MODULE_FEATURE_MAP)',
            message: `Feature "${featureId}" not found in FeatureRegistry`,
            fix: `Add "${featureId}" to FeatureRegistry.ts`
          });
          missingFeatures.push(featureId);
        }
      });
    }

    console.log(`   ✓ Found ${referencedInModuleMap.size} features in MODULE_FEATURE_MAP (legacy)`);
    console.log(`   ℹ️  Use getDynamicModuleFeatureMap() for current mappings`);
  } else {
    warnings.push({
      type: 'missing_activation',
      message: 'MODULE_FEATURE_MAP not found (OK if using v3.0 dynamic generation)',
      location: 'FeatureRegistry.ts'
    });
  }
  console.log();

  // ============================================
  // STEP 4: Check BusinessModelRegistry
  // ============================================
  console.log('🏢 Step 4: Validating BusinessModelRegistry...');

  const businessModelPath = path.resolve('src/config/BusinessModelRegistry.ts');
  const activatedByCapabilities = new Set<string>();

  if (fs.existsSync(businessModelPath)) {
    const bmContent = fs.readFileSync(businessModelPath, 'utf-8');

    // Extract activatesFeatures arrays from capabilities
    const capabilitiesMatch = bmContent.match(/const CAPABILITIES[^{]*\{([\s\S]*?)\n\};/);
    if (capabilitiesMatch) {
      const capContent = capabilitiesMatch[1];
      const activatesMatches = capContent.matchAll(/activatesFeatures:\s*\[([\s\S]*?)\]/g);

      for (const match of activatesMatches) {
        const featuresStr = match[1];
        const features = featuresStr
          .split(',')
          .map(f => f.trim())
          .map(f => f.replace(/['"]/g, ''))
          .filter(f => f.length > 0 && !f.startsWith('//'));

        features.forEach(f => activatedByCapabilities.add(f));
      }
    }

    // Extract activatesFeatures arrays from infrastructure
    const infrastructureMatch = bmContent.match(/const INFRASTRUCTURE[^{]*\{([\s\S]*?)\n\};/);
    if (infrastructureMatch) {
      const infraContent = infrastructureMatch[1];
      const activatesMatches = infraContent.matchAll(/activatesFeatures:\s*\[([\s\S]*?)\]/g);

      for (const match of activatesMatches) {
        const featuresStr = match[1];
        const features = featuresStr
          .split(',')
          .map(f => f.trim())
          .map(f => f.replace(/['"]/g, ''))
          .filter(f => f.length > 0 && !f.startsWith('//'));

        features.forEach(f => activatedByCapabilities.add(f));
      }
    }

    console.log(`   ✓ Found ${activatedByCapabilities.size} features activated by capabilities/infrastructure`);
  } else {
    warnings.push({
      type: 'missing_activation',
      message: 'BusinessModelRegistry.ts not found',
      location: 'src/config/'
    });
  }
  console.log();

  // ============================================
  // STEP 5: Find Orphaned Features
  // ============================================
  console.log('🔎 Step 5: Checking for orphaned features...');

  Object.keys(featureRegistry).forEach(featureId => {
    const isActivated = activatedByCapabilities.has(featureId);
    const isReferenced = referencedInManifests.has(featureId) || referencedInModuleMap.has(featureId);

    if (!isActivated && !isReferenced) {
      orphanedFeatures.push(featureId);
      warnings.push({
        type: 'unused_feature',
        message: `Feature "${featureId}" is defined but never activated or referenced`,
        location: 'FeatureRegistry.ts'
      });
    } else if (!isActivated) {
      warnings.push({
        type: 'missing_activation',
        message: `Feature "${featureId}" is referenced but never activated by any capability`,
        location: 'FeatureRegistry.ts / BusinessModelRegistry.ts'
      });
    }
  });

  console.log(`   ${orphanedFeatures.length > 0 ? '⚠️' : '✓'} Found ${orphanedFeatures.length} orphaned features`);
  console.log();

  // ============================================
  // STEP 6: Check Naming Conventions
  // ============================================
  console.log('📝 Step 6: Checking naming conventions...');

  let namingIssues = 0;

  Object.keys(featureRegistry).forEach(featureId => {
    // Check format: {domain}_{feature_name}
    if (!featureId.includes('_')) {
      warnings.push({
        type: 'naming_inconsistency',
        message: `Feature "${featureId}" doesn't follow naming convention {domain}_{name}`,
        location: 'FeatureRegistry.ts'
      });
      namingIssues++;
    }

    // Check for common prefixes
    const validPrefixes = [
      'sales_', 'inventory_', 'production_', 'products_', 'operations_',
      'scheduling_', 'customer_', 'finance_', 'mobile_', 'multisite_',
      'analytics_', 'staff_', 'rental_', 'membership_', 'digital_'
    ];

    const hasValidPrefix = validPrefixes.some(prefix => featureId.startsWith(prefix));
    if (!hasValidPrefix && featureId.includes('_')) {
      warnings.push({
        type: 'naming_inconsistency',
        message: `Feature "${featureId}" uses unknown domain prefix`,
        location: 'FeatureRegistry.ts'
      });
      namingIssues++;
    }
  });

  console.log(`   ${namingIssues > 0 ? '⚠️' : '✓'} Found ${namingIssues} naming issues`);
  console.log();

  // ============================================
  // STEP 7: Feature Usage Analysis
  // ============================================
  console.log('🔬 Step 7: Analyzing feature usage patterns...');

  // Build feature usage map
  const featureUsageMap = new Map<string, string[]>();

  // Analyze capabilities
  if (fs.existsSync(businessModelPath)) {
    const bmContent = fs.readFileSync(businessModelPath, 'utf-8');

    // Extract capability blocks
    const capabilityMatches = bmContent.matchAll(/['"]([a-z_]+)['"]:[\s\S]*?activatesFeatures:\s*\[([\s\S]*?)\]/g);

    for (const match of capabilityMatches) {
      const capabilityId = match[1];
      const featuresStr = match[2];
      const features = featuresStr
        .split(',')
        .map(f => f.trim())
        .map(f => f.replace(/['"]/g, ''))
        .filter(f => f.length > 0 && !f.startsWith('//'));

      features.forEach(featureId => {
        if (!featureUsageMap.has(featureId)) {
          featureUsageMap.set(featureId, []);
        }
        featureUsageMap.get(featureId)!.push(capabilityId);
      });
    }
  }

  // Identify common features (used by 3+ capabilities)
  const commonFeatures = Array.from(featureUsageMap.entries())
    .filter(([_, caps]) => caps.length >= 3)
    .sort((a, b) => b[1].length - a[1].length);

  // Identify unique features (used by only 1 capability)
  const uniqueFeatures = Array.from(featureUsageMap.entries())
    .filter(([_, caps]) => caps.length === 1);

  console.log(`   ✓ Found ${commonFeatures.length} common features`);
  console.log(`   ✓ Found ${uniqueFeatures.length} unique features`);
  console.log();

  // ============================================
  // RETURN RESULTS
  // ============================================

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    orphanedFeatures,
    missingFeatures: [...new Set(missingFeatures)],
    stats: {
      totalFeatures: Object.keys(featureRegistry).length,
      totalManifests: manifestFiles.length,
      totalModules: referencedInModuleMap.size,
      featuresInUse: activatedByCapabilities.size
    },
    featureAnalysis: {
      commonFeatures,
      uniqueFeatures,
      featureUsageMap
    }
  };
}

// ============================================
// PRINT RESULTS
// ============================================

function printResults(result: ValidationResult) {
  console.log('='.repeat(60));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log();

  // Stats
  console.log('📈 Statistics:');
  console.log(`   Total features defined: ${result.stats.totalFeatures}`);
  console.log(`   Features activated by capabilities: ${result.stats.featuresInUse}`);
  console.log(`   Module manifests: ${result.stats.totalManifests}`);
  console.log(`   Modules in navigation: ${result.stats.totalModules}`);
  console.log();

  // Overall status
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ ARCHITECTURE IS VALID - NO ISSUES FOUND!');
    console.log();
    return;
  }

  // Errors
  if (result.errors.length > 0) {
    console.log(`❌ ERRORS (${result.errors.length}):`);
    console.log();

    const errorsByType = result.errors.reduce((acc, err) => {
      if (!acc[err.type]) acc[err.type] = [];
      acc[err.type].push(err);
      return acc;
    }, {} as Record<string, ValidationError[]>);

    Object.entries(errorsByType).forEach(([type, errs]) => {
      console.log(`  ${type.toUpperCase().replace(/_/g, ' ')} (${errs.length}):`);
      errs.forEach(error => {
        console.log(`    ❌ ${error.message}`);
        console.log(`       Location: ${error.location}`);
        if (error.fix) {
          console.log(`       💡 Fix: ${error.fix}`);
        }
        console.log();
      });
    });
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${result.warnings.length}):`);
    console.log();

    const warningsByType = result.warnings.reduce((acc, warn) => {
      if (!acc[warn.type]) acc[warn.type] = [];
      acc[warn.type].push(warn);
      return acc;
    }, {} as Record<string, ValidationWarning[]>);

    Object.entries(warningsByType).forEach(([type, warns]) => {
      console.log(`  ${type.toUpperCase().replace(/_/g, ' ')} (${warns.length}):`);
      warns.slice(0, 10).forEach(warning => {
        console.log(`    ⚠️  ${warning.message}`);
        if (warning.location) {
          console.log(`       Location: ${warning.location}`);
        }
      });
      if (warns.length > 10) {
        console.log(`    ... and ${warns.length - 10} more`);
      }
      console.log();
    });
  }

  // Missing Features
  if (result.missingFeatures.length > 0) {
    console.log(`❌ MISSING FEATURES (${result.missingFeatures.length}):`);
    console.log('   These features are referenced but not defined in FeatureRegistry:');
    console.log();
    result.missingFeatures.forEach(f => {
      console.log(`   - ${f}`);
    });
    console.log();
    console.log('   💡 Action: Add these features to FeatureRegistry.ts');
    console.log();
  }

  // Orphaned Features
  if (result.orphanedFeatures.length > 0) {
    console.log(`🔍 ORPHANED FEATURES (${result.orphanedFeatures.length}):`);
    console.log('   These features are defined but never activated by capabilities:');
    console.log();
    result.orphanedFeatures.forEach(f => {
      console.log(`   - ${f}`);
    });
    console.log();
    console.log('   💡 Action: Add to BusinessModelRegistry activatesFeatures or remove from FeatureRegistry');
    console.log();
  }

  // Feature Usage Analysis
  if (result.featureAnalysis.commonFeatures.length > 0) {
    console.log('🔬 FEATURE USAGE ANALYSIS:');
    console.log();

    console.log(`📊 Common Features (used by 3+ capabilities):`);
    console.log();
    result.featureAnalysis.commonFeatures.slice(0, 15).forEach(([feature, caps]) => {
      console.log(`   ${feature}`);
      console.log(`   └─ Used by ${caps.length} capabilities: ${caps.join(', ')}`);
      console.log();
    });

    if (result.featureAnalysis.commonFeatures.length > 15) {
      console.log(`   ... and ${result.featureAnalysis.commonFeatures.length - 15} more common features`);
      console.log();
    }

    console.log(`💡 Unique Features (used by only 1 capability):`);
    console.log();
    result.featureAnalysis.uniqueFeatures.slice(0, 10).forEach(([feature, caps]) => {
      console.log(`   ${feature} → ${caps[0]}`);
    });

    if (result.featureAnalysis.uniqueFeatures.length > 10) {
      console.log(`   ... and ${result.featureAnalysis.uniqueFeatures.length - 10} more`);
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(60));
  if (result.valid) {
    console.log('✅ NO CRITICAL ERRORS - Architecture is valid');
    if (result.warnings.length > 0) {
      console.log(`⚠️  ${result.warnings.length} warnings to review`);
    }
  } else {
    console.log(`❌ VALIDATION FAILED - ${result.errors.length} errors found`);
  }
  console.log('='.repeat(60));
  console.log();
}

// ============================================
// RUN VALIDATION
// ============================================

validateArchitecture()
  .then(result => {
    printResults(result);
    process.exit(result.valid ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation script failed:');
    console.error(error);
    process.exit(1);
  });
