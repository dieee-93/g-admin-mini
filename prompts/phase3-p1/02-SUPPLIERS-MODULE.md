# 🏢 SUPPLIERS MODULE - Production Ready

**Module**: Suppliers (Vendor Management)
**Phase**: Phase 3 P1 - Supply Chain - Module 2/3
**Estimated Time**: 4 hours
**Priority**: P1 (Independent, foundation for Supplier Orders)

---

## 📋 OBJECTIVE

Make the **Suppliers module** production-ready following the 10-criteria checklist.

**Status**: ✅ **ALREADY PARTIALLY COMPLETE** - Form was migrated in Form Migration Session (2025-01-31)

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**
2. ✅ **Scaffolding ordered**
3. ✅ **Zero errors** (verify current state)
4. ✅ **UI complete** (form already migrated)
5. ✅ **Cross-module mapped**
6. ✅ **Zero duplication**
7. ✅ **DB connected**
8. ✅ **Features mapped**
9. ✅ **Permissions designed** (minimumRole already set)
10. ✅ **README**

---

## 📂 MODULE FILES

**Manifest**: `src/modules/suppliers/manifest.tsx` ✅ (minimumRole: SUPERVISOR)
**Page**: `src/pages/admin/supply-chain/suppliers/page.tsx`
**Form**: `src/pages/admin/supply-chain/suppliers/components/SupplierFormModal.tsx` ✅ (MIGRATED)
**Hooks**:
- `useSupplierForm.ts` ✅ (already exists)
- `useSupplierValidation.ts` ✅ (already exists)

---

## 🔍 MODULE DETAILS

### Current Status

**Form Migration** (2025-01-31):
- ✅ Form uses React Hook Form + Zod
- ✅ Business validations (unique name/email, CUIT format)
- ✅ Field warnings (low rating, inactive supplier)
- ✅ Validation summary with Alert
- ✅ Form status badge
- ✅ Progress indicator

**Hooks**:
- **PROVIDES**:
  - `suppliers.supplier_created`
  - `suppliers.supplier_updated`
  - `suppliers.supplier_status_changed`
  - `materials.supplier.actions` (integration)
  - `materials.supplier.badge` (rating badge)

- **CONSUMES**:
  - `materials.low_stock_alert` (trigger reorders)

---

## 🎯 WORKFLOW (4 HOURS)

### 1️⃣ AUDIT (30 min)
- [ ] Verify form migration complete
- [ ] Check ESLint errors: `pnpm -s exec eslint src/pages/admin/supply-chain/suppliers/`
- [ ] Check TypeScript errors
- [ ] Test CRUD operations
- [ ] Verify permissions integration
- [ ] Document current state

### 2️⃣ FIX STRUCTURE (45 min)
- [ ] Fix any remaining ESLint errors
- [ ] Fix any TypeScript errors
- [ ] Verify `usePermissions('suppliers')` in page
- [ ] Verify service layer has permission checks
- [ ] Ensure all imports from `@/shared/ui`

### 3️⃣ DATABASE & FUNCTIONALITY (1 hour)
- [ ] Test CREATE supplier (form already migrated)
- [ ] Test READ suppliers (list view)
- [ ] Test UPDATE supplier
- [ ] Test DELETE supplier
- [ ] Test supplier rating system
- [ ] Verify performance tracking

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)
- [ ] Create README.md
- [ ] Document form validation architecture
- [ ] Test integration with Materials (supplier actions)
- [ ] Verify EventBus integration
- [ ] Test supplier badge in materials view

**README Highlight**:
```markdown
## Form Architecture

This module uses the **Material Form Pattern**:
- Business logic in hook (`useSupplierForm.ts`)
- Validation in separate hook (`useSupplierValidation.ts`)
- UI presentational (`SupplierFormModal.tsx`)

### Validations
- Unique name (checkDuplicateName)
- Unique email (validateEmailUnique)
- CUIT format Argentina (validateTaxId)
- Rating 1-5 (validateRating)

### Warnings
- Low rating (<3)
- Inactive supplier
- Missing contact info
```

### 5️⃣ VALIDATION (45 min)
- [ ] All 10 criteria met
- [ ] Manual testing (full CRUD workflow)
- [ ] Test form validations
- [ ] Test warnings
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] README complete

---

## 📚 REFERENCE

**Form Migration Doc**: `FORM_MIGRATION_PROMPT.md` (Section: Suppliers Form)

**Integration Points**:
- Materials module (supplier actions, rating badge)
- Supplier Orders module (depends on this)

---

## ⏱️ TIME TRACKING

- Audit: 30 min
- Fix Structure: 45 min
- Database: 1 hour
- Cross-Module: 1 hour
- Validation: 45 min

**Total**: 4 hours

---

**Status**: 🟢 READY TO START (likely faster due to form migration)
**Next**: Supplier Orders module
