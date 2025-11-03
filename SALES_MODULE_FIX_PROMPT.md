# SALES MODULE - ESLint Fix Session Prompt

## Context
This is a continuation session to fix ESLint errors in the Sales module after completing the manifest and main page fixes.

## Current Progress ✅

### Completed (Session 1):
1. ✅ **Manifest fixed** (`src/modules/sales/manifest.tsx`)
   - Fixed 2 unused `data` parameters (lines 186, 260)
   - Removed unused imports (OnlineCatalogTab, CatalogManagement, GlobeAltIcon, FolderIcon)
   - Replaced 3 `any` types with proper TypeScript types (`OrderData`, `{ activeTab: string }`)
   - **Result**: 0 errors, 4 warnings (react-refresh - non-blocking)

2. ✅ **Main page fixed** (`src/pages/admin/operations/sales/page.tsx`)
   - **CRITICAL BUG FOUND AND FIXED**: EventBus integration was missing
   - Added `useEffect` import
   - Implemented EventBus subscription system (3 events: materials.stock_updated, materials.low_stock_alert, kitchen.order_ready)
   - Created `EventData` interface to replace `any` types
   - Implemented error recovery system using `handleError` and `pageState`
   - **Result**: 0 errors, 0 warnings

3. ✅ **Core services verified**
   - saleApi.ts: Clean ✅
   - taxCalculationService.ts: Clean ✅

### Remaining Work ⚠️

**Total errors**: 191 problems (171 errors, 20 warnings)

**Error breakdown by category**:
1. **Unused variables/imports**: ~80 errors (most common)
2. **`any` types**: ~60 errors (type safety)
3. **Missing useEffect dependencies**: ~15 warnings (React hooks)
4. **Unused function parameters**: ~10 errors
5. **Lexical declarations in case blocks**: ~6 errors (switch statements)

---

## Files To Fix (Prioritized)

### 🔴 CRITICAL PRIORITY - Core Functionality Files

#### 1. **Sales Components** (14 files, ~70 errors)
**Why critical**: These are the main UI components used directly by users

Files:
- `src/pages/admin/operations/sales/components/SalesManagement.tsx` (7 errors)
- `src/pages/admin/operations/sales/components/ProductWithStock.tsx` (12 errors)
- `src/pages/admin/operations/sales/components/SaleWithStockView.tsx` (3 errors)
- `src/pages/admin/operations/sales/components/SalesAlerts.tsx` (3 errors)
- `src/pages/admin/operations/sales/components/SalesMetrics.tsx` (2 errors)
- `src/pages/admin/operations/sales/components/CartValidationSummary.tsx` (2 errors)
- `src/pages/admin/operations/sales/components/SaleFormModal.tsx` (5 errors)
- `src/pages/admin/operations/sales/components/PaymentConfirmationModal.tsx` (5 errors)
- `src/pages/admin/operations/sales/components/Payment/ModernPaymentProcessor.tsx` (4 errors)
- `src/pages/admin/operations/sales/components/OfflineSalesView.tsx` (21 errors - MOST CRITICAL)

**Common pattern detected**: Unused imports suggest incomplete feature implementation

#### 2. **Sales Hooks** (4 files, ~40 errors)
**Why critical**: These provide business logic to components

Files:
- `src/pages/admin/operations/sales/hooks/useSalesPage.ts` (21 errors)
- `src/pages/admin/operations/sales/hooks/useSales.ts` (3 errors)
- `src/pages/admin/operations/sales/hooks/useSalesEnhanced.ts` (4 errors)
- `src/pages/admin/operations/sales/hooks/useAdminAppointments.ts` (3 errors)

**Common pattern detected**: Many `any` types and unused variables - likely incomplete type definitions

### 🟡 MEDIUM PRIORITY - Feature Modules

#### 3. **B2B Sub-module** (5 files, ~10 errors)
**Status**: Phase 3 feature (not yet fully active)

Files:
- `src/modules/sales/b2b/components/QuoteBuilder.tsx` (3 errors)
- `src/modules/sales/b2b/services/approvalWorkflowService.ts` (4 errors)
- `src/modules/sales/b2b/services/financeIntegration.ts` (1 error)
- `src/modules/sales/b2b/services/quotesService.ts` (1 error)
- `src/modules/sales/b2b/services/tieredPricingService.ts` (1 error)

**Pattern**: Unused types suggest skeleton implementation waiting for Phase 3

#### 4. **Ecommerce Sub-module** (7 files, ~15 errors)
**Status**: Active but optional feature

Files:
- `src/modules/sales/ecommerce/components/CatalogManagement.tsx` (2 errors)
- `src/modules/sales/ecommerce/components/OnlineCatalogTab.tsx` (4 errors)
- `src/modules/sales/ecommerce/components/OnlineOrdersTab.tsx` (5 errors)
- `src/modules/sales/ecommerce/hooks/useCart.ts` (1 warning)
- `src/modules/sales/ecommerce/hooks/useOnlineOrders.ts` (1 warning)
- `src/modules/sales/ecommerce/hooks/useProductCatalog.ts` (1 warning)
- `src/modules/sales/ecommerce/services/checkoutService.ts` (1 error)
- `src/modules/sales/ecommerce/types/index.ts` (1 error)

**Pattern**: Missing useEffect dependencies - likely performance issues or stale data bugs

### 🟢 LOW PRIORITY - Analytics/Advanced Features

#### 5. **Analytics Components** (10+ files, ~45 errors)
**Status**: Advanced features, not blocking core functionality

Files:
- `src/pages/admin/operations/sales/components/Analytics/SalesAnalyticsEnhanced.tsx` (8 errors)
- `src/pages/admin/operations/sales/components/Analytics/SalesIntelligenceDashboard/` (multiple files)
- `src/pages/admin/operations/sales/components/Analytics/AdvancedSalesAnalyticsDashboard/` (multiple files)
- All other Analytics/* files

**Pattern**: Mostly `any` types and unused variables in analytics calculations

#### 6. **Specialty Components** (5 files, ~15 errors)
**Status**: Optional features (QR ordering, appointments, delivery)

Files:
- `src/pages/admin/operations/sales/components/QROrdering/QRCodeGenerator.tsx` (2 errors)
- `src/pages/admin/operations/sales/components/QROrdering/QROrderPage.tsx` (7 errors)
- `src/pages/admin/operations/sales/components/AppointmentsTab.tsx` (5 errors)
- `src/pages/admin/operations/sales/components/AppointmentsCalendarView.tsx` (1 error)
- `src/pages/admin/operations/sales/components/DeliveryOrders/DeliveryOrderCard.tsx` (1 error)

---

## Fix Strategy & Investigation Guidelines

### 🔍 CRITICAL: Always Investigate Before Removing

**DO NOT just delete unused code**. Follow this process:

#### For Unused Variables:
```typescript
// ❌ WRONG - Just commenting out
// const { Badge } = ...;

// ✅ RIGHT - Investigate first
// 1. Search codebase for where Badge SHOULD be used
// 2. Check component props/types for missing functionality
// 3. Look for TODO comments or incomplete features
// 4. If truly unused, remove import + any related dead code
```

#### For Unused Imports:
**Ask these questions**:
1. **Is there a UI element that should use this?** (e.g., `Badge`, `Alert`, `Icon`)
2. **Is there error handling missing?** (e.g., unused `handleError`, `try/catch`)
3. **Is there validation missing?** (e.g., unused validation functions)
4. **Is there accessibility missing?** (e.g., unused ARIA components)

**Example Investigation**:
```typescript
// File: SalesAlerts.tsx
// Error: 'CheckCircleIcon' is defined but never used

// INVESTIGATION STEPS:
// 1. Check if there's a success state that should show CheckCircleIcon
// 2. Look at similar components (MaterialsAlerts) for patterns
// 3. Check if there's a TODO or comment mentioning success states
// 4. If found: IMPLEMENT the missing feature
// 5. If not found: Remove import
```

#### For `any` Types:
**DO NOT use `unknown` as a quick fix**. Instead:

1. **Find the real type**:
   ```typescript
   // ❌ LAZY FIX
   const data: unknown = ...;

   // ✅ PROPER FIX - Find the actual type
   import { Sale } from '../types';
   const data: Sale[] = ...;
   ```

2. **Create proper interfaces**:
   ```typescript
   // If type doesn't exist, create it
   interface MetricCardProps {
     title: string;
     value: number;
     trend: 'up' | 'down' | 'stable';
     icon: React.ComponentType;
   }
   ```

3. **Check database schema** for data types:
   ```bash
   # Use MCP tools to inspect tables
   mcp__postgres-pro__describe_table { table: "sales" }
   ```

#### For Missing useEffect Dependencies:

**These are REAL BUGS** - fix properly:

```typescript
// ❌ WRONG - Ignoring the warning
useEffect(() => {
  fetchData();
}, []); // eslint-disable-line

// ✅ RIGHT - Fix the dependency issue
const fetchData = useCallback(() => {
  // implementation
}, []); // No external deps

useEffect(() => {
  fetchData();
}, [fetchData]); // Now safe
```

---

## Common Bug Patterns Found

### Pattern 1: EventBus Integration Missing
**Example**: Main page had EventBus imported but not used
**Fix**: Implemented useEffect subscription system

**Look for this in**:
- OfflineSalesView.tsx (has EventBus config but no subscription)
- Any file importing EventBus but not calling `.subscribe()`

### Pattern 2: Error Handlers Imported But Not Used
**Example**: `handleError` imported but errors just logged
**Fix**: Wrap risky operations in try/catch + call handleError

```typescript
// BEFORE
const loadData = async () => {
  const data = await api.fetch();
  setData(data);
};

// AFTER
const loadData = async () => {
  try {
    const data = await api.fetch();
    setData(data);
  } catch (error) {
    handleError(error, { context: 'loadData', recoverable: true });
  }
};
```

### Pattern 3: Offline Support Half-Implemented
**Files**: OfflineSalesView.tsx, ProductWithStock.tsx
**Issue**: `isOffline` imported but not used in conditional rendering

```typescript
// BEFORE
<Button>Save</Button>

// AFTER
<Button disabled={isOffline}>
  {isOffline ? 'Offline Mode' : 'Save'}
</Button>
```

### Pattern 4: Decimal.js Imported But Not Used
**Files**: PaymentConfirmationModal.tsx, ProductWithStock.tsx
**Issue**: Still using float arithmetic instead of Decimal.js

```typescript
// ❌ FLOAT ARITHMETIC BUG
const total = price * quantity;

// ✅ BANKING PRECISION
const total = FinancialDecimal(price).mul(quantity).toNumber();
```

### Pattern 5: Switch Statement Case Declarations
**File**: SalesIntelligenceDashboard/hooks/index.ts
**Issue**: Variables declared directly in case blocks without braces

```typescript
// ❌ WRONG
switch (type) {
  case 'A':
    const value = 10; // Error!
    break;
}

// ✅ RIGHT
switch (type) {
  case 'A': {
    const value = 10;
    break;
  }
}
```

---

## Execution Plan

### Phase 1: Critical Fixes (2-3 hours)
1. ✅ Fix manifest (DONE)
2. ✅ Fix main page (DONE)
3. ⏭️ Fix OfflineSalesView.tsx (21 errors - MOST CRITICAL)
4. ⏭️ Fix ProductWithStock.tsx (12 errors)
5. ⏭️ Fix useSalesPage.ts (21 errors)
6. ⏭️ Fix SalesManagement.tsx (7 errors)

**Goal**: Get core POS functionality lint-clean

### Phase 2: Hook Fixes (1-2 hours)
7. Fix remaining hooks (useSales.ts, useSalesEnhanced.ts, useAdminAppointments.ts)
8. Fix useEffect dependency warnings in ecommerce hooks

**Goal**: Ensure business logic is type-safe

### Phase 3: Component Cleanup (1-2 hours)
9. Fix remaining core components
10. Fix Payment components
11. Fix QR/Appointments/Delivery components

**Goal**: Complete all user-facing components

### Phase 4: Analytics (Optional - 1 hour)
12. Fix Analytics components (if time permits)
13. Fix B2B skeleton code

**Goal**: Clean up advanced features

---

## Testing Strategy

After each fix:
1. Run ESLint: `pnpm -s exec eslint [file]`
2. Check TypeScript: `pnpm -s exec tsc --noEmit`
3. If component: Verify it renders (check page in dev server)
4. If hook: Check if dependent components still work

---

## Success Criteria

### Minimum (Production-Ready 80%):
- ✅ Manifest: 0 errors
- ✅ Main page: 0 errors
- ✅ Core components: 0 errors (SalesManagement, ProductWithStock, SaleWithStockView)
- ✅ Core hooks: 0 errors (useSalesPage, useSales)
- ✅ Core services: 0 errors (already clean)
- ⏳ README: Complete
- **Total**: <20 errors remaining (Analytics/specialty only)

### Ideal (100%):
- All files: 0 errors, 0 warnings
- All features working
- Full type safety

---

## Start Command for Next Session

```bash
# Check current status
pnpm -s exec eslint src/modules/sales src/pages/admin/operations/sales 2>&1 | grep "problems"

# Start with most critical file
pnpm -s exec eslint src/pages/admin/operations/sales/components/OfflineSalesView.tsx
```

---

## Notes for AI Assistant

1. **Read the file first** before fixing - understand context
2. **Investigate every unused import** - it might be a missing feature
3. **Never use `any` or `unknown`** - always find the real type
4. **Check for patterns** - if multiple files have same error, it's architectural
5. **Test after each fix** - don't batch fixes blindly
6. **Update SALES_MODULE_ESLINT_REPORT.txt** as you progress
7. **Document any bugs found** in comments

---

## Additional Context

- **Project**: G-Admin Mini v3.1 (React 19, TypeScript 5.8, Vite 7, ChakraUI v3, Supabase)
- **Architecture**: Modular system with EventBus, offline-first, capabilities system
- **Standards**: Banking-level precision (Decimal.js), WCAG AA accessibility, semantic HTML
- **Pattern**: See Materials module README for cross-module integration examples

---

**Last Updated**: 2025-01-25 (Session 1 completed: manifest + main page)
**Next Target**: OfflineSalesView.tsx (21 errors, high complexity)
