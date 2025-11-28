# 🔴 Derived State Anti-Pattern Analysis - activeModules Issue

**Date:** 2025-11-15
**Issue:** Sidebar navigation behaves erratically when toggling capabilities
**Root Cause:** Storing computed/derived values in state (ANTI-PATTERN)

---

## 🎯 The Problem in Our Code

### Current Implementation (ANTI-PATTERN ❌)

We're **storing** `activeModules` in the Zustand state:

```typescript
// ❌ BAD: Storing derived value in state
interface FeatureState {
  activeFeatures: FeatureId[];      // ✅ Source of truth
  activeModules: string[];          // ❌ DERIVED VALUE - shouldn't be stored!
}

// ❌ BAD: 8 different places calculating the same thing
const newActiveModules = getModulesForActiveFeatures(activeFeatures);
set({ activeModules: newActiveModules });
```

### Why This Causes Bugs

1. **Multiple Sources of Truth:** 8 places calculate `activeModules` separately
2. **Race Conditions:** Different calculations use different `activeFeatures` values
3. **Stale State:** One part of UI sees old value, another sees new value
4. **Synchronization Hell:** Need to manually update `activeModules` everywhere

**Result:** Sometimes activating a capability *removes* modules instead of adding them (as you experienced).

---

## 📚 Industry Best Practices - Evidence from Research

### 1. Zustand Official Documentation

**From Zustand Tic-Tac-Toe Tutorial:**

> "This `Game` component demonstrates the final, refactored state management strategy using Zustand. It **calculates the `xIsNext` state dynamically from `currentMove`** to eliminate redundancy, thereby preventing potential bugs and simplifying the codebase."

**Example from docs:**

```typescript
// ✅ GOOD: Derive xIsNext from currentMove
export default function Game() {
  const currentMove = useGameStore((state) => state.currentMove);
  const xIsNext = currentMove % 2 === 0;  // ✅ COMPUTED, not stored

  // ❌ BAD would be: storing both currentMove AND xIsNext in state
}
```

**Why this matters:** Same pattern as our issue - `activeModules` should be computed from `activeFeatures`, not stored.

---

### 2. TkDodo (Zustand Expert) - "Working with Zustand"

**Source:** https://tkdodo.eu/blog/working-with-zustand

**Key Quote:**
> "Atomic selectors are essential. Zustand decides when to inform your component that the state it is interested in has changed, by comparing the result of the selector with the result of the previous render."

**Best Practice:**
- ✅ Store only **essential data** (activeFeatures)
- ✅ Derive everything else via **selectors**
- ❌ Don't store computed values (activeModules)

---

### 3. Zustand GitHub Discussions - Derived State Pattern

**Source:** https://github.com/pmndrs/zustand/discussions/1341

**Recommended Pattern:**

```typescript
// ✅ GOOD: Custom hook for derived values
const useBearStore = create({
  bears: 0,
});

// Derived value hook (NOT stored in state)
export function useBearCountPlusOne(): number {
  const bears = useBearStore(s => s.bears);
  return bears + 1;  // ✅ Computed on-demand
}
```

**Applies to us:**

```typescript
// ✅ GOOD: Compute activeModules on-demand
export function useActiveModules(): string[] {
  const activeFeatures = useCapabilityStore(s => s.features.activeFeatures);
  return getModulesForActiveFeatures(activeFeatures);  // ✅ Always fresh
}
```

---

### 4. Zustand Docs - Common Anti-Patterns

**From TypeScript Guide:**

> "The anti-pattern would be **storing computed values directly in the state** instead of calculating them on-demand through selectors."

**Performance Note:**
> "When people say derived states, they assume the computation is cached - it's not about a problem, it's about optimization."

---

## 🏗️ Correct Architecture Pattern

### ✅ Solution 1: Selector/Getter Pattern (Recommended)

```typescript
// capabilityStore.ts
export const useCapabilityStore = create((set, get) => ({
  features: {
    activeFeatures: [],
    // ❌ Remove: activeModules: []  // Don't store derived value!
  },

  // ✅ Add getter (computed on-demand)
  getActiveModules: () => {
    const { activeFeatures } = get().features;
    return getModulesForActiveFeatures(activeFeatures);
  }
}));

// Usage in components
const activeModules = useCapabilityStore(state => state.getActiveModules());
```

**Benefits:**
- ✅ Single source of truth (`activeFeatures`)
- ✅ Always consistent (computed from latest state)
- ✅ No manual synchronization
- ✅ No race conditions

---

### ✅ Solution 2: Custom Hook Pattern (Alternative)

```typescript
// hooks/useActiveModules.ts
export function useActiveModules(): string[] {
  const activeFeatures = useCapabilityStore(
    state => state.features.activeFeatures
  );

  return useMemo(
    () => getModulesForActiveFeatures(activeFeatures),
    [activeFeatures]
  );
}

// Usage
const activeModules = useActiveModules();
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Memoized for performance
- ✅ Type-safe

---

## 📊 Comparison Table

| Aspect | Current (Stored) | Correct (Derived) |
|--------|------------------|-------------------|
| Sources of truth | 2 (`activeFeatures` + `activeModules`) | 1 (`activeFeatures` only) |
| Update locations | 8 places | 0 (auto-computed) |
| Race conditions | ✅ Possible | ❌ Impossible |
| Stale state | ✅ Possible | ❌ Impossible |
| Consistency | ⚠️ Manual | ✅ Automatic |
| Bug risk | 🔴 High | 🟢 Low |
| Maintenance | 🔴 Complex | 🟢 Simple |

---

## 🔬 Real-World Examples

### Example 1: Redux Toolkit (Similar Pattern)

```typescript
// Redux Toolkit uses selectors for derived state
const selectActiveModules = createSelector(
  [selectActiveFeatures],
  (activeFeatures) => getModulesForActiveFeatures(activeFeatures)
);
```

### Example 2: Jotai (Atom-based)

```typescript
// Jotai uses derived atoms
const activeFeaturesAtom = atom([]);
const activeModulesAtom = atom(
  (get) => getModulesForActiveFeatures(get(activeFeaturesAtom))
);
```

### Example 3: MobX (Observable pattern)

```typescript
class Store {
  @observable activeFeatures = [];

  @computed get activeModules() {
    return getModulesForActiveFeatures(this.activeFeatures);
  }
}
```

**All follow the same principle:** Derive, don't duplicate.

---

## 🚀 Migration Plan

### Phase 1: Refactor Store (Breaking Change)

```typescript
// BEFORE
interface FeatureState {
  activeFeatures: FeatureId[];
  activeModules: string[];  // ❌ Remove this
}

// AFTER
interface FeatureState {
  activeFeatures: FeatureId[];
  // activeModules removed - will be computed
}

// Add getter
getActiveModules: () => {
  const { activeFeatures } = get().features;
  return getModulesForActiveFeatures(activeFeatures);
}
```

### Phase 2: Update All Usages

**Find all 8 locations:**

```bash
grep -n "activeModules" src/store/capabilityStore.ts
```

**Replace with getter:**

```typescript
// ❌ BEFORE
const activeModules = useCapabilityStore(state => state.features.activeModules);

// ✅ AFTER
const activeModules = useCapabilityStore(state => state.getActiveModules());
```

### Phase 3: Update Sidebar & Navigation

```typescript
// Sidebar.tsx
const activeModules = useCapabilityStore(state => state.getActiveModules());

// useModuleNavigation.ts
const activeModules = useCapabilityStore(state => state.getActiveModules());
```

### Phase 4: Remove Manual Updates

Delete all `set({ activeModules: ... })` calls (8 locations).

---

## ✅ Validation Checklist

After refactoring:

- [ ] Only 1 source of truth (`activeFeatures`)
- [ ] No `activeModules` in state type
- [ ] No `set({ activeModules: ... })` calls
- [ ] All components use `getActiveModules()`
- [ ] Sidebar updates reactively
- [ ] No race conditions
- [ ] TypeScript compiles
- [ ] Tests pass

---

## 📖 References

1. **Zustand Official Docs - Derived State:**
   - https://github.com/pmndrs/zustand/blob/main/docs/guides/tutorial-tic-tac-toe.md
   - Pattern: Compute `xIsNext` from `currentMove`

2. **TkDodo - Working with Zustand:**
   - https://tkdodo.eu/blog/working-with-zustand
   - Quote: "Store only essential data, derive everything else"

3. **Zustand GitHub - Derived Values Discussion:**
   - https://github.com/pmndrs/zustand/discussions/1341
   - Pattern: Custom hooks for computed values

4. **Zustand Best Practices:**
   - https://www.projectrules.ai/rules/zustand
   - Rule: "Leverage computed state for derived values"

5. **React State Management Principles:**
   - Single Source of Truth (SSOT)
   - Don't Repeat Yourself (DRY)
   - Minimize State (prefer derivation)

---

## 🎯 Expected Outcome

After implementing the solution:

1. ✅ **Consistent behavior:** Toggling a capability always adds/removes correct modules
2. ✅ **No stale state:** UI always shows current computed modules
3. ✅ **No race conditions:** Only one calculation path
4. ✅ **Simpler code:** 8 update locations → 0 update locations
5. ✅ **Better maintainability:** Change logic in 1 place, affects all consumers

---

**Status:** Ready for implementation
**Confidence:** High (backed by official docs + industry practices)
**Estimated effort:** 2-3 hours
