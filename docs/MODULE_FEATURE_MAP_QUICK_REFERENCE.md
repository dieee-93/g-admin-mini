So# MODULE_FEATURE_MAP - Quick Reference

**Date**: 2025-01-15  
**Architecture**: CORE_FEATURES + activatedBy/enhancedBy

---

## TL;DR

- **CORE_FEATURES**: Features that are ALWAYS active (like `customers`, `sales_order_management`)
- **alwaysActive**: Module always visible in navigation
- **activatedBy**: Single feature that activates the module
- **enhancedBy**: Extra features that add functionality (but don't activate module)

---

## Quick Examples

### 1. Core Module (Always Visible)

```typescript
'dashboard': {
  alwaysActive: true,
  description: 'Dashboard principal - siempre visible'
}
```

### 2. Feature-Activated Module

```typescript
'staff': {
  activatedBy: 'staff_employee_management',
  enhancedBy: ['staff_labor_cost_tracking'],
  description: 'Módulo de personal - gestión de empleados y turnos'
}
```

### 3. Module with Multiple Enhancements

```typescript
'sales': {
  alwaysActive: true,
  enhancedBy: [
    'sales_payment_processing',
    'sales_pos_onsite',
    'sales_dine_in_orders'
  ],
  description: 'Módulo de ventas - gestión de órdenes y pagos'
}
```

---

## Decision Tree: How to Configure a Module

```
┌─────────────────────────────────┐
│ Is this module universal?       │
│ (ALL businesses need it)        │
└───────┬─────────────────────────┘
        │
    YES │ NO
        │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│ alwaysActive:    │    │ activatedBy: 'feat'  │
│ true             │    │ enhancedBy: [...]    │
└──────────────────┘    └──────────────────────┘
    Examples:                Examples:
    - dashboard               - staff
    - customers               - materials
    - sales                   - memberships
    - fulfillment             - rentals
```

---

## CORE_FEATURES List

```typescript
export const CORE_FEATURES: readonly FeatureId[] = [
  // System essentials
  'dashboard',
  'settings',
  'debug',
  'gamification',
  
  // Business essentials
  'customers',              // ALL businesses have customers
  'sales_order_management', // ALL businesses sell something
] as const;
```

**Rule**: If a feature is in CORE_FEATURES, it's automatically active for all users.

---

## Common Patterns

### Pattern 1: System Module
```typescript
'settings': {
  alwaysActive: true,
  description: 'Configuración del sistema'
}
```

### Pattern 2: Optional Business Module
```typescript
'materials': {
  activatedBy: 'inventory_material_management',
  enhancedBy: ['inventory_waste_tracking', 'inventory_purchase_orders'],
  description: 'Gestión de materiales e insumos'
}
```

### Pattern 3: Multi-Enhancement Module
```typescript
'fulfillment': {
  alwaysActive: true,
  enhancedBy: [
    'operations_table_management',
    'sales_pickup_orders',
    'sales_delivery_orders',
    'sales_fulfillment_queue'
  ],
  description: 'Gestión de pedidos y fulfillment'
}
```

---

## Activation Logic

```typescript
function getModulesForActiveFeatures(features: FeatureId[]): string[] {
  const activeModules = new Set<string>();

  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    // Case 1: Always-active modules → ALWAYS in navigation
    if (config.alwaysActive) {
      activeModules.add(moduleId);
      return;
    }

    // Case 2: Feature-activated modules → Only if user has the feature
    if (config.activatedBy && features.includes(config.activatedBy)) {
      activeModules.add(moduleId);
      // Note: enhancedBy doesn't affect activation
    }
  });

  return Array.from(activeModules);
}
```

**Key Point**: `enhancedBy` features don't activate the module, they just add extra functionality.

---

## Adding a New Module

### Step 1: Define in MODULE_FEATURE_MAP

```typescript
'my-new-module': {
  activatedBy: 'my_feature_flag',         // Required
  enhancedBy: ['optional_feature_1'],     // Optional
  description: 'My new module description' // Required
}
```

### Step 2: Create Module Manifest

```typescript
export const myNewModuleManifest: ModuleManifest = {
  id: 'my-new-module',  // Must match MODULE_FEATURE_MAP key
  name: 'My New Module',
  version: '1.0.0',
  requiredFeatures: ['my_feature_flag'],         // Maps to activatedBy
  optionalFeatures: ['optional_feature_1'],      // Maps to enhancedBy
  // ...
};
```

### Step 3: Run Validation Test

```bash
pnpm test:run src/__tests__/module-feature-map-validation.test.ts
```

**Expected**: ✅ All tests pass, including your new module

---

## Validation Test

The test ensures MODULE_FEATURE_MAP stays in sync with module manifests:

```bash
pnpm test:run src/__tests__/module-feature-map-validation.test.ts

# Expected output:
✅ my-new-module - synced
✅ All modules in sync!
```

**If test fails**:
1. Check that `activatedBy` matches `manifest.requiredFeatures[0]`
2. Check that `enhancedBy` matches `manifest.optionalFeatures`
3. Check that `alwaysActive` matches `manifest.autoInstall`

---

## Common Mistakes

### ❌ Mistake 1: Multiple activatedBy

```typescript
// WRONG - activatedBy is a single feature, not an array
'sales': {
  activatedBy: ['sales_order_management', 'sales_pos'],  // ❌
}

// CORRECT - use activatedBy for primary, enhancedBy for extras
'sales': {
  activatedBy: 'sales_order_management',  // ✅
  enhancedBy: ['sales_pos_onsite'],       // ✅
}
```

### ❌ Mistake 2: Missing from CORE_FEATURES

```typescript
// If a feature is universal, add it to CORE_FEATURES
// Don't make every module depend on it

// WRONG - sales_order_management in every module
'sales': { activatedBy: 'sales_order_management' },
'fulfillment': { activatedBy: 'sales_order_management' },
'products': { activatedBy: 'sales_order_management' },

// CORRECT - add to CORE_FEATURES, make modules alwaysActive
export const CORE_FEATURES = ['sales_order_management'];
'sales': { alwaysActive: true },
'fulfillment': { alwaysActive: true },
'products': { alwaysActive: true },
```

### ❌ Mistake 3: Using Old Pattern

```typescript
// WRONG - old pattern (removed)
'staff': {
  requiredFeatures: ['staff_employee_management'],  // ❌
  optionalFeatures: ['staff_shift_management'],     // ❌
}

// CORRECT - new pattern
'staff': {
  activatedBy: 'staff_employee_management',  // ✅
  enhancedBy: ['staff_shift_management'],    // ✅
}
```

---

## Industry Inspiration

| Pattern | Source | Used In |
|---------|--------|---------|
| `alwaysActive` | WordPress "core plugins" | dashboard, settings, customers |
| `activatedBy` | Odoo `depends` field | staff, materials, memberships |
| `enhancedBy` | WordPress plugin hooks | All modules with optional features |
| `CORE_FEATURES` | Martin Fowler "Permissioning Toggles" | customers, sales_order_management |

---

## Debugging

### Check if module should be active

```typescript
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

const userFeatures = ['staff_employee_management', 'staff_shift_management'];
const activeModules = getModulesForActiveFeatures(userFeatures);

console.log(activeModules);
// Expected: ['dashboard', 'settings', ..., 'staff']
```

### Check CORE_FEATURES

```typescript
import { CORE_FEATURES } from '@/config/FeatureRegistry';

console.log(CORE_FEATURES);
// ['dashboard', 'settings', 'debug', 'gamification', 'customers', 'sales_order_management']
```

### Check MODULE_FEATURE_MAP

```typescript
import { MODULE_FEATURE_MAP } from '@/config/FeatureRegistry';

console.log(MODULE_FEATURE_MAP['staff']);
// {
//   activatedBy: 'staff_employee_management',
//   enhancedBy: ['staff_labor_cost_tracking'],
//   description: '...'
// }
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/config/FeatureRegistry.ts` | CORE_FEATURES + MODULE_FEATURE_MAP definition |
| `src/lib/modules/useModuleNavigation.ts` | Uses MODULE_FEATURE_MAP to filter navigation |
| `src/__tests__/module-feature-map-validation.test.ts` | Validates sync with manifests |
| `src/modules/*/manifest.tsx` | Module manifests (source of truth) |

---

## Status: ✅ Production Ready

- All 28 modules migrated
- All tests passing
- TypeScript compiles without errors
- Zero legacy code

**Last Updated**: 2025-01-15
