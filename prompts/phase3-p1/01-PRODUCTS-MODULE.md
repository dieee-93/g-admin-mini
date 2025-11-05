# 📦 PRODUCTS MODULE - Production Ready

**Module**: Products (Catalog Management)
**Phase**: Phase 3 P1 - Supply Chain - Module 1/3
**Estimated Time**: 4-5 hours
**Priority**: P1 (Depends on Materials)

---

## 📋 OBJECTIVE

Make the **Products module** production-ready following the 10-criteria checklist.

**Dependencies**: Materials module (for BOM/recipes)

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, services/, hooks/, types/ organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: All CRUD operations working
5. ✅ **Cross-module mapped**: README documents provides/consumes
6. ✅ **Zero duplication**: No repeated logic
7. ✅ **DB connected**: All CRUD via service layer
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole + usePermissions + service layer
10. ✅ **README**: Cross-module integration documented

---

## 📂 MODULE FILES

**Manifest**: `src/modules/products/manifest.tsx`
**Page**: `src/pages/admin/supply-chain/products/page.tsx`
**Database**: `products` table (Supabase)

---

## 🔍 MODULE DETAILS

### Current Status (From Production Plan)

**Metadata**:
- ID: `products`
- Dependencies: `['materials']` (for BOM/recipes)
- Tier: 2 (First-level dependency)
- minimumRole: `OPERADOR` ✅ (already set)

**Hooks**:
- **PROVIDES**:
  - `products.product_created`
  - `products.product_updated`
  - `products.price_changed`
  - `dashboard.widgets`

- **CONSUMES**:
  - `materials.stock_updated` (recipe availability)
  - `materials.low_stock_alert` (ingredient alerts)

**Features**:
- Product CRUD
- Pricing management
- Categories
- BOM/Recipes (materials consumption)
- Menu display

### Database Schema

**Table**: `products`
```sql
- id: uuid (PK)
- name: text
- description: text
- price: decimal (Decimal.js precision)
- category: text
- is_available: boolean
- recipe: jsonb (materials + quantities)
- image_url: text
- created_at: timestamptz
- updated_at: timestamptz
```

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1️⃣ AUDIT (30 min)
- [ ] Read manifest
- [ ] Read page component
- [ ] Check ESLint errors
- [ ] Check TypeScript errors
- [ ] Review database schema
- [ ] Test CRUD operations
- [ ] Document findings

### 2️⃣ FIX STRUCTURE (1 hour)
- [ ] Fix ESLint errors
- [ ] Fix TypeScript errors
- [ ] Add `minimumRole` (if missing)
- [ ] Add `usePermissions('products')`
- [ ] Use `@/shared/ui` imports
- [ ] Create `productApi.ts` with permission checks

**Service Layer Pattern**:
```typescript
// src/pages/admin/supply-chain/products/services/productApi.ts
import { requirePermission } from '@/lib/permissions';

export const createProduct = async (data: Product, user: AuthUser) => {
  requirePermission(user, 'products', 'create');
  return supabase.from('products').insert(data);
};
```

### 3️⃣ DATABASE & FUNCTIONALITY (1.5 hours)
- [ ] Test CREATE product
- [ ] Test READ products (list + detail)
- [ ] Test UPDATE product
- [ ] Test DELETE product
- [ ] Verify BOM/recipe integration (materials)
- [ ] Test price calculations (Decimal.js)
- [ ] Verify availability logic

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)
- [ ] Create README.md
- [ ] Document provides/consumes
- [ ] Test integration with Materials (BOM)
- [ ] Test integration with Sales (pricing)
- [ ] Register dashboard widget
- [ ] Test EventBus events

**EventBus Integration**:
```typescript
// Listen to materials stock updates
eventBus.subscribe('materials.stock_updated', (event) => {
  // Update product availability based on recipe ingredients
});
```

### 5️⃣ VALIDATION (30 min)
- [ ] All 10 criteria met
- [ ] Manual testing (CRUD workflow)
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] README complete

---

## 📚 REFERENCE

**Study**: Materials module (`src/pages/admin/supply-chain/materials/`)
- Service layer pattern
- Decimal.js usage
- Permission integration

---

## ⏱️ TIME TRACKING

- Audit: 30 min
- Fix Structure: 1 hour
- Database: 1.5 hours
- Cross-Module: 1 hour
- Validation: 30 min

**Total**: 4.5 hours

---

**Status**: 🟢 READY TO START
**Next**: Suppliers module
