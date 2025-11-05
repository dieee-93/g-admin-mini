# 📋 SUPPLIER ORDERS MODULE - Production Ready

**Module**: Supplier Orders (Purchase Orders)
**Phase**: Phase 3 P1 - Supply Chain - Module 3/3
**Estimated Time**: 5 hours
**Priority**: P1 (Depends on Suppliers + Materials)

---

## 📋 OBJECTIVE

Make the **Supplier Orders module** production-ready following the 10-criteria checklist.

**Dependencies**: Suppliers + Materials (purchase orders link suppliers to inventory)

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**
2. ✅ **Scaffolding ordered**
3. ✅ **Zero errors**
4. ✅ **UI complete**
5. ✅ **Cross-module mapped**
6. ✅ **Zero duplication**
7. ✅ **DB connected**
8. ✅ **Features mapped**
9. ✅ **Permissions designed** (minimumRole: SUPERVISOR ✅)
10. ✅ **README**

---

## 📂 MODULE FILES

**Manifest**: `src/modules/supplier-orders/manifest.tsx` ✅ (minimumRole: SUPERVISOR)
**Page**: `src/pages/admin/supply-chain/supplier-orders/page.tsx` (TO VERIFY)
**Database**: `supplier_orders` table

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ID: `supplier-orders`
- Dependencies: `['suppliers', 'materials']`
- Tier: 3 (Second-level dependency)
- minimumRole: `SUPERVISOR` ✅

**Hooks**:
- **PROVIDES**:
  - `supplier_orders.order_created`
  - `supplier_orders.order_updated`
  - `supplier_orders.order_deleted`
  - `supplier_orders.status_changed`
  - `supplier_orders.order_received` (triggers stock update)

- **CONSUMES**:
  - `materials.low_stock_alert` (auto-create PO suggestion)
  - `suppliers.supplier_updated` (update PO if supplier changes)

### Database Schema

**Table**: `supplier_orders`
```sql
- id: uuid (PK)
- supplier_id: uuid (FK → suppliers)
- order_date: timestamptz
- expected_delivery: timestamptz
- status: text ('draft' | 'sent' | 'received' | 'cancelled')
- total_amount: decimal
- notes: text
- created_at: timestamptz
- updated_at: timestamptz
```

**Related**: `supplier_order_items`
```sql
- id: uuid (PK)
- order_id: uuid (FK → supplier_orders)
- material_id: uuid (FK → items/materials)
- quantity: decimal
- unit_price: decimal
- subtotal: decimal
```

---

## 🎯 WORKFLOW (5 HOURS)

### 1️⃣ AUDIT (45 min)
- [ ] Read manifest
- [ ] Read page component
- [ ] Check ESLint errors
- [ ] Check TypeScript errors
- [ ] Review database schema (2 tables)
- [ ] Test if page exists or needs creation
- [ ] Document findings

### 2️⃣ FIX STRUCTURE (1.5 hours)
- [ ] Fix ESLint errors
- [ ] Fix TypeScript errors
- [ ] Create page if missing
- [ ] Add `usePermissions('supplier-orders')`
- [ ] Create `supplierOrdersApi.ts` with permissions
- [ ] Use `@/shared/ui` imports

**Service Layer Pattern**:
```typescript
// src/pages/admin/supply-chain/supplier-orders/services/supplierOrdersApi.ts
import { requirePermission } from '@/lib/permissions';

export const createSupplierOrder = async (data: SupplierOrder, user: AuthUser) => {
  requirePermission(user, 'supplier-orders', 'create');

  // Create order + order items in transaction
  return supabase.rpc('create_supplier_order', {
    order_data: data,
    items_data: data.items
  });
};
```

### 3️⃣ DATABASE & FUNCTIONALITY (1.5 hours)
- [ ] Create PO form (or verify exists)
- [ ] Test CREATE PO with items
- [ ] Test READ POs (list + detail)
- [ ] Test UPDATE PO
- [ ] Test DELETE PO
- [ ] Test status transitions (draft → sent → received)
- [ ] Test "receive order" flow (updates materials stock)
- [ ] Verify Decimal.js for amounts

**Key Workflow**:
1. Create PO → status: 'draft'
2. Send to supplier → status: 'sent'
3. Receive goods → status: 'received' + **emit `supplier_orders.order_received`**
4. Materials module listens → auto-updates stock

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)
- [ ] Create README.md
- [ ] Document provides/consumes
- [ ] Test integration with Suppliers (supplier selector)
- [ ] Test integration with Materials (item selector + stock update)
- [ ] Test EventBus: emit `order_received` → materials updates stock
- [ ] Test EventBus: consume `materials.low_stock_alert` → suggest PO
- [ ] Register dashboard widget (pending POs)

**EventBus Integration**:
```typescript
// Emit when order received
eventBus.emit('supplier_orders.order_received', {
  orderId,
  supplierId,
  items: [{ materialId, quantityReceived }]
});

// Materials module listens and auto-updates stock
```

**Low Stock Auto-Suggestion**:
```typescript
// In manifest setup
eventBus.subscribe('materials.low_stock_alert', (event) => {
  const { materialId, currentStock, reorderPoint } = event.payload;

  // Suggest creating PO for this material
  logger.info('SupplierOrders', 'Low stock alert, suggest PO', {
    materialId,
    quantitySuggested: reorderPoint - currentStock
  });
});
```

### 5️⃣ VALIDATION (30 min)
- [ ] All 10 criteria met
- [ ] Manual testing (full PO workflow)
- [ ] Test receive order → stock updates
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] README complete

---

## 📚 REFERENCE

**Study**:
- Materials module (stock update logic)
- Suppliers module (supplier selector)
- Sales module (similar order structure)

---

## ⏱️ TIME TRACKING

- Audit: 45 min
- Fix Structure: 1.5 hours
- Database: 1.5 hours
- Cross-Module: 1 hour
- Validation: 30 min

**Total**: 5 hours

---

**Status**: 🟢 READY TO START
**Completes**: Phase 3 P1 - Supply Chain
**Next Phase**: Phase 3 P2 - Finance Modules
