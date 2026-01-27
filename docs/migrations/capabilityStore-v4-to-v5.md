# capabilityStore Migration Guide - V4 to V5

**Status**: ✅ Service layer complete, store refactored  
**Next Step**: Update consumers to use new architecture  
**Date**: 2025-01-16

---

## 🎯 Migration Summary

### What Changed

**V4 (Old - 968 lines)**:
- ❌ Mixed responsibilities (profile + features + DB + UI)
- ❌ Business logic in store
- ❌ DB operations in store
- ❌ isLoading managed manually

**V5 (New - 250 lines)**:
- ✅ Service layer for business logic (`featureActivationService.ts`)
- ✅ TanStack Query for DB operations (`useBusinessProfile.ts`)
- ✅ Zustand store only for UI state (`capabilityStore.v5.ts`)
- ✅ 71% size reduction

---

## 📦 New Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Business Profile (TanStack Query)             │
│ - Server state (profile from DB)                        │
│ - Loading/error handling automatic                      │
│ - Files: useBusinessProfile.ts                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Feature Activation (Service Layer)            │
│ - Pure business logic (stateless)                       │
│ - Feature queries (hasFeature, hasAllFeatures)          │
│ - Files: featureActivationService.ts                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Feature State (Zustand Store)                 │
│ - Client UI state only                                  │
│ - Atomic selectors for performance                      │
│ - Files: capabilityStore.v5.ts                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Migration Steps for Consumers

### Step 1: Profile Operations → TanStack Query

**BEFORE (V4)**:
```typescript
import { useCapabilities } from '@/store/capabilityStore';

function MyComponent() {
  const { profile, isLoading, loadFromDB, saveToDB } = useCapabilities();

  useEffect(() => {
    loadFromDB();
  }, []);

  const handleSave = () => {
    saveToDB();
  };

  if (isLoading) return <Spinner />;

  return <div>{profile.businessName}</div>;
}
```

**AFTER (V5)**:
```typescript
import { useBusinessProfile, useUpdateProfile } from '@/lib/capabilities';

function MyComponent() {
  const { profile, isLoading, error } = useBusinessProfile();
  const { updateProfile } = useUpdateProfile();

  // No need for loadFromDB - TanStack Query handles it automatically

  const handleSave = () => {
    updateProfile({ businessName: 'New Name' });
  };

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;

  return <div>{profile.businessName}</div>;
}
```

### Step 2: Capability Toggle → TanStack Query

**BEFORE (V4)**:
```typescript
import { useCapabilities } from '@/store/capabilityStore';

function CapabilitySelector() {
  const { toggleCapability } = useCapabilities();

  const handleToggle = (capId) => {
    toggleCapability(capId); // Updates store + DB
  };

  return <button onClick={() => handleToggle('onsite_sales')}>Toggle</button>;
}
```

**AFTER (V5)**:
```typescript
import { useToggleCapability } from '@/lib/capabilities';

function CapabilitySelector() {
  const { toggleCapability, isToggling } = useToggleCapability();

  const handleToggle = (capId) => {
    toggleCapability(capId); // TanStack mutation handles store + DB
  };

  return (
    <button
      onClick={() => handleToggle('onsite_sales')}
      disabled={isToggling}
    >
      Toggle
    </button>
  );
}
```

### Step 3: Feature Queries → Service Layer

**BEFORE (V4)**:
```typescript
import { useCapabilities } from '@/store/capabilityStore';

function MyComponent() {
  const { hasFeature, hasAllFeatures, activeFeatures } = useCapabilities();

  const canUsePOS = hasFeature('sales_pos_onsite');
  const canSell = hasAllFeatures(['sales_pos_onsite', 'sales_payment_processing']);

  return <div>Features: {activeFeatures.length}</div>;
}
```

**AFTER (V5) - Option A (Atomic Selectors - RECOMMENDED)**:
```typescript
import { useFeatureV5, useActiveFeaturesV5 } from '@/store/capabilityStore.v5';
import { hasFeature, hasAllFeatures } from '@/lib/capabilities';

function MyComponent() {
  // Atomic selector - only re-renders when activeFeatures changes
  const activeFeatures = useActiveFeaturesV5();

  const canUsePOS = hasFeature(activeFeatures, 'sales_pos_onsite');
  const canSell = hasAllFeatures(activeFeatures, [
    'sales_pos_onsite',
    'sales_payment_processing'
  ]);

  return <div>Features: {activeFeatures.length}</div>;
}
```

**AFTER (V5) - Option B (Store Methods)**:
```typescript
import { useCapabilityStoreV5 } from '@/store/capabilityStore.v5';

function MyComponent() {
  const hasFeature = useCapabilityStoreV5(state => state.hasFeature);
  const activeFeatures = useCapabilityStoreV5(state => state.features.activeFeatures);

  const canUsePOS = hasFeature('sales_pos_onsite');

  return <div>Features: {activeFeatures.length}</div>;
}
```

### Step 4: Setup Actions → TanStack Query

**BEFORE (V4)**:
```typescript
import { useCapabilities } from '@/store/capabilityStore';

function SetupWizard() {
  const { completeSetup, dismissWelcome } = useCapabilities();

  const handleComplete = () => {
    completeSetup(); // Updates store + DB
  };

  const handleDismiss = () => {
    dismissWelcome(); // Updates store + DB
  };

  return <button onClick={handleComplete}>Complete</button>;
}
```

**AFTER (V5)**:
```typescript
import { useCompleteSetup, useDismissWelcome } from '@/lib/capabilities';

function SetupWizard() {
  const { completeSetup, isCompleting } = useCompleteSetup();
  const { dismissWelcome, isDismissing } = useDismissWelcome();

  const handleComplete = () => {
    completeSetup(); // TanStack mutation handles store + DB
  };

  const handleDismiss = () => {
    dismissWelcome(); // TanStack mutation handles store + DB
  };

  return (
    <button onClick={handleComplete} disabled={isCompleting}>
      Complete
    </button>
  );
}
```

---

## 📋 Migration Checklist

Search for these patterns in your codebase:

- [ ] `import { useCapabilities } from '@/store/capabilityStore'`
- [ ] `loadFromDB()`
- [ ] `saveToDB()`
- [ ] `initializeProfile()`
- [ ] `toggleCapability()`
- [ ] `setCapabilities()`
- [ ] `setInfrastructure()`
- [ ] `toggleInfrastructure()`
- [ ] `completeSetup()`
- [ ] `dismissWelcome()`
- [ ] `resetProfile()`
- [ ] `isLoading` (from capabilityStore)

Replace with:

- [x] `import { useBusinessProfile, useUpdateProfile, ... } from '@/lib/capabilities'`
- [x] `useBusinessProfile()` (auto-loads, no manual call)
- [x] `useUpdateProfile().updateProfile()`
- [x] `useInitializeProfile().initializeProfile()`
- [x] `useToggleCapability().toggleCapability()`
- [x] `useUpdateProfile().updateProfile({ selectedCapabilities })`
- [x] `useSetInfrastructure().setInfrastructure()`
- [x] `useUpdateProfile().updateProfile({ selectedInfrastructure })`
- [x] `useCompleteSetup().completeSetup()`
- [x] `useDismissWelcome().dismissWelcome()`
- [x] `useResetProfile().resetProfile()`
- [x] `useBusinessProfile().isLoading`

---

## 🧪 Testing After Migration

```bash
# 1. Run service layer tests
pnpm vitest run src/lib/capabilities/__tests__/featureActivationService.test.ts

# 2. Type check
pnpm tsc --noEmit

# 3. Run all tests
pnpm test

# 4. Manual testing
pnpm dev
# - Test profile loading
# - Test capability toggle
# - Test setup wizard
# - Test feature queries
```

---

## ⚠️ Breaking Changes

### 1. Profile Loading is Automatic

**V4**: Manual `loadFromDB()` call required  
**V5**: TanStack Query loads automatically (no action needed)

```typescript
// ❌ V4 - Manual loading
useEffect(() => {
  loadFromDB();
}, []);

// ✅ V5 - Automatic
const { profile, isLoading } = useBusinessProfile();
```

### 2. Feature Queries are Pure Functions

**V4**: Methods from store  
**V5**: Pure functions from service

```typescript
// ❌ V4 - Store method
const { hasFeature } = useCapabilities();
hasFeature('sales_pos_onsite');

// ✅ V5 - Pure function
import { hasFeature } from '@/lib/capabilities';
const activeFeatures = useActiveFeaturesV5();
hasFeature(activeFeatures, 'sales_pos_onsite');
```

### 3. Mutations Return Loading State

**V4**: Global `isLoading` for all operations  
**V5**: Per-mutation `isPending` state

```typescript
// ❌ V4 - Global loading
const { isLoading, saveToDB } = useCapabilities();

// ✅ V5 - Per-mutation loading
const { updateProfile, isUpdating } = useUpdateProfile();
```

---

## 🎁 Benefits

1. ✅ **71% size reduction** (968 → 250 lines)
2. ✅ **Separation of concerns** (service vs store vs server)
3. ✅ **Better performance** (atomic selectors, TanStack Query caching)
4. ✅ **Easier testing** (pure functions)
5. ✅ **Consistent patterns** (same as salesStore, shiftStore)
6. ✅ **Automatic request deduplication** (TanStack Query)
7. ✅ **Optimistic updates** (TanStack Query)
8. ✅ **Error handling** (TanStack Query)

---

## 📚 References

- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Cross-Module Architecture](./docs/cross-module/CROSS_MODULE_DATA_ARCHITECTURE.md)
- [Sales Store Migration](./docs/migrations/salesStore-migration.md)
- [Shift Store Migration](./docs/migrations/shiftStore-migration.md)

---

## 🚀 Next Steps

1. Search for consumers: `pnpm grep -l "useCapabilities" --include="*.tsx"`
2. Update consumers one by one (test after each)
3. Run full test suite
4. Deploy to staging
5. Monitor for issues
6. Replace old store with v5 (rename files)

---

**Last Updated**: 2025-01-16  
**Migration Status**: Service layer complete, awaiting consumer updates  
**Estimated Consumer Updates**: ~20 files
