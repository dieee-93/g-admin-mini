# 🔍 Code Audit Report: Smart Alerts System

**Date:** November 19, 2025  
**Scope:** Smart Alerts Engine V2 Implementation  
**Status:** ⚠️ Critical Issues Found

---

## 🎯 Executive Summary

### Critical Findings

| Issue | Severity | Impact | Files Affected |
|-------|----------|--------|----------------|
| **Duplicate SmartAlertsEngine** | 🔴 **Critical** | 2 competing implementations | 2 files |
| **Inconsistent API Pattern** | 🟡 **High** | Old: static methods, New: instance methods | Materials, Products hooks |
| **Type System Divergence** | 🟡 **High** | SmartAlert vs CreateAlertInput | 2 type systems |
| **Unused Code** | 🟢 **Medium** | Factory function never used | SmartAlertsEngine.ts |
| **Hook Duplication** | 🟢 **Medium** | 95% similar code in 2 hooks | useSmartInventoryAlerts, useSmartProductsAlerts |

---

## 🔴 Critical Issue #1: Duplicate SmartAlertsEngine Classes

### Problem

Two **competing** implementations with **different APIs**:

**OLD (V1) - Materials Specific:**
```typescript
// src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts
export class SmartAlertsEngine {
  // ❌ STATIC methods (no instance needed)
  static generateSmartAlerts(
    materials: MaterialABC[],
    config?: Partial<SmartAlertsConfig>
  ): SmartAlert[] {
    // Returns: SmartAlert[] (custom type)
  }
}

// Usage in OLD hooks:
const alerts = SmartAlertsEngine.generateSmartAlerts(materials);
```

**NEW (V2) - Generic Base Class:**
```typescript
// src/lib/alerts/SmartAlertsEngine.ts
export class SmartAlertsEngine<T = any> {
  // ✅ INSTANCE methods with config
  constructor(config: SmartAlertsEngineConfig<T>) {}
  
  evaluate(data: T | T[]): CreateAlertInput[] {
    // Returns: CreateAlertInput[] (unified system type)
  }
}

// Usage in NEW pattern:
const engine = new SmartAlertsEngine({ rules, context: 'materials' });
const alerts = engine.evaluate(materials);
```

### Impact

- ❌ **Tests reference OLD engine**: All `__tests__/stocklab-*.test.ts` import old engine
- ❌ **Hooks reference OLD engine**: `useSmartInventoryAlerts.ts` uses old adapter
- ❌ **Type incompatibility**: `SmartAlert` ≠ `CreateAlertInput`
- ❌ **Confusing for developers**: Which one to use?
- ❌ **No migration path**: Can't easily switch

### Root Cause

V2 engine was created as **new generic base class** but **didn't replace or deprecate** V1 Materials-specific engine.

---

## 🟡 High Impact Issue #2: Type System Divergence

### Problem

Two competing alert type systems:

**OLD (Materials):**
```typescript
// SmartAlert type (custom, ~70 lines)
export interface SmartAlert {
  id: string;
  type: AlertType; // 'low_stock' | 'out_of_stock' | 'overstocked' | ...
  severity: AlertSeverity; // 'info' | 'warning' | 'critical' | 'urgent'
  title: string;
  description: string;
  itemId: string;
  itemName: string;
  abcClass: ABCClass;
  currentValue: number;
  thresholdValue: number;
  deviation: number;
  recommendedAction: string;
  actionPriority: number;
  estimatedImpact: 'low' | 'medium' | 'high';
  timeToAction: 'immediate' | 'within_24h' | 'within_week' | 'next_month';
  generatedAt: string;
  expiresAt?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  contextData: Record<string, unknown>;
}
```

**NEW (Unified System):**
```typescript
// CreateAlertInput type (from shared/alerts)
export interface CreateAlertInput {
  type: AlertType; // 'stock' | 'system' | 'validation' | ...
  severity: AlertSeverity; // 'critical' | 'high' | 'medium' | 'low' | 'info'
  context: AlertContext; // 'materials' | 'products' | ...
  intelligence_level: IntelligenceLevel; // 'simple' | 'smart' | 'predictive'
  title: string;
  description?: string;
  metadata?: AlertMetadata;
  persistent?: boolean;
  autoExpire?: number;
  actions?: Omit<AlertAction, 'id'>[];
}
```

### Inconsistencies

| Field | SmartAlert (V1) | CreateAlertInput (V2) | Issue |
|-------|-----------------|----------------------|-------|
| **Severity** | `'info' \| 'warning' \| 'critical' \| 'urgent'` | `'critical' \| 'high' \| 'medium' \| 'low' \| 'info'` | Different enums! |
| **Type** | `'low_stock' \| 'out_of_stock' \| ...` (8 types) | `'stock' \| 'system' \| ...` (7 types) | Different granularity |
| **Metadata** | Flat properties (itemId, abcClass, etc.) | JSONB object `AlertMetadata` | Different structure |
| **Actions** | `recommendedAction: string` | `actions: AlertAction[]` | Different approach |
| **Timestamps** | `generatedAt`, `expiresAt` | `autoExpire: number` | Different expiry model |
| **Intelligence** | N/A (implicit smart) | `intelligence_level: 'smart'` | Missing field |

### Impact

- ❌ Can't use SmartAlertsEngine V2 with Materials without adapter
- ❌ Conversion logic required (lossy transformation)
- ❌ Type safety broken at boundaries

---

## 🟡 High Impact Issue #3: Inconsistent Hook Patterns

### Problem

`useSmartInventoryAlerts` and `useSmartProductsAlerts` are **95% identical** with minor differences:

**Shared Pattern (95%):**
```typescript
export function useSmartXXXAlerts() {
  const actions = useAlertsActions();
  const items = useXXXStore(state => state.items); // Only difference
  
  const lastGenerationRef = useRef<number>(0);
  const MIN_GENERATION_INTERVAL = 3000;

  const generateAndUpdateAlerts = useCallback(async () => {
    try {
      logger.debug('XXX', '[useSmartXXXAlerts] Generating...', {...});
      
      // 1. Clear previous alerts
      await actions.clearAll({ context: 'xxx' }); // Only difference
      
      // 2. Generate via Adapter
      const alerts = await XXXAdapter.generateAlerts(items); // Only difference
      
      // 3. Create alerts
      for (const alert of alerts) {
        await actions.create(alert);
      }
      
      logger.info('XXX', `Generated ${alerts.length} alerts`, {...});
    } catch (error) {
      logger.error('XXX', 'Error generating alerts:', error);
    }
  }, [items, actions]);

  // Circuit breaker effect (identical in both)
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;

    if (items.length > 0 && timeSinceLastGeneration >= MIN_GENERATION_INTERVAL) {
      lastGenerationRef.current = now;
      generateAndUpdateAlerts();
      logger.debug('XXX', '[useSmartXXXAlerts] Alert generation allowed', {...});
    } else if (items.length > 0) {
      logger.warn('XXX', '[useSmartXXXAlerts] Alert generation throttled', {...});
    }
  }, [items, generateAndUpdateAlerts]);

  return { generateAndUpdateAlerts };
}
```

**Only 5% Differences:**
1. Module name in logs: `'Materials'` vs `'Products'`
2. Store selector: `useMaterialsStore` vs `useProductsStore`
3. Context: `'materials'` vs `'products'`
4. Adapter: `SmartAlertsAdapter` vs `ProductsAlertsAdapter`

### Anti-Pattern

This is classic **template pattern** violation - should be abstracted to:

```typescript
// ✅ BETTER: Generic hook
function useSmartModuleAlerts<T>(config: {
  moduleName: string;
  context: AlertContext;
  selector: (state: any) => T[];
  adapter: { generateAlerts: (items: T[]) => Promise<CreateAlertInput[]> };
}) {
  // Single implementation
}

// Usage:
const useSmartInventoryAlerts = () =>
  useSmartModuleAlerts({
    moduleName: 'Materials',
    context: 'materials',
    selector: (state) => useMaterialsStore(state).items,
    adapter: SmartAlertsAdapter
  });
```

---

## 🟢 Medium Issue #4: Unused Factory Function

### Problem

```typescript
// src/lib/alerts/SmartAlertsEngine.ts (line 295)
/**
 * Factory function to create a SmartAlertsEngine instance
 */
export function createSmartAlertsEngine<T = any>(
  config: SmartAlertsEngineConfig<T>
): SmartAlertsEngine<T> {
  return new SmartAlertsEngine(config);
}
```

### Analysis

- ❌ **Never imported** anywhere in codebase
- ❌ **No tests** for factory function
- ❌ **No clear benefit** over `new SmartAlertsEngine(...)`
- ❌ **Dead code** increasing bundle size

### Recommendation

**Option A:** Remove it (simple constructor is fine)  
**Option B:** Add value (e.g., singleton pattern, memoization)

---

## 🟢 Medium Issue #5: Missing Rule Validation

### Problem

`isValidSmartAlertRule` type guard exists but is **not used** in SmartAlertsEngine constructor:

```typescript
// src/lib/alerts/types/smartRules.ts
export function isValidSmartAlertRule<T>(rule: any): rule is SmartAlertRule<T> {
  return (
    typeof rule === 'object' &&
    typeof rule.id === 'string' &&
    typeof rule.name === 'string' &&
    typeof rule.condition === 'function' &&
    // ... validation logic
  );
}

// src/lib/alerts/SmartAlertsEngine.ts (line 81)
for (const rule of this.config.rules) {
  if (!rule.id || !rule.name || !rule.condition || !rule.severity) {
    // ❌ Custom validation instead of using type guard
    throw new Error(`SmartAlertsEngine: Invalid rule configuration`);
  }
}
```

### Anti-Pattern

**DRY violation** - validation logic duplicated. Should be:

```typescript
// ✅ BETTER:
import { isValidSmartAlertRule } from './types/smartRules';

for (const rule of this.config.rules) {
  if (!isValidSmartAlertRule(rule)) {
    throw new Error(`SmartAlertsEngine: Invalid rule ${rule.id || 'unknown'}`);
  }
}
```

---

## 🔍 Minor Issues

### Issue #6: Inconsistent Logger Context

```typescript
// SmartAlertsEngine.ts
logger.debug('SmartAlertsEngine', '...'); // Uses class name
logger.info('SmartAlertsEngine', '...');

// useSmartInventoryAlerts.ts
logger.debug('Materials', '...'); // Uses module name
logger.info('Materials', '...');

// useSmartProductsAlerts.ts
logger.debug('Products', '...'); // Uses module name
```

**Problem:** Searching logs for "SmartAlertsEngine" won't find Materials/Products usage.

**Solution:** Standardize on module name or include both: `'Materials:SmartAlertsEngine'`

---

### Issue #7: Missing JSDoc for Exported Types

```typescript
// ❌ Missing JSDoc
export interface RuleEvaluationResult {
  ruleId: string;
  matched: boolean;
  evaluationTime: number;
  error?: Error;
}

// ✅ Has JSDoc
export interface SmartAlertRule<T = any> {
  /** Unique identifier for this rule */
  id: string;
  // ...
}
```

**Impact:** IDE tooltips less helpful, docs generation incomplete.

---

### Issue #8: Magic Numbers

```typescript
// ❌ Magic numbers
const MIN_GENERATION_INTERVAL = 3000; // 3 seconds

// ✅ Should be constants
const CIRCUIT_BREAKER_INTERVAL_MS = 3000;
const DEFAULT_MAX_ALERTS = 100;
```

---

## 📋 Architectural Issues

### Issue #9: Tight Coupling to Materials Domain

Old SmartAlertsEngine is **tightly coupled** to Materials:

```typescript
// ❌ Materials-specific throughout
import { type MaterialABC, type ABCClass } from '@/pages/.../materials/types/abc-analysis';

static generateSmartAlerts(
  materials: MaterialABC[], // ❌ Only works with MaterialABC
  config?: Partial<SmartAlertsConfig>
): SmartAlert[] { ... }
```

**Impact:**
- Can't reuse for Products, Sales, Rentals, etc.
- Every module would need custom engine implementation
- V2 engine solved this with generics `<T>`

---

### Issue #10: No Tests for V2 Engine

```bash
# V1 engine has extensive tests:
src/__tests__/stocklab-*.test.ts (6 test files)

# V2 engine has ZERO tests
src/lib/alerts/SmartAlertsEngine.ts - NOT TESTED
src/lib/alerts/types/smartRules.ts - NOT TESTED
```

**Critical Gap:** V2 engine shipped without validation.

---

## 🎯 Recommendations

### Priority 1: Resolve Duplicate Engines (Critical)

**Option A: Migrate Materials to V2 (Recommended)**

1. Create `materialsSmartRules.ts` with SmartAlertRule definitions
2. Update `SmartAlertsAdapter` to use V2 engine instance
3. Update `useSmartInventoryAlerts` to use new pattern
4. Create adapter layer if needed: `SmartAlert` → `CreateAlertInput`
5. Mark old engine as `@deprecated`
6. Update all tests to use V2

**Option B: Keep Both (Not Recommended)**

1. Rename V1: `MaterialsAlertsEngine` (domain-specific)
2. Keep V2 as generic base class
3. Document when to use which

**Decision Needed:** Choose migration strategy ASAP

---

### Priority 2: Abstract Hook Pattern

Create generic hook:

```typescript
// src/hooks/useSmartModuleAlerts.ts
export function useSmartModuleAlerts<T>(config: SmartModuleAlertsConfig<T>) {
  // Generic implementation (80 lines once)
}

// Specific hooks become 5-line wrappers:
export const useSmartInventoryAlerts = () =>
  useSmartModuleAlerts({
    moduleName: 'Materials',
    context: 'materials',
    selector: useMaterialsStore,
    adapter: MaterialsAlertsAdapter
  });
```

**Benefit:** 90 duplicated lines → 10 lines per module

---

### Priority 3: Fix Type System

**Option A: Convert at Boundary**

```typescript
// src/adapters/smartAlertConverter.ts
export function convertSmartAlertToCreateInput(
  smartAlert: SmartAlert
): CreateAlertInput {
  return {
    type: inferTypeFromSmartAlertType(smartAlert.type),
    severity: mapSeverity(smartAlert.severity),
    context: 'materials',
    intelligence_level: 'smart',
    title: smartAlert.title,
    description: smartAlert.description,
    metadata: {
      itemId: smartAlert.itemId,
      itemName: smartAlert.itemName,
      currentStock: smartAlert.currentValue,
      // ... map all fields
    }
  };
}
```

**Option B: Eliminate SmartAlert Type (Preferred)**

1. Migrate Materials to use `CreateAlertInput` directly
2. Remove `SmartAlert` type completely
3. Update all references

---

### Priority 4: Add Tests

```typescript
// src/lib/alerts/__tests__/SmartAlertsEngine.test.ts
describe('SmartAlertsEngine', () => {
  describe('constructor', () => {
    it('should validate config');
    it('should throw on invalid rules');
  });

  describe('evaluate', () => {
    it('should generate alerts for matching conditions');
    it('should respect circuit breaker');
    it('should limit max alerts');
    it('should handle errors gracefully');
  });

  describe('inferAlertType', () => {
    it('should infer stock type from rule id');
    it('should default to business type');
  });
});
```

---

### Priority 5: Remove Dead Code

```typescript
// ❌ Remove unused factory
export function createSmartAlertsEngine<T = any>(...) { ... }
```

---

### Priority 6: Use Type Guard

```typescript
// ✅ Use existing validation
import { isValidSmartAlertRule } from './types/smartRules';

for (const rule of this.config.rules) {
  if (!isValidSmartAlertRule(rule)) {
    throw new Error(`Invalid rule ${rule.id || 'unknown'}`);
  }
}
```

---

## 📊 Code Metrics

### Duplication Analysis

| Code Block | Lines | Occurrences | Wasted Lines |
|------------|-------|-------------|--------------|
| **SmartAlertsEngine class** | ~300 | 2 | ~300 |
| **Smart alerts hook pattern** | ~90 | 2 | ~90 |
| **Circuit breaker logic** | ~25 | 2 | ~25 |
| **Type validation** | ~10 | 2 | ~10 |
| **Total** | | | **~425 lines** |

### Complexity Metrics

| File | Lines | Functions | Complexity | Grade |
|------|-------|-----------|------------|-------|
| `SmartAlertsEngine.ts` (V2) | 306 | 7 | Medium | B |
| `smartAlertsEngine.ts` (V1) | 720 | 15+ | High | C |
| `useSmartInventoryAlerts.ts` | 168 | 3 | Low | A |
| `useSmartProductsAlerts.ts` | 118 | 3 | Low | A |

---

## ✅ Action Plan

### Week 1: Critical Fixes

- [ ] **Day 1-2**: Decide migration strategy (V1 → V2 or keep both)
- [ ] **Day 3**: Implement type conversion adapter
- [ ] **Day 4**: Create generic `useSmartModuleAlerts` hook
- [ ] **Day 5**: Write tests for V2 engine

### Week 2: Refactoring

- [ ] **Day 1-2**: Migrate Materials to V2 pattern
- [ ] **Day 3**: Update Products to use generic hook
- [ ] **Day 4**: Remove duplicate code
- [ ] **Day 5**: Documentation update

### Week 3: Cleanup

- [ ] Remove dead code
- [ ] Fix minor issues
- [ ] Update all tests
- [ ] Final QA

---

## 🏆 Expected Outcomes

### Code Quality

- **-425 duplicated lines** removed
- **2 → 1 SmartAlertsEngine** implementations
- **100% test coverage** for V2 engine
- **Consistent API** across modules

### Maintainability

- **Single source of truth** for alert generation
- **Easy to add new modules** (5-line hook wrapper)
- **Type-safe** throughout stack
- **Clear migration path** documented

### Performance

- **Smaller bundle** (dead code removed)
- **Faster compilation** (less duplicate code)
- **Better caching** (consistent patterns)

---

## 📚 References

### Files Analyzed

1. `src/lib/alerts/SmartAlertsEngine.ts` - V2 engine ✅ NEW
2. `src/lib/alerts/types/smartRules.ts` - V2 types ✅ NEW
3. `src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts` - V1 engine ❌ OLD
4. `src/hooks/useSmartInventoryAlerts.ts` - Materials hook
5. `src/hooks/useSmartProductsAlerts.ts` - Products hook
6. `src/shared/alerts/types.ts` - Unified alert types

### Documentation

- [ALERT_ARCHITECTURE_V2.md](../docs/alert/ALERT_ARCHITECTURE_V2.md) - V2 architecture spec
- [SMART_ALERTS_GUIDE.md](../docs/alert/SMART_ALERTS_GUIDE.md) - Implementation tutorial

---

**Report Generated:** November 19, 2025  
**Next Review:** After Priority 1-3 fixes completed  
**Estimated Fix Time:** 2-3 weeks (3 developers)
