# Módulo Supplier Orders - G-Admin Mini

**Version:** 1.0.0 - Initial Release
**Last Updated:** 2025-01-12

---

## 📋 Descripción

El módulo de **Supplier Orders** gestiona órdenes de compra a proveedores para reabastecer el inventario de materiales. Conecta los módulos de Suppliers y Materials con un workflow completo desde la creación hasta la recepción de mercadería.

### Características principales:
- ✅ **CRUD completo de órdenes** (Create, Read, Update, Delete)
- ✅ **Multi-item support** - Múltiples materiales por orden
- ✅ **Status workflow** - draft → pending → approved → received/cancelled
- ✅ **Auto-generated PO numbers** - Formato: PO-YYYYMMDD-XXXX
- ✅ **Stock auto-update** - Al recibir, actualiza inventario automáticamente
- ✅ **EventBus integration** - 5 eventos emitidos
- ✅ **Supabase integration** - 2 tablas con triggers automáticos
- ✅ **Module Registry** - Integración cross-module
- ✅ **Offline-first** - Sincronización automática

---

## 🏗️ Arquitectura

```
src/pages/admin/supply-chain/supplier-orders/
├── README.md                    # Este archivo
├── page.tsx                     # Página principal con CapabilityGate
│
├── types/
│   ├── index.ts
│   └── supplierOrderTypes.ts    # Types, Zod schemas, status helpers
│
├── services/
│   ├── supplierOrdersApi.ts     # Supabase operations
│   └── supplierOrdersService.ts # Business logic + EventBus
│
├── hooks/
│   ├── index.ts
│   ├── useSupplierOrders.ts     # Data fetching & mutations
│   └── useSupplierOrdersPage.ts # Page orchestration
│
└── components/
    ├── index.ts
    ├── SupplierOrdersMetrics.tsx      # KPI cards
    ├── SupplierOrderFormModal.tsx     # Create/Edit form (v1.1)
    ├── SupplierOrdersTable.tsx        # Orders table
    └── SupplierOrdersManagement.tsx   # Main coordinator

src/modules/supplier-orders/
└── manifest.tsx                 # Module Registry manifest
```

---

## 📊 Database Schema

### Tables Created:
- **`supplier_orders`** - Main PO table
- **`supplier_order_items`** - Line items per PO

### Functions:
- `generate_po_number()` - Auto-generates PO-YYYYMMDD-XXXX format
- `update_supplier_order_total()` - Auto-calculates totals from items

### Triggers:
- Auto-update `total_amount` when items change
- Auto-update `updated_at` timestamp

---

## 🔄 Workflow & Status

```
draft → pending → approved → received
                    ↓
                 cancelled
```

**Status Definitions:**
- **draft**: Initial creation, can edit freely
- **pending**: Submitted, waiting approval
- **approved**: Approved, sent to supplier
- **received**: Materials received, stock updated
- **cancelled**: Order cancelled

---

## 🔌 Integration

### EventBus Events Emitted:
- `supplier_orders.order_created`
- `supplier_orders.order_updated`
- `supplier_orders.order_deleted`
- `supplier_orders.status_changed`
- `supplier_orders.order_received`

### Events Consumed:
- `materials.low_stock_alert` (future: auto-generate PO)
- `suppliers.supplier_updated`

### Module Dependencies:
- **Depends on**: `suppliers`, `materials`
- **Required capability**: `inventory_supplier_management`

---

## 🚀 Running Locally

```bash
# Database is already created via Supabase MCP

# Start dev server (usually running on :5173)
pnpm dev

# Navigate to
http://localhost:5173/admin/supplier-orders

# Type check
pnpm -s exec tsc --noEmit

# Lint
pnpm lint
```

---

## 📝 Phase 1 Status: ✅ COMPLETE

### Implemented:
- ✅ Database schema with auto-calculations
- ✅ Complete type system with Zod validation
- ✅ API layer (CRUD + status management)
- ✅ Business logic service with EventBus
- ✅ Data fetching hooks
- ✅ Page orchestration hook
- ✅ Metrics component (7 KPIs)
- ✅ Table component with status badges
- ✅ Management coordinator
- ✅ Module manifest registered
- ✅ Lazy loading configured
- ✅ Route added to App.tsx

### ✅ Phase 1.1 - COMPLETADO (2025-01-12):
- ✅ **SupplierOrderFormModal** - Complex multi-item form with real-time totals
- ✅ **Receive Order Modal** - Receive materials with qty tracking & discrepancy alerts
- ✅ **Status change actions** - Approve/Cancel/Receive buttons with confirmations
- ✅ **Advanced filters** - By date range, supplier, status, overdue flag

### Phase 2 - Future:
- 📋 **Auto-generate PO** - From `materials.low_stock_alert`
- 📋 **Email notifications** - To suppliers
- 📋 **PDF generation** - Print PO documents
- 📋 **Analytics dashboard** - Supplier performance metrics

---

## 🎯 Quick Start Example

```typescript
// Create a new order
import { supplierOrdersService } from './services/supplierOrdersService';

const newOrder = await supplierOrdersService.createOrder({
  supplier_id: 'uuid-here',
  expected_delivery_date: '2025-01-20',
  notes: 'Urgente',
  items: [
    { material_id: 'mat-1', quantity: 100, unit_cost: 5.50 },
    { material_id: 'mat-2', quantity: 50, unit_cost: 12.00 }
  ]
});
// PO number auto-generated: PO-20250112-0001
// Total auto-calculated: $1150.00
```

---

## 📚 Documentation

- **Types**: See `types/supplierOrderTypes.ts` for complete type definitions
- **API**: See `services/supplierOrdersApi.ts` for all operations
- **Business Logic**: See `services/supplierOrdersService.ts` for workflows
- **Manifest**: See `src/modules/supplier-orders/manifest.tsx`

---

**🎯 Status:** Phase 1.1 Complete - Fully Functional ✅
**📅 Created:** 2025-01-12
**📅 Phase 1.1 Completed:** 2025-01-12
**👥 Maintainers:** G-Admin Team
