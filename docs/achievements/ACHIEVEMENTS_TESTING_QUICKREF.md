# ACHIEVEMENTS TESTING - QUICK REFERENCE

## 🚀 Run Tests

```bash
# All achievements tests
pnpm test achievements --run

# Unit tests only
pnpm test achievements-validators --run

# Integration tests only
pnpm test achievements-integration --run

# Watch mode
pnpm test achievements --watch
```

## 📦 Import Mock Utilities

```typescript
import {
  // Base contexts
  createEmptyContext,
  createBasicProfileContext,
  createCompleteProfileContext,
  
  // Builders
  withProducts,
  withStaff,
  withPaymentMethods,
  withPaymentGateways,
  
  // Presets
  createTakeAwayReadyContext,
  createDineInReadyContext,
  createECommerceReadyContext,
  
  // Utilities
  composeContext,
  cloneContext,
  summarizeContext,
} from '@/__tests__/mocks/mockValidationContext';
```

## 🧪 Create Test Context

### Option 1: Use Preset
```typescript
const context = createTakeAwayReadyContext();
// ✅ All TakeAway validations will pass
```

### Option 2: Compose Custom
```typescript
const context = composeContext(
  (ctx) => withProducts(ctx, 5, true),
  (ctx) => withPaymentMethods(ctx),
  createBasicProfileContext
);
```

### Option 3: Fluent Builder
```typescript
let context = createEmptyContext();
context = withProducts(context, 10, true);
context = withStaff(context, 3);
context = withPaymentGateways(context, [
  { type: 'online', name: 'MercadoPago' }
]);
```

## ✅ Test Validator

```typescript
import { TAKEAWAY_MANDATORY } from '@/modules/achievements/constants';

const req = TAKEAWAY_MANDATORY.find(r => r.id === 'takeaway_business_name');

// Should pass
expect(req.validator(completeContext)).toBe(true);

// Should fail
expect(req.validator(emptyContext)).toBeFalsy();
```

## 🔄 Test Validation Flow

```typescript
function validateOperation(action, requirements, context) {
  const relevant = requirements.filter(r => r.blocksAction === action);
  const missing = relevant.filter(r => !r.validator(context));
  
  return {
    allowed: missing.length === 0,
    missingRequirements: missing,
    totalRequired: relevant.length,
    completed: relevant.length - missing.length,
  };
}

const result = validateOperation(
  'takeaway:toggle_public',
  TAKEAWAY_MANDATORY,
  context
);

expect(result.allowed).toBe(true);
expect(result.completed).toBe(5);
```

## 📊 Available Presets

| Preset | Requirements Satisfied |
|--------|------------------------|
| `createTakeAwayReadyContext()` | 5 requirements ✅ |
| `createDineInReadyContext()` | 6 requirements ✅ |
| `createECommerceReadyContext()` | 7 requirements ✅ |
| `createDeliveryReadyContext()` | 4 requirements ✅ |
| `createPhysicalProductsReadyContext()` | 4 requirements ✅ |

## 🛠️ Available Builders

```typescript
withProducts(context, count, published = true)
withStaff(context, count, { role?, allActive? })
withCouriers(context, count)
withTables(context, count)
withPaymentMethods(context, methods = ['Efectivo'])
withPaymentGateways(context, gateways = [{ type: 'online' }])
withDeliveryZones(context, count)
withMaterials(context, count)
withAssets(context, count)
withSuppliers(context, count)
withSales(context, count)
```

## 🐛 Debug Context

```typescript
import { summarizeContext } from '@/__tests__/mocks/mockValidationContext';

console.log(summarizeContext(context));
// Prints readable summary of context state
```

## 📈 Test Statistics

- **42 tests** (29 unit + 13 integration)
- **100% passing**
- **<50ms execution time**
- **52 requirements validated**

## 📚 Docs

- Full Report: `ACHIEVEMENTS_TESTING_REPORT.md`
- Summary: `ACHIEVEMENTS_VALIDATION_COMPLETE.md`
- Code: `src/__tests__/achievements-*.test.ts`
