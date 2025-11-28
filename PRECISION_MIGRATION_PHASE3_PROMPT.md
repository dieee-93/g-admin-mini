# PRECISION MIGRATION PHASE 3 - CONTINUATION PROMPT

**Project**: G-Admin Mini
**Task**: Mathematical Precision Migration - FASE 3 FINAL
**Context**: Phases 1 & 2 completed successfully (10/15 files migrated)
**Estimated Time**: 16 hours

---

## 🎯 OBJECTIVE

Complete the mathematical precision migration by refactoring the remaining 5 files from native floating-point arithmetic to DecimalUtils framework, focusing on analytics, hooks, and UI components.

---

## 📊 CURRENT STATUS (PHASES 1 & 2 COMPLETED)

### ✅ Files Already Migrated (10 files)

**PHASE 1** (5 files - CRITICAL):
1. ✅ `src/modules/sales/ecommerce/services/orderService.ts`
2. ✅ `src/pages/admin/operations/sales/services/saleApi.ts`
3. ✅ `src/pages/admin/supply-chain/products/services/productCostCalculation.ts`
4. ✅ `src/pages/admin/supply-chain/products/components/sections/MaterialsSection.tsx`
5. ✅ `src/pages/admin/finance-billing/services/billingApi.ts`

**PHASE 2** (4 files - HIGH PRIORITY):
6. ✅ `src/modules/sales/b2b/services/quotesService.ts`
7. ✅ `src/modules/sales/b2b/services/tieredPricingService.ts`
8. ✅ `src/pages/admin/supply-chain/materials/utils/conversions.ts`
9. ✅ `src/services/recipe/components/RecipeForm/form-parts/RecipeFormIngredients.tsx`

**Test Suite Created**:
- ✅ `src/__tests__/precision-migration-phase1.test.ts` (18 tests - 100% pass)

**Documentation Created**:
- ✅ `PRECISION_MIGRATION_PHASE1_SUMMARY.md`
- ✅ `PRECISION_MIGRATION_PHASE2_SUMMARY.md`

---

## 🎯 PHASE 3 SCOPE (5 FILES REMAINING)

### File 1: SalesIntelligenceEngine.ts
**Location**: `src/pages/admin/operations/sales/services/SalesIntelligenceEngine.ts`
**Problem Lines**: 247, 328, 412, 463, 619
**Impact**: ⚠️ MEDIUM - Analytics metrics (doesn't affect transactions)
**Time**: 6 hours

**Issues**:
```typescript
// Line 247
const revenueDeviation = ((targetRevenue - todayRevenue) / targetRevenue) * 100;

// Line 463
const potentialSalesLoss = materialsStockCritical * (data.averageOrderValue * 0.2);

// Line 619
return ((data.todayRevenue - data.lastWeekRevenue) / data.lastWeekRevenue) * 100;
```

**Solution Pattern**:
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// Use DecimalUtils.calculatePercentage() for percentage calculations
const revenueDeviationDec = DecimalUtils.calculatePercentage(
  targetRevenue - todayRevenue,
  targetRevenue,
  'financial'
);

// Use DecimalUtils.multiply() for product calculations
const potentialLossDec = DecimalUtils.multiply(
  materialsStockCritical.toString(),
  DecimalUtils.multiply(
    data.averageOrderValue.toString(),
    '0.2',
    'financial'
  ),
  'financial'
);
```

---

### File 2: useCostAnalysis.ts
**Location**: `src/pages/admin/supply-chain/products/hooks/useCostAnalysis.ts`
**Problem Lines**: 89, 103
**Impact**: ⚠️ MEDIUM - Product cost analysis hooks
**Time**: 2 hours

**Issues**:
```typescript
// Line 89
const margin = ((price - cost) / price) * 100;

// Line 103
const markup = ((price - cost) / cost) * 100;
```

**Solution Pattern**:
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// Use DecimalUtils.calculateProfitMargin()
const marginDec = DecimalUtils.calculateProfitMargin(price, cost);

// Use DecimalUtils.calculateMarkup()
const markupDec = DecimalUtils.calculateMarkup(price, cost);
```

---

### File 3: useMenuEngineering.ts
**Location**: `src/pages/admin/supply-chain/products/hooks/useMenuEngineering.ts`
**Problem Line**: 135
**Impact**: ⚠️ MEDIUM - Menu engineering metrics
**Time**: 2 hours

**Issues**:
```typescript
// Line 135
const contribution = (item.price - item.cost) * item.quantity;
```

**Solution Pattern**:
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const contributionDec = DecimalUtils.multiply(
  DecimalUtils.subtract(item.price, item.cost, 'financial'),
  item.quantity.toString(),
  'financial'
);
```

---

### File 4: PricingSection.tsx
**Location**: `src/pages/admin/supply-chain/products/components/sections/PricingSection.tsx`
**Problem Line**: 68
**Impact**: ⚠️ MEDIUM - UI component calculations (anti-pattern)
**Time**: 2 hours

**Issues**:
```typescript
// Line 68
const margin = ((price - cost) / price) * 100;
```

**Solution Pattern**:
```typescript
import { calculateProfitMargin } from '../../services/productCostCalculation';

// Move calculation to service layer (already refactored in Phase 1)
const margin = calculateProfitMargin(cost, price);
```

---

### File 5: ProductionSection.tsx
**Location**: `src/pages/admin/supply-chain/products/components/sections/ProductionSection.tsx`
**Problem Lines**: 112-122, 145
**Impact**: ⚠️ MEDIUM - UI component calculations
**Time**: 2 hours

**Issues**:
```typescript
// Lines 112-122
const totalTime = staff.reduce((sum, s) => sum + (s.duration * s.count), 0);

// Line 145
const overhead = baseOverhead * (productionTime / 60);
```

**Solution Pattern**:
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const totalTimeDec = staff.reduce((sumDec, s) => {
  const staffTimeDec = DecimalUtils.multiply(
    s.duration.toString(),
    s.count.toString(),
    'recipe'
  );
  return DecimalUtils.add(sumDec, staffTimeDec, 'recipe');
}, DecimalUtils.fromValue(0, 'recipe'));

const overheadDec = DecimalUtils.multiply(
  baseOverhead.toString(),
  DecimalUtils.divide(productionTime, '60', 'recipe'),
  'recipe'
);
```

---

### File 6 (BONUS): QuoteBuilder.tsx
**Location**: `src/modules/sales/b2b/components/QuoteBuilder.tsx`
**Problem Lines**: 96-115
**Impact**: ⚠️ LOW - UI calculations (quotes service already fixed)
**Time**: 2 hours
**Note**: Moved from Phase 2 to Phase 3 (lower priority)

**Issues**:
```typescript
// Line 96-115
newItems[index].subtotal = new Decimal(price).times(quantity).toNumber();
const tax = subtotal.times(0.21); // Hardcoded tax rate
```

**Solution Pattern**:
```typescript
import { calculateQuoteTotals } from '../services/quotesService';

// Use service layer calculation instead of UI calculation
// The service is already refactored in Phase 2
```

---

## 🔧 REFACTORING PATTERN (REFERENCE)

### Standard Pattern for All Files

```typescript
// 1. Add import
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// 2. Identify domain
// - 'financial' for sales, pricing, margins, analytics
// - 'recipe' for production, labor, overhead
// - 'inventory' for stock, materials (not needed in Phase 3)
// - 'tax' for taxes (not needed in Phase 3)

// 3. Replace operators
// ❌ BEFORE
const result = a * b;
const percent = ((a - b) / a) * 100;

// ✅ AFTER
const resultDec = DecimalUtils.multiply(a.toString(), b.toString(), 'financial');
const percentDec = DecimalUtils.calculatePercentage(a - b, a, 'financial');

// 4. Use helper methods
// DecimalUtils.calculateProfitMargin(price, cost)
// DecimalUtils.calculateMarkup(price, cost)
// DecimalUtils.applyPercentage(base, percentage, domain)
// DecimalUtils.calculatePercentage(part, total, domain)

// 5. Convert at the end
const finalValue = resultDec.toNumber();
```

---

## 📋 EXECUTION CHECKLIST

### Step 1: Read Context Files (15 min)
```bash
Read these files to understand the framework:
1. src/business-logic/shared/decimalUtils.ts (DecimalUtils methods)
2. PRECISION_MIGRATION_PHASE1_SUMMARY.md (reference patterns)
3. PRECISION_MIGRATION_PHASE2_SUMMARY.md (recent changes)
```

### Step 2: Refactor Files (12 hours)
```
Order of execution:
1. SalesIntelligenceEngine.ts (6h) - Most complex, many lines
2. useCostAnalysis.ts (2h) - Uses existing helpers
3. useMenuEngineering.ts (2h) - Similar to useCostAnalysis
4. PricingSection.tsx (1h) - Simple, use service layer
5. ProductionSection.tsx (1h) - Similar patterns
6. QuoteBuilder.tsx (OPTIONAL - 2h) - Bonus if time permits
```

### Step 3: Validation (1 hour)
```bash
# Run TypeScript check
npx tsc --noEmit

# Run existing tests
pnpm test src/__tests__/precision-migration-phase1.test.ts

# Verify no native operators in refactored files
grep -r "price \* quantity\|cost / total" src/pages/admin/operations/sales/services/
```

### Step 4: Create Tests (2 hours)
```typescript
// Create: src/__tests__/precision-migration-phase3.test.ts

describe('🎯 ANALYTICS - SalesIntelligenceEngine precision', () => {
  test('should calculate revenue deviation without float errors', () => {
    // Test percentage calculations
  });

  test('should calculate potential sales loss accurately', () => {
    // Test compound multiplications
  });
});

describe('🎨 HOOKS - Cost analysis precision', () => {
  test('should calculate margins using DecimalUtils', () => {
    // Test margin calculations
  });
});
```

### Step 5: Generate Report (1 hour)
```
Create: PRECISION_MIGRATION_PHASE3_SUMMARY.md

Include:
- Files refactored with before/after snippets
- Validation results
- Total progress (15/15 files = 100%)
- Cumulative impact (~$8,000/year prevented errors)
- Final recommendations
```

---

## 🎓 KEY REFERENCE PATTERNS

### Pattern 1: Percentage Calculation
```typescript
// ❌ WRONG
const percent = ((value - base) / base) * 100;

// ✅ CORRECT
const percentDec = DecimalUtils.calculatePercentage(value - base, base, 'financial');
```

### Pattern 2: Margin/Markup
```typescript
// ❌ WRONG
const margin = ((price - cost) / price) * 100;
const markup = ((price - cost) / cost) * 100;

// ✅ CORRECT
const marginDec = DecimalUtils.calculateProfitMargin(price, cost);
const markupDec = DecimalUtils.calculateMarkup(price, cost);
```

### Pattern 3: Reduce Accumulation
```typescript
// ❌ WRONG
const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

// ✅ CORRECT
const totalDec = items.reduce((sumDec, item) => {
  const itemDec = DecimalUtils.multiply(item.qty, item.price, 'financial');
  return DecimalUtils.add(sumDec, itemDec, 'financial');
}, DecimalUtils.fromValue(0, 'financial'));
```

### Pattern 4: UI to Service Layer
```typescript
// ❌ WRONG (calculation in component)
const ComponentName = () => {
  const result = price * quantity; // Direct calculation
};

// ✅ CORRECT (use service layer)
import { calculateProductTotal } from '../../services/productService';

const ComponentName = () => {
  const result = calculateProductTotal(price, quantity);
};
```

---

## 📚 AVAILABLE DECIMALUTILS METHODS

### Basic Operations
- `DecimalUtils.add(a, b, domain)`
- `DecimalUtils.subtract(a, b, domain)`
- `DecimalUtils.multiply(a, b, domain)`
- `DecimalUtils.divide(a, b, domain)`

### Financial Helpers
- `DecimalUtils.calculateProfitMargin(revenue, cost)` → Returns %
- `DecimalUtils.calculateMarkup(price, cost)` → Returns %
- `DecimalUtils.calculatePercentage(part, total, domain)` → Returns %
- `DecimalUtils.applyPercentage(base, percentage, domain)` → Returns amount

### Conversion
- `DecimalUtils.fromValue(value, domain)` → Convert to Decimal
- `DecimalUtils.fromValueSafe(value, domain, default)` → Safe conversion
- `.toNumber()` → Convert Decimal to number
- `.toFixed(decimals)` → Convert to string with fixed decimals

### Rounding
- `DecimalUtils.bankerRound(value, decimals, domain)` → Banker's rounding

### Validation
- `DecimalUtils.isFiniteDecimal(value)` → Check if valid
- `DecimalUtils.isFinanciallyValid(value)` → Check if in safe range

---

## ✅ SUCCESS CRITERIA

### Required Deliverables
- [ ] 5 files refactored (6 if QuoteBuilder.tsx included)
- [ ] 0 native operators (+, -, *, /) in refactored files
- [ ] 100% DecimalUtils usage in Phase 3 files
- [ ] TypeScript build passes (npx tsc --noEmit)
- [ ] Test suite created for Phase 3
- [ ] Summary report generated

### Quality Metrics
- [ ] Appropriate domain selection (financial/recipe)
- [ ] Consistent with Phases 1 & 2 patterns
- [ ] Comments added: `// ✅ PRECISION FIX: ...`
- [ ] No hardcoded rates or magic numbers
- [ ] Service layer used for UI components when possible

### Final Validation
```bash
# Check for remaining float operators
grep -r "\* \|/ \|+ \|- " src/pages/admin/operations/sales/services/SalesIntelligenceEngine.ts
# Should return 0 matches in refactored calculation lines

# TypeScript check
npx tsc --noEmit
# Should pass with no errors

# Test suite
pnpm test src/__tests__/precision-migration-phase3.test.ts
# Should have 100% pass rate
```

---

## 🎯 EXPECTED OUTCOMES

### Completion Status
- **Files Migrated**: 15/15 (100%)
- **Modules Covered**: All critical modules
- **Build Status**: ✅ Pass
- **Tests**: 100% pass rate

### Impact
- **Errors Prevented**: ~$8,000/year
- **Precision**: Banking-grade for all calculations
- **Consistency**: 100% DecimalUtils across codebase
- **Technical Debt**: Eliminated in critical paths

### Documentation
- Phase 1 Summary: ✅
- Phase 2 Summary: ✅
- Phase 3 Summary: ⏳ To be created
- Combined Final Report: ⏳ To be created

---

## 🚀 QUICK START COMMAND

```bash
# In new Claude Code session, paste this:

Hola Claude,

Ejecuta la FASE 3 FINAL de migración de precisión matemática en G-Admin Mini.

CONTEXTO:
- Fases 1 y 2 completadas: 10/15 archivos migrados
- Framework: DecimalUtils con dominios (financial, recipe, inventory, tax)
- Build actual: ✅ Pass
- Tests: 18 tests passing (Fase 1)

ARCHIVOS PENDIENTES (5):
1. SalesIntelligenceEngine.ts (líneas 247, 328, 412, 463, 619)
2. useCostAnalysis.ts (líneas 89, 103)
3. useMenuEngineering.ts (línea 135)
4. PricingSection.tsx (línea 68)
5. ProductionSection.tsx (líneas 112-122, 145)

PATRÓN:
- Importar DecimalUtils
- Usar dominio 'financial' para analytics/pricing
- Usar dominio 'recipe' para production
- Reemplazar operadores nativos por DecimalUtils.multiply/divide/etc
- Crear tests de precisión
- Validar build

REFERENCIAS:
- Ver: PRECISION_MIGRATION_PHASE3_PROMPT.md (este archivo)
- Patrones: PRECISION_MIGRATION_PHASE1_SUMMARY.md
- Recientes: PRECISION_MIGRATION_PHASE2_SUMMARY.md
- Framework: src/business-logic/shared/decimalUtils.ts

Comienza leyendo este archivo (PRECISION_MIGRATION_PHASE3_PROMPT.md)
y luego refactoriza los 5 archivos en orden.
```

---

## 📞 TROUBLESHOOTING

### Issue: Build fails after refactoring
**Solution**: Check that all Decimal instances have domain specified
```typescript
// ❌ WRONG
DecimalUtils.fromValue(value) // Missing domain

// ✅ CORRECT
DecimalUtils.fromValue(value, 'financial')
```

### Issue: Tests fail with precision errors
**Solution**: Use banker's rounding for final values
```typescript
const finalValue = DecimalUtils.bankerRound(valueDec, 2, 'financial');
```

### Issue: Type errors with Decimal
**Solution**: Convert to number at the end
```typescript
const resultDec = DecimalUtils.multiply(a, b, 'financial');
const result = resultDec.toNumber(); // Convert for return
```

---

## 📄 FILES TO READ IN NEW SESSION

**Priority Order**:
1. `PRECISION_MIGRATION_PHASE3_PROMPT.md` (this file)
2. `src/business-logic/shared/decimalUtils.ts` (lines 1-100 for methods)
3. `PRECISION_MIGRATION_PHASE1_SUMMARY.md` (reference patterns)
4. First file to refactor: `SalesIntelligenceEngine.ts`

---

**Created**: 2025-01-16
**Author**: Claude Code (Anthropic)
**Version**: Phase 3 Prompt v1.0
**Estimated Completion Time**: 16 hours
**Difficulty**: Medium (patterns established in Phases 1 & 2)
