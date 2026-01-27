# Suppliers (`/modules/suppliers`)

## Overview
Vendor Relationship Management (VRM) system. Tracks supplier details, performance metrics, and integrates with the inventory system for reordering.

## 🏗️ Architecture
**Type**: Business Module
**Category**: Supply Chain

Designed to work closely with **Materials**. While Materials tracks *what* you have, Suppliers tracks *who* sends it.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Materials** | Consumer | Links ingredients to default suppliers. |
| **Dashboard** | Provider | Injects "Supplier Overview" widget. |
| **Procurement** | Host | (Planned) Future home for Purchase Order generation. |

---

## Features
- **Supplier Directory**: comprehensive contact and payment info.
- **Performance Rating**: 1-5 star rating based on delivery times and quality (manual or calc).
- **Integration Actions**: Quick-nav buttons injected into Inventory screens.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `materials.supplier.actions`
- **Purpose**: Injects "View Supplier" or "Create PO" buttons directly into the Materials table row.
- **Priority**: `85`

#### 2. `materials.supplier.badge`
- **Purpose**: Renders a small "Star Rating" badge next to supplier names in other modules.

#### 3. `dashboard.widgets`
- **Purpose**: Metrics widget (e.g., "Active Suppliers").

### Consumed Events
- `materials.stock_alert`: Could trigger automated reorder suggestions.

---

## 🔌 Public API (`exports`)

### Data Access
```typescript
// Get supplier details
const supplier = await registry.getExports('suppliers').getSupplier('SUP-001');

// Get performance metrics (for decision making)
const metrics = await registry.getExports('suppliers').getSupplierPerformance('SUP-001');
// { rating: 4.8, onTimeDelivery: 98% }
```

### UI Components
```typescript
// Reusable Supplier Form for wizards
<HookPoint name="suppliers.form-content" />
```

---

## 🔒 Access Control
- **Minimum Role**: `SUPERVISOR`
- **Permissions**: `suppliers.read`, `suppliers.create`, `suppliers.manage`

---

**Last Updated**: 2025-01-25
**Module ID**: `suppliers`
