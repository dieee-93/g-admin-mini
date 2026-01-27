# 🚨 CRITICAL DUPLICATION REPORT - useCustomers

**Date**: 2026-01-12
**Module**: Customers
**Status**: ⚠️ **HIGH PRIORITY - DUPLICATION DETECTED**

---

## 🔍 DUPLICATED CODE FOUND

### Two Different Implementations of `useCustomers`

#### Version 1: Global Hook (TanStack Query - NEWER)
**Location**: `src/hooks/useCustomers.ts`
**Lines**: ~450 lines
**Pattern**: TanStack Query with query keys factory
**Features**:
- ✅ Query keys factory (`customersKeys`)
- ✅ TanStack Query hooks (`useQuery`, `useMutation`)
- ✅ Modern pattern (follows Cash module)
- ✅ Separate hooks for CRUD operations
- ✅ Optimistic updates
- ✅ Auto-invalidation

**Code sample**:
```typescript
export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (filters?: CustomerFilters) => [...customersKeys.lists(), filters] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
  stats: () => [...customersKeys.all, 'stats'] as const,
};

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: customersKeys.list(filters),
    queryFn: async () => { /* ... */ }
  });
}
```

---

#### Version 2: Page Hook (useCrudOperations - OLDER)
**Location**: `src/pages/admin/core/crm/customers/hooks/existing/useCustomers.ts`
**Lines**: ~200 lines
**Pattern**: Wrapper around `useCrudOperations` hook
**Features**:
- ✅ Uses unified CRUD system
- ✅ Includes sales aggregation
- ✅ Real-time subscriptions
- ❌ No query keys factory
- ❌ Less flexible (monolithic hook)

**Code sample**:
```typescript
export function useCustomers() {
  const crud = useCrudOperations<any>({
    tableName: 'customers',
    selectQuery: `*, sales (...)`,
    schema: EntitySchemas.customer,
    enableRealtime: true,
    cacheKey: 'customers',
  });

  const customers = useMemo<Customer[]>(() => {
    return crud.items.map(item => ({
      ...item,
      total_orders: calculateOrders(item),
      total_spent: calculateSpent(item),
      // ...
    }));
  }, [crud.items]);

  return { customers, loading, addCustomer, updateCustomer, deleteCustomer };
}
```

---

## 📊 USAGE ANALYSIS

### Version 1 (Global Hook) - BARELY USED
**Imports**: 1 file
```
src/pages/admin/core/dashboard/components/widgets/CustomersWidget.tsx
└── import { useCustomerStats } from '@/hooks/useCustomers';
```

### Version 2 (Page Hook) - HEAVILY USED
**Imports**: 6 files
```
src/pages/admin/core/crm/customers/components/
├── CustomerAnalytics/CustomerAnalytics.tsx
├── CustomerAnalytics/CustomerOrdersHistory.tsx
├── CustomerAnalytics/CustomerSegments.tsx
├── CustomerForm/CustomerForm.tsx
└── CustomerList/CustomerList.tsx
```

---

## 🎯 RECOMMENDATION

### ⚠️ **WINNER: Version 2 (Page Hook)**

**Reasons**:
1. **Actually used**: 6 files vs 1 file
2. **Sales aggregation**: Includes sales data (business requirement)
3. **Real-time**: Already has real-time subscriptions
4. **Backward compatible**: Maintains exact interface expected by components

### ❌ **DELETE: Version 1 (Global Hook)**

**Reasons**:
1. **Barely used**: Only `CustomersWidget.tsx` imports `useCustomerStats`
2. **Incomplete**: Missing sales aggregation
3. **Duplicate effort**: Re-implements what useCrudOperations already does
4. **Migration overhead**: Would require changing 6 components

---

## ✅ CONSOLIDATION PLAN

### Step 1: Keep Version 2, Delete Version 1

```bash
# Delete global hook
rm src/hooks/useCustomers.ts
rm src/hooks/useCustomerValidation.ts
```

### Step 2: Move Page Hook to Module

```bash
# Create customers module
mkdir -p src/modules/customers/hooks
mkdir -p src/modules/customers/store

# Move page hook to module
mv src/pages/admin/core/crm/customers/hooks/existing/useCustomers.ts \
   src/modules/customers/hooks/useCustomers.ts

# Move other customer hooks
mv src/pages/admin/core/crm/customers/hooks/existing/useCustomerNotes.ts \
   src/modules/customers/hooks/useCustomerNotes.ts
mv src/pages/admin/core/crm/customers/hooks/existing/useCustomerRFM.ts \
   src/modules/customers/hooks/useCustomerRFM.ts
mv src/pages/admin/core/crm/customers/hooks/existing/useCustomerTags.ts \
   src/modules/customers/hooks/useCustomerTags.ts

# Move store
mv src/store/customersStore.ts src/modules/customers/store/
```

### Step 3: Create Barrel Export

```typescript
// src/modules/customers/hooks/index.ts
export { useCustomers, useCustomerSearch } from './useCustomers';
export { useCustomerNotes } from './useCustomerNotes';
export { useCustomerRFM } from './useCustomerRFM';
export { useCustomerTags } from './useCustomerTags';
```

### Step 4: Update Imports

**Before**:
```typescript
// CustomerAnalytics.tsx
import { useCustomers } from '../../hooks/existing/useCustomers';
```

**After**:
```typescript
// CustomerAnalytics.tsx
import { useCustomers } from '@/modules/customers/hooks';
```

### Step 5: Fix CustomersWidget (Only User of Global Hook)

**Before**:
```typescript
// CustomersWidget.tsx
import { useCustomerStats } from '@/hooks/useCustomers';
```

**After**:
```typescript
// CustomersWidget.tsx
import { useCustomers } from '@/modules/customers/hooks';

// In component:
const { customers, loading } = useCustomers();
const stats = useMemo(() => calculateStats(customers), [customers]);
```

---

## 📋 MIGRATION CHECKLIST

### Phase 1: Analysis (DONE)
- [x] Identify duplicates
- [x] Compare implementations
- [x] Count usage
- [x] Determine winner

### Phase 2: Consolidation
- [ ] Delete `src/hooks/useCustomers.ts`
- [ ] Delete `src/hooks/useCustomerValidation.ts`
- [ ] Create `src/modules/customers/hooks/`
- [ ] Move page hooks to module
- [ ] Create barrel export

### Phase 3: Update Imports
- [ ] Update `CustomerAnalytics.tsx` (2 files)
- [ ] Update `CustomerForm.tsx`
- [ ] Update `CustomerList.tsx`
- [ ] Update `CustomersWidget.tsx` (needs refactor)

### Phase 4: Cleanup
- [ ] Delete `hooks/existing/` folder
- [ ] Move `customersStore.ts` to module
- [ ] Update store imports

### Phase 5: Validation
- [ ] Run TypeScript compiler (`tsc --noEmit`)
- [ ] Test customer pages
- [ ] Test dashboard widget
- [ ] Verify no broken imports

---

## 🧪 TESTING STRATEGY

### Files to Test After Migration

1. **Customer List**
   - Path: `/admin/core/crm/customers`
   - Test: CRUD operations, search, filters

2. **Customer Analytics**
   - Test: RFM segmentation, charts, stats

3. **Dashboard Widget**
   - Path: `/admin/core/dashboard`
   - Test: Customer stats display

4. **Customer Form**
   - Test: Create/edit customer

---

## 🎯 EXPECTED OUTCOME

### Before (Duplicated)
```
src/hooks/useCustomers.ts                  ← 450 lines (DELETE)
src/hooks/useCustomerValidation.ts         ← 150 lines (DELETE)
src/pages/.../hooks/existing/useCustomers.ts ← 200 lines (MOVE)
Total: 800 lines across 3 files
```

### After (Consolidated)
```
src/modules/customers/hooks/
├── useCustomers.ts                        ← 200 lines (moved from pages)
├── useCustomerNotes.ts                    ← Already existed
├── useCustomerRFM.ts                      ← Already existed
├── useCustomerTags.ts                     ← Already existed
└── index.ts                               ← Barrel export
Total: ~300 lines (600 lines deleted!)
```

**Savings**: 600 lines of duplicate code eliminated ✨

---

## 🚨 RISKS & MITIGATIONS

### Risk 1: Breaking Changes
**Mitigation**: Update imports atomically, test each component

### Risk 2: Missing Functionality
**Mitigation**: Page hook (Version 2) is more complete, safer choice

### Risk 3: Type Errors
**Mitigation**: Keep exact same types and interfaces

---

## 📝 NOTES

### Why Version 2 Won?

1. **Real usage**: 6 files depend on it vs 1 file
2. **Sales aggregation**: Business requirement not in Version 1
3. **Less work**: Moving is easier than refactoring 6 components
4. **Real-time**: Already configured, Version 1 lacks this

### Why Version 1 Failed?

1. **Premature optimization**: Created modern pattern but never adopted
2. **Incomplete**: Missing sales aggregation
3. **Not integrated**: Components never migrated to it
4. **Orphaned**: Only 1 widget uses a sub-hook

---

## ✅ CONCLUSION

**Action**: Delete Version 1 (global hook), move Version 2 (page hook) to module

**Rationale**: Version 2 is actually used, more complete, and requires less migration work

**Next Steps**:
1. Execute consolidation plan
2. Update imports (7 files)
3. Test thoroughly
4. Delete duplicates

---

**Status**: Ready for execution
**Estimated Time**: 1 hour
**Files Affected**: 7 components + 3 hooks
**Lines Saved**: ~600 lines of duplicate code
