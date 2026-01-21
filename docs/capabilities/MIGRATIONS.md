# Migration Guides

**Migration guides for the Capability-Features System**

**Current Version**: 4.0 + v3.0 Dynamic Module Mapping
**Last Updated**: 2025-12-21

---

## Table of Contents

1. [v3.0 Dynamic Module Mapping](#v30-dynamic-module-mapping-december-2025) ⚡ **NEW**
2. [v4.0 Migration (Completed)](#v40-migration-atomic-architecture)
3. [async_operations Rename (Planned)](#async_operations-rename-planned)
4. [Future Migration Guidelines](#future-migration-guidelines)

---

## v3.0 Dynamic Module Mapping (December 2025)

**Status**: ✅ Completed
**Date**: December 21, 2025
**Effort**: Low

### Summary

`MODULE_FEATURE_MAP` is now auto-generated from module manifests:
- No need to manually edit FeatureRegistry
- Single source of truth (manifest)
- Impossible to forget adding modules
- Always in sync

### What Changed

#### Before (v2.0) - Manual ❌

```typescript
// Had to edit TWO places:
// 1. Module manifest
export const myModuleManifest: ModuleManifest = {
  requiredFeatures: ['some_feature']
};

// 2. FeatureRegistry (DUPLICATION)
export const MODULE_FEATURE_MAP = {
  'my-module': {
    requiredFeatures: ['some_feature']
  }
};
```

#### After (v3.0) - Automatic ✅

```typescript
// ONLY edit manifest - system does the rest!
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  requiredFeatures: ['some_feature'],
  optionalFeatures: ['another_feature']
};
// Module appears automatically in navigation!
```

### Migration Steps

**If creating new module**: Just define the manifest (as shown above).

**If module already exists**: No migration needed! Dynamic system reads from existing manifests.

### Full Documentation

See `DYNAMIC_MODULE_FEATURE_MAP_MIGRATION.md` in project root.

---

## v4.0 Migration (Atomic Architecture)

**Status**: ✅ Completed
**Date**: January 2025

### Summary

Complete architectural refactor to atomic capability system:
- Capabilities are now atomic (indivisible, combinable)
- Removed redundant intermediary capabilities
- Renamed `online_store` → `async_operations`
- Streamlined to 12 core capabilities
- 88+ features now auto-activated

---

### What Changed

#### Removed Capabilities

These capabilities were removed as they're now auto-activated by core capabilities:

| Old Capability | Replaced By | Reason |
|----------------|-------------|--------|
| `production_workflow` | Auto-activated by `physical_products` | Production is inherent to physical products |
| `appointment_based` | Auto-activated by `professional_services`, `asset_rental`, `membership_subscriptions` | Scheduling is inherent to these models |

**Migration**: No action needed - features automatically activated.

---

#### Renamed Capabilities

| Old Name | New Name | Reason |
|----------|----------|--------|
| `online_store` | `async_operations` | More accurate - it's about async operations (orders/bookings after hours), not just online stores |

**Breaking Change**: Database stores old IDs.

**Migration Script**:
```typescript
// In capabilityStore.ts version 4 migration
migrate: (persistedState: any, version: number) => {
  if (version < 4) {
    logger.info('CapabilityStore', 'Migrating to v4...');

    // Rename online_store → async_operations
    if (persistedState.profile?.selectedCapabilities) {
      persistedState.profile.selectedCapabilities =
        persistedState.profile.selectedCapabilities.map((cap: string) =>
          cap === 'online_store' ? 'async_operations' : cap
        );
    }

    return persistedState;
  }
  return persistedState;
}
```

---

### Breaking Changes

#### 1. Capability IDs Changed

```typescript
// ❌ OLD
selectedCapabilities: ['online_store']

// ✅ NEW
selectedCapabilities: ['async_operations']
```

**Fix**: Run migration script above.

---

#### 2. Feature Names Changed

Some features renamed for consistency:

| Old | New |
|-----|-----|
| `sales_async_order_processing` | `sales_online_order_processing` |
| `customer_online_reservation` | `customer_online_accounts` |

**Fix**: Automatic in FeatureActivationEngine.

---

#### 3. MODULE_FEATURE_MAP Changes (⚠️ DEPRECATED in v3.0)

> **⚡ NEW v3.0**: `MODULE_FEATURE_MAP` is now auto-generated.
> You DON'T need to edit FeatureRegistry anymore!
> Just update your module manifest. See `DYNAMIC_MODULE_FEATURE_MAP_MIGRATION.md`.

Production module requirements updated:

```typescript
// ❌ OLD
'production': {
  requiredFeatures: [
    'production_workflow_configured'  // Removed capability
  ]
}

// ✅ NEW
'production': {
  requiredFeatures: [
    'production_bom_management',
    'production_display_system',
    'production_order_queue'
  ]
}
```

**Fix (v3.0)**: Update your **module manifest** instead:

```typescript
// src/modules/production/manifest.tsx
export const productionManifest: ModuleManifest = {
  id: 'production',
  requiredFeatures: [
    'production_bom_management',
    'production_display_system',
    'production_order_queue'
  ]
};

// No need to touch FeatureRegistry.ts anymore!
// System auto-generates the mapping from manifest.
```

**OLD Fix (v2.0 - Deprecated)**: ~~Update MODULE_FEATURE_MAP in FeatureRegistry.ts~~

---

### Migration Steps

#### Step 1: Update Dependencies

```bash
pnpm install
```

#### Step 2: Update Store Version

**File**: `src/store/capabilityStore.ts`

```typescript
{
  name: 'capability-store-v4',
  version: 4,  // Incremented
  migrate: (persistedState, version) => {
    if (version < 4) {
      // Migration logic here
    }
  }
}
```

#### Step 3: Database Migration

**File**: `database/migrations/20250120_capability_v4.sql`

```sql
-- Rename online_store → async_operations in business_profiles
UPDATE business_profiles
SET selected_capabilities = array_replace(
  selected_capabilities,
  'online_store',
  'async_operations'
)
WHERE 'online_store' = ANY(selected_capabilities);

-- Remove obsolete capabilities
UPDATE business_profiles
SET selected_capabilities = array_remove(
  selected_capabilities,
  'production_workflow'
);

UPDATE business_profiles
SET selected_capabilities = array_remove(
  selected_capabilities,
  'appointment_based'
);
```

#### Step 4: Test Migration

```typescript
// Test script
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';

describe('v4 migration', () => {
  test('old capability IDs still work', () => {
    // Should handle gracefully
    const { activeFeatures } = FeatureActivationEngine.activateFeatures(
      ['async_operations'], // New name
      ['single_location']
    );

    expect(activeFeatures).toContain('sales_online_order_processing');
  });

  test('production auto-activates', () => {
    const { activeFeatures } = FeatureActivationEngine.activateFeatures(
      ['physical_products'],
      []
    );

    expect(activeFeatures).toContain('production_bom_management');
    expect(activeFeatures).toContain('production_display_system');
  });
});
```

#### Step 5: Update Documentation

- [x] Update README.md
- [x] Update ARCHITECTURE.md
- [x] Update REGISTRIES.md
- [x] Update code examples

---

### Rollback Plan

If v4 causes issues:

```sql
-- Rollback database
UPDATE business_profiles
SET selected_capabilities = array_replace(
  selected_capabilities,
  'async_operations',
  'online_store'
)
WHERE 'async_operations' = ANY(selected_capabilities);
```

```typescript
// Rollback store version
{
  name: 'capability-store-v3',
  version: 3
}
```

---

### Post-Migration Verification

```typescript
// Verification checklist
const checks = [
  {
    name: 'Store hydrates without errors',
    test: () => {
      const state = useCapabilityStore.getState();
      return state.profile !== null;
    }
  },
  {
    name: 'Features activate correctly',
    test: () => {
      const { activeFeatures } = useCapabilityStore.getState();
      return activeFeatures.length > 0;
    }
  },
  {
    name: 'Modules show in navigation',
    test: () => {
      const modules = getActiveModules();
      return modules.includes('dashboard');
    }
  },
  {
    name: 'No duplicate features',
    test: () => {
      const { activeFeatures } = useCapabilityStore.getState();
      const unique = new Set(activeFeatures);
      return unique.size === activeFeatures.length;
    }
  }
];

checks.forEach(check => {
  console.log(`${check.name}: ${check.test() ? '✅' : '❌'}`);
});
```

---

## async_operations Rename (Planned)

**Status**: ⚠️ Planned (not yet implemented everywhere)
**Timeline**: Q1 2025

### Background

The capability `online_store` was renamed to `async_operations` in v4.0 to better reflect its purpose:

**OLD thinking**: "It's for online stores"
**NEW thinking**: "It's for receiving orders/bookings outside operating hours"

---

### Why the Change?

1. **More Accurate**: A beauty salon using online booking isn't an "online store"
2. **Clearer Intent**: Async operations = orders/bookings when closed
3. **Better UX**: Users understand "operate 24/7" vs "sell online"

---

### What Needs Updating

#### Code References

```bash
# Find remaining references
grep -r "online_store" src/

# Expected locations:
# - Feature IDs (sales_online_order_processing) ✅ Correct
# - Comments/docs referring to old name ❌ Need update
# - Test descriptions ❌ Need update
```

---

#### Database

```sql
-- Check for old IDs
SELECT id, business_name, selected_capabilities
FROM business_profiles
WHERE 'online_store' = ANY(selected_capabilities);

-- Should return 0 rows if migration complete
```

---

#### Documentation

- [ ] Update user-facing docs
- [ ] Update marketing materials
- [ ] Update setup wizard copy
- [ ] Update help articles

---

### Migration Script

**For future use** (if any old IDs remain):

```typescript
// Complete migration utility
export async function migrateAsyncOperations() {
  // 1. LocalStorage
  const stored = localStorage.getItem('capability-store-v4');
  if (stored) {
    const data = JSON.parse(stored);
    if (data.state?.profile?.selectedCapabilities) {
      data.state.profile.selectedCapabilities =
        data.state.profile.selectedCapabilities.map((cap: string) =>
          cap === 'online_store' ? 'async_operations' : cap
        );
      localStorage.setItem('capability-store-v4', JSON.stringify(data));
    }
  }

  // 2. Database
  const { data: profiles } = await supabase
    .from('business_profiles')
    .select('id, selected_capabilities')
    .contains('selected_capabilities', ['online_store']);

  for (const profile of profiles || []) {
    const updated = profile.selected_capabilities.map((cap: string) =>
      cap === 'online_store' ? 'async_operations' : cap
    );

    await supabase
      .from('business_profiles')
      .update({ selected_capabilities: updated })
      .eq('id', profile.id);
  }

  console.log(`✅ Migrated ${profiles?.length || 0} profiles`);
}
```

---

### Find & Replace Patterns

```bash
# Safe replacements (code)
online_store → async_operations

# Safe replacements (UI copy)
"Online Store" → "24/7 Operations"
"tienda online" → "operaciones asíncronas"
"sell online" → "receive orders anytime"

# Unsafe replacements (keep as-is)
sales_online_order_processing  # Feature ID - correct
sales_online_payment_gateway   # Feature ID - correct
```

---

### Testing Checklist

- [ ] Store migration runs without errors
- [ ] Database migration runs without errors
- [ ] Setup wizard shows new name
- [ ] Existing businesses still work
- [ ] Features activate correctly
- [ ] No broken UI references
- [ ] Help docs updated
- [ ] Error messages updated

---

## Future Migration Guidelines

### Planning a Breaking Change

1. **Document the change**
   - What's changing and why
   - Who is affected
   - What breaks

2. **Create migration plan**
   - Database migration
   - Store migration
   - Code updates
   - Rollback plan

3. **Version bump**
   - Increment store version
   - Update migration function
   - Document in CHANGELOG

4. **Communication**
   - Notify team
   - Update docs
   - Prepare support materials

---

### Data Migration Pattern

```typescript
// Standard migration pattern
export const useCapabilityStore = create<CapabilityStoreState>()(
  persist(
    (set, get) => ({ /* store definition */ }),
    {
      name: 'capability-store-v5',  // Increment
      version: 5,                     // Increment

      migrate: (persistedState: any, version: number) => {
        // Version-specific migrations
        if (version < 4) {
          // v4 migration
          persistedState = migrateToV4(persistedState);
        }

        if (version < 5) {
          // v5 migration
          persistedState = migrateToV5(persistedState);
        }

        return persistedState;
      }
    }
  )
);

function migrateToV4(state: any) {
  // Specific v4 changes
  return transformedState;
}

function migrateToV5(state: any) {
  // Specific v5 changes
  return transformedState;
}
```

---

### Backward Compatibility Strategy

#### Pattern 1: Alias Old IDs

```typescript
// Support both old and new
const CAPABILITY_ALIASES: Record<string, BusinessCapabilityId> = {
  'online_store': 'async_operations',       // Old → New
  'production_workflow': 'physical_products' // Old → New
};

function normalizeCapabilityId(id: string): BusinessCapabilityId {
  return CAPABILITY_ALIASES[id] || id;
}
```

---

#### Pattern 2: Deprecation Warnings

```typescript
// Warn about deprecated IDs
export function toggleCapability(capabilityId: BusinessCapabilityId) {
  if (DEPRECATED_CAPABILITIES.includes(capabilityId)) {
    logger.warn(
      'CapabilityStore',
      `Capability "${capabilityId}" is deprecated. Use "${CAPABILITY_ALIASES[capabilityId]}" instead.`
    );
  }

  // Continue with normalized ID
  const normalizedId = normalizeCapabilityId(capabilityId);
  // ...
}
```

---

#### Pattern 3: Gradual Deprecation

```typescript
// Phase 1: Support both (1-2 releases)
// Phase 2: Deprecation warnings (1-2 releases)
// Phase 3: Remove old ID (breaking change)

// Version 4.0 - Support both
'online_store' | 'async_operations'  // Both work

// Version 4.5 - Warn about old
if (id === 'online_store') {
  console.warn('Deprecated: Use async_operations');
}

// Version 5.0 - Remove old (BREAKING)
'async_operations'  // Only this works
```

---

### Testing Migration

```typescript
// Migration test suite
describe('Migration: v3 → v4', () => {
  test('renames online_store to async_operations', () => {
    const v3State = {
      profile: {
        selectedCapabilities: ['physical_products', 'online_store']
      }
    };

    const v4State = migrate(v3State, 3);

    expect(v4State.profile.selectedCapabilities).toEqual([
      'physical_products',
      'async_operations'
    ]);
  });

  test('removes production_workflow', () => {
    const v3State = {
      profile: {
        selectedCapabilities: ['production_workflow', 'onsite_service']
      }
    };

    const v4State = migrate(v3State, 3);

    expect(v4State.profile.selectedCapabilities).not.toContain('production_workflow');
  });

  test('preserves other data', () => {
    const v3State = {
      profile: {
        businessName: 'Test Business',
        selectedCapabilities: ['online_store']
      },
      features: {
        completedMilestones: ['first_sale']
      }
    };

    const v4State = migrate(v3State, 3);

    expect(v4State.profile.businessName).toBe('Test Business');
    expect(v4State.features.completedMilestones).toEqual(['first_sale']);
  });
});
```

---

### Communication Template

```markdown
## Breaking Change: [Change Name]

**Version**: X.X.X
**Date**: YYYY-MM-DD
**Impact**: [Low/Medium/High]

### What's Changing

[Description of change]

### Why

[Rationale for change]

### Who's Affected

- [x] Existing users with [condition]
- [ ] New users (no impact)
- [ ] Developers using [API]

### Migration Required

- [x] Automatic (via store migration)
- [ ] Manual (requires action)

### Action Required

For Users:
- [x] No action - automatic migration

For Developers:
- [ ] Update code references
- [ ] Run database migration
- [ ] Update tests
- [ ] Review documentation

### Testing

- [ ] Test with existing data
- [ ] Test fresh installs
- [ ] Test rollback
- [ ] Verify no data loss

### Rollback Plan

[Instructions for reverting if issues arise]

### Support

Questions? Contact: [support contact]
```

---

## Version History

| Version | Date | Changes | Breaking |
|---------|------|---------|----------|
| **4.0** | 2025-01 | Atomic architecture, async_operations rename | Yes |
| **3.0** | 2024-12 | Centralized requirements mapping | No |
| **2.0** | 2024-11 | Business Model Registry refactor | Yes |
| **1.0** | 2024-09 | Initial capability system | N/A |

---

## Next Steps

- **For troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **For development**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **For architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
