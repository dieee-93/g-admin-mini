# Duplication Analysis - Before Migration

**Date**: 2026-01-12
**Purpose**: Detect code duplication before migrating hooks from `src/hooks/` to modules

---

## 🔍 ANALYSIS SUMMARY

### Current Hook/Store Locations

```
STAFF:
├── src/hooks/useStaffData.ts              ← Global hook (to migrate)
├── src/hooks/useStaff.ts                  ← Global hook (to migrate)
├── src/hooks/useStaffValidation.ts        ← Global hook (to migrate)
├── src/store/staffStore.ts                ← Global store (to migrate)
├── src/pages/admin/resources/staff/hooks/
│   ├── useStaffPage.ts                    ← Page-specific (KEEP in pages)
│   └── useStaffForm.tsx                   ← Page-specific (KEEP in pages)
└── src/modules/staff/
    ├── manifest.tsx                       ← Module manifest exists
    └── widgets/                           ← Module widgets exist

CUSTOMERS:
├── src/hooks/useCustomers.ts              ← Global hook (to migrate)
├── src/hooks/useCustomerValidation.ts     ← Global hook (to migrate)
├── src/store/customersStore.ts            ← Global store (to migrate)
└── src/pages/admin/core/crm/customers/hooks/
    ├── existing/useCustomers.ts           ← Existing page hook
    ├── useCustomerForm.ts                 ← Page-specific
    └── useCustomersPage.ts                ← Page-specific

SUPPLIERS:
├── src/hooks/useSuppliers.ts              ← Global hook (to migrate)
├── src/hooks/useSupplierValidation.ts     ← Global hook (to migrate)
├── src/store/suppliersStore.ts            ← Global store (to migrate)
└── No page hooks found

MATERIALS:
├── src/hooks/useMaterialValidation.ts     ← Global hook (to migrate)
├── src/modules/materials/hooks/index.ts   ← Module hooks exist (re-exports)
└── src/pages/admin/supply-chain/materials/hooks/
    ├── useMaterials.ts                    ← Page-specific
    ├── useMaterialsPage.ts                ← Page-specific
    └── (8 more hooks)                     ← All page-specific
```

---

## ⚠️ POTENTIAL DUPLICATIONS DETECTED

### 1. Customers Module

**DUPLICATION RISK**: ⚠️ **HIGH**

```typescript
// src/hooks/useCustomers.ts (global)
// vs
// src/pages/admin/core/crm/customers/hooks/existing/useCustomers.ts (page)
```

**Action Required**:
1. Compare both hooks
2. If identical: delete one, use the other
3. If different: determine which one is correct
4. Consolidate into module hook

---

### 2. Materials Module

**DUPLICATION RISK**: ✅ **LOW - Already handled**

```typescript
// src/modules/materials/hooks/index.ts
export { useMaterials } from '@/pages/admin/supply-chain/materials/hooks/useMaterials';
```

✅ **Already following correct pattern**:
- Module hooks are re-exports from page hooks
- No actual duplication
- Migration already complete

---

## 📋 MIGRATION STRATEGY (Anti-Duplication)

### Pattern 1: No Duplication (Staff, Suppliers, Assets)

**Current**:
```
src/hooks/useStaffData.ts → Global hook
src/modules/staff/        → No hooks yet
```

**Strategy**: SAFE TO MIGRATE
1. Create `src/modules/staff/hooks/`
2. Move `src/hooks/useStaffData.ts` → `src/modules/staff/hooks/`
3. Move `src/store/staffStore.ts` → `src/modules/staff/store/`
4. Update imports

---

### Pattern 2: Potential Duplication (Customers)

**Current**:
```
src/hooks/useCustomers.ts
src/pages/admin/core/crm/customers/hooks/existing/useCustomers.ts
```

**Strategy**: COMPARE & CONSOLIDATE
1. ✅ Read both hooks
2. ✅ Determine which is correct/newer
3. ✅ Delete duplicate
4. ✅ Migrate surviving hook to module
5. ✅ Update all imports

---

### Pattern 3: Re-export Pattern (Materials - Already Done)

**Current**:
```
src/modules/materials/hooks/index.ts → Re-exports from pages/
```

**Strategy**: ✅ NO ACTION NEEDED
- Already following correct pattern
- Module hooks re-export page hooks
- No duplication

---

## 🎯 PRE-MIGRATION CHECKLIST

Before migrating ANY hook, verify:

- [ ] Check if hook exists in `src/modules/{module}/hooks/`
- [ ] Check if hook exists in `src/pages/*/hooks/`
- [ ] If duplicates found:
  - [ ] Compare both versions
  - [ ] Determine which is correct
  - [ ] Delete duplicate
  - [ ] Document decision
- [ ] Search for all imports of the hook
- [ ] Verify no broken dependencies after move

---

## 🔧 DUPLICATION DETECTION COMMANDS

### Check if hook exists in module
```bash
find src/modules/{module} -name "use*.ts" -o -name "use*.tsx"
```

### Check if hook exists in pages
```bash
find src/pages -name "{hookName}.ts" -o -name "{hookName}.tsx"
```

### Find all imports of a hook
```bash
grep -r "from '@/hooks/{hookName}'" src/ --include="*.ts" --include="*.tsx"
```

### Compare two hooks
```bash
diff src/hooks/useCustomers.ts src/pages/admin/core/crm/customers/hooks/existing/useCustomers.ts
```

---

## 📊 DUPLICATION SUMMARY

| Module | Global Hook | Module Hook | Page Hook | Duplication? |
|--------|-------------|-------------|-----------|--------------|
| Staff | ✅ Yes | ❌ No | ✅ Yes (different) | ✅ Safe |
| Customers | ✅ Yes | ❌ No | ✅ Yes (same?) | ⚠️ Check |
| Suppliers | ✅ Yes | ❌ No | ❌ No | ✅ Safe |
| Materials | ❌ No | ✅ Yes (re-export) | ✅ Yes | ✅ Safe |
| Assets | ✅ Yes | ❌ No | ❌ No | ✅ Safe |
| Products | ✅ Yes | ✅ Yes (re-export) | ✅ Yes | ✅ Safe |

---

## ✅ SAFE TO MIGRATE (No Duplication)

These modules have NO duplication and are SAFE to migrate:

1. **Staff**
   - `src/hooks/useStaffData.ts` → `src/modules/staff/hooks/`
   - `src/hooks/useStaff.ts` → `src/modules/staff/hooks/`
   - `src/hooks/useStaffValidation.ts` → `src/modules/staff/hooks/`
   - `src/hooks/useStaffPolicies.ts` → `src/modules/staff/hooks/`
   - `src/store/staffStore.ts` → `src/modules/staff/store/`

2. **Suppliers**
   - `src/hooks/useSuppliers.ts` → `src/modules/suppliers/hooks/`
   - `src/hooks/useSupplierValidation.ts` → `src/modules/suppliers/hooks/`
   - `src/store/suppliersStore.ts` → `src/modules/suppliers/store/`

3. **Assets**
   - `src/hooks/useAssets.ts` → `src/modules/assets/hooks/`
   - `src/hooks/useAssetValidation.ts` → `src/modules/assets/hooks/`
   - `src/store/assetsStore.ts` → `src/modules/assets/store/`

---

## ⚠️ REQUIRES ANALYSIS (Potential Duplication)

### Customers

**Files to compare**:
```bash
src/hooks/useCustomers.ts
src/pages/admin/core/crm/customers/hooks/existing/useCustomers.ts
```

**Next Steps**:
1. Read both files
2. Diff comparison
3. Determine which is correct
4. Delete duplicate
5. Migrate survivor

---

## 🚨 PAGE HOOKS vs MODULE HOOKS

### ✅ KEEP in pages/ (Page-specific orchestration):
```
src/pages/admin/resources/staff/hooks/
├── useStaffPage.ts        ← Page orchestrator (KEEP)
└── useStaffForm.tsx       ← Form-specific (KEEP)
```

### ✅ MOVE to modules/ (Reusable data/domain logic):
```
src/hooks/
├── useStaffData.ts        ← Data fetching (MOVE)
├── useStaffValidation.ts  ← Domain validation (MOVE)
└── useStaffPolicies.ts    ← Business rules (MOVE)
```

**Rule of Thumb**:
- **Page hooks**: Orchestrate multiple concerns for a specific page → KEEP in pages/
- **Module hooks**: Reusable domain logic → MOVE to modules/
- **Global hooks**: Generic utilities → KEEP in src/hooks/core/

---

## 📝 MIGRATION ORDER (Anti-Duplication)

### Phase 1: Safe Migrations (No duplication)
1. Staff module (8 hooks)
2. Suppliers module (3 hooks)
3. Assets module (2 hooks)

### Phase 2: Analyze & Consolidate
1. Customers module (compare hooks first)

### Phase 3: Validation Hooks
1. Materials validations
2. Products validations
3. Sales validations

---

**Status**: Ready for execution
**Next Step**: Start with Staff module (safest, no duplication)
