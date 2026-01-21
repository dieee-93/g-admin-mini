/**
 * MODULE FEATURE MAP VALIDATION TEST
 *
 * Ensures MODULE_FEATURE_MAP stays in sync with module manifests.
 *
 * NEW ARCHITECTURE:
 * - manifest.activatedBy → map.activatedBy
 * - manifest.enhancedBy → map.enhancedBy
 * - manifest.autoInstall → map.alwaysActive
 */

import { describe, it, expect } from 'vitest';
import { ALL_MODULE_MANIFESTS } from '@/modules';
import { MODULE_FEATURE_MAP } from '@/config/FeatureRegistry';
// Note: CORE_FEATURES removed - CORE modules now loaded via CORE_MODULES array

describe('MODULE_FEATURE_MAP validation', () => {
  it('should match all module manifests with navigation metadata', () => {
    const errors: string[] = [];

    const modulesWithNavigation = ALL_MODULE_MANIFESTS.filter(
      manifest => manifest.metadata?.navigation
    );

    console.log(`\n📊 Validating ${modulesWithNavigation.length} modules...\n`);

    modulesWithNavigation.forEach(manifest => {
      const mapEntry = MODULE_FEATURE_MAP[manifest.id];

      if (!mapEntry) {
        errors.push(`❌ Module "${manifest.id}" missing from MODULE_FEATURE_MAP`);
        return;
      }

      // Check alwaysActive matches autoInstall
      if (mapEntry.alwaysActive !== (manifest.autoInstall === true)) {
        errors.push(`❌ "${manifest.id}": alwaysActive mismatch`);
      }

      // Check activatedBy
      const manifestActivatedBy = (manifest as any).activatedBy;
      if (manifestActivatedBy && mapEntry.activatedBy !== manifestActivatedBy) {
        errors.push(`❌ "${manifest.id}": activatedBy mismatch`);
      }

      // Check enhancedBy
      const manifestEnhanced = (manifest as any).enhancedBy || [];
      const mapEnhanced = (mapEntry as any).enhancedBy || [];
      
      if (JSON.stringify(manifestEnhanced) !== JSON.stringify(mapEnhanced)) {
        errors.push(`❌ "${manifest.id}": enhancedBy mismatch`);
      }

      if (errors.filter(e => e.includes(manifest.id)).length === 0) {
        console.log(`  ✅ ${manifest.id.padEnd(25)} - synced`);
      }
    });

    if (errors.length > 0) {
      console.error('\n❌ Errors:\n');
      errors.forEach(e => console.error(e));
    } else {
      console.log('\n✅ All modules in sync!\n');
    }

    expect(errors).toEqual([]);
  });

  it('should have valid descriptions', () => {
    const missing: string[] = [];

    Object.entries(MODULE_FEATURE_MAP).forEach(([id, config]) => {
      if (!(config as any).description) {
        missing.push(id);
      }
    });

    expect(missing).toEqual([]);
  });
});
