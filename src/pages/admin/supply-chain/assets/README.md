# Assets Module

**Physical Asset Management & Rental Integration**

> Complete CRUD system with cross-module UI injection pattern demonstration

---

## 📋 Overview

The Assets module manages physical assets (equipment, vehicles, tools, etc.) with full support for rental integration through the **HookPoint injection pattern**.

### Key Features

- ✅ Complete CRUD operations for assets
- ✅ Multi-status tracking (available, in_use, maintenance, rented, retired)
- ✅ Condition monitoring (excellent → broken)
- ✅ Financial tracking (purchase price, current value, depreciation)
- ✅ Maintenance scheduling with alerts
- ✅ **Rental-ready fields** (rental pricing, availability)
- ✅ **HookPoints for cross-module UI injection**
- ✅ EventBus integration for system-wide events
- ✅ Zustand store for state management
- ✅ Offline-first support

---

## 🏗️ Architecture

### Tech Stack

- **State**: Zustand store (`@/store/assetsStore.ts`)
- **UI**: Shared UI components (`@/shared/ui`)
- **API**: Supabase with RLS policies
- **Events**: EventBus for cross-module communication
- **Forms**: React Hook Form with validation

### File Structure

```
src/pages/admin/supply-chain/assets/
├── page.tsx                      # Main page with ContentLayout
├── README.md                     # This file
├── types/
│   └── index.ts                  # TypeScript interfaces
├── services/
│   ├── assetsApi.ts              # Supabase CRUD operations
│   └── assetsService.ts          # Business logic & calculations
├── hooks/
│   ├── useAssetsPage.ts          # Main page hook (Zustand + API)
│   └── index.ts                  # Barrel exports
└── components/
    ├── AssetsMetrics.tsx         # Metrics cards (MetricCard)
    ├── AssetsFilters.tsx         # Filter panel
    ├── AssetsTable.tsx           # Table with HookPoint
    ├── AssetFormModal.tsx        # Form with HookPoint
    ├── AssetDetailModal.tsx      # Detail with HookPoint
    ├── AssetsManagement.tsx      # Main orchestrator
    └── index.ts                  # Barrel exports
```

---

## 🎯 HookPoint Integration Pattern

This module demonstrates the **cross-module UI injection pattern** used throughout G-Admin.

### Provided HookPoints

Assets exposes 3 HookPoints for other modules to inject UI:

```typescript
// In Assets manifest
hooks: {
  provide: [
    'assets.row.actions',      // Inject buttons in table rows
    'assets.form.fields',      // Inject fields in create/edit form
    'assets.detail.sections',  // Inject sections in detail view
  ]
}
```

### Usage in Components

```tsx
// AssetsTable.tsx - Row actions
<HookPoint hookName="assets.row.actions" hookParams={asset} />

// AssetFormModal.tsx - Form fields
<HookPoint hookName="assets.form.fields" hookParams={{ asset, register }} />

// AssetDetailModal.tsx - Detail sections
<HookPoint hookName="assets.detail.sections" hookParams={asset} />
```

### Consumer Example (Rentals Module)

```tsx
// In Rentals manifest setup()
registry.addAction(
  'assets.row.actions',
  (asset) => <RentAssetButton asset={asset} />,
  'rentals',
  10 // priority
);
```

**Result**: Rentals module injects a "Rent" button into Assets table without Assets knowing about Rentals!

---

## 📊 Database Schema

```sql
CREATE TABLE public.assets (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  condition VARCHAR(50) DEFAULT 'good',

  -- Financial
  purchase_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  purchase_date DATE,

  -- Location
  location VARCHAR(255),
  assigned_to UUID REFERENCES employees(id),

  -- Rental Integration (used by Rentals module)
  is_rentable BOOLEAN DEFAULT false,
  rental_price_per_day DECIMAL(10, 2),
  rental_price_per_hour DECIMAL(10, 2),
  currently_rented BOOLEAN DEFAULT false,
  current_rental_id UUID,

  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER DEFAULT 90,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 EventBus Events

### Emitted Events

```typescript
// Asset created
EventBus.emit('assets.created', {
  assetId: string,
  assetName: string,
  category: AssetCategory,
  timestamp: string,
});

// Asset updated
EventBus.emit('assets.updated', {
  assetId: string,
  assetName: string,
  timestamp: string,
});

// Status changed
EventBus.emit('assets.status_updated', {
  assetId: string,
  oldStatus: AssetStatus,
  newStatus: AssetStatus,
  timestamp: string,
});
```

### Consumed Events

```typescript
// Listen to rental events (if needed)
EventBus.subscribe('rentals.asset_rented', (event) => {
  // Update asset status to 'rented'
});
```

---

## 💡 Usage Examples

### Basic CRUD

```tsx
import { useAssetsPage } from './hooks';

function MyComponent() {
  const { assets, actions, loading } = useAssetsPage();

  // Create asset
  await actions.handleSubmit({
    name: 'Laptop Dell XPS',
    asset_code: 'EQ-0001',
    category: 'electronics',
    purchase_price: 1500,
    is_rentable: true,
    rental_price_per_day: 50,
  });

  // Update status
  await actions.handleStatusChange(assetId, 'maintenance');

  // Delete asset
  await actions.handleDelete(assetId);
}
```

### Filtering Assets

```tsx
const { filteredAssets, filters, actions } = useAssetsPage();

// Filter by status
actions.handleFiltersChange({ status: ['available', 'in_use'] });

// Filter by category
actions.handleFiltersChange({ category: ['equipment'] });

// Search
actions.handleFiltersChange({ search: 'Dell' });

// Rentable only
actions.handleFiltersChange({ is_rentable: true });
```

### Using Store Directly

```tsx
import { useAssets } from '@/store/assetsStore';

function MyComponent() {
  const store = useAssets();

  // Get computed values
  const rentableAssets = store.getRentableAssets();
  const maintenanceDue = store.getMaintenanceDue(7); // Next 7 days

  // Access metrics
  console.log(store.stats.maintenance_due_soon);
}
```

---

## 🧪 Testing Integration

To test the HookPoint pattern:

1. **Enable Rentals module** in module registry
2. **Navigate to Assets** page
3. **Look for injected UI**:
   - "Rent" button in table rows (purple icon)
   - "Rental Configuration" section in form
   - "Rental History" section in detail modal

---

## 🚀 Future Enhancements

- [ ] Add realtime subscriptions (Supabase)
- [ ] Multi-location support
- [ ] Barcode/QR code scanning
- [ ] Photo uploads for assets
- [ ] Maintenance workflow automation
- [ ] Depreciation calculator
- [ ] Asset transfer between locations
- [ ] Bulk import/export

---

## 📚 Related Documentation

- [HookPoint System Guide](../../../../lib/hooks/README.md)
- [Module Architecture](../../../../docs/architecture/modules.md)
- [Rentals Integration](../../../operations/rentals/README.md)
- [Shared UI Components](../../../../shared/ui/README.md)

---

**Last Updated**: 2025-01-06
**Status**: ✅ Production Ready
**Pattern**: HookPoint Injection Demo
