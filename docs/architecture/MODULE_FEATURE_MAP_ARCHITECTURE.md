# MODULE_FEATURE_MAP Architecture Decision

**Date:** 2026-01-15  
**Status:** ✅ Active  
**Type:** Architecture Decision Record (ADR)

---

## Context

We needed to map modules to their required/optional features for dynamic navigation. This creates a **duplication problem**:

1. **Source 1:** `src/config/FeatureRegistry.ts` → `MODULE_FEATURE_MAP` (static)
2. **Source 2:** `src/modules/*/manifest.tsx` → `requiredFeatures` / `optionalFeatures` (per module)

---

## Problem

When adding or modifying a module, devs must update **both** places or navigation breaks. Potential solutions:

| Solution | Pros | Cons |
|----------|------|------|
| **A: Static Map + Test** | Simple, fast, industry standard | Intentional duplication |
| **B: Build-time Generation** | No duplication, single source | Complex script, fragile AST parsing |
| **C: Runtime Discovery** | No duplication, dynamic | Chicken-and-egg timing issue |
| **D: JSON Metadata** | Easy to parse, validated | Two files per module |

---

## Decision

**We chose Option A: Static Map + Test Validation**

### Rationale

1. **Industry Standard:**  
   - ESLint: `package.json` metadata vs plugin code
   - Babel: `package.json` exports vs transform code  
   - Webpack: `package.json` exports vs loader code
   - VS Code: `package.json` contributes vs extension code

2. **Simplicity:**  
   - No build scripts
   - No AST parsing
   - No import resolution issues
   - Works in all environments

3. **Performance:**  
   - No runtime overhead
   - No dynamic imports at startup
   - Immediate availability

4. **Safety:**  
   - Test ensures synchronization: `src/__tests__/module-feature-map-validation.test.ts`
   - CI fails if they drift out of sync
   - Clear error messages showing exactly what needs updating

---

## Implementation

### Static Map

```typescript
// src/config/FeatureRegistry.ts
export const MODULE_FEATURE_MAP: Record<string, {
  alwaysActive?: boolean;
  requiredFeatures?: FeatureId[];
  optionalFeatures?: FeatureId[];
  description?: string;
}> = {
  'sales': {
    requiredFeatures: ['sales_order_management'],
    optionalFeatures: ['sales_payment_processing', ...],
    description: 'Módulo de ventas'
  },
  // ... rest of modules
};
```

### Validation Test

```typescript
// src/__tests__/module-feature-map-validation.test.ts
describe('MODULE_FEATURE_MAP validation', () => {
  it('should match all module manifests', () => {
    ALL_MODULE_MANIFESTS.forEach(manifest => {
      const mapEntry = MODULE_FEATURE_MAP[manifest.id];
      expect(mapEntry?.requiredFeatures).toEqual(manifest.requiredFeatures);
      expect(mapEntry?.optionalFeatures).toEqual(manifest.optionalFeatures);
    });
  });
});
```

### Usage

```typescript
// src/contexts/FeatureFlagContext.tsx
const activeModules = getModulesForActiveFeatures(activeFeatures);
// Uses MODULE_FEATURE_MAP directly - fast, synchronous
```

---

## Consequences

### Positive

- ✅ Simple to understand and maintain
- ✅ Fast (no runtime overhead)
- ✅ Follows industry best practices
- ✅ Validated automatically in CI
- ✅ Clear error messages when out of sync

### Negative

- ❌ Intentional duplication (validated)
- ❌ Must remember to update both places
- ❌ Test must run to catch errors

### Mitigation

- Test runs in CI on every PR
- Test output shows **exactly** what to fix
- Clear comments in code point to the test

---

## Maintenance Workflow

### Adding a New Module

1. Create `src/modules/my-module/manifest.tsx`:
   ```typescript
   export const myModuleManifest: ModuleManifest = {
     id: 'my-module',
     requiredFeatures: ['my_feature'],
     optionalFeatures: ['optional_feature'],
     metadata: { navigation: { ... } }
   };
   ```

2. Add entry to `MODULE_FEATURE_MAP`:
   ```typescript
   'my-module': {
     requiredFeatures: ['my_feature'],
     optionalFeatures: ['optional_feature'],
     description: 'My module description'
   }
   ```

3. Run test:
   ```bash
   pnpm test src/__tests__/module-feature-map-validation.test.ts
   ```

4. If test fails, update `MODULE_FEATURE_MAP` based on error messages

---

## Alternatives Considered But Rejected

### Build-Time Generation (Option B)

**Why rejected:**  
- Requires AST parsing (ts-morph or TS Compiler API)
- Fragile to changes in manifest structure
- Adds build complexity
- Most projects don't use this approach

**When to reconsider:**  
If we have >100 modules and manual sync becomes painful

### Runtime Discovery (Option C)

**Why rejected:**  
- Chicken-and-egg problem: `FeatureFlagProvider` mounts before modules register
- Async initialization complexity
- Performance overhead

**When to reconsider:**  
If we refactor to two-phase initialization

### JSON Metadata (Option D)

**Why rejected:**  
- Requires two files per module (`manifest.json` + `manifest.tsx`)
- More migration work (34 modules to refactor)
- Less TypeScript type safety

**When to reconsider:**  
If we need to consume metadata from non-TypeScript tools

---

## References

- **Industry Patterns:**
  - [ESLint Plugin System](https://eslint.org/docs/latest/extend/plugins)
  - [Babel Plugin System](https://babeljs.io/docs/en/plugins/)
  - [VS Code Extension API](https://code.visualstudio.com/api/references/contribution-points)
  
- **Codebase:**
  - Test: `src/__tests__/module-feature-map-validation.test.ts`
  - Map: `src/config/FeatureRegistry.ts` (MODULE_FEATURE_MAP)
  - Manifests: `src/modules/*/manifest.tsx`

---

## Questions?

**Q: Why not just generate it at build-time?**  
A: Most projects don't. ESLint/Babel/Webpack all use static metadata + validation. It's simpler and more reliable.

**Q: What if I forget to update the map?**  
A: The test will fail in CI with a clear error message showing exactly what's missing.

**Q: Can we automate this in the future?**  
A: Yes, if the number of modules grows significantly (>100), we can revisit build-time generation.

---

**Last Updated:** 2026-01-15  
**Next Review:** When we reach 50+ modules or team requests automation
