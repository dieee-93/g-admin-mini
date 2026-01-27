# Sales Module Refactoring - Diagnostic Report

**Module:** `src/modules/sales`  
**Date:** 2025-12-17  
**Protocol:** MODULES_REFACTORING_PROMPT.md  

---

## 📊 PHASE 1: ARCHITECTURE DIAGNOSTIC

### ✅ Strengths

1. **Manifest Complete** ✅
   - File: `src/modules/sales/manifest.tsx` (575 lines)
   - Complete structure with setup/teardown
   - Proper hook registration (9 hooks provided, 2 consumed)
   - EventBus integration active
   - Dashboard widgets registered
   - Navigation metadata complete

2. **Module Structure** ✅
   - Follows standard module layout
   - Sub-modules organized: `b2b/`, `ecommerce/`
   - Proper separation: `services/`, `hooks/`, `components/`, `widgets/`
   - Total files: 31

3. **Financial Precision (Partial)** ⚠️
   - Already using `DecimalUtils` in B2B services (`quotesService.ts`, `tieredPricingService.ts`)
   - Proper financial domain usage detected

4. **Alerts Integration** ✅
   - Comprehensive alerts adapter: `salesAlertsAdapter.ts` (378 lines)
   - 10 alert factories implemented
   - Integrated with global alerts system in hooks

---

## ❌ Critical Issues

### 1. Server State in Hooks (Anti-Pattern 1.2)

**Files Affected:**
- `ecommerce/hooks/useCatalogs.ts` - Line 1: `const [catalogs, setCatalogs] = useState<Catalog[]>([]);`
- `ecommerce/hooks/useOnlineOrders.ts` - Line 1: `const [orders, setOrders] = useState<OnlineOrderExtended[]>([]);`
- `ecommerce/hooks/useProductCatalog.ts` - Line 1: `const [products, setProducts] = useState<OnlineProduct[]>([]);`

**Issue:** Server data stored in `useState` instead of TanStack Query

**Impact:** CRITICAL
- No automatic cache invalidation
- Manual loading states
- No request deduplication
- Potential stale data issues

**Solution Required:**
- Migrate to TanStack Query (see `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md`)
- Create query hooks: `useCatalogs()`, `useOnlineOrders()`, `useProductCatalog()`
- Use `useQuery` for fetching, `useMutation` for updates

---

### 2. Missing Service Layer Separation (Anti-Pattern 6.2, 6.3)

**Files Analyzed:**
- `b2b/services/quotesService.ts` - ✅ Good: Uses DecimalUtils, has calculateQuoteTotals engine
- `b2b/services/tieredPricingService.ts` - ✅ Good: Pure calculation functions
- `ecommerce/services/cartService.ts` - ⚠️ Mixed: DB calls + business logic in same file

**Issue:** `cartService.ts` mixes data access with business logic

**Current Structure:**
```
cartService (services/cartService.ts)
  ├── getCart() - DB access
  ├── addItem() - DB access + business logic (quantity merge)
  └── helpers (getItemCount, hasProduct) - Pure functions
```

**Recommended Structure:**
```
cartApi.ts (Data Access Layer)
  ├── getCart()
  ├── updateCart()
  └── deleteCart()

cartService.ts (Business Logic Layer)
  ├── addItemToCart() - Uses cartApi
  ├── mergeGuestCart() - Orchestration
  └── validateCart() - Business rules

cartEngine.ts (Pure Calculations)
  ├── calculateCartTotal()
  ├── applyDiscounts()
  └── calculateTax()
```

**Priority:** HIGH (affects testability and maintainability)

---

### 3. Type Safety Issues (Anti-Pattern - TypeScript)

**File:** `b2b/types/index.ts`

**Issue:** Direct import of `Decimal` from `decimal.js` instead of using `DecimalUtils` types

```typescript
// ❌ Line 10: import Decimal from 'decimal.js';
// ❌ Line 204: original_price: Decimal;
// ❌ Line 206: discount_amount: Decimal;
```

**Should use:**
```typescript
import { FinancialDecimal } from '@/business-logic/shared/decimalUtils';

export interface CalculatedPrice {
  original_price: FinancialDecimal;
  discount_amount: FinancialDecimal;
  final_price: FinancialDecimal;
}
```

---

## ⚠️ Medium Priority Issues

### 4. Missing JSDoc on Exports (Anti-Pattern 8.4)

**File:** `manifest.tsx`

**Issue:** Exports API lacks JSDoc documentation

```typescript
// ❌ Lines 495-507: exports section has no JSDoc
exports: {
  createOrder: async (orderData: OrderData) => { ... },
  getOrderStatus: async (orderId: string) => { ... },
}
```

**Should have:**
```typescript
exports: {
  /**
   * Creates a new sales order
   * @param orderData - Order details including items and customer
   * @returns Created order with ID and status
   * @throws {AppError} If validation fails or customer not found
   * @example
   * const order = await salesAPI.createOrder({ items: [...] });
   */
  createOrder: async (orderData: OrderData) => { ... },
}
```

---

### 5. Hook Quality Issues (Anti-Pattern - Hooks)

**File:** `ecommerce/hooks/useCart.ts`

**Issues:**
- ✅ Good: Uses `useCallback` for functions
- ⚠️ Missing: Memoization for derived values
- ⚠️ Large hook: 327 lines (should decompose)

**Recommendation:**
- Extract `useCartMutations()` for CRUD operations
- Extract `useCartState()` for derived values
- Create facade hook `useCart()` that combines both

---

### 6. No Store Files Detected

**Observation:** No Zustand stores found in `src/modules/sales/**/*Store.ts`

**Analysis:**
- ✅ Good: No server state in stores (avoiding anti-pattern 1.2)
- ⚠️ May need UI state store if module has:
  - Modal states (quote builder, order details)
  - Filter states (order history, quote list)
  - Selection states (bulk actions)

**Action:** Verify if UI state is needed during implementation

---

## 📋 Module Compliance Checklist

### Manifest Validation
- [x] `manifest.tsx` exists
- [x] Complete structure (id, name, version, depends, features)
- [x] Setup function implemented
- [x] Teardown function implemented
- [x] Exports defined (needs JSDoc)
- [x] Metadata includes navigation
- [x] Registered in `src/modules/index.ts`

### Module Structure
- [x] `README.md` exists (113 lines, production ready ✅)
- [x] `types/` directory exists (b2b/types/index.ts)
- [x] `services/` directory exists
- [x] `hooks/` directory exists
- [x] `components/` directory exists
- [ ] **MISSING:** `store/` directory (if UI state needed)
- [ ] **MISSING:** `handlers/` directory (EventBus handlers should be extracted)

### Anti-Patterns Scan
- [x] ✅ No native math operators in financial code (already using DecimalUtils)
- [ ] ❌ Server state in hooks (ecommerce hooks use useState)
- [x] ✅ No `produce()` from immer found
- [x] ✅ No direct Supabase access outside services
- [ ] ⚠️ Some mixed concerns in cartService
- [x] ✅ Manifest complete

---

## 🎯 Refactoring Priority List

### Priority 1: Critical (PHASE 2)

1. **Migrate ecommerce hooks to TanStack Query**
   - `useCatalogs.ts` → Create `useQuery` hook
   - `useOnlineOrders.ts` → Create `useQuery` + `useMutation` hooks
   - `useProductCatalog.ts` → Create `useQuery` hook
   - **Effort:** 4-6 hours
   - **Reference:** `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md`

2. **Refactor cartService separation**
   - Extract `cartApi.ts` (data access only)
   - Keep `cartService.ts` for business logic
   - Create `cartEngine.ts` if calculations needed
   - **Effort:** 2-3 hours

3. **Fix TypeScript types in b2b/types**
   - Replace `Decimal` import with `FinancialDecimal`
   - Update `CalculatedPrice` interface
   - **Effort:** 30 minutes

### Priority 2: Medium (PHASE 3)

4. **Add JSDoc to manifest exports**
   - Document `createOrder`
   - Document `getOrderStatus`
   - Add `@example` and `@throws`
   - **Effort:** 1 hour

5. **Decompose useCart hook**
   - Extract `useCartMutations`
   - Extract `useCartState`
   - Create facade `useCart`
   - **Effort:** 2 hours

6. **Extract EventBus handlers**
   - Create `handlers/index.ts`
   - Move handlers from manifest setup
   - Register in setup/teardown
   - **Effort:** 1-2 hours

### Priority 3: Low (PHASE 4)

7. **Add performance optimizations**
   - `useMemo` for derived cart values
   - Review `useCallback` dependencies
   - **Effort:** 1 hour

8. **Create UI state store if needed**
   - Assess if modal/filter states needed
   - Create `store/salesUIStore.ts` if required
   - **Effort:** 2-3 hours (if needed)

---

## 📊 Metrics Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Files | 31 | ✅ |
| Critical Issues | 3 | ❌ |
| Medium Issues | 3 | ⚠️ |
| Manifest Status | Complete | ✅ |
| DecimalUtils Usage | Partial (B2B ✅, E
