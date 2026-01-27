# Sales Page Refactoring - Progress Report

**Date:** 2025-12-17  
**Page:** `src/pages/admin/operations/sales`  
**Protocol:** PAGES_REFACTORING_PROMPT.md  
**Status:** 🔄 **IN PROGRESS**

---

## ✅ COMPLETED: PHASE 1 & PHASE 2.1

### Phase 1: Component Diagnostic ✅

**Created:** `SALES_PAGE_DIAGNOSTIC_REPORT.md` - Complete diagnostic with:
- 7 critical issues identified
- 40+ components analyzed
- 11,705 lines of component code audited
- 6,376 lines of service code audited
- Detailed refactoring strategy

### Phase 2.1: Move Services to Module ✅

**Services Migrated:**

1. ✅ **Tax Calculation Service**
   - Already existed in `src/modules/cash/services/taxCalculationService.ts`
   - Page copy is duplicate - can be removed
   - 426 lines of financial calculation logic

2. ✅ **Sales Intelligence Engine**
   - Moved to: `src/modules/sales/services/salesIntelligenceEngine.ts`
   - 723 lines of business intelligence logic
   - Exports: `SalesIntelligenceEngine`, types

3. ✅ **Sales Analytics**
   - Moved to: `src/modules/sales/services/salesAnalytics.ts`
   - 434 lines of analytics calculations
   - Uses DecimalUtils for precision

4. ✅ **Table API**
   - Moved to: `src/modules/sales/services/tableApi.ts`
   - 482 lines of restaurant table management
   - Data access layer

5. ⚠️ **POS API** (Partial)
   - Started move to: `src/modules/sales/services/posApi.ts`
   - 502 lines of POS sales logic
   - **Issue:** Depends on page types, needs type migration first
   - **Status:** Copied but has compilation errors

6. ✅ **Services Index Created**
   - Created: `src/modules/sales/services/index.ts`
   - Exports all migrated services

**Files Remaining in Page:**
- `src/pages/admin/operations/sales/services/SalesAlertsAdapter.ts` (384 lines)
  - Different from module version, needs consolidation
- `src/pages/admin/operations/sales/services/saleApi.ts` (502 lines)
  - Still in use by page, migration blocked by type dependencies
- `src/pages/admin/operations/sales/services/taxCalculationService.ts` (426 lines)
  - **CAN BE DELETED** - duplicate of cash module version

---

## 🔄 IN PROGRESS: PHASE 2.2

### Create Module Hooks with TanStack Query

**Hooks Needed:**

1. **useAppointments** ❌ Not Created
   - Replace: `hooks/useAdminAppointments.ts`
   - Current: Uses `useState` + direct Supabase
   - Target: TanStack Query in `src/modules/sales/hooks/`

2. **useCart** ✅ Already Exists!
   - Location: `src/modules/sales/ecommerce/hooks/useCart.ts`
   - Features: TanStack Query, mutations, cart operations
   - **Action:** Page should use this instead of `useSalesCart`

3. **useTables** ❌ Not Created
   - For: Restaurant table management
   - Uses: `tableApi.ts` (now in module)
   - Target: TanStack Query hook

4. **usePOSSales** ❌ Not Created
   - For: POS sales CRUD operations
   - Uses: `posApi.ts` (when types are migrated)
   - Target: TanStack Query hook

---

## ⏳ PENDING TASKS

### Phase 2.3: Replace Supabase Access

**Files with Direct Supabase (7 files):**

1. ❌ `hooks/useAdminAppointments.ts` - Create module hook
2. ❌ `hooks/useSalesCart.ts` - Use existing `useCart()` from module
3. ❌ `services/saleApi.ts` - Migrate to module
4. ❌ `services/tableApi.ts` - ✅ Moved, update imports
5. ❌ `components/AppointmentsTab.tsx` - Use module hook
6. ❌ `components/SaleWithStockView.tsx` - Use module hook  
7. ❌ `components/QROrdering/QROrderPage.tsx` - Use module hook

### Phase 2.4: Remove Duplicate Code

**Duplicates to Remove:**

1. ❌ `hooks/useSalesCart.ts` → Use `@/modules/sales/ecommerce/hooks/useCart`
2. ❌ `services/taxCalculationService.ts` → Use `@/modules/cash/services`
3. ❌ `services/SalesAlertsAdapter.ts` → Consolidate with module version

### Phase 3: Decompose God Components

**Components to Split:**

1. ❌ `OfflineSalesView.tsx` (927 lines) → 5-7 components
2. ❌ `QROrdering/QROrderPage.tsx` (649 lines) → 4-5 components
3. ❌ `Payment/ModernPaymentProcessor.tsx` (583 lines) → 4-5 components
4. ❌ `SaleFormModal.tsx` (532 lines) → 3-4 components
5. ❌ `OrderManagement/KitchenDisplaySystem.tsx` (525 lines) → 3-4 components

### Phase 4: Code Quality

1. ❌ Add React.memo to list components
2. ❌ Add useCallback to event handlers
3. ❌ Add useMemo for calculations
4. ❌ Fix TypeScript errors in page.tsx

### Phase 5: Verification

1. ❌ TypeScript compilation check
2. ❌ Visual regression testing
3. ❌ Performance profiling

---

## 🚧 BLOCKERS

### Blocker 1: Type Dependencies

**Issue:** `posApi.ts` imports types from `../types` (page types)

**Resolution Options:**
1. Move page types to module types
2. Keep posApi in page temporarily
3. Create separate types in module

**Recommendation:** Move types to module, update all imports

### Blocker 2: Alerts Adapter Duplication

**Issue:** Two versions of SalesAlertsAdapter exist:
- `src/modules/sales/services/salesAlertsAdapter.ts` (simpler)
- `src/pages/admin/operations/sales/services/SalesAlertsAdapter.ts` (complex)

**Resolution:** Needs manual consolidation/decision on which to keep

---

## 📊 Progress Metrics

| Category | Completed | Total | Progress |
|----------|-----------|-------|----------|
| **Services Moved** | 4/6 | 6 | 67% |
| **Supabase Removed** | 0/7 | 7 | 0% |
| **Hooks Created** | 0/4 | 4 | 0% |
| **Components Split** | 0/5 | 5 | 0% |
| **Overall** | 4/22 | 22 | 18% |

---

## 🎯 Next Immediate Steps

### Step 1: Finish Type Migration (1-2 hours)
1. Move `src/pages/admin/operations/sales/types.ts` → `src/modules/sales/types/pos.ts`
2. Export from `src/modules/sales/types/index.ts`
3. Fix `posApi.ts` imports
4. Complete posApi migration

### Step 2: Create useAppointments Hook (2-3 hours)
1. Create `src/modules/sales/hooks/useAppointments.ts`
2. Implement with TanStack Query
3. Export from module manifest
4. Update page to use it

### Step 3: Replace useSalesCart (30 min)
1. Update page imports to use existing `useCart()` from module
2. Delete `hooks/useSalesCart.ts`
3. Verify cart functionality works

### Step 4: Remove Duplicate Files (30 min)
1. Delete `services/taxCalculationService.ts` from page
2. Update imports to use `@/modules/cash/services`
3. Consolidate alerts adapters

---

## ⚠️ Critical Architecture Violations Still Present

| Violation | Files | Status |
|-----------|-------|--------|
| **Direct Supabase Access** | 7 files | ❌ Not Fixed |
| **Server State in useState** | 4 files | ❌ Not Fixed |
| **God Components (>500 lines)** | 5 files | ❌ Not Fixed |
| **Business Logic in Pages** | 2 files remaining | ⚠️ Partially Fixed |
| **Duplicate Code** | 3 files | ❌ Not Fixed |

---

## 📝 Files Modified So Far

### Created:
1. ✅ `src/modules/sales/services/index.ts`
2. ✅ `src/modules/sales/services/salesIntelligenceEngine.ts`
3. ✅ `src/modules/sales/services/salesAnalytics.ts`
4. ✅ `src/modules/sales/services/tableApi.ts`
5. ⚠️ `src/modules/sales/services/posApi.ts` (has errors)

### To Delete:
1. ❌ `src/pages/admin/operations/sales/services/taxCalculationService.ts`

### To Consolidate:
1. ❌ `src/pages/admin/operations/sales/services/SalesAlertsAdapter.ts`

---

## 🔄 Continuation Plan

**Estimated Remaining Time:** 12-15 hours

**Week 1 (Remaining):**
- Finish type migration (2 hours)
- Create module hooks (4-6 hours)
- Replace Supabase access (2-3 hours)
- Remove duplicates (1 hour)

**Week 2:**
- Decompose god components (6-8 hours)
- Performance optimization (2-3 hours)
- Testing and verification (2-3 hours)

---

**Status:** Ready to continue with Type Migration and Hook Creation  
**Next Task:** Move types.ts to module and fix posApi
