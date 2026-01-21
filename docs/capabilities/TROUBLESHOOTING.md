# Troubleshooting Guide

**Common issues and solutions for the Capability-Features System**

**Version**: 4.0
**Last Updated**: 2025-01-20

---

## Table of Contents

1. [Features Not Activating](#features-not-activating)
2. [Modules Not Showing in Navigation](#modules-not-showing-in-navigation)
3. [Store Hydration Issues](#store-hydration-issues)
4. [Performance Issues](#performance-issues)
5. [Requirement Validation Issues](#requirement-validation-issues)
6. [Testing Issues](#testing-issues)

---

## Features Not Activating

### Symptom

Features you expect to be active are not in `activeFeatures` array.

---

### How to Debug

```typescript
// Step 1: Check what's selected
const { profile } = useCapabilityStore.getState();
console.log('Selected capabilities:', profile?.selectedCapabilities);
console.log('Selected infrastructure:', profile?.selectedInfrastructure);

// Step 2: Check what SHOULD activate
import { getActivatedFeatures } from '@/config/BusinessModelRegistry';

const expectedFeatures = getActivatedFeatures(
  profile?.selectedCapabilities || [],
  profile?.selectedInfrastructure || []
);
console.log('Expected features:', expectedFeatures.length);
console.log('Actual features:', profile?.activeFeatures.length);

// Step 3: Check specific feature
const featureId = 'sales_pos_onsite';
const isExpected = expectedFeatures.includes(featureId);
const isActive = profile?.activeFeatures.includes(featureId);

console.log(`Feature "${featureId}":`);
console.log(`  Expected: ${isExpected}`);
console.log(`  Active: ${isActive}`);

// Step 4: Check capability definition
import { getCapability } from '@/config/BusinessModelRegistry';

const cap = getCapability('onsite_service');
console.log('Capability activates:', cap?.activatesFeatures);
```

---

### Common Causes

#### 1. Feature Not in activatesFeatures Array

**Symptom**: Feature missing from capability's `activatesFeatures`.

**Fix**: Add feature to capability in `BusinessModelRegistry.ts`:

```typescript
'my_capability': {
  activatesFeatures: [
    // ... existing
    'my_missing_feature',  // ← ADD THIS
  ]
}
```

---

#### 2. Feature Activation Engine Not Running

**Symptom**: `activeFeatures` is empty even with capabilities selected.

**Fix**: Ensure FeatureActivationEngine is called:

```typescript
// Check if this runs on capability change
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';

const { activeFeatures } = FeatureActivationEngine.activateFeatures(
  selectedCapabilities,
  selectedInfrastructure
);

// Should populate activeFeatures
```

---

#### 3. Store Not Recomputing After Change

**Symptom**: Features don't update when capabilities change.

**Fix**: Check store action calls `FeatureActivationEngine`:

```typescript
// In toggleCapability action
const { activeFeatures } = FeatureActivationEngine.activateFeatures(
  newCapabilities,
  updatedProfile.selectedInfrastructure
);

// Must update state with new activeFeatures
setState({
  features: {
    ...state.features,
    activeFeatures  // ← Must update
  }
});
```

---

#### 4. Typo in Feature ID

**Symptom**: Feature ID doesn't match registry.

**Fix**: Use TypeScript autocomplete or check `FeatureRegistry.ts`:

```typescript
// ❌ WRONG
'sales_pos_on_site'

// ✅ CORRECT
'sales_pos_onsite'
```

---

### Solution Patterns

#### Pattern A: Force Recomputation

```typescript
// Manually trigger recomputation
const { profile } = useCapabilityStore.getState();

if (profile) {
  const { activeFeatures } = FeatureActivationEngine.activateFeatures(
    profile.selectedCapabilities,
    profile.selectedInfrastructure
  );

  useCapabilityStore.setState({
    features: {
      ...useCapabilityStore.getState().features,
      activeFeatures
    }
  });
}
```

---

#### Pattern B: Clear and Reinitialize

```typescript
// Nuclear option - clear store and reinitialize
const { profile, resetProfile, initializeProfile } = useCapabilityStore.getState();

const savedProfile = { ...profile };
resetProfile();
initializeProfile(savedProfile);
```

---

### Prevention

1. **Use TypeScript**: Prevents typos in feature IDs
2. **Test capability changes**: Write tests for each capability
3. **Log feature activation**: Add logging to FeatureActivationEngine
4. **Validate registries**: Test that all referenced features exist

---

## Modules Not Showing in Navigation

### Symptom

Modules you expect in navigation are not visible, even with correct capabilities.

---

### How to Debug Module Feature Mapping

> ⚡ **NEW v3.0**: Uses dynamic generation from manifests.

```typescript
// Step 1: Check active features
const activeFeatures = useActiveFeatures();
console.log('Active features:', activeFeatures);

// Step 2: Check dynamic MODULE_FEATURE_MAP
import { getDynamicModuleFeatureMap } from '@/config/FeatureRegistry';

const moduleId = 'my-module';
const moduleFeatureMap = getDynamicModuleFeatureMap();
const config = moduleFeatureMap[moduleId];
console.log('Module config:', config);

// Step 3: Check requirements
if (config.requiredFeatures) {
  const hasAll = config.requiredFeatures.every(f =>
    activeFeatures.includes(f)
  );
  console.log('Has all required features:', hasAll);
  console.log('Missing required:', config.requiredFeatures.filter(f =>
    !activeFeatures.includes(f)
  ));
}

if (config.optionalFeatures) {
  const hasAny = config.optionalFeatures.some(f =>
    activeFeatures.includes(f)
  );
  console.log('Has any optional feature:', hasAny);
  console.log('Matching optional:', config.optionalFeatures.filter(f =>
    activeFeatures.includes(f)
  ));
}

// Step 4: Check computed modules
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

const modules = getModulesForActiveFeatures(activeFeatures);
console.log('Visible modules:', modules);
console.log('Contains my-module?', modules.includes(moduleId));
```

---

### Common Mistakes

#### 1. Missing Features in Manifest

**Symptom**: Module never appears even with features active.

**Cause**: Module manifest doesn't declare required/optional features.

**Fix (v3.0)**: Update your **module manifest** (NOT FeatureRegistry):

```typescript
// src/modules/my-module/manifest.tsx
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  // Add features that activate this module
  requiredFeatures: [], // Features that MUST be active (AND logic)
  optionalFeatures: [
    'feature_that_activates_module' // At least ONE must be active (OR logic)
  ],
  // ... rest of manifest
};
```

---

#### 2. Using AND Instead of OR

**Symptom**: Module only shows when ALL features are active, but you want OR logic.

**Cause**: Using `requiredFeatures` instead of `optionalFeatures` in manifest.

**Fix (v3.0)**: Change manifest to use `optionalFeatures`:

```typescript
// ❌ WRONG - Requires ALL (AND logic)
export const myModuleManifest: ModuleManifest = {
  requiredFeatures: [
    'feature_a',
    'feature_b',
    'feature_c'
  ]
};

// ✅ CORRECT - At least ONE (OR logic)
export const myModuleManifest: ModuleManifest = {
  optionalFeatures: [
    'feature_a',
    'feature_b', 
    'feature_c'
  ]
};
```

---

#### 3. Module Not Registered

**Symptom**: Module in manifest but still doesn't show.

**Cause**: Module not added to `ALL_MODULE_MANIFESTS` in `src/modules/index.ts`.

**Fix**: Add manifest to the exports:

```typescript
// src/modules/index.ts
import { myModuleManifest } from './my-module/manifest';

export const ALL_MODULE_MANIFESTS = [
  // ... existing
  myModuleManifest, // Add here
];
```

**Note**: Once added, the dynamic system handles the rest automatically!

---

#### 4. Wrong Feature IDs

**Symptom**: Module config references wrong feature IDs.

**Cause**: Typo or outdated feature ID in manifest.

**Fix**: Check valid feature IDs in `src/config/types/atomic-capabilities.ts`:

```typescript
// Verify your feature exists
export type FeatureId = 
  | 'sales_order_management'
  | 'inventory_stock_tracking'
  // ... etc

// Then use correct ID in manifest
export const myModuleManifest: ModuleManifest = {
  requiredFeatures: ['sales_order_management'], // ✅ Correct ID
  // NOT: 'sales_management' ❌
};
```

**Fix**: Change to `optionalFeatures`:

```typescript
// ❌ WRONG - Requires ALL
'my-module': {
  requiredFeatures: [
    'feature_a',  // Must have all 3
    'feature_b',
    'feature_c'
  ]
}

// ✅ CORRECT - Requires ANY
'my-module': {
  optionalFeatures: [
    'feature_a',  // At least one
    'feature_b',
    'feature_c'
  ]
}
```

---

#### 3. Missing Module Registration

**Symptom**: Module in MODULE_FEATURE_MAP but still doesn't show.

**Cause**: Module not registered in module system or navigation.

**Fix**: Register module in `routeMap.ts`:

```typescript
import { myModuleManifest } from '@/pages/admin/my-module';

export const routeMap = {
  'my-module': {
    path: '/admin/my-module',
    component: lazy(() => import('@/pages/admin/my-module/page')),
    manifest: myModuleManifest
  }
};
```

---

#### 4. Feature ID Mismatch

**Symptom**: Module config references wrong feature IDs.

**Cause**: Typo or outdated feature ID.

**Fix**: Verify feature IDs exist in `FeatureRegistry.ts`:

```typescript
// Check if feature exists
import { getFeature } from '@/config/FeatureRegistry';

const feature = getFeature('my_feature');
if (!feature) {
  console.error('Feature does not exist!');
}
```

---

### Solution Patterns

#### Pattern A: Debug Helper

```typescript
// Add to component for debugging
function NavigationDebugger() {
  const activeFeatures = useActiveFeatures();
  const visibleModules = useCapabilityStore(state => state.getActiveModules());

  return (
    <details>
      <summary>Navigation Debug</summary>
      <pre>
        Active Features: {JSON.stringify(activeFeatures, null, 2)}
        {'\n\n'}
        Visible Modules: {JSON.stringify(visibleModules, null, 2)}
      </pre>
    </details>
  );
}
```

---

#### Pattern B: Validation Script

```typescript
// Validate MODULE_FEATURE_MAP
function validateModuleFeatureMap() {
  const errors: string[] = [];

  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    // Check requiredFeatures exist
    config.requiredFeatures?.forEach(featureId => {
      if (!getFeature(featureId)) {
        errors.push(`Module "${moduleId}" references non-existent required feature "${featureId}"`);
      }
    });

    // Check optionalFeatures exist
    config.optionalFeatures?.forEach(featureId => {
      if (!getFeature(featureId)) {
        errors.push(`Module "${moduleId}" references non-existent optional feature "${featureId}"`);
      }
    });
  });

  if (errors.length > 0) {
    console.error('MODULE_FEATURE_MAP validation errors:', errors);
  } else {
    console.log('✅ MODULE_FEATURE_MAP is valid');
  }

  return errors;
}

// Run in dev
if (process.env.NODE_ENV === 'development') {
  validateModuleFeatureMap();
}
```

---

### Prevention

1. **Use TypeScript autocomplete** when writing MODULE_FEATURE_MAP
2. **Write tests** for module visibility
3. **Document** requiredFeatures vs optionalFeatures pattern
4. **Validate** MODULE_FEATURE_MAP on startup in dev

---

## Store Hydration Issues

### Symptom

Store data is lost, empty, or incorrect after page reload.

---

### Understanding Hydration Lifecycle

```
1. Page loads
2. Store initializes with default state
3. Zustand persist reads localStorage
4. onFinishHydration fires
5. hasHydrated() returns true
6. Components can safely read store
```

**Problem**: Reading store before hydration completes.

---

### Common Problems

#### 1. Reading Before Hydration

**Symptom**: Components show "no data" briefly, then correct data loads.

**Cause**: Reading store before `hasHydrated()` is true.

**Fix**: Wait for hydration:

```typescript
function MyComponent() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useCapabilityStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubscribe;
  }, []);

  if (!hydrated) {
    return <LoadingSpinner />;
  }

  // Now safe to use store
  const { profile } = useCapabilities();
  return <div>{profile?.businessName}</div>;
}
```

---

#### 2. Race Conditions

**Symptom**: Sometimes data loads, sometimes doesn't.

**Cause**: Accessing store in race with hydration.

**Fix**: Use synchronous check:

```typescript
function MyComponent() {
  const hasHydrated = useCapabilityStore.persist.hasHydrated();

  if (!hasHydrated) {
    return <LoadingSpinner />;
  }

  // Safe to use store
}
```

---

#### 3. Empty State After Hydration

**Symptom**: Hydration completes but store is empty.

**Cause**: LocalStorage cleared or corrupted.

**Fix**: Implement fallback to DB:

```typescript
useEffect(() => {
  const unsubscribe = useCapabilityStore.persist.onFinishHydration(async (state) => {
    if (!state.profile) {
      // LocalStorage empty - try DB
      const loaded = await useCapabilityStore.getState().loadFromDB();

      if (!loaded) {
        // No data anywhere - redirect to setup
        navigate('/setup');
      }
    }
  });

  return unsubscribe;
}, []);
```

---

#### 4. Hydration Overwrites Changes

**Symptom**: User makes changes, they disappear on reload.

**Cause**: Changes not persisted before hydration.

**Fix**: Ensure auto-save in actions:

```typescript
toggleCapability: (capabilityId) => {
  set((state) => {
    const updatedProfile = {
      ...state.profile,
      selectedCapabilities: newCapabilities
    };

    // Persist immediately (async, don't wait)
    saveProfileToDB(updatedProfile).catch(err => {
      logger.error('Failed to save:', err);
    });

    return { ...state, profile: updatedProfile };
  });
}
```

---

### Solution Patterns

#### Pattern A: Hydration Guard Hook

```typescript
export function useHydration() {
  const [hydrated, setHydrated] = useState(
    useCapabilityStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsubscribe = useCapabilityStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubscribe;
  }, []);

  return hydrated;
}

// Use in components
function MyComponent() {
  const hydrated = useHydration();

  if (!hydrated) return <LoadingSpinner />;

  // Safe to use store
}
```

---

#### Pattern B: Hydration Provider

```typescript
const HydrationContext = createContext(false);

export function HydrationProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useCapabilityStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubscribe;
  }, []);

  if (!hydrated) return <AppLoadingScreen />;

  return (
    <HydrationContext.Provider value={hydrated}>
      {children}
    </HydrationContext.Provider>
  );
}

// Use
function App() {
  return (
    <HydrationProvider>
      <Router />
    </HydrationProvider>
  );
}
```

---

### Prevention

1. **Always wait for hydration** before reading store
2. **Use hydration guards** in root components
3. **Implement fallback to DB** if localStorage empty
4. **Log hydration lifecycle** in dev

---

## Performance Issues

### Symptom

Components re-render unnecessarily, app feels slow.

---

### Profiling Tools

```typescript
// React DevTools Profiler
import { Profiler } from 'react';

function MyComponent() {
  return (
    <Profiler
      id="MyComponent"
      onRender={(id, phase, actualDuration) => {
        console.log(`${id} (${phase}) took ${actualDuration}ms`);
      }}
    >
      {/* Component content */}
    </Profiler>
  );
}
```

---

### Common Causes

#### 1. Selector Re-computation

**Symptom**: Component re-renders on every store change.

**Cause**: Using full `useCapabilities()` instead of specific selector.

**Fix**: Use specific hooks:

```typescript
// ❌ BAD - Re-renders on ANY store change
function MyComponent() {
  const { activeFeatures, profile, isLoading } = useCapabilities();

  // Only uses activeFeatures, but re-renders when profile or isLoading change
  return <div>{activeFeatures.length}</div>;
}

// ✅ GOOD - Only re-renders when activeFeatures change
function MyComponent() {
  const activeFeatures = useActiveFeatures();

  return <div>{activeFeatures.length}</div>;
}
```

---

#### 2. Unnecessary Re-renders

**Symptom**: Child components re-render when parent updates.

**Cause**: Not memoizing expensive computations.

**Fix**: Use `useMemo` and `useCallback`:

```typescript
function FeatureList() {
  const activeFeatures = useActiveFeatures();

  // ❌ BAD - Creates new array on every render
  const sortedFeatures = activeFeatures
    .map(getFeature)
    .sort((a, b) => a.name.localeCompare(b.name));

  // ✅ GOOD - Only recomputes when activeFeatures change
  const sortedFeatures = useMemo(() => {
    return activeFeatures
      .map(getFeature)
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name));
  }, [activeFeatures]);

  return (
    <ul>
      {sortedFeatures.map(f => <li key={f.id}>{f.name}</li>)}
    </ul>
  );
}
```

---

#### 3. Large State Objects

**Symptom**: Slow store updates.

**Cause**: Zustand copying large nested objects.

**Fix**: Flatten state structure or use immer:

```typescript
// ❌ BAD - Deep nesting
interface State {
  data: {
    capabilities: {
      selected: {
        ids: string[];
        metadata: { ... };
      };
    };
  };
}

// ✅ GOOD - Flat structure
interface State {
  selectedCapabilities: string[];
  capabilityMetadata: Record<string, any>;
}
```

---

### Solutions

#### Solution A: Selector Optimization

```typescript
// Create specific selectors
export const useActiveFeatureCount = () =>
  useCapabilityStore(state => state.features.activeFeatures.length);

export const useBusinessName = () =>
  useCapabilityStore(state => state.profile?.businessName);

// Use specific selectors
function Header() {
  const count = useActiveFeatureCount();
  const name = useBusinessName();

  return <div>{name}: {count} features</div>;
}
```

---

#### Solution B: Memoization Pattern

```typescript
function FeatureStats() {
  const activeFeatures = useActiveFeatures();

  const stats = useMemo(() => {
    const byDomain: Record<string, number> = {};

    activeFeatures.forEach(featureId => {
      const feature = getFeature(featureId);
      if (feature) {
        byDomain[feature.domain] = (byDomain[feature.domain] || 0) + 1;
      }
    });

    return byDomain;
  }, [activeFeatures]);

  return <StatChart data={stats} />;
}
```

---

#### Solution C: Virtual Lists

For long lists:

```typescript
import { FixedSizeList } from 'react-window';

function FeatureList() {
  const activeFeatures = useActiveFeatures();

  const Row = ({ index, style }) => {
    const featureId = activeFeatures[index];
    const feature = getFeature(featureId);

    return (
      <div style={style}>
        {feature?.name}
      </div>
    );
  };

  return (
    <FixedSizeList
      height={400}
      itemCount={activeFeatures.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

### Prevention

1. **Use specific selectors** instead of full store
2. **Memoize expensive computations**
3. **Profile regularly** with React DevTools
4. **Keep state flat** avoid deep nesting
5. **Use virtual lists** for long lists

---

## Requirement Validation Issues

### Symptom

Requirements not validating correctly, achievements not unlocking.

---

### Common Causes

#### 1. Validator Function Errors

**Symptom**: Achievement never completes even when condition met.

**Cause**: Validator throwing error or returning wrong value.

**Debug**:

```typescript
// Test validator manually
const achievement = getRequirementsForCapability('onsite_service')[0];

const context = {
  profile: useCapabilityStore.getState().profile,
  tables: [], // Mock context
  // ... other context
};

try {
  const result = achievement.validator(context);
  console.log(`Validator result: ${result}`);
} catch (error) {
  console.error('Validator error:', error);
}
```

---

#### 2. Context Missing Data

**Symptom**: Validator always returns false.

**Cause**: Validation context missing required data.

**Fix**: Ensure context includes all data:

```typescript
const validator = (ctx) => (ctx.tables?.length || 0) > 0;

// ❌ BAD - Missing tables
const context = {
  profile: { ... }
};

// ✅ GOOD - Includes tables
const context = {
  profile: { ... },
  tables: await fetchTables()
};
```

---

### Prevention

1. **Test validators** in isolation
2. **Add error handling** to validators
3. **Log validation context** in dev
4. **Document** required context fields

---

## Testing Issues

### Common Test Failures

#### 1. Mock Setup

```typescript
// Proper mock setup
jest.mock('@/store/capabilityStore', () => ({
  useCapabilities: jest.fn(),
  useActiveFeatures: jest.fn(),
  useCapabilityStore: {
    getState: jest.fn(),
    setState: jest.fn()
  }
}));

beforeEach(() => {
  (useCapabilities as jest.Mock).mockReturnValue({
    activeFeatures: ['sales_order_management'],
    hasFeature: (id: string) => id === 'sales_order_management',
    profile: { businessName: 'Test' }
  });
});
```

---

#### 2. Async Test Issues

```typescript
// Wait for hydration in tests
test('loads profile', async () => {
  const { result, waitFor } = renderHook(() => useCapabilities());

  await waitFor(() => {
    expect(result.current.profile).not.toBeNull();
  });

  expect(result.current.profile?.businessName).toBe('Test');
});
```

---

## Next Steps

- **For development**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **For API reference**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **For patterns**: See [PATTERNS.md](./PATTERNS.md)
- **For migrations**: See [MIGRATIONS.md](./MIGRATIONS.md)
